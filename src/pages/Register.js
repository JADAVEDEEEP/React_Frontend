// RegisterWithNav.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterWithNav() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("A"); // A | B | C

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | danger
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("❌ Passwords do not match");
      setMessageType("danger");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/auth/signup", form);
      setMessage("✅ " + (res.data.message || "Registration successful!"));
      setMessageType("success");
      setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Registration failed!"));
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  // Inline CSS for navbar & form
  useEffect(() => {
    if (document.getElementById("pp-embedded-css")) return;
    const css = `
      :root { --accent-A: #667eea; --accent-B: #ffd166; --accent-C: #c59b2b; }
      .hp-root { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial; min-height:100vh; background: #f7f7fb; }
      .hp-header { padding: 14px 18px; background: transparent; }
      .hp-brand { display:flex; gap:10px; align-items:center; font-weight:800; }
      .hp-badge { font-size:12px; padding:6px 10px; border-radius:999px; background: rgba(0,0,0,0.06); }
      .hp-nav .nav-link { color: rgba(15,23,42,0.8); margin-right:12px; font-weight:600; }
      .register-card-wrap { display:flex; justify-content:center; padding-top:40px; padding-bottom:40px; }
      .register-card { width:100%; max-width:400px; border-radius:14px; background:#fff; box-shadow:0 20px 45px rgba(10,10,30,0.08); padding:28px; }
      .form-input { border-radius:999px; padding:10px 15px; border:1px solid #e6e9ef; transition:box-shadow .18s, border-color .18s; }
      .form-input:focus { box-shadow:0 6px 22px rgba(102,126,234,0.12); border-color: rgba(102,126,234,0.28); outline:none; }
      .seller-btn { border-radius:999px; padding:12px; font-weight:700; }
      @media (max-width:767px) {
        .hp-nav.d-none.d-md-flex { display:none !important; }
        .hp-header { padding:12px; }
        .register-card { padding:20px; margin: 18px; }
      }
    `;
    const style = document.createElement("style");
    style.id = "pp-embedded-css";
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  const accentColorMap = { A: "#667eea", B: "#ffd166", C: "#c59b2b" };
  const accent = accentColorMap[theme] || accentColorMap.A;

  return (
    <div className="hp-root">
      {/* NAVBAR */}
      <div className="hp-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="hp-brand">
              <span style={{ fontSize: 22 }}>🛍️</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Trendzz</div>
                <div className="hp-badge">Seller Dashboard</div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <nav className="hp-nav d-none d-md-flex">
              <a className="nav-link" href="/">Home</a>
              <a className="nav-link" href="/collection">Collection</a>
              <a className="nav-link" href="/shop">Shop</a>
              <a className="nav-link" href="/about">About</a>
            </nav>

            {/* THEME BUTTONS */}
            <div className="d-flex align-items-center ms-3 me-2">
              {["A","B","C"].map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm me-1 ${theme === t ? "btn-primary" : t==="B" ? "btn-outline-warning": t==="C"? "btn-outline-dark":"btn-outline-primary"}`}
                  onClick={() => setTheme(t)}
                >{t}</button>
              ))}
            </div>

            <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/login")}>Login</button>
            <button className="btn btn-dark" onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </div>

      {/* REGISTER FORM */}
      <div className="register-card-wrap">
        <div className="register-card">
          <h3 style={{ marginBottom: 15, fontWeight: 800, color: "#0b1220" }}>Become a Trendzz Seller</h3>
          <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>Create your seller account to start selling</p>

          {message && <div className={`alert alert-${messageType} text-center`}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <input name="firstName" className="form-control form-input" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
              </div>
              <div className="col-md-6">
                <input name="lastName" className="form-control form-input" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
              </div>
            </div>

            <div className="mb-3">
              <input type="email" name="email" className="form-control form-input" value={form.email} onChange={handleChange} placeholder="Email" required />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <input type="password" name="password" className="form-control form-input" value={form.password} onChange={handleChange} placeholder="Password" required />
              </div>
              <div className="col-md-6">
                <input type="password" name="confirmPassword" className="form-control form-input" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
              </div>
            </div>

            <button type="submit" className="btn seller-btn w-100" style={{ background: accent, color: theme==="B"?"#111":"#fff", border:"none" }} disabled={loading}>
              {loading ? "Creating Seller Account..." : "Create Seller Account"}
            </button>
          </form>

          <p className="text-center mt-3" style={{ color: "#6b7280", fontSize: 14 }}>
            Already have a seller account? <a href="/login" style={{ color: accent, fontWeight: 700 }}>Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
