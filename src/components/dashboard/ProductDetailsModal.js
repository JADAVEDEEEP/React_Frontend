import React, { useEffect, useState } from "react";

export default function ProductDetailsModal({
  productDetail,
  setProductDetail,
}) {
  const [animate, setAnimate] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);



  return (
    <div
      className="modal d-block"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
      onClick={() => setProductDetail(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#fff",
          borderRadius: "22px",
          padding: "35px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          transform: animate ? "scale(1)" : "scale(0.85)",
          opacity: animate ? 1 : 0,
          transition: "0.35s ease",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          className="btn-close"
          onClick={() => setProductDetail(null)}
          style={{
            position: "absolute",
            top: 20,
            right: 40,
            transform: "scale(1.3)",
            opacity: 0.7,
          }}
        ></button>

        {/* GRID: DESKTOP = 12 + 12 horizontal  
                 MOBILE = full width stacked */}
        <div className="row align-items-center g-4">

          {/* LEFT: PRODUCT IMAGE (12 col desktop) */}
          <div className="col-12 col-lg-6 text-center">
            <img
              src={
                productDetail.image ||
                "https://www.pngmart.com/files/6/Plain-White-T-Shirt-PNG-Transparent-Image.png"
              }
              alt="product"
              style={{
                width: "260px",
                height: "260px",
                maxWidth: "100%",
                objectFit: "contain",
                transition: "0.45s ease",
                transform: hover
                  ? "translateY(-10px) scale(1.08)"
                  : "translateY(0) scale(1)",
                filter: hover
                  ? "drop-shadow(0px 25px 35px rgba(0,0,0,0.25))"
                  : "drop-shadow(0px 12px 15px rgba(0,0,0,0.15))",
              }}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            />
          </div>

          {/* RIGHT: PRODUCT DETAILS (12 col desktop) */}
          <div className="col-12 col-lg-6">
            <h3
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "10px",
                color: "#111",
              }}
            >
              {productDetail.name}
            </h3>

            <h4
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#05a66b",
                marginBottom: "15px",
              }}
            >
              ₹{productDetail.price}
            </h4>

            <p
              style={{
                color: "#555",
                fontSize: "1rem",
                lineHeight: "1.55",
                marginBottom: "18px",
              }}
            >
              {productDetail.description}
            </p>

            <hr />

            <div style={{ fontSize: "1rem", color: "#222" }}>
              <p><b>Category:</b> {productDetail.category}</p>
              <p><b>Quantity:</b> {productDetail.quantity}</p>
              <p>
                <b>Sizes:</b>{" "}
                {Array.isArray(productDetail.sizes)
                  ? productDetail.sizes.join(", ")
                  : productDetail.sizes}
              </p>
              <p>
                <b>Colors:</b>{" "}
                {Array.isArray(productDetail.colors)
                  ? productDetail.colors.join(", ")
                  : productDetail.colors}
              </p>
            </div>
          </div>
        </div>

        {/* Extra Mobile Tweaks */}
        <style>
          {`
            @media (max-width: 576px) {
              h3 { font-size: 1.4rem !important; }
              img { width: 200px !important; height: 200px !important; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
