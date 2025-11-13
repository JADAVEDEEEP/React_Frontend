// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = "http://localhost:3001/api/allproducts" || "https://react-frontend-vakw.vercel.app";

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalQuantity: 0
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch products (public endpoint or adjust as needed)
      const productsRes = await axios.get(API_URL);
      
      let productsArray = [];
      if (productsRes.data && productsRes.data.data) {
        productsArray = Array.isArray(productsRes.data.data) ? productsRes.data.data : [productsRes.data.data];
      } else if (Array.isArray(productsRes.data)) {
        productsArray = productsRes.data;
      }

      const validProducts = productsArray.filter(p => p && typeof p === 'object');
      setProducts(validProducts);

      // Calculate stats
      const totalProducts = validProducts.length;
      const totalRevenue = validProducts.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity) || 0), 0);
      const totalQuantity = validProducts.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
      
      // Simulate user count (you can fetch from users API endpoint if available)
      const totalUsers = Math.floor(Math.random() * 100) + 50;

      setStats({ totalUsers, totalProducts, totalRevenue, totalQuantity });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Top products by price
  const topProductsByPrice = products
    .slice()
    .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.name?.substring(0, 10) || 'Unknown',
      price: parseFloat(p.price) || 0
    }));

  // Top products by quantity
  const topProductsByQuantity = products
    .slice()
    .sort((a, b) => (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.name?.substring(0, 10) || 'Unknown',
      quantity: parseInt(p.quantity) || 0
    }));

  // Product category distribution (Pie chart)
  const categoryData = [
    { name: 'Electronics', value: products.filter(p => parseFloat(p.price) > 500).length, color: '#0d6efd' },
    { name: 'Fashion', value: products.filter(p => parseFloat(p.price) >= 100 && parseFloat(p.price) <= 500).length, color: '#6610f2' },
    { name: 'Accessories', value: products.filter(p => parseFloat(p.price) < 100).length, color: '#198754' },
  ].filter(item => item.value > 0);

  // Revenue trend (simulated monthly data)
  const revenueTrend = [
    { month: 'Jan', revenue: stats.totalRevenue * 0.6 },
    { month: 'Feb', revenue: stats.totalRevenue * 0.7 },
    { month: 'Mar', revenue: stats.totalRevenue * 0.8 },
    { month: 'Apr', revenue: stats.totalRevenue * 0.9 },
    { month: 'May', revenue: stats.totalRevenue },
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold fs-3" href="/">
            🛍️ Trendzz
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2">
              <li className="nav-item">
                <button
                  className="btn btn-light fw-bold"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-warning fw-bold text-dark"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section with Stats */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Welcome to Trendzz</h1>
          <p className="lead mb-4 text-muted">
            Your complete product management solution with real-time analytics
          </p>
          <div className="d-flex justify-content-center gap-3 mb-5">
            <button
              className="btn btn-primary btn-lg fw-bold px-5"
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </button>
            <button
              className="btn btn-outline-primary btn-lg fw-bold px-5"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <span style={{ fontSize: '28px' }}>👥</span>
                    </div>
                    <h2 className="fw-bold mb-1">{stats.totalUsers}</h2>
                    <p className="text-muted mb-0">Total Users</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <span style={{ fontSize: '28px' }}>📦</span>
                    </div>
                    <h2 className="fw-bold mb-1">{stats.totalProducts}</h2>
                    <p className="text-muted mb-0">Total Products</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <span style={{ fontSize: '28px' }}>💰</span>
                    </div>
                    <h2 className="fw-bold mb-1">${stats.totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</h2>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <span style={{ fontSize: '28px' }}>📊</span>
                    </div>
                    <h2 className="fw-bold mb-1">{stats.totalQuantity.toLocaleString()}</h2>
                    <p className="text-muted mb-0">Total Stock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="row g-4 mb-5">
              {/* Top Products by Price */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4">🏆 Top Products by Price</h5>
                    {topProductsByPrice.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topProductsByPrice}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => `$${value}`} />
                          <Bar dataKey="price" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">No product data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Products by Quantity */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4">📈 Top Products by Stock</h5>
                    {topProductsByQuantity.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topProductsByQuantity}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="quantity" fill="#198754" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">No product data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Categories (Pie) */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4">🎯 Product Categories</h5>
                    {categoryData.length > 0 ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <ResponsiveContainer width="60%" height={250}>
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="ms-3">
                          {categoryData.map((item, index) => (
                            <div key={index} className="d-flex align-items-center mb-2">
                              <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: item.color, marginRight: '10px' }}></div>
                              <span className="small">{item.name} ({item.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-5">No category data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4">💸 Revenue Trend</h5>
                    {stats.totalRevenue > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => `$${value.toFixed(0)}`} />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#6610f2" 
                            strokeWidth={3} 
                            dot={{ fill: '#6610f2', r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">No revenue data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="row g-4 mb-5">
              <div className="col-12">
                <div className="card border-0 shadow-sm bg-primary bg-gradient text-white">
                  <div className="card-body p-5 text-center">
                    <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
                    <p className="lead mb-4">Join thousands of businesses managing their inventory efficiently</p>
                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-light btn-lg fw-bold px-5"
                        onClick={() => navigate('/register')}
                      >
                        Create Free Account
                      </button>
                      <button
                        className="btn btn-outline-light btn-lg fw-bold px-5"
                        onClick={() => navigate('/login')}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                      <span style={{ fontSize: '32px' }}>⚡</span>
                    </div>
                    <h5 className="fw-bold mb-2">Real-time Analytics</h5>
                    <p className="text-muted">Track your inventory and sales in real-time with powerful dashboards</p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                      <span style={{ fontSize: '32px' }}>🔒</span>
                    </div>
                    <h5 className="fw-bold mb-2">Secure & Reliable</h5>
                    <p className="text-muted">Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                      <span style={{ fontSize: '32px' }}>🚀</span>
                    </div>
                    <h5 className="fw-bold mb-2">Easy to Use</h5>
                    <p className="text-muted">Intuitive interface designed for maximum productivity</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-top py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <h5 className="fw-bold">🛍️ Trendzz</h5>
              <p className="text-muted mb-0">Your trusted product management platform</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="text-muted mb-0">
                &copy; {new Date().getFullYear()} Trendzz. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}