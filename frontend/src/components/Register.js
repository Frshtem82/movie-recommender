import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('رمز عبور و تکرارش یکسان نیستند');
      return;
    }
    if (password.length < 4) {
      setError('رمز عبور باید حداقل ۴ کاراکتر باشد');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(username, password);
      alert('ثبت‌نام با موفقیت انجام شد! حالا وارد شو.');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5 col-lg-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="mb-4 text-center">📝 ثبت‌نام</h2>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">نام کاربری</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label">رمز عبور</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">تکرار رمز عبور</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    در حال ثبت...
                  </>
                ) : (
                  'ثبت‌نام'
                )}
              </button>
            </form>
            <p className="text-center mt-3 mb-0">
              حساب داری؟ <Link to="/">ورود</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}