import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'خطای ناشناخته';
    console.error('API Error:', message, err);
    return Promise.reject(new Error(message));
  }
);

export default api;

// ---------- Auth ----------
export const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
  register: (username, password) => api.post('/register', { username, password }),
};

// ---------- Movies ----------
export const movieAPI = {
  search: (query) => api.get('/search_movies', { params: { query } }),
  addWatched: (userId, movieId) => api.post(`/add_watched/${userId}/${movieId}`),
  removeWatched: (userId, movieId) =>
    api.post(`/remove_watched/${userId}/${movieId}`),
  getWatched: (userId) => api.get(`/watched_movies/${userId}`),
  getRecommendations: (userId) => api.get(`/recommendations/${userId}`),
  getLLMRecommendations: (userId, n = 10) =>
    api.get(`/llm_recommendations/${userId}`, { params: { n } }),
};

// ---------- Dashboard ----------
export const dashboardAPI = {
  directorGenre: () => api.get('/director_genre_specialization'),
  actorCollab: (actor = 'Henry Robert') =>
    api.get('/actor_collaboration', { params: { target_actor: actor } }),
  genrePopularity: () => api.get('/genre_popularity'),
  actorDirector: () => api.get('/actor_director_collaboration'),
};