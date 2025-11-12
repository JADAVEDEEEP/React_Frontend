// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const API_URL = "http://localhost:3001/api" ||"https://react-frontend-vakw.vercel.app";

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

  const token = localStorage.getItem('token');

  // Create axios instance only once with useMemo
  const axiosInstance = useMemo(() => {
    return axios.create({
      headers: { Authorization: `Bearer ${token}` }
    });
  }, [token]);

  // Toast helper - stable reference
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch products - stable reference
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_URL);
      
      // Ensure we have a valid array and filter out invalid entries
      let productsArray = [];
      if (res.data && res.data.data) {
        productsArray = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      } else if (Array.isArray(res.data)) {
        productsArray = res.data;
      }
      
      // Filter out undefined/null products
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

  // Initial load - only run once on mount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  // Filter and sort products
  useEffect(() => {
    // Filter out any undefined/null products first
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

  // CRUD handlers
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
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">Welcome, {user.name || 'User'} 👋</h4>
            <small className="text-muted">{user.email}</small>
          </div>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={() => {
                  setShowForm(true);
                  setSelectedProduct(null);
                }}
              >
                + Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="card shadow-sm">
        <div className="card-body">
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, index) => (
                      <tr key={p._id || index}>
                        <td>{index + 1}</td>
                        <td>{p.name || 'N/A'}</td>
                        <td>{p.description || 'N/A'}</td>
                        <td>{p.price || '0'}</td>
                        <td>{p.quantity || '0'}</td>
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
          className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'}`}
          style={{ zIndex: 9999 }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

// --- Product Form Component ---
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
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}