import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or danger
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
      const res = await axios.post('http://localhost:3001/auth/signup', form);
      setMessage("✅ " + (res.data.message || "Registration successful!"));
      setMessageType("success");

      setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Registration failed!"));
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0 rounded-4 p-5">
            <h2 className="text-center mb-4 fw-bold text-primary">Create Your Account</h2>

            {/* Display message */}
            {message && (
              <div className={`alert alert-${messageType} text-center`} role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    name="firstName"
                    className="form-control shadow-sm rounded-pill px-3 py-2"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    name="lastName"
                    className="form-control shadow-sm rounded-pill px-3 py-2"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control shadow-sm rounded-pill px-3 py-2"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control shadow-sm rounded-pill px-3 py-2"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control shadow-sm rounded-pill px-3 py-2"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="text-center mt-4 text-secondary">
              Already have an account?{" "}
              <a href="/login" className="fw-semibold text-decoration-none text-primary">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
