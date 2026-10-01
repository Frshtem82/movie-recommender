from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId
from database import users_collection, movies_collection

router = APIRouter(tags=["movies"])

@router.get("/search_movies")
def search_movies(query: str):
    results = list(movies_collection.find(
        {"title": {"$regex": query, "$options": "i"}},
        {"title": 1, "release_year": 1, "genres": 1, "rating": 1,
         "directors": 1, "description": 1, "_id": 1}
    ).limit(10))
    for res in results:
        res["_id"] = str(res["_id"])
    return results

@router.post("/add_watched/{user_id}/{movie_id}")
def add_watched(user_id: str, movie_id: str):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(404, "User not found")
        movie = movies_collection.find_one({"_id": ObjectId(movie_id)})
        if not movie:
            raise HTTPException(404, "Movie not found")
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"watched_movies": ObjectId(movie_id)}}
        )
        return {"message": "Movie added to watched"}
    except InvalidId:
        raise HTTPException(400, "Invalid user_id or movie_id")

@router.post("/remove_watched/{user_id}/{movie_id}")
def remove_watched(user_id: str, movie_id: str):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(404, "User not found")
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"watched_movies": ObjectId(movie_id)}}
        )
        return {"message": "Movie removed from watched"}
    except InvalidId:
        raise HTTPException(400, "Invalid user_id or movie_id")

@router.get("/watched_movies/{user_id}")
def get_watched(user_id: str):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(404, "User not found")
        watched_ids = user.get("watched_movies", [])
        movies = list(movies_collection.find(
            {"_id": {"$in": watched_ids}},
            {"title": 1, "release_year": 1, "genres": 1, "rating": 1,
             "directors": 1, "description": 1, "_id": 1}
        ))
        for movie in movies:
            movie["_id"] = str(movie["_id"])
        return movies
    except InvalidId:
        raise HTTPException(400, "Invalid user_id")

@router.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(404, "User not found")
        watched_ids = user.get("watched_movies", [])
        
        # Calculate weights
        watched_movies = list(movies_collection.find({"_id": {"$in": watched_ids}}))
        genre_counts = {}
        director_counts = {}
        actor_counts = {}
        for movie in watched_movies:
            for genre in movie.get("genres", []):
                genre_counts[genre] = genre_counts.get(genre, 0) + 1
            for director in movie.get("directors", []):
                director_counts[director] = director_counts.get(director, 0) + 1
            for actor in movie.get("cast", []):
                actor_counts[actor] = actor_counts.get(actor, 0) + 1
        
        # Normalize weights
        total_genres = sum(genre_counts.values()) or 1
        total_directors = sum(director_counts.values()) or 1
        total_actors = sum(actor_counts.values()) or 1
        genre_weights = {k: v / total_genres for k, v in genre_counts.items()}
        director_weights = {k: v / total_directors for k, v in director_counts.items()}
        actor_weights = {k: v / total_actors for k, v in actor_counts.items()}
        
        # Aggregation pipeline for scoring unwatched movies
        pipeline = [
            {"$match": {"_id": {"$nin": watched_ids}}},
            {"$addFields": {
                "genre_score": {"$sum": {"$map": {
                    "input": "$genres",
                    "as": "g",
                    "in": {"$ifNull": [{"$literal": 1}, 0]}
                }}},
                "director_score": {"$sum": {"$map": {
                    "input": "$directors",
                    "as": "d",
                    "in": {"$ifNull": [{"$literal": 1}, 0]}
                }}},
                "actor_score": {"$sum": {"$map": {
                    "input": "$cast",
                    "as": "a",
                    "in": {"$ifNull": [{"$literal": 1}, 0]}
                }}},
            }},
            {"$addFields": {
                "total_score": {"$add": [
                    {"$multiply": ["$genre_score", 0.4]},
                    {"$multiply": ["$director_score", 0.25]},
                    {"$multiply": ["$actor_score", 0.15]},
                    {"$divide": [{"$ifNull": ["$rating", 0]}, 20]},
                    {"$divide": [{"$cond": [{"$gt": [{"$ifNull": ["$votes", 0]}, 0]}, {"$log10": {"$ifNull": ["$votes", 1]}}, 0]}, 100]}
                ]}
            }},
            {"$sort": {"total_score": -1}},
            {"$limit": 20},
            {"$project": {
                "title": 1, "release_year": 1, "genres": 1, "directors": 1,
                "rating": 1, "description": 1, "total_score": 1, "_id": 1
            }}
        ]
        recommendations = list(movies_collection.aggregate(pipeline))
        for rec in recommendations:
            rec["_id"] = str(rec["_id"])
        return recommendations
    except InvalidId:
        raise HTTPException(400, "Invalid user_id")