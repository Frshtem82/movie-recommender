from fastapi import APIRouter, HTTPException
from models import User
from security import hash_password, check_password
from database import users_collection

router = APIRouter(tags=["auth"])

@router.post("/register")
def register(user: User):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(400, "Username already exists")
    hashed_pw = hash_password(user.password)
    result = users_collection.insert_one({
        "username": user.username,
        "password": hashed_pw,
        "watched_movies": []
    })
    return {"message": "User created", "user_id": str(result.inserted_id)}

@router.post("/login")
def login(user: User):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or not check_password(db_user["password"], user.password):
        raise HTTPException(400, "Invalid credentials")
    return {"message": "Logged in", "user_id": str(db_user["_id"])}