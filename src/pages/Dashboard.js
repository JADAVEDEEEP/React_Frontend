import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com", id: "12345" });
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
  const [productDetail, setProductDetail] = useState(null);
  const [animateTrigger, setAnimateTrigger] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const axiosInstance = useMemo(() => {
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
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
    console.log("API Response:", res.data);

    // 🔥 Check backend success
    if (res.data.success !== true) {
      showToast(res.data.message || "Failed to load products", "error");
      setProducts([]);
      setFilteredProducts([]);
      return;
    }

    // 🔥 Extract products
    const productsArray = Array.isArray(res.data.data)
      ? res.data.data
      : [res.data.data];

    setProducts(productsArray);
    setFilteredProducts(productsArray);

    // 🔥 Show backend message or default
    showToast(res.data.message || `Loaded ${productsArray.length} products`, "success");

  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Server error while loading products", "error");
    setProducts([]);
    setFilteredProducts([]);
  } finally {
    setLoading(false);
  }
}, [axiosInstance, showToast]);


  useEffect(() => {
    // Load user data from localStorage if available
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      
      if (userName) setUser({ name: userName, email: userEmail || "john@example.com", id: userId || "12345" });
    }
    
    fetchProducts();
  }, [fetchProducts]);

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

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce(
      (sum, p) => {
        const price = parseFloat(p?.price) || 0;
        const quantity = parseInt(p?.quantity) || 0;
        return sum + (price * quantity);
      },
      0
    );
    const totalQuantity = products.reduce((sum, p) => sum + (parseInt(p?.quantity) || 0), 0);
    const avgPrice =
      totalProducts > 0 ? products.reduce((sum, p) => sum + (parseFloat(p?.price) || 0), 0) / totalProducts : 0;

    return { totalProducts, totalRevenue, totalQuantity, avgPrice };
  }, [products]);

  const priceChartData = useMemo(() => {
    return products
      .filter(p => p && p.price !== undefined)
      .slice()
      .sort((a, b) => (parseFloat(b?.price) || 0) - (parseFloat(a?.price) || 0))
      .slice(0, 7)
      .map((p) => ({
        name: p?.name?.substring(0, 15) || "Unknown",
        price: parseFloat(p?.price) || 0,
      }));
  }, [products]);

  const quantityChartData = useMemo(() => {
    return products
      .filter(p => p && p.quantity !== undefined)
      .slice()
      .sort((a, b) => (parseInt(b?.quantity) || 0) - (parseInt(a?.quantity) || 0))
      .slice(0, 8)
      .map((p) => ({
        name: p?.name?.substring(0, 10) || "Unknown",
        quantity: parseInt(p?.quantity) || 0,
      }));
  }, [products]);

  const valueDistributionData = useMemo(() => {
    const topProducts = products
      .filter(p => p && p.price !== undefined && p.quantity !== undefined)
      .map((p) => ({
        name: p?.name || "Unknown",
        value: (parseFloat(p?.price) || 0) * (parseInt(p?.quantity) || 0),
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
        if (!p || p.price === undefined) return false;
        const price = parseFloat(p.price) || 0;
        return price >= r.min && price <= r.max;
      }).length,
    }));
  }, [products]);

  const recentTransactions = useMemo(() => {
    return products
      .filter(p => p && p._id)
      .slice(0, 5)
      .map((p) => ({
        product: p?.name || "Unknown Product",
        date: new Date(p?.createdAt || Date.now()).toLocaleDateString(),
        time: new Date(p?.createdAt || Date.now()).toLocaleTimeString(),
        quantity: p?.quantity || 0,
        price: p?.price || 0,
        total: ((parseFloat(p?.price) || 0) * (parseInt(p?.quantity) || 0)).toFixed(2),
        status: parseInt(p?.quantity) > 10 ? "In Stock" : parseInt(p?.quantity) > 0 ? "Low Stock" : "Out of Stock",
        raw: p,
      }));
  }, [products]);

  const handleCreate = async (data) => {
  try {
    setFormLoading(true);

    const res = await axiosInstance.post(API_URL, data);
    console.log("Create response:", res.data);

    if (!res.data.success) {
      showToast(res.data.message || "Failed to create product", "error");
      return;
    }

    const newProduct = res.data.data;

    setProducts((prev) => [newProduct, ...prev]);
    setShowForm(false);

    showToast(res.data.message || "Product created", "success");

  } catch (err) {
    showToast("Error creating product", "error");
  } finally {
    setFormLoading(false);
  }
};

const handleUpdate = async (data) => {
  try {
    setFormLoading(true);

    const res = await axiosInstance.put(`${API_URL}/${selectedProduct._id}`, data);
    console.log("Update response:", res.data);

    if (!res.data.success) {
      showToast(res.data.message || "Failed to update product", "error");
      return;
    }

    const updatedProduct = res.data.data;

    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );

    setShowForm(false);
    setSelectedProduct(null);

    showToast(res.data.message || "Product updated", "success");

  } catch (err) {
    showToast("Error updating product", "error");
  } finally {
    setFormLoading(false);
  }
};

  const handleDelete = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/${id}`);

    if (!res.data.success) {
      showToast(res.data.message || "Failed to delete", "error");
      return;
    }

    setProducts((prev) => prev.filter((p) => p._id !== id));

    showToast(res.data.message || "Product deleted", "success");

  } catch (err) {
    showToast("Error deleting product", "error");
  }
};


  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    showToast("Logged out successfully!", "success");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  const themeColors = {
    A: { primary: "#0d6efd", secondary: "#6c757d", accent: "#0dcaf0" },
    B: { primary: "#ffc107", secondary: "#fd7e14", accent: "#20c997" },
    C: { primary: "#212529", secondary: "#495057", accent: "#6c757d" },
  };
  const currentTheme = themeColors[theme];

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
    }, [value, duration, trigger]);

    return display;
  };

  const animatedTotalProducts = useAnimatedNumber(stats.totalProducts, 900, animateTrigger);
  const animatedTotalQuantity = useAnimatedNumber(stats.totalQuantity, 900, animateTrigger);
  const animatedTotalRevenue = useAnimatedNumber(Math.round(stats.totalRevenue), 900, animateTrigger);
  const animatedAvgPrice = useAnimatedNumber(Math.round(stats.avgPrice), 900, animateTrigger);

  const openProductDetail = (p) => {
    setProductDetail(p);
  };

  const MenuItem = ({ icon, label, tab, onClick }) => (
    <div
      className={`sb-item ${activeTab === tab ? "active" : ""}`}
      onClick={onClick || (() => { setActiveTab(tab); setMobileMenuOpen(false); })}
      title={label}
    >
      <div className="sb-icon">{icon}</div>
      {!sidebarCollapsed && <div className="sb-label">{label}</div>}
    </div>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f7f7fc" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-x: hidden; }
        
        .sidebar {
          width: 260px;
          transition: width 220ms cubic-bezier(.2,.9,.2,1);
          background: #fff;
          border-right: 1px solid #e9eef6;
          min-height: 100vh;
          position: sticky;
          top: 0;
          z-index: 900;
          flex-shrink: 0;
        }
        .sidebar.collapsed { width: 80px; }
        .sidebar .menu { padding: 18px 12px; }
        
        .sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 180ms;
          color: #333;
          margin-bottom: 8px;
          position: relative;
        }
        .sb-item:hover {
          background: linear-gradient(135deg, #f6f7fb, #eef1f6);
          transform: translateX(4px);
        }
        .sb-item.active {
          background: linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.primary}08);
          color: ${currentTheme.primary};
          font-weight: 600;
        }
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 28px;
          background: ${currentTheme.primary};
          border-radius: 0 4px 4px 0;
        }
        
        .sb-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          font-size: 20px;
          flex-shrink: 0;
        }
        .sb-item.active .sb-icon {
          background: ${currentTheme.primary}10;
        }
        .sb-label {
          font-weight: 600;
          white-space: nowrap;
          font-size: 15px;
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          background: #f6f7fb;
          transition: all 180ms;
          font-size: 18px;
          font-weight: bold;
          color: #666;
        }
        .collapse-btn:hover {
          background: ${currentTheme.primary}15;
          color: ${currentTheme.primary};
          transform: scale(1.05);
        }

        .hp-header {
          background: #fff;
          padding: 16px 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 800;
        }
        .hp-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 22px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .hp-name {
          font-weight: 800;
          font-size: 1.1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hp-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent});
          color: #fff;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
          font-weight: 700;
          font-size: 15px;
          transition: transform 180ms;
        }
        .hp-avatar:hover {
          transform: scale(1.08);
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1400;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .mobile-overlay.open {
          opacity: 1;
          pointer-events: all;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #fff;
          z-index: 1500;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 6px 0 24px rgba(0,0,0,0.15);
          padding: 20px;
          overflow-y: auto;
        }
        .mobile-drawer.open {
          transform: translateX(0);
        }
        .mobile-drawer .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }
        .mobile-drawer .item {
          padding: 14px 12px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
          transition: all 180ms;
          font-size: 15px;
        }
        .mobile-drawer .item:hover {
          background: #f6f7fb;
        }
        .mobile-drawer .item.active {
          background: ${currentTheme.primary}15;
          color: ${currentTheme.primary};
          font-weight: 600;
        }

        .hamburger {
          width: 30px;
          height: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          cursor: pointer;
          padding: 5px 0;
          background: transparent;
          border: none;
        }
        .hamburger span {
          display: block;
          height: 3px;
          background: #333;
          border-radius: 3px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }
        .hamburger.open span:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }
        .hamburger.open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .hamburger.open span:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }

        .main-area {
          flex: 1;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .container-main {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .fade-in-up {
          animation: fadeUp 0.5s ease-out forwards;
        }
        @keyframes fadeUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: none;
            opacity: 1;
          }
        }

        @media(max-width: 991px) {
          .sidebar {
            display: none;
          }
          .container-main {
            padding: 16px;
          }
        }

        @media(max-width: 576px) {
          .hp-header {
            padding: 12px 16px;
          }
          .container-main {
            padding: 12px;
          }
        }

        .card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }

        .table-hover tbody tr {
          transition: all 0.2s;
        }
        .table-hover tbody tr:hover {
          background-color: ${currentTheme.primary}08;
          transform: scale(1.01);
        }

        .modal {
          backdrop-filter: blur(4px);
        }
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div style={{ padding: "16px 12px", marginBottom: "12px" }}>
          {!sidebarCollapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>
              <div className="hp-logo" style={{ width: 42, height: 42, fontSize: 20 }}>🛍️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "16px" }}>Lavish</div>
                <div style={{ fontSize: 12, color: "#888" }}>Seller Dashboard</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>
              <div className="hp-logo" style={{ width: 42, height: 42, fontSize: 20 }}>🛍️</div>
            </div>
          )}
        </div>

        <div className="menu">
          <MenuItem icon="📊" label="Dashboard" tab="dashboard" />
          <MenuItem icon="📦" label="Products" tab="products" />
          <MenuItem icon="🧾" label="Orders" tab="orders" />
          <MenuItem icon="⚙️" label="Settings" tab="settings" />

          <div style={{ height: 20, borderBottom: "1px solid #eee", margin: "16px 0" }} />

          <MenuItem icon="🚪" label="Logout" tab="" onClick={handleLogout} />

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <div className="collapse-btn" title={sidebarCollapsed ? "Expand" : "Collapse"} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? "»" : "«"}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="hp-logo" style={{ width: 42, height: 42, fontSize: 20 }}>🛍️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px" }}>Lavish</div>
              <div style={{ fontSize: 12, color: "#888" }}>Menu</div>
            </div>
          </div>
          <button 
            className="btn btn-link p-0" 
            onClick={() => setMobileMenuOpen(false)} 
            style={{ fontSize: 28, textDecoration: "none", color: "#333", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div>
          <div className={`item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}>
            <span style={{ fontSize: "20px" }}>📊</span> Dashboard
          </div>
          <div className={`item ${activeTab === "products" ? "active" : ""}`} onClick={() => { setActiveTab("products"); setMobileMenuOpen(false); }}>
            <span style={{ fontSize: "20px" }}>📦</span> Products
          </div>
          <div className={`item ${activeTab === "orders" ? "active" : ""}`} onClick={() => { setActiveTab("orders"); setMobileMenuOpen(false); }}>
            <span style={{ fontSize: "20px" }}>🧾</span> Orders
          </div>
          <div className={`item ${activeTab === "settings" ? "active" : ""}`} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}>
            <span style={{ fontSize: "20px" }}>⚙️</span> Settings
          </div>
          
          <div style={{ height: 1, background: "#eee", margin: "16px 0" }} />
          
          <div className="item text-danger" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
            <span style={{ fontSize: "20px" }}>🚪</span> Logout
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main-area">
        {/* Header */}
        <div className="hp-header">
          <div className="d-flex align-items-center justify-content-between">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="d-lg-none">
                <button className={`hamburger ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>
                
                <div className="d-none d-sm-block">
                 
              
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="d-none d-md-flex align-items-center gap-1">
                <button className={`btn btn-sm ${theme === "A" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTheme("A")}>A</button>
                <button className={`btn btn-sm ${theme === "B" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setTheme("B")}>B</button>
                <button className={`btn btn-sm ${theme === "C" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setTheme("C")}>C</button>
              </div>

              <div onClick={() => setProfileOpen(true)}>
                <div className="hp-avatar">{user.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("") : "U"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-main">
          {activeTab === "dashboard" && (
            <div className="fade-in-up">
              {/* Stats Cards */}
              <div className="row g-3 g-md-4 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="p-2 rounded-3" style={{ backgroundColor: `${currentTheme.primary}20` }}>
                          <span style={{ fontSize: "22px" }}>📦</span>
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
                          <span style={{ fontSize: "22px" }}>📊</span>
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
                          <span style={{ fontSize: "22px" }}>💰</span>
                        </div>
                      </div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h5 className="mb-0 fw-bold">${animatedTotalRevenue.toLocaleString()}</h5>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                          <span style={{ fontSize: "22px" }}>📈</span>
                        </div>
                      </div>
                      <p className="text-muted mb-1 small">Average Price</p>
                      <h5 className="mb-0 fw-bold">${animatedAvgPrice}</h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="row g-3 g-md-4 mb-4">
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <h6 className="mb-3 fw-semibold">Top Products by Price</h6>
                      {priceChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={priceChartData} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-42} textAnchor="end" height={70} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value) => `${value}`} />
                            <Bar dataKey="price" fill={currentTheme.primary} radius={[8, 8, 2, 2]} />
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
                            <Bar dataKey="quantity" fill="#198754" radius={[8, 8, 2, 2]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-muted py-5">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="row g-3 g-md-4 mb-4">
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <h6 className="mb-3 fw-semibold">Top 5 Products by Total Value</h6>
                      {valueDistributionData.length > 0 ? (
                        <div className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                          <ResponsiveContainer width="60%" height={220}>
                            <PieChart>
                              <Pie data={valueDistributionData} cx="50%" cy="50%" innerRadius={48} outerRadius={88} paddingAngle={2} dataKey="value">
                                {valueDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value.toFixed(2)}`} />
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
                            <Line type="monotone" dataKey="count" stroke="#6610f2" strokeWidth={3} dot={{ fill: "#6610f2", r: 5 }} />
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
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="mb-0 fw-semibold">Recent Products Overview</h5>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "180px", minWidth: "140px" }} />
                      <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: "150px", minWidth: "130px" }}>
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
                            <tr key={idx} style={{ cursor: "pointer" }} onClick={() => openProductDetail(txn.raw)}>
                              <td className="fw-semibold small">{txn.product}</td>
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
          )}

          {activeTab === "products" && (
            <div className="fade-in-up">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h4 className="mb-0 fw-bold">Products Management</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn btn-sm" style={{ backgroundColor: currentTheme.primary, color: "#fff", border: "none" }} onClick={() => { setShowForm(true); setSelectedProduct(null); }}>
                        ➕ Add Product
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchProducts()}>
                        ↺ Refresh
                      </button>
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
                              <td colSpan="7" className="text-center text-muted py-4">No products found</td>
                            </tr>
                          ) : (
                            filteredProducts.map((p, index) => (
                              <tr key={p._id || index}>
                                <td className="small">{index + 1}</td>
                                <td className="fw-semibold small" style={{ cursor: "pointer" }} onClick={() => openProductDetail(p)}>
                                  {p.name || "N/A"}
                                </td>
                                <td className="text-muted small d-none d-md-table-cell">{p.description || "N/A"}</td>
                                <td className="small">${p.price || "0"}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      parseInt(p.quantity) > 10 ? "bg-success" :
                                      parseInt(p.quantity) > 0 ? "bg-warning text-dark" : "bg-danger"
                                    }`}
                                    style={{ fontSize: "10px" }}
                                  >
                                    {p.quantity || "0"}
                                  </span>
                                </td>
                                <td className="fw-semibold small d-none d-lg-table-cell">
                                  ${((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2)}
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-warning me-1" onClick={() => { setSelectedProduct(p); setShowForm(true); }}>
                                    ✏️
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>
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

          {activeTab === "orders" && (
            <div className="fade-in-up">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5 text-center">
                  <div style={{ fontSize: "72px", marginBottom: "20px" }}>🧾</div>
                  <h4 className="fw-bold mb-2">Orders Coming Soon</h4>
                  <p className="text-muted">Order management features will be available here.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="fade-in-up">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5 text-center">
                  <div style={{ fontSize: "72px", marginBottom: "20px" }}>⚙️</div>
                  <h4 className="fw-bold mb-2">Settings</h4>
                  <p className="text-muted">Application settings and preferences will be available here.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onCancel={() => { setShowForm(false); setSelectedProduct(null); }}
          onSubmit={selectedProduct ? handleUpdate : handleCreate}
          loading={formLoading}
          themeColor={currentTheme.primary}
        />
      )}

      {productDetail && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1" onClick={() => setProductDetail(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Product Details</h5>
                <button type="button" className="btn-close" onClick={() => setProductDetail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex gap-3 align-items-start flex-column flex-sm-row">
                  <div style={{ width: 96, height: 96, borderRadius: 12, background: `${currentTheme.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, flexShrink: 0 }}>
                    📦
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ marginBottom: 8 }}>{productDetail.name || "Untitled"}</h5>
                    <div className="text-muted mb-3">{productDetail.description || "No description provided."}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                      <div className="p-2 bg-light rounded">
                        <small className="text-muted d-block">Price</small>
                        <strong>${productDetail.price || "0"}</strong>
                      </div>
                      <div className="p-2 bg-light rounded">
                        <small className="text-muted d-block">Quantity</small>
                        <strong>{productDetail.quantity || "0"}</strong>
                      </div>
                      <div className="p-2 bg-light rounded">
                        <small className="text-muted d-block">SKU</small>
                        <strong>{productDetail.sku || "—"}</strong>
                      </div>
                      <div className="p-2 bg-light rounded">
                        <small className="text-muted d-block">Total Value</small>
                        <strong>${((parseFloat(productDetail.price) || 0) * (parseInt(productDetail.quantity) || 0)).toFixed(2)}</strong>
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <small className="text-muted">Added: {new Date(productDetail.createdAt || Date.now()).toLocaleString()}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={() => setProductDetail(null)}>Close</button>
                <button type="button" className="btn" style={{ backgroundColor: currentTheme.primary, color: "#fff" }} onClick={() => { setSelectedProduct(productDetail); setShowForm(true); setProductDetail(null); }}>
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1" onClick={() => setProfileOpen(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">User Profile</h5>
                <button type="button" className="btn-close" onClick={() => setProfileOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28, flexShrink: 0 }}>
                    {user.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("") : "U"}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">{user.name || "User"}</h5>
                    <div className="text-muted" style={{ fontSize: 14 }}>{user.email || ""}</div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">User ID</small>
                      <strong>{user.id || "—"}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">Total Products</small>
                      <strong>{stats.totalProducts}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">Total Revenue</small>
                      <strong>${stats.totalRevenue.toFixed(2)}</strong>
                    </div>
                  </div>
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

      {toast && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === "success" ? "success" : "danger"} shadow-lg`} style={{ zIndex: 9999, minWidth: "250px" }} role="alert">
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "20px", marginRight: "10px" }}>{toast.type === "success" ? "✓" : "✕"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
    if (!form.name.trim() || !form.price || !form.quantity) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(form);
  };

  return (
   <div
  className="modal d-block"
  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  tabIndex="-1"
  onClick={onCancel}
>
  <div
    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
    style={{
      maxWidth: "650px",       // Wider modal
      width: "100%",
      maxHeight: "90vh",       // Prevent crashing
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="modal-content border-0 shadow-lg" style={{ maxHeight: "90vh", overflow: "hidden" }}>
      
      {/* Header */}
      <div
        className="modal-header border-bottom"
        style={{ background: `${themeColor}10` }}
      >
        <h5 className="modal-title fw-bold">
          {product ? "✏️ Edit Product" : "➕ Add New Product"}
        </h5>
        <button type="button" className="btn-close" onClick={onCancel}></button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        {/* Body (scrolling only inside body) */}
        <div
          className="modal-body"
          style={{
            overflowY: "auto",
            maxHeight: "60vh",     // Body scroll → modal never crashes
          }}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Product Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Wireless Mouse"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Price ($) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
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
              placeholder="Product description (optional)"
            ></textarea>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Quantity <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">SKU</label>
              <input
                type="text"
                className="form-control"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Product code (optional)"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer border-top bg-light">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: themeColor, border: "none" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : (
              <>{product ? "Update" : "Create"} Product</>
            )}
          </button>
        </div>

      </form>
    </div>
  </div>
</div>

  );
}