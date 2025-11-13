// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = "http://localhost:3001/api" || "https://react-frontend-vakw.vercel.app";

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

  const token = localStorage.getItem('token');

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
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (!token) {
      navigate('/login');
      return;
    }

    setUser({ id: userId, name: userName, email: userEmail });
    fetchProducts();
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

  // Calculate real statistics from products
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity) || 0), 0);
    const totalQuantity = products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
    const avgPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / totalProducts : 0;

    return { totalProducts, totalRevenue, totalQuantity, avgPrice };
  }, [products]);

  // Chart 1: Top Products by Price (Bar Chart)
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

  // Chart 2: Quantity Distribution (Bar Chart)
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

  // Chart 3: Product Value Distribution (Pie Chart - Price * Quantity)
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

  // Chart 4: Price Range Distribution (Line Chart)
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

  // Recent transactions based on products
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
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 bg-white shadow-sm vh-100 position-sticky top-0" style={{ borderRight: '1px solid #dee2e6' }}>
          <div className="p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary text-white rounded-3 p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <strong>B</strong>
              </div>
              <h5 className="mb-0 fw-bold">BayaPay</h5>
            </div>

            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <button
                  className={`nav-link btn text-start w-100 ${activeTab === 'dashboard' ? 'btn-primary text-white' : 'btn-light'}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Dashboard
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link btn text-start w-100 ${activeTab === 'products' ? 'btn-primary text-white' : 'btn-light'}`}
                  onClick={() => setActiveTab('products')}
                >
                  📦 Products
                </button>
              </li>
            </ul>

            <div className="position-absolute bottom-0 start-0 w-100 p-3">
              <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-0">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-bottom sticky-top">
            <div className="container-fluid">
              <div className="d-flex justify-content-between align-items-center py-3">
                <h3 className="mb-0 fw-bold">Merchant Dashboard</h3>
                <div className="d-flex align-items-center gap-2">
                  <span className="me-3">Welcome, <strong>{user.name || 'User'}</strong></span>
                  <button className="btn btn-light btn-sm">🔍</button>
                  <button className="btn btn-light btn-sm">🔔</button>
                  <button className="btn btn-light btn-sm">⚙️</button>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'dashboard' ? (
            <div className="p-4">
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
                  <div className="row g-4 mb-4">
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                              <span style={{ fontSize: '24px' }}>📦</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Total Products</p>
                          <h3 className="mb-0 fw-bold">{stats.totalProducts}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="bg-success bg-opacity-10 p-3 rounded-3">
                              <span style={{ fontSize: '24px' }}>📊</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Total Quantity</p>
                          <h3 className="mb-0 fw-bold">{stats.totalQuantity.toLocaleString()}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="bg-danger bg-opacity-10 p-3 rounded-3">
                              <span style={{ fontSize: '24px' }}>💰</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Total Revenue</p>
                          <h3 className="mb-0 fw-bold">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                              <span style={{ fontSize: '24px' }}>📈</span>
                            </div>
                          </div>
                          <p className="text-muted mb-1 small">Average Price</p>
                          <h3 className="mb-0 fw-bold">${stats.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="row g-4 mb-4">
                    {/* Top Products by Price */}
                    <div className="col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h6 className="mb-3 fw-semibold">Top Products by Price</h6>
                          {priceChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={priceChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => `$${value}`} />
                                <Bar dataKey="price" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-center text-muted py-5">No data available</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock Quantity by Product */}
                    <div className="col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h6 className="mb-3 fw-semibold">Stock Quantity by Product</h6>
                          {quantityChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={quantityChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 12 }} />
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
                  <div className="row g-4 mb-4">
                    {/* Product Value Distribution (Pie) */}
                    <div className="col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h6 className="mb-3 fw-semibold">Top 5 Products by Total Value</h6>
                          {valueDistributionData.length > 0 ? (
                            <div className="d-flex align-items-center justify-content-center">
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
                              <div className="ms-3">
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

                    {/* Price Range Distribution */}
                    <div className="col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h6 className="mb-3 fw-semibold">Price Range Distribution</h6>
                          {priceRangeData.some(d => d.count > 0) ? (
                            <ResponsiveContainer width="100%" height={220}>
                              <LineChart data={priceRangeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
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
                    <div className="card-body">
                      <h5 className="mb-3 fw-semibold">Recent Products Overview</h5>
                      {recentTransactions.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Product Name</th>
                                <th>Date Added</th>
                                <th>Time</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total Value</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentTransactions.map((txn, index) => (
                                <tr key={index}>
                                  <td className="fw-semibold">{txn.product}</td>
                                  <td className="text-muted small">{txn.date}</td>
                                  <td className="text-muted small">{txn.time}</td>
                                  <td>{txn.quantity}</td>
                                  <td>${txn.price}</td>
                                  <td className="fw-semibold">${txn.total}</td>
                                  <td>
                                    <span className={`badge ${
                                      txn.status === 'In Stock' ? 'bg-success' : 
                                      txn.status === 'Low Stock' ? 'bg-warning text-dark' : 'bg-danger'
                                    }`}>
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
            <div className="p-4">
              {/* Products Section */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 fw-bold">Products Management</h4>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setSelectedProduct(null);
                      }}
                      className="btn btn-primary"
                    >
                      ➕ Add Product
                    </button>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
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
                            <th>#</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price ($)</th>
                            <th>Quantity</th>
                            <th>Total Value</th>
                            <th>Actions</th>
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
                                <td>{index + 1}</td>
                                <td className="fw-semibold">{p.name || 'N/A'}</td>
                                <td className="text-muted">{p.description || 'N/A'}</td>
                                <td>${p.price || '0'}</td>
                                <td>
                                  <span className={`badge ${
                                    parseInt(p.quantity) > 10 ? 'bg-success' : 
                                    parseInt(p.quantity) > 0 ? 'bg-warning text-dark' : 'bg-danger'
                                  }`}>
                                    {p.quantity || '0'}
                                  </span>
                                </td>
                                <td className="fw-semibold">
                                  ${((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2)}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => {
                                      setSelectedProduct(p);
                                      setShowForm(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(p._id)}
                                  >
                                    Delete
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

function ProductForm({ product, onSubmit, onCancel, loading }) {
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
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