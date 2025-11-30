import React from "react";
import { Search, Bell, User, Menu } from "lucide-react";

const Header = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  setProfileOpen
}) => {
  return (
    <header
      className="w-100 d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom sticky-top"
      style={{ height: '64px' }}
    >
      {/* LEFT */}
      <div className="d-flex align-items-center gap-3">
        {/* Mobile Toggle */}
        <button
          className="btn btn-light d-lg-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="d-none d-md-flex align-items-center position-relative">
          <Search size={18} className="text-muted position-absolute ms-3" />
          <input
            type="text"
            className="form-control ps-5 rounded-pill bg-light border-0"
            placeholder="Search..."
            style={{ width: '250px' }}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="d-flex align-items-center gap-3">
        {/* Notifications */}
        <button className="btn btn-light rounded-circle position-relative p-2">
          <Bell size={20} className="text-muted" />
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
            <span className="visually-hidden">New alerts</span>
          </span>
        </button>

        {/* User */}
        <div
          className="d-flex align-items-center gap-2 cursor-pointer"
          onClick={() => setProfileOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <div className="text-end d-none d-sm-block">
            <p className="mb-0 fw-bold small">{user?.name || "User"}</p>
            <p className="mb-0 text-muted small">{user?.email}</p>
          </div>
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            <User size={20} className="text-muted" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
