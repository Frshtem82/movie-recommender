# 🎬 Movie Recommender

An intelligent movie recommendation system built with MongoDB, FastAPI, and Hugging Face LLM.

## ✨ Features

- 🔐 User registration and login with bcrypt password hashing
- 🔍 Movie search by title
- ✅ Manage watched movies list
- 🤖 AI-powered recommendations using Hugging Face LLM
- 📊 Algorithmic recommendations based on genre, director, and cast
- 📈 Analytical dashboard with MongoDB aggregation queries

## 🏗️ Project Architecture

```
movie-recommender/
├── backend/          # FastAPI + MongoDB + LLM
└── frontend/         # React + Bootstrap
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** — Web framework
- **MongoDB** — Database
- **Hugging Face** — LLM for recommendations
- **bcrypt** — Password hashing
- **Pydantic** — Data validation

### Frontend
- **React 18** — UI library
- **React Router v6** — Routing
- **Axios** — HTTP client
- **Bootstrap 5** — Styling

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- Hugging Face API Token

### 1. Clone the repository

```bash
git clone https://github.com/frshtem82/movie-recommender.git
cd movie-recommender
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in the values:
- `MONGO_URI` → MongoDB connection string
- `HF_TOKEN` → Hugging Face API token
- `HF_MODEL` → Model ID (e.g., `Qwen/Qwen2.5-7B-Instruct`)

Run the server:

```bash
python main.py
```

Backend will be available at `http://localhost:8000`. API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Run the app:

```bash
npm start
```

Frontend will be available at `http://localhost:3000`.

## 📁 Backend Structure

```
backend/
├── main.py              # FastAPI entry point
├── database.py          # MongoDB connection
├── models.py            # Pydantic models
├── security.py          # Password hashing utilities
├── llm_service.py       # Hugging Face integration
├── cache_service.py     # LLM result caching
└── routers/
    ├── auth.py          # /register, /login
    ├── movies.py        # /search_movies, /add_watched, ...
    └── llm.py           # /llm_recommendations
```

## 🔑 Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | User login |
| GET | `/search_movies?query=` | Search movies by title |
| POST | `/add_watched/{user_id}/{movie_id}` | Add movie to watched list |
| POST | `/remove_watched/{user_id}/{movie_id}` | Remove movie from watched list |
| GET | `/watched_movies/{user_id}` | Get watched movies |
| GET | `/recommendations/{user_id}` | Algorithmic recommendations |
| GET | `/llm_recommendations/{user_id}` | LLM-powered recommendations |
| GET | `/director_genre_specialization` | Director-genre specialization |
| GET | `/actor_collaboration` | Actor collaboration network |
| GET | `/genre_popularity` | Genre popularity over time |
| GET | `/actor_director_collaboration` | Actor-director collaborations |

## 🗄️ Database Schema

### `movies` collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "release_year": "int",
  "genres": ["string"],
  "directors": ["string"],
  "cast": ["string"],
  "rating": "float",
  "votes": "int",
  "description": "string"
}
```

### `users` collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string (bcrypt hash)",
  "watched_movies": ["ObjectId"]
}
```

### `llm_cache` collection
```json
{
  "key": "string (MD5 hash)",
  "recommendations": ["object"]
}
```

## 🔒 Security

- Passwords are hashed with bcrypt
- API tokens stored in `.env` (never committed)
- CORS restricted to `http://localhost:3000`
- LLM responses cached in MongoDB to reduce API costs