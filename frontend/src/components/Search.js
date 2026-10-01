import React, { useState, useEffect, useRef } from 'react';
import { movieAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Search() {
  const { userId } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await movieAPI.search(query);
        setResults(res.data);
      } catch (err) {
        setToast({ type: 'danger', text: 'خطا در جستجو: ' + err.message });
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const addToWatched = async (movieId, title) => {
    try {
      await movieAPI.addWatched(userId, movieId);
      setAddedIds((prev) => new Set(prev).add(movieId));
      setToast({ type: 'success', text: `«${title}» به لیست تماشاشده اضافه شد ✅` });
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setToast({ type: 'danger', text: 'خطا: ' + err.message });
    }
  };

  return (
    <div>
      <h2 className="mb-3">🔍 جستجوی فیلم</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="form-control form-control-lg mb-3 shadow-sm"
        placeholder="حداقل ۳ حرف از اسم فیلم بنویس..."
      />

      {toast && (
        <div className={`alert alert-${toast.type} py-2`}>{toast.text}</div>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <p className="text-muted small mb-2">{results.length} نتیجه پیدا شد</p>
      )}

      <div className="row">
        {results.map((movie) => (
          <div key={movie._id} className="col-md-6 mb-3">
            <div className="card movie-card h-100 border-0 shadow-sm">
              <div className="card-body">
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
                <p className="small text-muted mb-2">
                  ⭐ <strong>{movie.rating || 'N/A'}</strong>
                  {movie.directors?.length > 0 && (
                    <> | 🎬 {movie.directors.join(', ')}</>
                  )}
                </p>
                {movie.description && (
                  <p className="small text-muted mb-3" style={{ lineHeight: 1.5 }}>
                    {movie.description.slice(0, 140)}
                    {movie.description.length > 140 ? '...' : ''}
                  </p>
                )}
                <button
                  className={`btn btn-sm ${
                    addedIds.has(movie._id) ? 'btn-secondary' : 'btn-success'
                  }`}
                  onClick={() => addToWatched(movie._id, movie.title)}
                  disabled={addedIds.has(movie._id)}
                >
                  {addedIds.has(movie._id) ? '✓ اضافه شد' : '+ افزودن به تماشاشده'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && query.length >= 3 && results.length === 0 && (
        <div className="text-center text-muted my-5">
          <p className="fs-5">🔎 فیلمی با این نام پیدا نشد</p>
        </div>
      )}

      {query.length < 3 && (
        <div className="text-center text-muted my-5">
          <p className="fs-5">👆 شروع به تایپ کن تا فیلم‌ها رو ببینی</p>
        </div>
      )}
    </div>
  );
}