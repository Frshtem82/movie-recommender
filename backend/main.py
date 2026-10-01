from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import auth, movies, llm
import logging
logging.basicConfig(level=logging.INFO)
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("asyncio").setLevel(logging.WARNING)
load_dotenv()

app = FastAPI(title="Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(llm.router)
# app.include_router(dashboard.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)