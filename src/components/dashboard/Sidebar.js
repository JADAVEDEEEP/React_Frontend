import React from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  Settings,
  Share2,
  MessageSquare,
  HelpCircle,
  LogOut,
  Menu,
  X
} from "lucide-react";

const Sidebar = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout,
  mobileOpen,
  setMobileOpen
}) => {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "shipment", label: "Shipment", icon: Truck },
    { id: "settings", label: "Store Setting", icon: Settings },
    { id: "partners", label: "Platform Partner", icon: Share2 },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "support", label: "Help & Support", icon: HelpCircle }
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`sidebar d-flex flex-column ${sidebarCollapsed ? "collapsed" : ""} ${mobileOpen ? "show" : ""}`}
      >
        {/* ⭐ BRAND + LOGO ⭐ */}
        <div
          className="p-3 d-flex align-items-center justify-content-between border-bottom"
          style={{ height: "64px" }}
        >
          <div
            className={`d-flex align-items-center gap-2 ${
              sidebarCollapsed ? "justify-content-center w-100" : ""
            }`}
          >
            {/* BLUE GRADIENT LOGO BOX */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg, rgba(71,88,116,1), rgba(23,40,69,1))",
                boxShadow:
                  "8px 8px 20px rgba(0,0,0,0.15), -8px -8px 20px rgba(255,255,255,0.5)",
                color: "white",
                fontSize: "20px"
              }}
            >
              🛍️
            </div>

            {/* BRAND NAME */}
            {!sidebarCollapsed && (
              <span
                className="fw-bold h5 mb-0"
                style={{
                  color: "rgba(52, 75, 99, 1)"
                }}
              >
                Lavish
              </span>
            )}
          </div>

          {/* COLLAPSE BUTTON */}
          <button
            className="btn btn-light btn-sm d-none d-lg-flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>

          {/* MOBILE CLOSE BUTTON */}
          <button
            className="btn btn-light btn-sm d-lg-none"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU LIST */}
        <div className="flex-grow-1 overflow-auto p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`d-flex align-items-center gap-3 px-3 py-2 mb-1 rounded ${
                  active
                    ? "bg-primary text-white"
                    : "text-dark hover-bg-light"
                }`}
                style={{ cursor: "pointer", transition: "0.2s" }}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="p-3 border-top">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
