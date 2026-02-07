import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const AdminLogin = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/auth/login`, formData);
            if (res.data.user.role !== 'admin') {
                setError('Access denied. This is an admin login page.');
                return;
            }
            localStorage.setItem('token', res.data.token);
            onLogin(res.data.user);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed');
        }
    };

    return (
        <div className="auth-container">
            <Link to="/login" className="admin-toggle-icon" title="User Login">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </Link>

            <div className="auth-card" style={{ borderTop: '5px solid #007bff' }}>
                <h2 style={{ color: '#007bff' }}>Admin Login</h2>
                <p style={{ textAlign: 'center', color: '#666', marginTop: '-15px', marginBottom: '20px', fontSize: '14px' }}>
                    Access the Management Dashboard
                </p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Admin Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" style={{ backgroundColor: '#007bff' }}>
                        Login as Admin
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
