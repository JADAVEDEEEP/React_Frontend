import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginWithNav() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("A");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const AUTH_URL = import.meta.env.VITE_API_AUTH_URL;

    try {
      const res = await axios.post(`${AUTH_URL}/login`, form);

      setSuccessMsg(res.data.message || "Login successful!");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.userId);
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem(
        "userName",
        `${res.data.user.firstName} ${res.data.user.lastName}`
      );

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Inline CSS setup
  useEffect(() => {
    if (document.getElementById("pp-embedded-css-login")) return;

    const css = `
      :root { --accent-A: #667eea; --accent-B: #ffd166; --accent-C: #c59b2b; }
      .hp-root { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial; min-height:100vh; background: #f7f7fb; display:flex; flex-direction:column; }
      .hp-header { padding: 14px 18px; background: transparent; }
      .hp-brand { display:flex; gap:10px; align-items:center; font-weight:800; }
      .hp-badge { font-size:12px; padding:6px 10px; border-radius:999px; background: rgba(0,0,0,0.06); }
      .hp-nav .nav-link { color: rgba(15,23,42,0.8); margin-right:12px; font-weight:600; }
      .login-card-wrap { flex:1; display:flex; justify-content:center; align-items:center; padding:40px 0; }
      .login-card { width:100%; max-width:400px; border-radius:14px; background:#fff; box-shadow:0 20px 45px rgba(10,10,30,0.08); padding:28px; }
      .form-input { border-radius:999px; padding:10px 15px; border:1px solid #e6e9ef; transition:box-shadow .18s, border-color .18s; }
      .form-input:focus { box-shadow:0 6px 22px rgba(102,126,234,0.12); border-color: rgba(102,126,234,0.28); outline:none; }
      .login-btn { border-radius:999px; padding:12px; font-weight:700; }
      @media (max-width:767px) {
        .hp-nav.d-none.d-md-flex { display:none !important; }
        .hp-header { padding:12px; }
        .login-card { padding:20px; margin: 18px; }
      }
    `;
    const style = document.createElement("style");
    style.id = "pp-embedded-css-login";
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

            <div className="d-flex align-items-center ms-3 me-2">
              {["A","B","C"].map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm me-1 ${
                    theme === t ? "btn-primary" :
                    t==="B" ? "btn-outline-warning":
                    t==="C"? "btn-outline-dark":"btn-outline-primary"
                  }`}
                  onClick={() => setTheme(t)}
                >{t}</button>
              ))}
            </div>

            <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/login")}>Login</button>
            <button className="btn btn-dark" onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </div>

      {/* LOGIN FORM */}
      <div className="login-card-wrap">
        <div className="login-card">
          <h2 className="text-center mb-3 fw-bold" style={{ color: "#0b1220" }}>
            Welcome Back!
          </h2>
          <p className="text-center mb-4" style={{ color: "#6b7280", fontSize: 14 }}>
            Login to your seller account
          </p>

          {errorMsg && <div className="alert alert-danger text-center">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success text-center">{successMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="form-control form-input"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                className="form-control form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn login-btn w-100"
              style={{ background: accent, color: theme==="B"?"#111":"#fff", border:"none" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-3" style={{ color: "#6b7280", fontSize: 14 }}>
            Don’t have an account?{" "}
            <a href="/register" style={{ color: accent, fontWeight: 700 }}>
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
