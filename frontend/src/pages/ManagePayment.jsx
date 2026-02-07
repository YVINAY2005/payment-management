import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const ManagePayment = () => {
    const [payments, setPayments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const paymentTypes = [
        { name: 'Bank', icon: '🏦' },
        { name: 'USDT', icon: '🪙' },
        { name: 'UPI', icon: '🔗' },
        { name: 'GPay', icon: '📱' },
        { name: 'PhonePe', icon: '📱' },
        { name: 'Paytm', icon: '📱' },
        { name: 'PayPal', icon: '🌍' },
        { name: 'OPay', icon: '📱' },
        { name: 'PalmPay', icon: '📱' }
    ];

    const fetchPayments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data);
        } catch (err) {
            console.error('Error fetching payments', err);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleAddClick = (type) => {
        // Map GPay/PhonePe to UPI for the backend schema if needed, 
        // but let's keep it simple and store as the selected type or general categories
        setSelectedType(type.name);
        setFormData({ paymentType: type.name === 'GPay' || type.name === 'PhonePe' ? 'UPI' : (type.name === 'OPay' || type.name === 'PalmPay' ? 'Bank' : type.name) });
        setShowModal(true);
        setEditingId(null);
    };

    const handleEdit = (payment) => {
        setEditingId(payment._id);
        setSelectedType(payment.paymentType);
        setFormData(payment);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/payments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchPayments();
            } catch (err) {
                console.error('Error deleting payment', err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(`${API_URL}/payments/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/payments`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchPayments();
        } catch (err) {
            console.error('Error saving payment', err);
        }
    };

    const renderFormFields = () => {
        const type = formData.paymentType;
        if (type === 'Bank') {
            return (
                <>
                    <div className="form-group"><input placeholder="Bank Name" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} required /></div>
                    <div className="form-group"><input placeholder="IFSC Code" value={formData.ifscCode || ''} onChange={e => setFormData({...formData, ifscCode: e.target.value})} required /></div>
                    <div className="form-group"><input placeholder="Account Number" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} required /></div>
                    <div className="form-group"><input placeholder="Account Holder Name" value={formData.accountHolderName || ''} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} required /></div>
                    <div className="form-group"><input placeholder="Branch Name" value={formData.branchName || ''} onChange={e => setFormData({...formData, branchName: e.target.value})} required /></div>
                </>
            );
        } else if (type === 'Paytm') {
            return <div className="form-group"><input placeholder="Paytm Number" value={formData.paytmNumber || ''} onChange={e => setFormData({...formData, paytmNumber: e.target.value})} required /></div>;
        } else if (type === 'UPI') {
            return <div className="form-group"><input placeholder="UPI ID" value={formData.upiId || ''} onChange={e => setFormData({...formData, upiId: e.target.value})} required /></div>;
        } else if (type === 'PayPal') {
            return <div className="form-group"><input placeholder="PayPal Email" value={formData.paypalEmail || ''} onChange={e => setFormData({...formData, paypalEmail: e.target.value})} required /></div>;
        } else if (type === 'USDT') {
            return <div className="form-group"><input placeholder="USDT Wallet Address" value={formData.usdtAddress || ''} onChange={e => setFormData({...formData, usdtAddress: e.target.value})} required /></div>;
        }
        return null;
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>‹</button>
                <h2>My Payment ...</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: '#fff9e6', padding: '2px 8px', borderRadius: '15px', fontSize: '12px' }}>⭐ 107</span>
                    <span style={{ background: '#e6f4ea', padding: '2px 8px', borderRadius: '15px', fontSize: '12px' }}>₹0.00</span>
                </div>
            </div>

            <h3 style={{ textAlign: 'center', margin: '30px 0' }}>Add Payment Options</h3>

            <div className="payment-options-grid">
                {paymentTypes.map((type, index) => (
                    <div key={index} className="payment-option-card" onClick={() => handleAddClick(type)}>
                        <span style={{ fontSize: '24px' }}>{type.icon}</span>
                        <span>{type.name}</span>
                    </div>
                ))}
            </div>

            <div className="disclaimer-box">
                <h4>💡 Disclaimer</h4>
                <p>1. Use only a bank account that matches your profile name.</p>
                <hr style={{ border: 'none', borderBottom: '1px solid #eee', margin: '10px 0' }} />
                <p>2. Do not link the same bank account to multiple Task Planet accounts.</p>
                <hr style={{ border: 'none', borderBottom: '1px solid #eee', margin: '10px 0' }} />
                <p>3. Fraudulent activity may result in account blocking.</p>
            </div>

            <div className="payment-list">
                <h3>Added Payment Methods</h3>
                {payments.map(payment => (
                    <div key={payment._id} className="payment-item">
                        <div className="payment-info">
                            <h4>{payment.paymentType}</h4>
                            <p>{payment.bankName || payment.upiId || payment.paytmNumber || payment.paypalEmail || payment.usdtAddress}</p>
                        </div>
                        <div className="payment-actions">
                            <button className="action-btn edit-btn" onClick={() => handleEdit(payment)}>Edit</button>
                            <button className="action-btn delete-btn" onClick={() => handleDelete(payment._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add {selectedType}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {renderFormFields()}
                            <button type="submit" className="add-payment-btn">
                                {editingId ? 'Update' : 'Add'} {selectedType}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePayment;
