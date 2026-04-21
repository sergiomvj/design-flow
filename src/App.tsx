import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DesignRequestForm } from './components/DesignRequestForm';
import { ProjectList } from './pages/ProjectList';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';

function AppContent() {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />

      <Route path="/" element={
        token ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
      } />

      <Route path="/new-request" element={
        token ? <Layout><DesignRequestForm /></Layout> : <Navigate to="/login" />
      } />

      <Route path="/projects/:status" element={
        token ? <Layout><ProjectList /></Layout> : <Navigate to="/login" />
      } />

      <Route path="/team" element={
        token && user?.role === 'ADMIN' ? <Layout><Team /></Layout> : <Navigate to="/" />
      } />

      <Route path="/settings" element={
        token ? <Layout><Settings /></Layout> : <Navigate to="/login" />
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
