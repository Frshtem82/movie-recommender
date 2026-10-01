import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('user_id');
    const savedName = localStorage.getItem('username');
    if (savedId) {
      setUserId(savedId);
      setUsername(savedName);
    }
    setReady(true);
  }, []);

  const login = (id, name) => {
    localStorage.setItem('user_id', id);
    localStorage.setItem('username', name);
    setUserId(id);
    setUsername(name);
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUserId(null);
    setUsername(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ userId, username, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};