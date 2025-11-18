// RegisterPlayboy.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPlayboy() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMsg("Passwords do not match");
      setMsgType("danger");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://node-backend-nu-eight.vercel.app/auth/signup",
        form
      );

      setMsg(res.data.message);
      setMsgType("success");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
      setMsgType("danger");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "#f7f7fc",
        padding: "40px 0",
        minHeight: "100vh",
      }}
    >

      {/* PLAYBOY LOGO */}
      <div
        logo-wrapper="true"
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "10px",
          paddingLeft: "20px",
          marginBottom: "25px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <div
          className="logo-icon"
          style={{
            width: "42px",
            height: "42px",
            minWidth: "42px",
            background: "linear-gradient(135deg, #ff6b35, #e85a28)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
          }}
        >
          🛍️
        </div>

        <div
          className="logo-text"
          style={{
            fontSize: "1.45rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #ff6b35, #004e89)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            whiteSpace: "nowrap",
          }}
        >
          PlayBoy
        </div>
      </div>

      {/* LOGO MEDIA QUERY */}
      <style>{`
        @media (max-width: 480px) {
          [logo-wrapper] .logo-icon {
            width: 35px !important;
            height: 35px !important;
            font-size: 15px !important;
          }

          [logo-wrapper] .logo-text {
            font-size: 1.25rem !important;
          }
             .login-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 0%;
    height: 2px;
    background: linear-gradient(135deg, #6a5af9, #4a3cf0);
    transition: width 0.3s ease;
    border-radius: 2px;
  }

  .login-link:hover::after {
    width: 100%;
  }
        }
      `}</style>

      <div className="container">
        <div className="row g-5">

          {/* LEFT SIDE FORM */}
          <div className="col-lg-6">
            <h2 style={{ fontWeight: 700 }}>Welcome to Playboy</h2>
            <p style={{ color: "#555", marginBottom: 30 }}>
              Create your seller account to start selling
            </p>

            {msg && (
              <div className={`alert alert-${msgType} text-center`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="fadeInUp">
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <input
                    name="firstName"
                    className="form-control shadow-sm"
                    style={inputStyle}
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <input
                    name="lastName"
                    className="form-control shadow-sm"
                    style={inputStyle}
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <input
                type="email"
                name="email"
                className="form-control shadow-sm mb-3"
                style={inputStyle}
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                className="form-control shadow-sm mb-3"
                style={inputStyle}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                className="form-control shadow-sm mb-4"
                style={inputStyle}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              <button
                className="btn w-100 shadow-sm"
                style={{
                  padding: "12px",
                  background: "#ec6c3a",
                  borderRadius: 8,
                  color: "white",
                  fontWeight: 600,
                  fontSize: 18,
                }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p
  style={{
    marginTop: 15,
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  }}
>
  Already have an account?{" "}
  <span
    onClick={() => navigate("/login")}
    style={{
      fontWeight: 600,
      cursor: "pointer",
      background: "linear-gradient(135deg, #6a5af9, #4a3cf0)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      position: "relative",
      paddingBottom: "2px",
    }}
    className="login-link"
  >
    Login
  </span>
</p>
            </form>

            <p className="mt-3" style={{ fontSize: 13, color: "#666" }}>
              By clicking you agree to our <b>Terms & Conditions</b> and{" "}
              <b>Privacy Policy</b>.
            </p>
          </div>

          {/* RIGHT SIDE INFO — HIDDEN ON MOBILE */}
          <div className="col-lg-6 d-none d-lg-block fadeInUp">
            <h4 className="mb-4" style={{ fontWeight: 700 }}>
              Grow your business faster by selling on Playboy
            </h4>

            <Feature icon="👥" title="1 lakh+" desc="Suppliers are selling commission-free" />
            <Feature icon="📍" title="19000+" desc="Pincodes supported for delivery" />
            <Feature icon="🗺️" title="Crores" desc="Customers buying across India" />
            <Feature icon="📦" title="700+" desc="Categories to sell" />

            <hr className="my-4" />

            <h4 style={{ fontWeight: 700 }}>All you need to sell on Playboy:</h4>

            <Feature icon="✔️" title="Tax Details" />
            <Feature icon="✔️" title="GSTIN / UIN" />
            <Feature icon="✔️" title="Bank Account" />
          </div>

        </div>
      </div>
    </div>
  );
}

/* COMPONENT FOR SIDEBAR FEATURES */
function Feature({ icon, title, desc }) {
  return (
    <div className="d-flex align-items-start mb-3">
      <div
        style={{
          width: 40,
          height: 40,
          background: "#efe9ff",
          color: "#7a4de6",
          fontSize: 20,
          borderRadius: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {icon}
      </div>

      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {desc && <div style={{ color: "#666", fontSize: 14 }}>{desc}</div>}
      </div>
    </div>
  );
}

/* INPUT STYLE */
const inputStyle = {
  borderRadius: 10,
  padding: "14px",
  border: "1px solid #ddd",
  fontSize: 15,
};
