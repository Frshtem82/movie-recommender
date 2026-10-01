import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Search from './components/Search';
import WatchedMovies from './components/WatchedMovies';
import Recommendations from './components/Recommendations';
import Dashboard from './components/Dashboard';

function NavBar() {
  const { userId, username, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🎬 Movie Recommender
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {userId && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/search">🔍 جستجو</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/watched">✅ تماشاشده‌ها</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/recommendations">✨ پیشنهادها</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">📊 داشبورد</Link>
                </li>
              </>
            )}
          </ul>
          {userId && (
            <div className="d-flex align-items-center">
              <span className="text-light me-3">👤 {username}</span>
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                خروج
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <div className="container mt-4 mb-5">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watched"
          element={
            <ProtectedRoute>
              <WatchedMovies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;