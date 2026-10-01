import hashlib
from database import llm_cache_collection

def make_cache_key(watched_ids: list) -> str:
    """ساخت کلید یکتا بر اساس لیست فیلم‌های دیده‌شده"""
    sorted_ids = sorted([str(i) for i in watched_ids])
    return hashlib.md5(",".join(sorted_ids).encode()).hexdigest()

def get_cached_recommendations(watched_ids: list):
    """گرفتن نتیجه از کش"""
    key = make_cache_key(watched_ids)
    cached = llm_cache_collection.find_one({"key": key})
    return cached["recommendations"] if cached else None

def save_recommendations(watched_ids: list, recommendations: list):
    """ذخیره نتیجه در کش"""
    key = make_cache_key(watched_ids)
    llm_cache_collection.update_one(
        {"key": key},
        {"$set": {"recommendations": recommendations}},
        upsert=True
    )