import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold fs-3" href="/">
            Trendzz
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2">
              <li className="nav-item">
                <button
                  className="btn btn-outline-primary fw-bold"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-primary fw-bold"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">Welcome to Trendzz</h1>
          <p className="lead mb-4">
            Manage your products seamlessly and track your inventory in one place.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-primary btn-lg fw-bold"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button
              className="btn btn-outline-primary btn-lg fw-bold"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light text-center py-3 shadow-sm">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Trendzz. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
