// Dashboard.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import StatsCards from "../components/dashboard/StatsCards";
import Charts from "../components/dashboard/Charts";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import ProductsTable from "../components/dashboard/ProductsTable";

import ProductForm from "../components/dashboard/ProductForm";
import ProductDetailsModal from "../components/dashboard/ProductDetailsModal";
import ProfileModal from "../components/dashboard/ProfileModal";

/**
 * CONFIG
 */
const API_URL = "https://node-backend-4b48.onrender.com/api";

/**
 * MAIN COMPONENT
 */
export default function Dashboard() {
  /* =======================
     STATE
  ======================== */
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    id: "12345",
  });

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

  /* =======================
     AXIOS INSTANCE
  ======================== */
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Axios Error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token]);

  /* =======================
     THEME
  ======================== */
  const themeColors = {
    A: { primary: "#0d6efd", secondary: "#6c757d", accent: "#0dcaf0" },
    B: { primary: "#ffc107", secondary: "#fd7e14", accent: "#20c997" },
    C: { primary: "#212529", secondary: "#495057", accent: "#6c757d" },
  };

  const currentTheme = themeColors[theme];

  /* =======================
     TOAST
  ======================== */
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* =======================
     FETCH PRODUCTS
  ======================== */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/");

      if (res.data && res.data.success === true) {
        const productsArray = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        showToast(res.data.message || `Loaded ${productsArray.length} products`, "success");
      } else {
        if (res.data && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
          setFilteredProducts(res.data.data);
          showToast("Loaded products", "success");
        } else {
          showToast(res.data?.message || "Failed to load products", "error");
          setProducts([]);
          setFilteredProducts([]);
        }
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      try {
        const res2 = await axiosInstance.get("/allproducts");
        if (res2.data && Array.isArray(res2.data)) {
          setProducts(res2.data);
          setFilteredProducts(res2.data);
          showToast("Loaded public products", "success");
        } else {
          showToast("Server error while loading products", "error");
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (err2) {
        console.error("Fallback fetch error:", err2);
        showToast("Server error while loading products", "error");
        setProducts([]);
        setFilteredProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, showToast]);

  /* =======================
     LOAD USER
  ======================== */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      if (userName) {
        setUser({
          name: userName,
          email: userEmail || "john@example.com",
          id: userId || "12345",
        });
      }
    }
    fetchProducts();
  }, [fetchProducts]);

  /* =======================
     FILTER + SORT
  ======================== */
  useEffect(() => {
    let filtered = products.filter((p) => p && p._id);

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") return (a?.name || "").localeCompare(b?.name || "");
      if (sortBy === "price") return (b?.price || 0) - (a?.price || 0);
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  /* =======================
     DERIVED DATA
  ======================== */
  const recentTransactions = useMemo(() => {
    return products
      .filter((p) => p && p._id)
      .slice(0, 5)
      .map((p) => ({
        product: p?.name || "Unknown Product",
        date: new Date(p?.createdAt || Date.now()).toLocaleDateString(),
        time: new Date(p?.createdAt || Date.now()).toLocaleTimeString(),
        quantity: p?.quantity || 0,
        price: p?.price || 0,
        total: ((parseFloat(p?.price) || 0) * (parseInt(p?.quantity) || 0)).toFixed(2),
        status:
          parseInt(p?.quantity) > 10
            ? "In Stock"
            : parseInt(p?.quantity) > 0
              ? "Low Stock"
              : "Out of Stock",
        raw: p,
      }));
  }, [products]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => {
      const price = parseFloat(p?.price) || 0;
      const quantity = parseInt(p?.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    const avgPrice =
      totalProducts > 0
        ? products.reduce((sum, p) => sum + (parseFloat(p?.price) || 0), 0) /
        totalProducts
        : 0;

    return {
      totalRevenue,
      totalOrders: 48, // Mock
      avgPrice,
      totalProducts,
    };
  }, [products]);

  const priceChartData = useMemo(() => {
    return products.map(p => ({
      name: p.name,
      price: parseFloat(p.price) || 0
    })).slice(0, 10);
  }, [products]);

  const quantityChartData = useMemo(() => {
    return products.map(p => ({
      name: p.name,
      quantity: parseInt(p.quantity) || 0
    })).slice(0, 10);
  }, [products]);

  /* =======================
     HANDLERS
  ======================== */
  const handleCreate = useCallback(async (formData) => {
    try {
      setFormLoading(true);
      const res = await axiosInstance.post("/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        showToast("Product created successfully");
        setShowForm(false);
        fetchProducts();
      } else {
        showToast(res.data?.message || "Failed to create", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating product", "error");
    } finally {
      setFormLoading(false);
    }
  }, [axiosInstance, fetchProducts, showToast]);

  const handleUpdate = useCallback(async (formData) => {
    if (!selectedProduct) return;
    try {
      setFormLoading(true);
      const res = await axiosInstance.put(`/${selectedProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        showToast("Product updated successfully");
        setShowForm(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        showToast(res.data?.message || "Failed to update", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating product", "error");
    } finally {
      setFormLoading(false);
    }
  }, [axiosInstance, fetchProducts, showToast, selectedProduct]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await axiosInstance.delete(`/${id}`);
      if (res.data?.success) {
        showToast("Product deleted");
        fetchProducts();
      } else {
        showToast(res.data?.message || "Failed to delete", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting product", "error");
    }
  }, [axiosInstance, fetchProducts, showToast]);

  const openProductDetail = useCallback((product) => {
    setProductDetail(product);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  }, []);

  /* =======================
     RENDER
  ======================== */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7fc" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-x: hidden; background-color: #f8f9fa; }
        
        /* Sidebar Styles */
        .sidebar { width: 260px; transition: width 0.3s; background: #fff; border-right: 1px solid #e9eef6; min-height: 100vh; position: fixed; top: 0; left: 0; z-index: 1040; }
        .sidebar.collapsed { width: 80px; }
        
        /* Main Content Styles */
        .main-area { 
          min-height: 100vh; 
          transition: margin-left 0.3s ease;
          margin-left: 260px;
        }
        .main-area.collapsed { margin-left: 80px; }
        
        /* Mobile Responsive */
        @media (max-width: 991.98px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.show { transform: translateX(0); }
          .main-area { margin-left: 0 !important; }
          .main-area.collapsed { margin-left: 0 !important; }
        }

        .sb-item { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; cursor:pointer; transition:all 180ms; color:#333; margin-bottom:8px; position:relative;}
        .sb-item:hover { background: linear-gradient(135deg,#f6f7fb,#eef1f6); transform: translateX(4px); }
        .sb-item.active { background: linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.primary}08); color: ${currentTheme.primary}; font-weight:600; }
        .sb-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:#fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-size:20px; flex-shrink:0;}
        .hp-header { background:#fff; padding:16px 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); position: sticky; top:0; z-index:800;}
        .container-main { padding:20px; max-width:1400px; margin:0 auto; width:100%; }
        .card { transition:transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,0.1) !important; }
        
        /* Utilities */
        .hover-bg-light:hover { background-color: #f8f9fa; }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main */}
      <div className={`main-area ${sidebarCollapsed ? 'collapsed' : ''}`}>

        <Header
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          theme={theme}
          setTheme={setTheme}
          user={user}
          setProfileOpen={setProfileOpen}
          currentTheme={currentTheme}
        />

        <div className="container-main">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats */}
              <StatsCards stats={stats} animateTrigger={animateTrigger} />

              {/* Charts */}
              <Charts
                priceChartData={priceChartData}
                quantityChartData={quantityChartData}
                currentTheme={currentTheme}
              />

              {/* Recent Table */}
              <RecentTransactions
                recentTransactions={recentTransactions}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                openProductDetail={openProductDetail}
              />
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <ProductsTable
              products={filteredProducts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              openProductDetail={openProductDetail}
              setShowForm={setShowForm}
              handleDelete={handleDelete}
            />
          )}

          {/* Orders Tab (placeholder) */}
          {activeTab === "orders" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <div style={{ fontSize: 72 }}>🧾</div>
                <h4 className="fw-bold">Orders Coming Soon</h4>
                <p className="text-muted">Order management features will be available here.</p>
              </div>
            </div>
          )}

          {/* Settings Tab (placeholder) */}
          {activeTab === "settings" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <div style={{ fontSize: 72 }}>⚙️</div>
                <h4 className="fw-bold">Settings</h4>
                <p className="text-muted">Application settings and preferences will be available here.</p>
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
        <ProductDetailsModal
          productDetail={productDetail}
          setProductDetail={setProductDetail}
          currentTheme={currentTheme}
          setSelectedProduct={setSelectedProduct}
          setShowForm={setShowForm}
        />
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <ProfileModal
          user={user}
          stats={stats}
          currentTheme={currentTheme}
          setProfileOpen={setProfileOpen}
          handleLogout={handleLogout}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === "success" ? "success" : "danger"} shadow-lg`} style={{ zIndex: 9999, minWidth: "250px" }}>
          <div className="d-flex align-items-center">
            <span style={{ fontSize: 20, marginRight: 10 }}>{toast.type === "success" ? "✓" : "✕"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
