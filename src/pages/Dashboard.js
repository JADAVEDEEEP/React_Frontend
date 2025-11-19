// Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "https://node-backend-nu-eight.vercel.app/api";

export default function Dashboard() {
  const navigate = useNavigate();

  // state
  const [user, setUser] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState("A");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productDetail, setProductDetail] = useState(null); // product detail modal
  const [animateTrigger, setAnimateTrigger] = useState(0); // to re-trigger counters when data updates

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const axiosInstance = useMemo(() => {
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token]);

  // toast helper
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // fetch products
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

      const validProducts = productsArray.filter((p) => p && typeof p === "object");

      setProducts(validProducts);
      setFilteredProducts(validProducts);
      setAnimateTrigger((s) => s + 1);
    } catch (err) {
      showToast("Failed to load products", "error");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, showToast]);

  // initial load - user + data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      const userJoined = localStorage.getItem("userJoined") || null;

      if (!token) {
        navigate("/login");
        return;
      }

      setUser({ id: userId, name: userName, email: userEmail, joined: userJoined });
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter & sort
  useEffect(() => {
    let filtered = products.filter((p) => p && p._id);

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") return (a?.name || "").localeCompare(b?.name || "");
      if (sortBy === "price") return (b?.price || 0) - (a?.price || 0);
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  // stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce(
      (sum, p) => sum + ((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)),
      0
    );
    const totalQuantity = products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
    const avgPrice =
      totalProducts > 0 ? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / totalProducts : 0;

    return { totalProducts, totalRevenue, totalQuantity, avgPrice };
  }, [products]);

  // price chart data
  const priceChartData = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
      .slice(0, 7)
      .map((p) => ({
        name: p.name?.substring(0, 15) || "Unknown",
        price: parseFloat(p.price) || 0,
      }));
  }, [products]);

  const quantityChartData = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0))
      .slice(0, 8)
      .map((p) => ({
        name: p.name?.substring(0, 10) || "Unknown",
        quantity: parseInt(p.quantity) || 0,
      }));
  }, [products]);

  const valueDistributionData = useMemo(() => {
    const topProducts = products
      .map((p) => ({
        name: p.name || "Unknown",
        value: (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0),
      }))
      .filter((p) => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const colors = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545"];

    return topProducts.map((item, index) => ({ ...item, color: colors[index % colors.length] }));
  }, [products]);

  const priceRangeData = useMemo(() => {
    const ranges = [
      { range: "$0-50", min: 0, max: 50 },
      { range: "$51-100", min: 51, max: 100 },
      { range: "$101-200", min: 101, max: 200 },
      { range: "$201-500", min: 201, max: 500 },
      { range: "$500+", min: 501, max: Infinity },
    ];

    return ranges.map((r) => ({
      range: r.range,
      count: products.filter((p) => {
        const price = parseFloat(p.price) || 0;
        return price >= r.min && price <= r.max;
      }).length,
    }));
  }, [products]);

  const recentTransactions = useMemo(() => {
    return products.slice(0, 5).map((p) => ({
      product: p.name || "Unknown Product",
      date: new Date(p.createdAt || Date.now()).toLocaleDateString(),
      time: new Date(p.createdAt || Date.now()).toLocaleTimeString(),
      quantity: p.quantity || 0,
      price: p.price || 0,
      total: ((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2),
      status: parseInt(p.quantity) > 10 ? "In Stock" : parseInt(p.quantity) > 0 ? "Low Stock" : "Out of Stock",
      raw: p,
    }));
  }, [products]);

  // CRUD handlers (keep from your original code)
  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      const res = await axiosInstance.post(API_URL, data);
      const newProduct = res.data.data ? res.data.data[0] : res.data;
      setProducts((prev) => [newProduct, ...prev]);
      setShowForm(false);
      showToast("Product created successfully!", "success");
    } catch (err) {
      showToast("Error creating product", "error");
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
      setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)));
      setShowForm(false);
      setSelectedProduct(null);
      showToast("Product updated successfully!", "success");
    } catch (err) {
      showToast("Error updating product", "error");
      console.error(err.response?.data || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast("Product deleted successfully!", "success");
    } catch (err) {
      showToast("Error deleting product", "error");
      console.error(err.response?.data || err.message);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") localStorage.clear();
    navigate("/login");
  };

  // Theme colors
  const themeColors = {
    A: { primary: "#0d6efd", secondary: "#6c757d", accent: "#0dcaf0" },
    B: { primary: "#ffc107", secondary: "#fd7e14", accent: "#20c997" },
    C: { primary: "#212529", secondary: "#495057", accent: "#6c757d" },
  };
  const currentTheme = themeColors[theme];

  /* ===== animated counters (simple requestAnimationFrame) ===== */
  const useAnimatedNumber = (value, duration = 700, trigger = 0) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
      const start = performance.now();
      const from = 0;
      const to = Number(value) || 0;

      const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(from + (to - from) * eased);
        setDisplay(current);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
      // retrigger when value or trigger changes
    }, [value, duration, trigger]);

    return display;
  };

  const animatedTotalProducts = useAnimatedNumber(stats.totalProducts, 900, animateTrigger);
  const animatedTotalQuantity = useAnimatedNumber(stats.totalQuantity, 900, animateTrigger);
  const animatedTotalRevenue = useAnimatedNumber(Math.round(stats.totalRevenue), 900, animateTrigger);
  const animatedAvgPrice = useAnimatedNumber(Math.round(stats.avgPrice), 900, animateTrigger);

  // open product detail modal when clicking a row
  const openProductDetail = (p) => {
    setProductDetail(p);
  };

  /* =======================
     Layout & Styles
     ======================= */
  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f7f7fc" }}>
      <style>{`
        /* SIDEBAR */
        .sidebar {
          width: 240px;
          transition: width 220ms cubic-bezier(.2,.9,.2,1), box-shadow 220ms;
          background: #fff;
          border-right: 1px solid #e9eef6;
          min-height: 100vh;
          position: sticky;
          top: 0;
          z-index: 900;
        }
        .sidebar.collapsed { width: 72px; }
        .sidebar .menu {
          padding: 18px;
        }
        .sb-item {
          display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer;
          transition: background 180ms, transform 160ms;
          color:#333;
        }
        .sb-item:hover { background: #f6f7fb; transform: translateY(-2px); }
        .sb-item.active { background: linear-gradient(135deg, rgba(122,136,160,0.12), rgba(30,51,86,0.06)); color: ${currentTheme.primary}; }
        .sb-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:#fff; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
        .sb-label { font-weight:600; white-space:nowrap; }

        /* collapse button */
        .collapse-btn {
          display:flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:8px; cursor:pointer; margin: 14px;
          background:#fff; box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        /* header */
        .hp-header {
          background: #fff;
          padding: 14px 18px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          position: sticky;
          top: 0;
          z-index: 800;
        }
        .hp-brand { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .hp-logo {
          width:42px; height:42px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(135deg, #7a88a0ff, #1e3356ff);
          color: #fff; font-size: 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.14);
        }
        .hp-name {
          font-weight: 800;
          font-size: 1.05rem;
          background: linear-gradient(135deg, #7a88a0ff, #1e3356ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hp-avatar {
          width:40px; height:40px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          background:#fff; border:1px solid #eee; cursor:pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        /* mobile drawer */
        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #fff;
          z-index: 1500;
          transform: translateX(-110%);
          transition: transform 0.28s ease;
          box-shadow: 6px 0 20px rgba(0,0,0,0.08);
          padding: 18px;
        }
        .mobile-drawer.open { transform: translateX(0); }
        .mobile-drawer .item { padding: 10px 8px; border-radius:8px; cursor:pointer; }
        .mobile-drawer .item:hover { background: #f6f6fb; }

        /* main */
        .main-area {
          flex: 1;
          min-height: 100vh;
          overflow: auto;
        }
        .container-main { padding: 18px; max-width: 1200px; margin: 0 auto; width: 100%; }

        /* small animations */
        .fade-in-up { transform: translateY(8px); opacity:0; animation: fadeUp .45s forwards; }
        @keyframes fadeUp { to { transform:none; opacity:1; } }

        /* responsive: sidebar becomes top on small screens */
        @media(max-width: 991px) {
          .sidebar { display:none; }
        }
      `}</style>

      {/* Sidebar (desktop) */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div style={{ display: "flex", justifyContent: sidebarCollapsed ? "center" : "space-between", alignItems: "center", padding: "14px 12px" }}>
          {!sidebarCollapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setActiveTab("dashboard"); }}>
              <div className="hp-logo" style={{ width: 38, height: 38, fontSize: 18 }}>🛍️</div>
              <div>
                <div style={{ fontWeight: 800 }}>Lavish</div>
                <div style={{ fontSize: 12, color: "#666" }}>Seller Dashboard</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }} onClick={() => { setActiveTab("dashboard"); }}>
              <div className="hp-logo" style={{ width: 38, height: 38, fontSize: 18 }}>🛍️</div>
            </div>
          )}

          <div style={{ display: sidebarCollapsed ? "none" : "block" }}>
            {/* empty for alignment */}
          </div>
        </div>

        <div className="menu">
          <div
            className={`sb-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
            title="Dashboard"
            style={{ marginBottom: 6 }}
          >
            <div className="sb-icon">📊</div>
            {!sidebarCollapsed && <div className="sb-label">Dashboard</div>}
          </div>

          <div
            className={`sb-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
            title="Products"
            style={{ marginBottom: 6 }}
          >
            <div className="sb-icon">📦</div>
            {!sidebarCollapsed && <div className="sb-label">Products</div>}
          </div>

          <div
            className={`sb-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            title="Orders"
            style={{ marginBottom: 6 }}
          >
            <div className="sb-icon">🧾</div>
            {!sidebarCollapsed && <div className="sb-label">Orders</div>}
          </div>

          <div
            className={`sb-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            title="Settings"
            style={{ marginBottom: 12 }}
          >
            <div className="sb-icon">⚙️</div>
            {!sidebarCollapsed && <div className="sb-label">Settings</div>}
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between", padding: "0 12px", marginTop: 12 }}>
            <div style={{ width: sidebarCollapsed ? "100%" : "auto", display: "flex", justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
              <div className="sb-item" onClick={() => { handleLogout(); }}>
                <div className="sb-icon">🚪</div>
                {!sidebarCollapsed && <div className="sb-label">Logout</div>}
              </div>
            </div>

            <div style={{ display: sidebarCollapsed ? "none" : "block" }}>
              <div className="collapse-btn" title={sidebarCollapsed ? "Expand" : "Collapse"} onClick={() => setSidebarCollapsed((s) => !s)}>
                {sidebarCollapsed ? "»" : "«"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="hp-logo" style={{ width: 38, height: 38 }}>🛍️</div>
            <div>
              <div style={{ fontWeight: 800 }}>Lavish</div>
              <small className="text-muted">Seller Dashboard</small>
            </div>
          </div>
          <button className="btn btn-link" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 20 }}>✕</button>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="item" onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}>📊 Dashboard</div>
          <div className="item" onClick={() => { setActiveTab("products"); setMobileMenuOpen(false); }}>📦 Products</div>
          <div className="item" onClick={() => { setActiveTab("orders"); setMobileMenuOpen(false); }}>🧾 Orders</div>
          <div className="item" onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}>⚙️ Settings</div>
          <div className="item text-danger" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>🚪 Logout</div>
        </div>
      </div>

      {/* Main area */}
      <div className="main-area" style={{ flex: 1 }}>
        {/* Header */}
        <div className="hp-header">
          <div className="d-flex align-items-center justify-content-between">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* mobile menu toggle */}
              <button className="btn btn-link d-lg-none" onClick={() => setMobileMenuOpen(true)} style={{ fontSize: 20, marginRight: 6 }}>☰</button>

              <div className="hp-brand" onClick={() => setActiveTab("dashboard")}>
                <div className="hp-logo">🛍️</div>
                <div style={{ marginLeft: 6 }}>
                  <div className="hp-name">Lavish</div>
                  <div style={{ fontSize: 12, color: "#666" }}>Seller Dashboard</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="d-none d-sm-flex align-items-center">
                <button className={`btn btn-sm me-1 ${theme === "A" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTheme("A")}>A</button>
                <button className={`btn btn-sm me-1 ${theme === "B" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setTheme("B")}>B</button>
                <button className={`btn btn-sm ${theme === "C" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setTheme("C")}>C</button>
              </div>

              <div title="Profile" onClick={() => setProfileOpen(true)} style={{ marginLeft: 8 }}>
                <div className="hp-avatar">{user.name ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "U"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* content container */}
        <div className="container-main">
          {activeTab === "dashboard" ? (
            <div className="fade-in-up">
              {/* Stats row */}
              <div className="row g-3 g-md-4 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="p-2 rounded-3" style={{ backgroundColor: `${currentTheme.primary}20` }}>
                          <span style={{ fontSize: "20px" }}>📦</span>
                        </div>
                      </div>
                      <p className="text-muted mb-1 small">Total Products</p>
                      <h4 className="mb-0 fw-bold">{animatedTotalProducts}</h4>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="bg-success bg-opacity-10 p-2 rounded-3">
                          <span style={{ fontSize: "20px" }}>📊</span>
                        </div>
                      </div>
                      <p className="text-muted mb-1 small">Total Quantity</p>
                      <h4 className="mb-0 fw-bold">{animatedTotalQuantity.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="bg-danger bg-opacity-10 p-2 rounded-3">
                          <span style={{ fontSize: "20px" }}>💰</span>
                        </div>
                      </div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h5 className="mb-0 fw-bold">${animatedTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h5>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                          <span style={{ fontSize: "20px" }}>📈</span>
                        </div>
                      </div>
                      <p className="text-muted mb-1 small">Average Price</p>
                      <h5 className="mb-0 fw-bold">${animatedAvgPrice}</h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="row g-3 g-md-4 mb-4">
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <h6 className="mb-3 fw-semibold">Top Products by Price</h6>
                      {priceChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={priceChartData} margin={{ left: -10 }} barGap={6}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-42} textAnchor="end" height={70} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Bar dataKey="price" fill={currentTheme.primary} radius={[8, 8, 2, 2]} animationDuration={1000} />
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
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={quantityChartData} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-42} textAnchor="end" height={70} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#198754" radius={[8, 8, 2, 2]} animationDuration={1000} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-muted py-5">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* second row */}
              <div className="row g-3 g-md-4 mb-4">
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <h6 className="mb-3 fw-semibold">Top 5 Products by Total Value</h6>
                      {valueDistributionData.length > 0 ? (
                        <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                          <ResponsiveContainer width="60%" height={220}>
                            <PieChart>
                              <Pie data={valueDistributionData} cx="50%" cy="50%" innerRadius={48} outerRadius={88} paddingAngle={2} dataKey="value" animationDuration={1200}>
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
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: item.color, marginRight: "8px" }} />
                                <small className="text-muted">{item.name.substring(0, 18)}</small>
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
                      {priceRangeData.some((d) => d.count > 0) ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={priceRangeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#6610f2" strokeWidth={3} dot={{ fill: "#6610f2", r: 5 }} animationDuration={1200} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-muted py-5">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* recent products table */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold">Recent Products Overview</h5>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 220 }} />
                      <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 150 }}>
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                      </select>
                    </div>
                  </div>

                  {recentTransactions.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th className="small">Product Name</th>
                            <th className="small d-none d-sm-table-cell">Date</th>
                            <th className="small d-none d-md-table-cell">Time</th>
                            <th className="small">Qty</th>
                            <th className="small">Price</th>
                            <th className="small d-none d-lg-table-cell">Total</th>
                            <th className="small">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTransactions.map((txn, idx) => (
                            <tr key={idx}>
                              <td className="fw-semibold small" style={{ cursor: "pointer" }} onClick={() => openProductDetail(txn.raw)}>{txn.product}</td>
                              <td className="text-muted small d-none d-sm-table-cell">{txn.date}</td>
                              <td className="text-muted small d-none d-md-table-cell">{txn.time}</td>
                              <td className="small">{txn.quantity}</td>
                              <td className="small">${txn.price}</td>
                              <td className="fw-semibold small d-none d-lg-table-cell">${txn.total}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    txn.status === "In Stock" ? "bg-success" :
                                    txn.status === "Low Stock" ? "bg-warning text-dark" : "bg-danger"
                                  }`}
                                  style={{ fontSize: "10px" }}
                                >
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
            </div>
          ) : (
            /* PRODUCTS view (compact) */
            <div className="fade-in-up">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h4 className="mb-0 fw-bold">Products Management</h4>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-sm" style={{ backgroundColor: currentTheme.primary, color: "#fff", border: "none" }} onClick={() => { setShowForm(true); setSelectedProduct(null); }}>➕ Add Product</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchProducts()}>↺ Refresh</button>
                    </div>
                  </div>

                  <div className="row g-2 g-md-3 mb-4">
                    <div className="col-12 col-md-8">
                      <input type="text" className="form-control" placeholder="🔍 Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="col-12 col-md-4">
                      <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
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
                            <tr><td colSpan="7" className="text-center text-muted py-4">No products found</td></tr>
                          ) : (
                            filteredProducts.map((p, index) => (
                              <tr key={p._id || index}>
                                <td className="small">{index + 1}</td>
                                <td className="fw-semibold small" style={{ cursor: "pointer" }} onClick={() => openProductDetail(p)}>{p.name || "N/A"}</td>
                                <td className="text-muted small d-none d-md-table-cell">{p.description || "N/A"}</td>
                                <td className="small">${p.price || "0"}</td>
                                <td>
                                  <span className={`badge ${
                                    parseInt(p.quantity) > 10 ? "bg-success" :
                                    parseInt(p.quantity) > 0 ? "bg-warning text-dark" : "bg-danger"
                                  }`} style={{ fontSize: "10px" }}>
                                    {p.quantity || "0"}
                                  </span>
                                </td>
                                <td className="fw-semibold small d-none d-lg-table-cell">${((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2)}</td>
                                <td>
                                  <button className="btn btn-sm btn-warning me-1" onClick={() => { setSelectedProduct(p); setShowForm(true); }}>✏️</button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>🗑️</button>
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

      {/* Product Detail Modal */}
      {productDetail && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Product Details</h5>
                <button type="button" className="btn-close" onClick={() => setProductDetail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex gap-3 align-items-start">
                  <div style={{ width: 96, height: 96, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                    📦
                  </div>
                  <div>
                    <h5 style={{ marginBottom: 6 }}>{productDetail.name || "Untitled"}</h5>
                    <div className="text-muted mb-2">{productDetail.description || "No description provided."}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      <div><strong>Price:</strong> ${productDetail.price || "0"}</div>
                      <div><strong>Qty:</strong> {productDetail.quantity || "0"}</div>
                      <div><strong>SKU:</strong> {productDetail.sku || "—"}</div>
                    </div>
                    <div style={{ marginTop: 10 }}><small className="text-muted">Added: {new Date(productDetail.createdAt || Date.now()).toLocaleString()}</small></div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={() => setProductDetail(null)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => { setSelectedProduct(productDetail); setShowForm(true); setProductDetail(null); }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">User Profile</h5>
                <button type="button" className="btn-close" onClick={() => setProfileOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #7a88a0ff, #1e3356ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>
                    {user.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("") : "U"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name || "User"}</div>
                    <div className="text-muted" style={{ fontSize: 14 }}>{user.email || ""}</div>
                    {user.joined && <div className="text-muted small mt-1">Joined: {user.joined}</div>}
                  </div>
                </div>

                <div>
                  <div className="mb-2"><strong>User ID:</strong> <span className="text-muted">{user.id || "—"}</span></div>
                  {/* Add more fields if desired */}
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={() => setProfileOpen(false)}>Close</button>
                <button type="button" className="btn btn-danger" onClick={() => { setProfileOpen(false); handleLogout(); }}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === "success" ? "success" : "danger"} shadow-lg`} style={{ zIndex: 9999 }} role="alert">
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ProductForm component */
function ProductForm({ product, onSubmit, onCancel, loading, themeColor }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    quantity: product?.quantity || "",
    sku: product?.sku || "",
  });

  useEffect(() => {
    setForm({
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      quantity: product?.quantity || "",
      sku: product?.sku || "",
    });
  }, [product]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">{product ? "Edit Product" : "Add Product"}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Product Name</label>
                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Enter product name" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Price ($)</label>
                <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} placeholder="0.00" step="0.01" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Enter product description"></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Quantity</label>
                <input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} placeholder="0" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">SKU (optional)</label>
                <input type="text" className="form-control" name="sku" value={form.sku} onChange={handleChange} placeholder="SKU / Identifier" />
              </div>
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn text-white" style={{ backgroundColor: themeColor, border: "none" }} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
