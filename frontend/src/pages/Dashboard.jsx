import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = ({ onLogout }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="dashboard-container">
            <div className="header">
                <h2>Profile</h2>
                <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
            </div>
            
            <div className="profile-section">
                <div className="profile-img"></div>
                <div>
                    <h3 style={{ margin: 0 }}>{user?.username}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{user?.email}</p>
                </div>
            </div>

            <div className="menu-list">
                <Link to="/manage-payment" className="menu-item">
                    <span style={{ fontSize: '20px' }}>💳</span>
                    <span>Manage Payment</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </Link>
                <div className="menu-item">
                    <span style={{ fontSize: '20px' }}>👤</span>
                    <span>Edit Profile</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
                <div className="menu-item">
                    <span style={{ fontSize: '20px' }}>🔔</span>
                    <span>Notifications</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
                <div className="menu-item">
                    <span style={{ fontSize: '20px' }}>🔒</span>
                    <span>Change Password</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
