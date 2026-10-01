import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function WatchedMovies() {
  const { userId } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchWatched = async () => {
    setLoading(true);
    try {
      const res = await movieAPI.getWatched(userId);
      setMovies(res.data);
    } catch (err) {
      setToast({ type: 'danger', text: 'خطا: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchWatched();
  }, [userId]);

  const removeWatched = async (movieId, title) => {
    if (!window.confirm(`«${title}» از لیست تماشاشده حذف بشه؟`)) return;
    try {
      await movieAPI.removeWatched(userId, movieId);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
      setToast({ type: 'success', text: 'حذف شد' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ type: 'danger', text: 'خطا: ' + err.message });
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>✅ فیلم‌های تماشاشده</h2>
        <span className="badge bg-secondary fs-6">{movies.length} فیلم</span>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type} py-2`}>{toast.text}</div>
      )}

      {movies.length === 0 ? (
        <div className="text-center text-muted my-5">
          <p className="fs-5">هنوز فیلمی اضافه نکردی</p>
          <Link to="/search" className="btn btn-primary">
            برو به جستجو
          </Link>
        </div>
      ) : (
        <div className="row">
          {movies.map((movie) => (
            <div key={movie._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card movie-card h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-1">
                    {movie.title}{' '}
                    <small className="text-muted">({movie.release_year})</small>
                  </h5>
                  <div className="mb-2">
                    {movie.genres?.map((g) => (
                      <span key={g} className="badge-genre">
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="small text-muted mb-3">
                    ⭐ {movie.rating || 'N/A'}
                  </p>
                  <button
                    className="btn btn-outline-danger btn-sm mt-auto align-self-start"
                    onClick={() => removeWatched(movie._id, movie.title)}
                  >
                    🗑 حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}