import React, { useState } from "react";

export default function RecentTransactions({
  recentTransactions,
  openProductDetail,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const colors = ["#00ff88", "#00a8ff", "#ff3366"];

  return (
    <div
      style={{
        padding: "60px 20px",
        fontFamily: "'Poppins', sans-serif",
        background: "#ffffff",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ---------------- HEADER ADDED HERE ---------------- */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "0.8px",
            color: "#000",
          }}
        >
          <span style={{ color: "#00ff88" }}>My</span>{" "}
          <span style={{ color: "#000" }}>Products</span>
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "0.9rem",
            marginTop: "8px",
            letterSpacing: "0.3px",
          }}
        >
          Manage and preview your product listings
        </p>
      </div>
      {/* --------------------------------------------------- */}

      {/* Glow Background Circles */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #00ff8840 0%, transparent 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #ff336640 0%, transparent 70%)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #00a8ff30 0%, transparent 70%)",
          filter: "blur(140px)",
          pointerEvents: "none",
        }}
      />

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
              style={{ cursor: "pointer", position: "relative" }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => openProductDetail(p)}
            >
              <div
                className="product-card"
                style={{
                  width: "100%",
                  height: "280px",
                  borderRadius: "20px",
                  background: "rgba(255, 255, 255, 0.3)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  padding: "25px 20px 20px",
                  overflow: "visible",
                  position: "relative",
                  transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <img
                    src={
                      p?.image ||
                      "https://www.pngmart.com/files/6/Plain-White-T-Shirt-PNG-Transparent-Image.png"
                    }
                    alt={txn.product}
                    className="float-img"
                    style={{
                      width: "130px",
                      height: "130px",
                      objectFit: "contain",
                      transition: "0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      filter: isHovered
                        ? `drop-shadow(0 25px 35px ${glowColor}50)`
                        : "drop-shadow(0 12px 18px rgba(0, 0, 0, 0.6))",
                      transform: isHovered
                        ? "scale(1.12) translateY(-12px)"
                        : "scale(1) translateY(0)",
                    }}
                  />
                </div>

                {/* NAME */}
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#333",
                    marginBottom: "auto",
                    letterSpacing: "0.3px",
                    lineHeight: "1.3",
                    textShadow: isHovered
                      ? `0 0 15px ${glowColor}60`
                      : "none",
                  }}
                >
                  {txn.product}
                </h4>

                {/* PRICE */}
                <h4
                  style={{
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: isHovered ? glowColor : "#a3a7a5ff",
                    marginTop: "auto",
                    marginBottom: "5px",
                    transition: "0.3s ease",
                    textShadow: isHovered ? `0 0 10px ${glowColor}60` : "none",
                  }}
                >
                  ₹{txn.price}
                </h4>

                {/* Bottom Glow Line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.3s ease",
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
