import React, { useState } from "react";

export default function RecentTransactions({
  recentTransactions,
  openProductDetail,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const colors = ["#3b82f6", "#10b981", "#f43f5e"]; // glow only

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily: "'Poppins', sans-serif",
        background: "#ffffff",        // PURE WHITE BACKGROUND
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            margin: 0,
            color: "#111827",
          }}
        >
          My <span style={{ color: "#3b82f6" }}>Products</span>
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: "0.9rem",
            marginTop: "6px",
          }}
        >
          Manage and preview your product listings
        </p>
      </div>

      {/* PRODUCT GRID */}
      <div className="row g-4 justify-content-center">
        {recentTransactions.map((txn, idx) => {
          const p = txn.raw;
          const glowColor = colors[idx % colors.length];
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => openProductDetail(p)}
            >
              <div
                style={{
                  width: "100%",
                  height: "260px",
                  borderRadius: "18px",
                  background: "#ffffff",     // PURE WHITE
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  textAlign: "center",
                  padding: "24px 18px",
                  transition: "0.35s",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                }}
              >
                {/* IMAGE */}
                <div
                  style={{
                    height: "130px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={
                      p?.image ||
                      "https://www.pngmart.com/files/6/Plain-White-T-Shirt-PNG-Transparent-Image.png"
                    }
                    alt={txn.product}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "contain",
                      transition: "0.35s",

                      filter: isHovered
                        ? `drop-shadow(0 20px 25px ${glowColor}40)`
                        : "drop-shadow(0 10px 12px rgba(0,0,0,0.3))",

                      transform: isHovered
                        ? "scale(1.10) translateY(-10px)"
                        : "scale(1) translateY(0)",
                    }}
                  />
                </div>

                {/* NAME */}
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "#111827",
                    marginBottom: "4px",
                  }}
                >
                  {txn.product}
                </h4>

                {/* PRICE */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: isHovered ? glowColor : "#6b7280",
                    transition: "0.25s",
                  }}
                >
                  ₹{txn.price}
                </div>

                {/* BOTTOM ACCENT */}
                <div
                  style={{
                    height: "3px",
                    width: "100%",
                    marginTop: "14px",
                    borderRadius: "50px",
                    background: isHovered ? glowColor : "#e5e7eb",
                    opacity: isHovered ? 1 : 0.4,
                    transition: "0.35s",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
