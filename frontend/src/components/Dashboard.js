import React, { useState } from 'react';
import { dashboardAPI } from '../api';

const TABS = [
  { key: 'directorGenre', label: '🎬 تخصص کارگردان-ژانر', color: 'primary' },
  { key: 'actorCollab', label: '🤝 همکاری بازیگران', color: 'success' },
  { key: 'genrePopularity', label: '📈 محبوبیت ژانر در زمان', color: 'info' },
  { key: 'actorDirector', label: '🎭 بازیگر-کارگردان', color: 'warning' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('directorGenre');
  const [data, setData] = useState({
    directorGenre: [],
    actorCollab: [],
    genrePopularity: [],
    actorDirector: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actorQuery, setActorQuery] = useState('Henry Robert');

  const fetchData = async (tabKey) => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (tabKey === 'directorGenre') res = await dashboardAPI.directorGenre();
      else if (tabKey === 'actorCollab')
        res = await dashboardAPI.actorCollab(actorQuery);
      else if (tabKey === 'genrePopularity')
        res = await dashboardAPI.genrePopularity();
      else if (tabKey === 'actorDirector')
        res = await dashboardAPI.actorDirector();

      setData((prev) => ({ ...prev, [tabKey]: res.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (data[key].length === 0) fetchData(key);
  };

  const renderTable = () => {
    const rows = data[activeTab];

    if (loading) {
      return (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" />
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-danger">{error}</div>;
    }

    if (rows.length === 0) {
      return (
        <div className="text-center text-muted my-4">
          <p>داده‌ای موجود نیست</p>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => fetchData(activeTab)}
          >
            دریافت داده
          </button>
        </div>
      );
    }

    // هر تب ستون‌های متفاوتی داره
    const configs = {
      directorGenre: {
        headers: ['کارگردان', 'ژانر', 'درصد (%)'],
        cells: (r) => [r.director, r.genre, r.percentage?.toFixed(2)],
      },
      actorCollab: {
        headers: ['بازیگر هدف', 'همکار', 'تعداد همکاری', 'میانگین امتیاز'],
        cells: (r) => [
          r.target_actor,
          r.collaborator,
          r.collaboration_count,
          r.avg_rating?.toFixed(2),
        ],
      },
      genrePopularity: {
        headers: ['دهه', 'ژانر', 'تعداد فیلم', 'میانگین امتیاز'],
        cells: (r) => [
          `${r.decade}s`,
          r.genre,
          r.movie_count,
          r.avg_rating?.toFixed(2),
        ],
      },
      actorDirector: {
        headers: ['بازیگر', 'کارگردان', 'میانگین امتیاز'],
        cells: (r) => [r.actor, r.director, r.avg_rating?.toFixed(2)],
      },
    };

    const cfg = configs[activeTab];

    return (
      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle">
          <thead className="table-dark">
            <tr>
              {cfg.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {cfg.cells(row).map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-3">📊 داشبورد تحلیلی</h2>

      <ul className="nav nav-pills mb-3 flex-wrap gap-2">
        {TABS.map((t) => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${
                activeTab === t.key ? `active bg-${t.color}` : `text-${t.color}`
              }`}
              onClick={() => handleTabChange(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'actorCollab' && (
        <div className="input-group mb-3" style={{ maxWidth: 400 }}>
          <input
            type="text"
            className="form-control"
            placeholder="نام بازیگر..."
            value={actorQuery}
            onChange={(e) => setActorQuery(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => fetchData('actorCollab')}
          >
            جستجو
          </button>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h5>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => fetchData(activeTab)}
              disabled={loading}
            >
              🔄 بروزرسانی
            </button>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  );
}