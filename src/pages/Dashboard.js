import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const API_URL = "http://localhost:3001/api";

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
  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

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
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_URL);
      const productsArray = Array.isArray(res.data.data) ? res.data.data : [];
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (err) {
      showToast('Failed to load products', 'error');
      console.error(err.response?.data || err.message);
    } finally { setLoading(false); }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a?.name?.localeCompare(b?.name);
      if (sortBy === 'price') return (b?.price || 0) - (a?.price || 0);
      return new Date(b?.createdAt) - new Date(a?.createdAt);
    });
    setFilteredProducts(filtered);
  };

  useEffect(() => { filterAndSortProducts(); }, [searchTerm, sortBy, products]);

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
    } finally { setFormLoading(false); }
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
    } finally { setFormLoading(false); }
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

  if (loading) return <div className="text-center mt-5 fs-5">Loading products...</div>;

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Welcome, {user.name || 'User'} 👋</h2>
          <p className="text-muted">{user.email}</p>
        </div>
        <button className="btn btn-outline-danger fw-bold" onClick={handleLogout}>Logout</button>
      </div>

      {/* Search & Sort */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search product..."
          className="form-control flex-grow-1 shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select shadow-sm"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
        <button
          className="btn btn-primary fw-bold shadow-sm"
          onClick={() => { setShowForm(true); setSelectedProduct(null); }}
        >
          + Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="table-responsive shadow-sm rounded-4">
        <table className="table table-hover align-middle mb-0">
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
            {Array.isArray(filteredProducts) && filteredProducts.filter(p => p).map((p, index) => (
              <tr key={p._id}>
                <td>{index + 1}</td>
                <td>{p?.name}</td>
                <td>{p?.description}</td>
                <td>{p?.price}</td>
                <td>{p?.quantity}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => { setSelectedProduct(p); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          loading={formLoading}
          product={selectedProduct}
          onCancel={() => setShowForm(false)}
          onSubmit={selectedProduct ? handleUpdate : handleCreate}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`alert alert-${toast.type === 'error' ? 'danger' : 'success'} position-fixed bottom-0 end-0 m-3 shadow`}>
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
  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <form className="modal-content shadow-lg rounded-4" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="form-control shadow-sm rounded-pill" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Price ($)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} className="form-control shadow-sm rounded-pill" required />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-control shadow-sm rounded-3" rows="3"></textarea>
              </div>
              <div className="col-12">
                <label className="form-label">Quantity</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="form-control shadow-sm rounded-pill" required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary fw-bold" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
