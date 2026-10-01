import os
import json
import re
from huggingface_hub import InferenceClient
from typing import List, Dict

client = InferenceClient(
    api_key=os.getenv("HF_TOKEN"),
    model=os.getenv("HF_MODEL", "meta-llama/Llama-3.3-70B-Instruct"),
    timeout=60,
)


def build_user_profile(watched_movies: List[Dict]) -> str:
    """ساخت خلاصه سلیقه کاربر بر اساس فیلم‌های دیده‌شده"""
    if not watched_movies:
        return "User has no watched movies yet."

    genres, directors, decades, ratings = {}, {}, {}, []
    for m in watched_movies:
        for g in m.get("genres", []):
            genres[g] = genres.get(g, 0) + 1
        for d in m.get("directors", []):
            directors[d] = directors.get(d, 0) + 1
        if m.get("release_year"):
            decade = (m["release_year"] // 10) * 10
            decades[decade] = decades.get(decade, 0) + 1
        if m.get("rating"):
            ratings.append(m["rating"])

    top_genres = sorted(genres.items(), key=lambda x: -x[1])[:5]
    top_directors = sorted(directors.items(), key=lambda x: -x[1])[:3]
    top_decades = sorted(decades.items(), key=lambda x: -x[1])[:2]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    return f"""
    User watched {len(watched_movies)} movies.
    Top genres: {', '.join(f'{g} ({c})' for g, c in top_genres)}
    Favorite directors: {', '.join(f'{d} ({c})' for d, c in top_directors)}
    Preferred decades: {', '.join(f'{d}s ({c})' for d, c in top_decades)}
    Average rating: {avg_rating:.1f}
    """.strip()


def extract_json_from_response(text: str) -> dict:
    """استخراج JSON از جواب LLM، حتی اگه توی ```json ... ``` یا متن اضافه باشه"""
    if not text:
        return {}

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    code_block = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if code_block:
        try:
            return json.loads(code_block.group(1))
        except json.JSONDecodeError:
            pass

    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(text[first_brace:last_brace + 1])
        except json.JSONDecodeError:
            pass

    return {}


def get_llm_recommendations(
    watched_movies: List[Dict],
    candidate_movies: List[Dict],
    n: int = 10
) -> List[Dict]:
    """LLM از بین کاندیداها بهترین‌ها رو انتخاب می‌کنه + دلیل"""
    profile = build_user_profile(watched_movies)

    candidates_text = "\n".join([
        f"- ID: {m['_id']} | {m['title']} ({m.get('release_year', '?')}) | "
        f"Genres: {', '.join(m.get('genres', []))} | "
        f"Directors: {', '.join(m.get('directors', []))} | "
        f"Rating: {m.get('rating', '?')}"
        for m in candidate_movies
    ])

    prompt = f"""You are a movie recommendation expert. Based on the user profile below, select the best {n} movies from the candidates.

## User Profile:
{profile}

## Candidate Movies:
{candidates_text}

## Instructions:
- Select movies that best match the user's taste.
- Ensure genre diversity.
- For each movie, write a brief reason (one sentence) why it suits this user.
- Return ONLY a valid JSON object, no extra text.

{{
  "recommendations": [
    {{"id": "movie_id_1", "reason": "reason..."}},
    {{"id": "movie_id_2", "reason": "reason..."}}
  ]
}}
"""

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a movie recommendation expert that returns only valid JSON."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=1500,
        temperature=0.3,
    )

    content = response.choices[0].message.content
    print(f"=== LLM RAW RESPONSE (first 500 chars) ===")
    print(content[:500] if content else "EMPTY RESPONSE")
    print(f"=== END ===")

    result = extract_json_from_response(content)
    if not result:
        print("LLM parse error: could not extract JSON from response")
        return []

    recommendations = result.get("recommendations", [])
    print(f"LLM returned {len(recommendations)} recommendations")
    return recommendations