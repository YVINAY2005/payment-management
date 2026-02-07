import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const AdminDashboard = ({ onLogout }) => {
    const [payments, setPayments] = useState([]);
    const [filters, setFilters] = useState({
        username: '',
        paymentType: '',
        bankName: '',
        ifscCode: '',
        paytmNumber: '',
        upiId: '',
        paypalEmail: '',
        usdtAddress: ''
    });

    const fetchPayments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams(filters).toString();
            const res = await axios.get(`${API_URL}/admin/payments?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data);
        } catch (err) {
            console.error('Error fetching admin data', err);
        }
    }, [filters]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '1000px' }}>
            <div className="header">
                <h2>Admin Panel</h2>
                <button onClick={onLogout} className="action-btn delete-btn">Logout</button>
            </div>

            <div className="filter-section">
                <input name="username" placeholder="Username" value={filters.username} onChange={handleFilterChange} />
                <select name="paymentType" value={filters.paymentType} onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    <option value="Bank">Bank</option>
                    <option value="Paytm">Paytm</option>
                    <option value="UPI">UPI</option>
                    <option value="PayPal">PayPal</option>
                    <option value="USDT">USDT</option>
                </select>
                <input name="bankName" placeholder="Bank Name" value={filters.bankName} onChange={handleFilterChange} />
                <input name="ifscCode" placeholder="IFSC Code" value={filters.ifscCode} onChange={handleFilterChange} />
                <input name="paytmNumber" placeholder="Paytm Number" value={filters.paytmNumber} onChange={handleFilterChange} />
                <input name="upiId" placeholder="UPI ID" value={filters.upiId} onChange={handleFilterChange} />
                <input name="paypalEmail" placeholder="PayPal Email" value={filters.paypalEmail} onChange={handleFilterChange} />
                <input name="usdtAddress" placeholder="USDT Address" value={filters.usdtAddress} onChange={handleFilterChange} />
            </div>

            <div className="payment-list">
                <h3>All User Payments</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Type</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p._id}>
                                <td>{p.user?.username} ({p.user?.email})</td>
                                <td>{p.paymentType}</td>
                                <td>
                                    {p.paymentType === 'Bank' && `${p.bankName} - ${p.accountNumber} (${p.ifscCode})`}
                                    {p.paymentType === 'Paytm' && p.paytmNumber}
                                    {p.paymentType === 'UPI' && p.upiId}
                                    {p.paymentType === 'PayPal' && p.paypalEmail}
                                    {p.paymentType === 'USDT' && p.usdtAddress}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
