import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_PRODUCT_URL || "http://localhost:3001/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('A');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const axiosInstance = useMemo(() => {
    return axios.create({
      headers: { Authorization: `Bearer ${token}` }
    });
  }, [token]);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_URL);
      
      let productsArray = [];
      if (res.data && res.data.data) {
        productsArray = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      } else if (Array.isArray(res.data)) {
        productsArray = res.data;
      }
      
      const validProducts = productsArray.filter(p => p && typeof p === 'object');
      
      setProducts(validProducts);
      setFilteredProducts(validProducts);
    } catch (err) {
      showToast('Failed to load products', 'error');
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, showToast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');

      if (!token) {
        navigate('/login');
        return;
      }

      setUser({ id: userId, name: userName, email: userEmail });
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    let filtered = products.filter(p => p && p._id);

    if (searchTerm.trim()) {
      filtered = filtered.filter(p =>
        p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return (a?.name || '').localeCompare(b?.name || '');
      if (sortBy === 'price') return (b?.price || 0) - (a?.price || 0);
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity) || 0), 0);
    const totalQuantity = products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
    const avgPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / totalProducts : 0;

    return { totalProducts, totalRevenue, totalQuantity, avgPrice };
  }, [products]);

  const priceChartData = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
      .slice(0, 7)
      .map(p => ({
        name: p.name?.substring(0, 15) || 'Unknown',
        price: parseFloat(p.price) || 0
      }));
  }, [products]);

  const quantityChartData = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0))
      .slice(0, 8)
      .map(p => ({
        name: p.name?.substring(0, 10) || 'Unknown',
        quantity: parseInt(p.quantity) || 0
      }));
  }, [products]);

  const valueDistributionData = useMemo(() => {
    const topProducts = products
      .map(p => ({
        name: p.name || 'Unknown',
        value: (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)
      }))
      .filter(p => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const colors = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545'];
    
    return topProducts.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  }, [products]);

  const priceRangeData = useMemo(() => {
    const ranges = [
      { range: '$0-50', min: 0, max: 50 },
      { range: '$51-100', min: 51, max: 100 },
      { range: '$101-200', min: 101, max: 200 },
      { range: '$201-500', min: 201, max: 500 },
      { range: '$500+', min: 501, max: Infinity }
    ];

    return ranges.map(r => ({
      range: r.range,
      count: products.filter(p => {
        const price = parseFloat(p.price) || 0;
        return price >= r.min && price <= r.max;
      }).length
    }));
  }, [products]);

  const recentTransactions = useMemo(() => {
    return products.slice(0, 5).map((p) => ({
      product: p.name || 'Unknown Product',
      date: new Date(p.createdAt || Date.now()).toLocaleDateString(),
      time: new Date(p.createdAt || Date.now()).toLocaleTimeString(),
      quantity: p.quantity || 0,
      price: p.price || 0,
      total: ((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2),
      status: parseInt(p.quantity) > 10 ? 'In Stock' : parseInt(p.quantity) > 0 ? 'Low Stock' : 'Out of Stock'
    }));
  }, [products]);

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      const res = await axiosInstance.post(API_URL, data);
      const newProduct = res.data.data ? res.data.data[0] : res.data;
      setProducts([newProduct, ...products]);
      setShowForm(false);
      showToast('Product created successfully!', 'success');
    } catch (err) {
      showToast('Error creating product', 'error');
      console.error(err.response?.data || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setFormLoading(true);
      const res = await axiosInstance.put(`${API_URL}/${selectedProduct._id}`, data);
      const updatedProduct = res.data.data ? res.data.data[0] : res.data;
      setProducts(products.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
      setShowForm(false);
      setSelectedProduct(null);
      showToast('Product updated successfully!', 'success');
    } catch (err) {
      showToast('Error updating product', 'error');
      console.error(err.response?.data || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      setProducts(products.filter(p => p._id !== id));
      showToast('Product deleted successfully!', 'success');
    } catch (err) {
      showToast('Error deleting product', 'error');
      console.error(err.response?.data || err.message);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    navigate('/login');
  };

  // Theme colors
  const themeColors = {
    A: { primary: '#0d6efd', secondary: '#6c757d', accent: '#0dcaf0' },
    B: { primary: '#ffc107', secondary: '#fd7e14', accent: '#20c997' },
    C: { primary: '#212529', secondary: '#495057', accent: '#6c757d' }
  };

  const currentTheme = themeColors[theme];

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Top Navbar */}
      <style>{`
        .hp-header {
          background: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .hp-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 900;
        }
        .hp-badge {
          font-size: 10px;
          background: ${currentTheme.primary};
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .hp-nav {
          gap: 1.5rem;
        }
        .nav-link {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }
        .nav-link:hover {
          color: ${currentTheme.primary};
        }
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: white;
          z-index: 9999;
          padding: 2rem;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
        }
        .mobile-menu.open {
          transform: translateX(0);
        }
        .sidebar {
          transition: transform 0.3s ease-in-out;
        }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 999;
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .hp-header {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="hp-header">
        <div className="d-flex justify-content-between align-items-center">
          {/* Mobile Menu Toggle */}
          <button 
            className="btn btn-link d-md-none p-0 me-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ fontSize: '24px', textDecoration: 'none' }}
          >
            ☰
          </button>

          {/* BRAND LOGO */}
          <div className="d-flex align-items-center gap-3">
            <div className="hp-brand">
              <span style={{ fontSize: 22 }}>🛍️</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Trendzz</div>
                <div className="hp-badge">Seller Dashboard</div>
              </div>
            </div>
          </div>

          {/* NAV LINKS + THEME + BUTTONS */}
          <div className="d-flex align-items-center">
            {/* DESKTOP NAV LINKS */}
            <nav className="hp-nav d-none d-lg-flex">
              <a className="nav-link" href="/">Home</a>
              <a className="nav-link" href="/collection">Collection</a>
              <a className="nav-link" href="/shop">Shop</a>
              <a className="nav-link" href="/about">About</a>
            </nav>

            {/* THEME BUTTONS */}
            <div className="d-none d-sm-flex align-items-center ms-3 me-2">
              <button
                className={`btn btn-sm me-1 ${theme === "A" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTheme("A")}
              >
                A
              </button>
              <button
                className={`btn btn-sm me-1 ${theme === "B" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => setTheme("B")}
              >
                B
              </button>
              <button
                className={`btn btn-sm ${theme === "C" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setTheme("C")}
              >
                C
              </button>
            </div>

            {/* User Info - Desktop */}
            <span className="me-3 d-none d-md-inline">
              Welcome, <strong>{user.name || 'User'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Menu</h5>
          <button 
            className="btn btn-link p-0"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '24px', textDecoration: 'none' }}
          >
            ✕
          </button>
        </div>
        
        <nav className="d-flex flex-column gap-3">
          <a className="nav-link" href="/" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a className="nav-link" href="/collection" onClick={() => setMobileMenuOpen(false)}>Collection</a>
          <a className="nav-link" href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</a>
          <a className="nav-link" href="/about" onClick={() => setMobileMenuOpen(false)}>About</a>
          
          <hr />
          
          <div className="d-flex gap-2 mb-3">
            <button
              className={`btn btn-sm ${theme === "A" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setTheme("A")}
            >
              Theme A
            </button>
            <button
              className={`btn btn-sm ${theme === "B" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setTheme("B")}
            >
              Theme B
            </button>
            <button
              className={`btn btn-sm ${theme === "C" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setTheme("C")}
            >
              Theme C
            </button>
          </div>
          
          <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </div>

      <div className="d-flex flex-grow-1">
        {/* Sidebar Toggle Button (Mobile) */}
        <button 
          className="btn btn-primary d-md-none position-fixed"
          style={{ bottom: '20px', right: '20px', zIndex: 998, borderRadius: '50%', width: '50px', height: '50px' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          📊
        </button>

        {/* Sidebar */}
        <div className={`sidebar bg-white shadow-sm ${sidebarOpen ? 'open' : ''}`} style={{ width: '250px', borderRight: '1px solid #dee2e6', minHeight: 'calc(100vh - 73px)' }}>
          <div className="p-4">
            <button 
              className="btn btn-link d-md-none p-0 mb-3"
              onClick={() => setSidebarOpen(false)}
              style={{ fontSize: '20px', textDecoration: 'none' }}
            >
              ✕ Close
            </button>

            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <button
                  className={`nav-link btn text-start w-100 ${activeTab === 'dashboard' ? 'text-white' : 'btn-light'}`}
                  style={activeTab === 'dashboard' ? { backgroundColor: currentTheme.primary } : {}}
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSidebarOpen(false);
                  }}
                >
                  📊 Dashboard
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link btn text-start w-100 ${activeTab === 'products' ? 'text-white' : 'btn-light'}`}
                  style={activeTab === 'products' ? { backgroundColor: currentTheme.primary } : {}}
                  onClick={() => {
                    setActiveTab('products');
                    setSidebarOpen(false);
                  }}
                >
                  📦 Products
                </button>
              </li>
            </ul>

            <div className="mt-4 d-none d-md-block">
              <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1">
          {activeTab === 'dashboard' ? (
            <div className="p-3 p-md-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading dashboard data...</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="row g-3 g-md-4 mb-4">
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="p-2 rounded-3" style={{ backgroundColor: `${currentTheme.primary}20` }}>
                              <span style={{ fontSize: '20px' }}>📦</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Total Products</p>
                          <h4 className="mb-0 fw-bold">{stats.totalProducts}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3">
                              <span style={{ fontSize: '20px' }}>📊</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Total Quantity</p>
                          <h4 className="mb-0 fw-bold">{stats.totalQuantity.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-danger bg-opacity-10 p-2 rounded-3">
                              <span style={{ fontSize: '20px' }}>💰</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Total Revenue</p>
                          <h5 className="mb-0 fw-bold">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                              <span style={{ fontSize: '20px' }}>📈</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Average Price</p>
                          <h5 className="mb-0 fw-bold">${stats.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="row g-3 g-md-4 mb-4">
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <h6 className="mb-3 fw-semibold">Top Products by Price</h6>
                          {priceChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={priceChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value) => `$${value}`} />
                                <Bar dataKey="price" fill={currentTheme.primary} radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-center text-muted py-5">No data available</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <h6 className="mb-3 fw-semibold">Stock Quantity by Product</h6>
                          {quantityChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={quantityChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#198754" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-center text-muted py-5">No data available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Row of Charts */}
                  <div className="row g-3 g-md-4 mb-4">
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <h6 className="mb-3 fw-semibold">Top 5 Products by Total Value</h6>
                          {valueDistributionData.length > 0 ? (
                            <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                              <ResponsiveContainer width="60%" height={220}>
                                <PieChart>
                                  <Pie
                                    data={valueDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {valueDistributionData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="ms-3 mt-3 mt-sm-0">
                                {valueDistributionData.map((item, index) => (
                                  <div key={index} className="d-flex align-items-center mb-2">
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, marginRight: '8px' }}></div>
                                    <small className="text-muted">{item.name.substring(0, 15)}</small>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted py-5">No data available</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <h6 className="mb-3 fw-semibold">Price Range Distribution</h6>
                          {priceRangeData.some(d => d.count > 0) ? (
                            <ResponsiveContainer width="100%" height={220}>
                              <LineChart data={priceRangeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#6610f2" strokeWidth={3} dot={{ fill: '#6610f2', r: 5 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-center text-muted py-5">No data available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Products Table */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <h5 className="mb-3 fw-semibold">Recent Products Overview</h5>
                      {recentTransactions.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th className="small">Product Name</th>
                                <th className="small d-none d-sm-table-cell">Date Added</th>
                                <th className="small d-none d-md-table-cell">Time</th>
                                <th className="small">Qty</th>
                                <th className="small">Price</th>
                                <th className="small d-none d-lg-table-cell">Total Value</th>
                                <th className="small">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentTransactions.map((txn, index) => (
                                <tr key={index}>
                                  <td className="fw-semibold small">{txn.product}</td>
                                  <td className="text-muted small d-none d-sm-table-cell">{txn.date}</td>
                                  <td className="text-muted small d-none d-md-table-cell">{txn.time}</td>
                                  <td className="small">{txn.quantity}</td>
                                  <td className="small">${txn.price}</td>
                                  <td className="fw-semibold small d-none d-lg-table-cell">${txn.total}</td>
                                  <td>
                                    <span className={`badge ${
                                      txn.status === 'In Stock' ? 'bg-success' : 
                                      txn.status === 'Low Stock' ? 'bg-warning text-dark' : 'bg-danger'
                                    }`} style={{ fontSize: '10px' }}>
                                      {txn.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">No products available</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-3 p-md-4">
              {/* Products Section */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h4 className="mb-0 fw-bold">Products Management</h4>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setSelectedProduct(null);
                      }}
                      className="btn btn-sm btn-md-regular"
                      style={{ backgroundColor: currentTheme.primary, color: 'white', border: 'none' }}
                    >
                      ➕ Add Product
                    </button>
                  </div>

                  <div className="row g-2 g-md-3 mb-4">
                    <div className="col-12 col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <select
                        className="form-select"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                      >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th className="small">#</th>
                            <th className="small">Name</th>
                            <th className="small d-none d-md-table-cell">Description</th>
                            <th className="small">Price ($)</th>
                            <th className="small">Qty</th>
                            <th className="small d-none d-lg-table-cell">Total Value</th>
                            <th className="small">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-muted py-4">
                                No products found
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p, index) => (
                              <tr key={p._id || index}>
                                <td className="small">{index + 1}</td>
                                <td className="fw-semibold small">{p.name || 'N/A'}</td>
                                <td className="text-muted small d-none d-md-table-cell">{p.description || 'N/A'}</td>
                                <td className="small">${p.price || '0'}</td>
                                <td>
                                  <span className={`badge ${
                                    parseInt(p.quantity) > 10 ? 'bg-success' : 
                                    parseInt(p.quantity) > 0 ? 'bg-warning text-dark' : 'bg-danger'
                                  }`} style={{ fontSize: '10px' }}>
                                    {p.quantity || '0'}
                                  </span>
                                </td>
                                <td className="fw-semibold small d-none d-lg-table-cell">
                                  ${((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2)}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-warning me-1"
                                    onClick={() => {
                                      setSelectedProduct(p);
                                      setShowForm(true);
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(p._id)}
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onCancel={() => setShowForm(false)}
          onSubmit={selectedProduct ? handleUpdate : handleCreate}
          loading={formLoading}
          themeColor={currentTheme.primary}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-lg`}
          style={{ zIndex: 9999 }}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onSubmit, onCancel, loading, themeColor }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    quantity: product?.quantity || ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">{product ? 'Edit Product' : 'Add Product'}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Price ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter product description"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn text-white" 
                style={{ backgroundColor: themeColor, border: 'none' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}