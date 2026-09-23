import React, { useState, useEffect } from 'react';
import { Package, LayoutDashboard, FileText, User, LogOut, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './Profile.css';

const UpdateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userId: '', ownerName: '', username: '', password: '',
        contact: '', email: '', shopName: '', shopAddress: '',
        gstNumber: '', shopActNumber: '',
        // --- NEW LOGIC ADDED ---
        bankAccountNumber: '', bankIfscCode: '', upiId: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const savedUser = localStorage.getItem("userData");
        if (savedUser) { setFormData(JSON.parse(savedUser)); } 
        else { navigate("/login"); }
    }, [navigate]);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.userId) return setMessage({ type: 'error', text: 'Session ID missing. Re-login.' });
        try {
            const response = await fetch('http://localhost:8080/user/update', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (await response.json() === true) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                localStorage.setItem("userData", JSON.stringify(formData));
            } else { setMessage({ type: 'error', text: 'Failed to update.' }); }
        } catch { setMessage({ type: 'error', text: 'Server error.' }); }
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-logo"><Package size={28} /><span>Softneil Billing</span></div>
                <nav className="sidebar-nav">
                    <div className="nav-item" onClick={() => navigate("/home")}><LayoutDashboard size={20} /> Dashboard</div>
                    <div className="nav-item" onClick={() => navigate("/products")}><Package size={20} /> Products</div>
                    <div className="nav-item" onClick={() => navigate("/invoice")}><FileText size={20} /> Invoices</div>
                    <div className="nav-item active"><User size={20} /> Profile</div>
                </nav>
                <button className="logout-btn" onClick={() => {localStorage.clear(); navigate("/login");}}><LogOut size={18} /> Logout</button>
            </aside>

            <main className="main-content profile-page">
                <header className="content-header">
                    <div className="header-title"><h1>Account Settings</h1><p>Manage profile information.</p></div>
                    <button className="back-btn-header" onClick={() => navigate("/home")}><ArrowLeft size={18} /> Back</button>
                </header>
                <div className="profile-card-container">
                    <form onSubmit={handleSubmit} className="profile-form">
                        {message.text && <div className={`profile-alert ${message.type}`}>{message.text}</div>}
                        <div className="form-section">
                            <h3><User size={18} /> Personal Details</h3>
                            <div className="form-grid">
                                <div className="form-group"><label>Owner Name</label><input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Contact</label><input type="number" name="contact" value={formData.contact || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Password</label><input type="password" name="password" value={formData.password || ''} onChange={handleChange} required /></div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3><Package size={18} /> Business & Bank Details</h3>
                            <div className="form-grid">
                                <div className="form-group full-width"><label>Shop Name</label><input type="text" name="shopName" value={formData.shopName || ''} onChange={handleChange} required /></div>
                                <div className="form-group full-width"><label>Address</label><textarea name="shopAddress" value={formData.shopAddress || ''} onChange={handleChange} rows="2" required /></div>
                                
                                <div className="form-group"><label>Acc Number</label><input type="text" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>IFSC Code</label><input type="text" name="bankIfscCode" value={formData.bankIfscCode || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>UPI ID</label><input type="text" name="upiId" value={formData.upiId || ''} onChange={handleChange} /></div>
                                
                                <div className="form-group"><label>GST No</label><input type="text" name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} /></div>
                            </div>
                        </div>
                        <div className="form-footer"><button type="submit" className="save-profile-btn"><Save size={18} /> Update Profile</button></div>
                    </form>
                </div>
            </main>
        </div>
    );
};
export default UpdateUser;