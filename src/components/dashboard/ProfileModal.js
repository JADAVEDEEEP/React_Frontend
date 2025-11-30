import React from "react";

export default function ProfileModal({
    user,
    stats,
    currentTheme,
    setProfileOpen,
    handleLogout,
}) {
    return (
        <div
            className="modal d-block bg-dark bg-opacity-50"
            tabIndex="-1"
            onClick={() => setProfileOpen(false)}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">User Profile</h5>
                        <button
                            className="btn-close"
                            onClick={() => setProfileOpen(false)}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fs-4 fw-bold" style={{ width: 80, height: 80 }}>
                                {user.name
                                    ? user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join("")
                                    : "U"}
                            </div>
                            <div>
                                <h5 className="fw-bold mb-1">{user.name || "User"}</h5>
                                <div className="text-muted">{user.email || ""}</div>
                            </div>
                        </div>

                        <div className="row g-3 mt-4">
                            <div className="col-12">
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">User ID</small>
                                    <strong>{user.id || "—"}</strong>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">
                                        Total Products
                                    </small>
                                    <strong>{stats.totalProducts}</strong>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">
                                        Total Revenue
                                    </small>
                                    <strong>${stats.totalRevenue.toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-top">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setProfileOpen(false)}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                setProfileOpen(false);
                                handleLogout();
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
