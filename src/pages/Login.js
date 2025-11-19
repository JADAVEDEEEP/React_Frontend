// LoginWithNav.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginWithNav() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://node-backend-nu-eight.vercel.app/auth/login",
        form
      );

      setMsg(res.data.message);
      setMsgType("success");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.userId);
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem(
        "userName",
        `${res.data.user.firstName} ${res.data.user.lastName}`
      );

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
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
      {/* GLOBAL STYLES */}
      <style>{`
        .register-link {
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #7a88a0ff, #1e3356ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-bottom: 2px;
          position: relative;
        }

        .register-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 0%;
          height: 2px;
          background: linear-gradient(135deg, #7a88a0ff, #1e3356ff);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .register-link:hover::after {
          width: 100%;
        }

        @media (max-width: 480px) {
          [logo-wrapper] .logo-icon {
            width: 35px !important;
            height: 35px !important;
            font-size: 15px !important;
          }

          [logo-wrapper] .logo-text {
            font-size: 1.25rem !important;
          }
        }
      `}</style>

      {/* LOGO */}
      <div
        logo-wrapper="true"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
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
            background: "linear-gradient(135deg, #7a88a0ff, #1e3356ff)",
            borderRadius: "12px",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.20)",
          }}
        >
          🛍️
        </div>

        <div
          className="logo-text"
          style={{
            fontSize: "1.45rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #7a88a0ff, #1e3356ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Lavish
        </div>
      </div>

      <div className="container">
        <div className="row g-5">
          {/* LEFT SIDE FORM */}
          <div className="col-lg-6">
            <h2 style={{ fontWeight: 700 }}>Welcome Back</h2>
            <p style={{ color: "#555", marginBottom: 30 }}>
              Login to your seller account
            </p>

            {msg && (
              <div className={`alert alert-${msgType} text-center`}>{msg}</div>
            )}

            <form onSubmit={handleSubmit} className="fadeInUp">
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
                className="form-control shadow-sm mb-4"
                style={inputStyle}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                className="btn w-100 shadow-sm"
                style={{
                  padding: "12px",
                  background: "linear-gradient(135deg, #7a88a0ff, #1e3356ff)",
                  borderRadius: 8,
                  color: "white",
                  fontWeight: 600,
                  fontSize: 18,
                }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* REGISTER LINK */}
              <p
                style={{
                  marginTop: "15px",
                  fontSize: "14px",
                  textAlign: "center",
                  color: "#555",
                }}
              >
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="register-link"
                >
                  Register
                </span>
              </p>

              {/* SOCIAL LOGIN BUTTONS */}
              <div style={{ marginTop: 25 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 15,
                    justifyContent: "center",
                  }}
                >
                  {/* GOOGLE */}
                  <button
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "10px 15px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <img
                      src="https://www.svgrepo.com/show/355037/google.svg"
                      alt="google"
                      style={{ width: 18 }}
                    />
                    Google
                  </button>

                  {/* FACEBOOK */}
                  <button
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "10px 15px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <img
                      src="https://www.svgrepo.com/show/448224/facebook.svg"
                      alt="facebook"
                      style={{ width: 18 }}
                    />
                    Facebook
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-lg-6 d-none d-lg-block fadeInUp">
            <h4 className="mb-4" style={{ fontWeight: 700 }}>
              Why join Lavish Seller?
            </h4>

            <Feature icon="🚀" title="Fast Growth" desc="Grow your business quickly" />
            <Feature icon="📦" title="Easy Management" desc="Manage orders easily" />
            <Feature icon="🔒" title="Secure Platform" desc="Fully protected data" />
            <Feature icon="💰" title="Zero Commission" desc="Sell freely" />

            <hr className="my-4" />

            <h4 style={{ fontWeight: 700 }}>Seller Benefits:</h4>

            <Feature icon="✔️" title="24/7 Support" />
            <Feature icon="✔️" title="Low Returns" />
            <Feature icon="✔️" title="Nationwide Reach" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Feature Component */
function Feature({ icon, title, desc }) {
  return (
    <div className="d-flex align-items-start mb-3">
      <div
        style={{
          width: 40,
          height: 40,
          background: "#ffe4d6",
          color: "#2a16c1",
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

/* Input Style */
const inputStyle = {
  borderRadius: 10,
  padding: "14px",
  border: "1px solid #ddd",
  fontSize: 15,
};
