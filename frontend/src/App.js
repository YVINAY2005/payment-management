import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ManagePayment from './pages/ManagePayment'
import './App.css'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/admin-login" element={!user ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard onLogout={handleLogout} />) : <Navigate to="/login" />} />
        <Route path="/manage-payment" element={user ? <ManagePayment onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
