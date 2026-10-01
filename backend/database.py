from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["movieDB"]

movies_collection = db["movies"]
users_collection = db["users"]
llm_cache_collection = db["llm_cache"]