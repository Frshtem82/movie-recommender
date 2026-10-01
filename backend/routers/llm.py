from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId
from database import users_collection, movies_collection
from llm_service import get_llm_recommendations
from cache_service import get_cached_recommendations, save_recommendations

router = APIRouter(tags=["llm"])

@router.get("/llm_recommendations/{user_id}")
def llm_recommendations(user_id: str, n: int = 10):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(404, "User not found")

        watched_ids = user.get("watched_movies", [])
        watched_movies = list(movies_collection.find({"_id": {"$in": watched_ids}}))

        if not watched_movies:
            return {
                "recommendations": [],
                "message": "Watch some movies first to get personalized recommendations."
            }


        cached = get_cached_recommendations(watched_ids)
        if cached:
            return {"recommendations": cached, "message": "ok (cached)"}

        candidates = list(movies_collection.find(
            {"_id": {"$nin": watched_ids}, "rating": {"$gte": 6.5}},
            {"title": 1, "release_year": 1, "genres": 1, "directors": 1,
             "rating": 1, "description": 1}
        ).sort("rating", -1).limit(50))

        for c in candidates:
            c["_id"] = str(c["_id"])

        llm_results = get_llm_recommendations(watched_movies, candidates, n=n)

        id_to_movie = {c["_id"]: c for c in candidates}
        enriched = []
        for rec in llm_results:
            movie = id_to_movie.get(rec["id"])
            if movie:
                enriched.append({**movie, "reason": rec.get("reason", "")})

        if enriched:
            save_recommendations(watched_ids, enriched)

        return {"recommendations": enriched, "message": "ok"}

    except InvalidId:
        raise HTTPException(400, "Invalid user_id")