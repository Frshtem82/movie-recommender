import React, { useState, useEffect } from 'react';
import { movieAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Recommendations() {
  const { userId } = useAuth();
  const [tab, setTab] = useState('llm'); // 'llm' | 'algorithmic'
  const [llmRecs, setLLMRecs] = useState([]);
  const [algoRecs, setAlgoRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLLM = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await movieAPI.getLLMRecommendations(userId, 10);
      setLLMRecs(res.data.recommendations || []);
      if (res.data.message && res.data.message !== 'ok') {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage('خطا: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlgo = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await movieAPI.getRecommendations(userId);
      setAlgoRecs(res.data);
    } catch (err) {
      setMessage('خطا: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    if (tab === 'llm') fetchLLM();
    else fetchAlgo();
  }, [userId, tab]);

  const renderMovie = (movie, isLLM) => (
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
          <p className="small text-muted mb-2">
            ⭐ {movie.rating || 'N/A'}
            {movie.directors?.length > 0 && (
              <> | 🎬 {movie.directors.join(', ')}</>
            )}
          </p>

          {isLLM && movie.reason && (
            <div className="llm-reason mb-2">
              <strong>🤖 چرا این فیلم؟</strong>
              <div>{movie.reason}</div>
            </div>
          )}

          {!isLLM && movie.total_score !== undefined && (
            <p className="small text-muted mb-2">
              <strong>امتیاز تطابق:</strong> {movie.total_score.toFixed(2)}
            </p>
          )}

          {movie.description && (
            <p
              className="small text-muted mb-0"
              style={{ lineHeight: 1.5, fontSize: '0.8rem' }}
            >
              {movie.description.slice(0, 120)}
              {movie.description.length > 120 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="mb-3">✨ پیشنهاد فیلم برای تو</h2>

      {/* تب‌ها */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'llm' ? 'active' : ''}`}
            onClick={() => setTab('llm')}
          >
            🤖 پیشنهاد هوشمند (AI)
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'algorithmic' ? 'active' : ''}`}
            onClick={() => setTab('algorithmic')}
          >
            📊 پیشنهاد الگوریتمی
          </button>
        </li>
      </ul>

      {message && <div className="alert alert-info py-2">{message}</div>}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          {tab === 'llm' && (
            <p className="text-muted mt-2">
              هوش مصنوعی در حال تحلیل سلیقه توست...
            </p>
          )}
        </div>
      ) : (
        <>
          {tab === 'llm' && (
            <>
              {llmRecs.length === 0 ? (
                <div className="text-center text-muted my-5">
                  <p>پیشنهادی موجود نیست. چند فیلم ببین و دوباره امتحان کن!</p>
                </div>
              ) : (
                <div className="row">
                  {llmRecs.map((m) => renderMovie(m, true))}
                </div>
              )}
            </>
          )}

          {tab === 'algorithmic' && (
            <>
              {algoRecs.length === 0 ? (
                <div className="text-center text-muted my-5">
                  <p>پیشنهادی موجود نیست. چند فیلم ببین و دوباره امتحان کن!</p>
                </div>
              ) : (
                <div className="row">
                  {algoRecs.map((m) => renderMovie(m, false))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}