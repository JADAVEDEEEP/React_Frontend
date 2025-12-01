import React from "react";
import { Search, Bell, User, Menu } from "lucide-react";

const Header = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  setProfileOpen
}) => {
  return (
    <>
      <style>
        {`
          .header-container {
            height: 70px;
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .search-input {
            width: 260px;
            height: 42px;
            border-radius: 50px;
            background: #f3f4f6;
            padding-left: 42px;
            border: none;
            font-size: 14px;
            transition: 0.2s;
          }

          .search-input:focus {
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
            outline: none;
          }

          .icon-btn {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #f8f9fa;
            border: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
          }

          .icon-btn:hover {
            transform: translateY(-2px);
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }

          .user-badge {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
            border: 1px solid #e5e7eb;
          }

          .user-badge:hover {
            background: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
        `}
      </style>

      <header className="w-100 d-flex align-items-center justify-content-between px-4 header-container">

        {/* LEFT SIDE */}
        <div className="d-flex align-items-center gap-3">

          {/* Mobile Menu Button */}
          <button 
            className="icon-btn d-lg-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} className="text-muted" />
          </button>

          {/* Search */}
          <div className="d-none d-md-flex align-items-center position-relative">
            <Search 
              size={18} 
              className="text-muted position-absolute ms-3"
              style={{ pointerEvents: "none" }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="d-flex align-items-center gap-3">

          {/* Notification */}
          <div className="position-relative">
            <button className="icon-btn">
              <Bell size={20} className="text-muted" />
            </button>
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle border border-light"
            ></span>
          </div>

          {/* User Profile */}
          <div 
            className="d-flex align-items-center gap-2"
            style={{ cursor: "pointer" }}
            onClick={() => setProfileOpen(true)}
          >
            <div className="text-end d-none d-sm-block">
              <p className="mb-0 fw-bold small">{user?.name || "User"}</p>
              <p className="mb-0 text-muted small">{user?.email || "example@mail.com"}</p>
            </div>

            <div className="user-badge">
              <User size={20} className="text-muted" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
