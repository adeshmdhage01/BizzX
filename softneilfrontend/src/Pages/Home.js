import React, { useState, useEffect, useCallback } from "react";
import { 
  Package, LayoutDashboard, FileText, User, LogOut, 
  TrendingUp, ShoppingCart, ArrowRight, Wallet 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayProfit: 0,
    todaySales: 0,
    totalRevenue: 0
  });

  // Get logged in user's ID from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.userId;

  // Logic: Memoize fetch function to prevent infinite loops and ESLint warnings
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:8080/invoice/stats/${userId}`);
      setStats({
        todayProfit: res.data.todayProfit || 0,
        todaySales: res.data.todaySales || 0,
        totalRevenue: res.data.totalRevenue || 0
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  }, [userId]);

  // Logic: Fetch stats on component mount if user is logged in
  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      fetchDashboardData();
    }
  }, [userId, navigate, fetchDashboardData]);

  const goHome = () => navigate("/home");
  const goToProducts = () => navigate("/products");
  const goToInvoice = () => navigate("/invoice");
  const goToProfile = () => navigate("/profile");
  
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Logic: Format numbers as Indian Currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Package className="logo-icon" size={28} />
          <span>Softneil Billing</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active" onClick={goHome}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={goToProducts}>
            <Package size={20} /> <span>Products</span>
          </div>
          <div className="nav-item" onClick={goToInvoice}>
            <FileText size={20} /> <span>Invoices</span>
          </div>
          <div className="nav-item" onClick={goToProfile}>
            <User size={20} /> <span>Profile</span>
          </div>
        </nav>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>Business Overview</h1>
            <p>Welcome back, {userData.ownerName || 'User'}! Manage your business operations efficiently.</p>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon revenue"><TrendingUp size={26} /></div>
            <div className="stat-info">
              <span>Today's Profit</span>
              <h3>{formatCurrency(stats.todayProfit)}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon sales"><ShoppingCart size={26} /></div>
            <div className="stat-info">
              <span>Today's Sales</span>
              <h3>{formatCurrency(stats.todaySales)}</h3>
            </div>
          </div>

        <div className="stat-card">
        
          <div className="stat-icon total-revenue"><Wallet size={26} /></div>
          <div className="stat-info">
            <span>Total Revenue</span>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>
        </section>

        <h2 className="section-title">Quick Actions</h2>
        <div className="action-grid">
          <div className="action-card" onClick={goToInvoice}>
            <div className="action-content">
              <div className="action-icon-circle blue"><FileText size={32} /></div>
              <h3>Create New Invoice</h3>
              <p>Quickly generate a bill and update stock levels instantly.</p>
            </div>
            <div className="action-footer">
              <span>Go to Billing</span>
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="action-card" onClick={goToProducts}>
            <div className="action-content">
              <div className="action-icon-circle indigo"><Package size={32} /></div>
              <h3>Manage Products</h3>
              <p>Add new stock, update pricing, and monitor inventory levels.</p>
            </div>
            <div className="action-footer">
              <span>View Inventory</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;