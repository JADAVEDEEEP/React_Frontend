// src/pages/HomePage.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as THREE from "three";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

const API_PRODUCTS = "http://localhost:3001/api/allproducts";
const API_SELLERS = "http://localhost:3001/auth/getusers";

export default function HomePage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("A"); // "A" | "B" | "C"
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const threeRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);

  // Inject CSS with animations and responsive
  useEffect(() => {
    const css = `
/* ===== Embedded HomePage CSS with Animations & Responsive ===== */
.hp-root { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; min-height:100vh; padding-bottom:40px; }
.hp-container { max-width:1300px; margin:24px auto; padding:18px; }

/* header */
.hp-header { background: var(--header-bg); border-radius:12px; padding:18px; box-shadow: var(--card-shadow); color:var(--text-color);
  animation: fadeUp 0.6s ease forwards;
  transition: background 0.4s ease;
}
.hp-brand { font-weight:800; font-size:20px; display:flex; align-items:center; gap:10px; }
.hp-badge{ font-size:12px; padding:6px 10px; border-radius:999px; background:var(--badge-bg); color:var(--badge-color); }

/* nav */
.hp-nav a{ color:var(--text-muted); text-decoration:none; margin-right:12px; font-weight:600; }
.hp-nav button{ margin-left:10px; }

/* hero */
.hp-hero { display:grid; grid-template-columns: 1fr 1fr; gap:22px; align-items:center; margin-top:16px; position:relative; overflow:visible; }
.hp-hero-left h1{ font-size:36px; margin-bottom:10px; color:var(--title-color);
  animation: fadeUp 0.6s ease forwards;
}
.hp-hero-left p{ color:var(--muted-color); margin-bottom:18px; max-width:520px;
  animation: fadeUp 0.7s ease forwards;
}
.hp-cta {
  border-radius:999px;
  padding:12px 26px;
  font-weight:700;
  border:none;
  cursor:pointer;
  transition: transform 0.25s ease, filter 0.25s ease;
}
.hp-cta:hover {
  transform: scale(1.05);
  filter: brightness(1.08);
}

/* three wrapper & hero image */
.three-wrap {
  position:absolute;
  right:28px;
  top:22px;
  width:420px;
  height:260px;
  pointer-events:none;
  z-index:0;
  opacity:0.18;
}
.hero-image-frame {
  border-radius:12px;
  overflow:hidden;
  width:420px;
  box-shadow:var(--image-shadow);
  z-index:2;
  margin-left:auto;
  transition: transform 0.6s ease, box-shadow 0.3s ease;
  animation: fadeUp 1s ease forwards;
}
.hero-image-frame:hover {
  transform: scale(1.05) rotate(1deg);
  box-shadow: 0 18px 50px rgba(0,0,0,0.25);
}

/* categories/products */
.section-title{ font-weight:800; margin-top:36px; color:var(--title-color); }
.cards-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap:18px; margin-top:12px; }

.card {
  background: var(--card-bg);
  border-radius:12px;
  box-shadow: var(--card-shadow);
  overflow:hidden;
  color:var(--text-color);
  opacity: 0;
  animation: fadeUp 0.8s ease forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.card img{ width:100%; height:200px; object-fit:cover; display:block; }
.card-body{ padding:12px 14px; }
.product-price{ font-weight:800; color:var(--accent-color); }

.cards-grid .card:nth-child(1) { animation-delay: 0.1s; }
.cards-grid .card:nth-child(2) { animation-delay: 0.15s; }
.cards-grid .card:nth-child(3) { animation-delay: 0.2s; }
.cards-grid .card:nth-child(4) { animation-delay: 0.25s; }
.cards-grid .card:nth-child(5) { animation-delay: 0.3s; }
.cards-grid .card:nth-child(6) { animation-delay: 0.35s; }

/* chart */
.chart-box{ background:var(--card-bg); padding:16px; border-radius:12px; box-shadow:var(--card-shadow); margin-top:16px;
  animation: fadeUp 1.2s ease forwards;
}

/* footer */
.hp-footer{ margin-top:28px; padding:14px 18px; border-radius:10px; background:var(--card-bg); box-shadow:var(--card-shadow); color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;
  animation: fadeUp 1.4s ease forwards;
}

/* empty */
.empty-card{ padding:22px; text-align:center; color:var(--muted-color); }

/* animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* buttons */
button, .btn {
  transition: all 0.25s ease;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

/* responsive */
@media (max-width: 900px) {
  .hp-hero { grid-template-columns:1fr; }
  .three-wrap { display:none; }
  .hero-image-frame { width:100%; }
}
@media (max-width: 600px) {
  .hp-hero-left h1 { font-size: 28px; }
  .card img { height: 160px; }
}
`;
    if (!document.getElementById("hp-embedded-css")) {
      const style = document.createElement("style");
      style.id = "hp-embedded-css";
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }, []);

  // Fetch products and sellers
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [prodRes, sellersRes] = await Promise.allSettled([
          axios.get(API_PRODUCTS),
          axios.get(API_SELLERS),
        ]);
        let prodArr = [];
        if (prodRes.status === "fulfilled") {
          const d = prodRes.value.data;
          if (Array.isArray(d)) prodArr = d;
          else if (Array.isArray(d?.data)) prodArr = d.data;
          else if (Array.isArray(prodRes.value.data?.products)) prodArr = prodRes.value.data.products;
        }
        prodArr = prodArr.map((p, i) => ({
          _id: p?._id ?? p?.id ?? `local_${i}`,
          name: p?.name ?? p?.title ?? `Product ${i + 1}`,
          price: Number(p?.price ?? p?.amount ?? 0) || 0,
          quantity: Number(p?.quantity ?? p?.stock ?? 0) || 0,
          image: p?.image ?? p?.img ?? `https://picsum.photos/seed/p${i}/900/600`,
          category: p?.category ?? p?.cat ?? "General",
        }));

        let sellersArr = [];
        if (sellersRes.status === "fulfilled") {
          const s = sellersRes.value.data;
          if (Array.isArray(s)) sellersArr = s;
          else if (Array.isArray(s?.data)) sellersArr = s.data;
          else if (Array.isArray(sellersRes.value.data?.sellers)) sellersArr = sellersRes.value.data.sellers;
        }
        sellersArr = sellersArr.map((s, i) => ({
          name: s?.name ?? s?.username ?? `Seller ${i + 1}`,
          products: Number(s?.productCount ?? s?.products?.length ?? Math.floor(Math.random() * 20)) || 0,
          email: s?.email ?? "",
        }));

        if (!mounted) return;
        setProducts(prodArr);
        setSellers(sellersArr);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // ThreeJS init & cleanup with responsive resize
  useEffect(() => {
    if (!threeRef.current) return;
    const container = threeRef.current;
    let width = container.clientWidth || 420;
    let height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const geom = new THREE.TorusKnotGeometry(1.2, 0.35, 192, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: theme === "C" ? 0xc59b2b : 0x6b5bff,
      roughness: 0.3,
      metalness: 0.4,
    });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    const p1 = new THREE.PointLight(0xffe6b3, 0.8);
    p1.position.set(5, 4, 5);
    const p2 = new THREE.PointLight(0x6b5bff, 0.8);
    p2.position.set(-4, -3, 5);
    scene.add(amb, p1, p2);

    let mounted = true;
    function animate() {
      if (!mounted) return;
      mesh.rotation.x += 0.004;
      mesh.rotation.y += 0.006;
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    }
    animate();

    // Responsive resize
    const onResize = () => {
      if (!threeRef.current) return;
      width = threeRef.current.clientWidth || 420;
      height = threeRef.current.clientHeight || 260;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      try {
        geom.dispose();
        mat.dispose();
      } catch (e) {}
      if (rendererRef.current) {
        rendererRef.current.forceContextLoss();
        if (rendererRef.current.domElement) {
          rendererRef.current.domElement.width = 0;
          rendererRef.current.domElement.height = 0;
          rendererRef.current.domElement.remove();
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [threeRef, theme]);

  // Derived values
  const totalProducts = products.length;
  const totalSellers = sellers.length;
  const totalRevenue = products.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);
  const totalQuantity = products.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

  const chartData = sellers.length ? sellers : [{ name: "No Data", products: 0 }];
  const topProducts = products.slice().sort((a, b) => b.price - a.price).slice(0, 6);
  const fmt = (n) => (Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  // Theme variables applied to root style with transition for smooth theme switch
  const themeVarsObj = {
    A: {
      "--header-bg": "linear-gradient(180deg,#ffffff,#f9f9fb)",
      "--card-bg": "#ffffff",
      "--card-shadow": "0 14px 40px rgba(20,20,40,0.06)",
      "--text-color": "#222",
      "--text-muted": "#6b7280",
      "--muted-color": "#6b7280",
      "--title-color": "#111827",
      "--accent-color": "#667eea",
      "--badge-bg": "rgba(102,126,234,0.12)",
      "--badge-color": "#102a7a",
      "--image-shadow": "0 18px 40px rgba(102,126,234,0.12)",
    },
    B: {
      "--header-bg": "linear-gradient(180deg,#ffffff,#f1f6ff)",
      "--card-bg": "#ffffff",
      "--card-shadow": "0 14px 40px rgba(20,30,80,0.06)",
      "--text-color": "#0f172a",
      "--text-muted": "#475569",
      "--muted-color": "#475569",
      "--title-color": "#0b1220",
      "--accent-color": "#ffd166",
      "--badge-bg": "#e8f0ff",
      "--badge-color": "#1e3a8a",
      "--image-shadow": "0 18px 40px rgba(13,110,253,0.12)",
    },
    C: {
      "--header-bg": "linear-gradient(180deg,#0b0b0d,#0f0f12)",
      "--card-bg": "#0b0c10",
      "--card-shadow": "0 14px 60px rgba(0,0,0,0.6)",
      "--text-color": "#f7f5ee",
      "--text-muted": "#cfc6b9",
      "--muted-color": "#cfc6b9",
      "--title-color": "#fff7e6",
      "--accent-color": "#c59b2b",
      "--badge-bg": "rgba(255,255,240,0.06)",
      "--badge-color": "#f8e7a0",
      "--image-shadow": "0 18px 40px rgba(0,0,0,0.6)",
    },
  };
  const vars = themeVarsObj[theme] || themeVarsObj.A;
  const rootStyle = { ...vars, transition: "all 0.4s ease" };

  return (
    <div className="hp-root" style={rootStyle}>
      <div className="hp-container">
        {/* HEADER */}
        <div className="hp-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="hp-brand">
                <span style={{ fontSize: 22 }}>🛍️</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>Trendzz</div>
                  <div className="hp-badge">Seller Dashboard</div>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <nav className="hp-nav d-none d-md-flex">
                <a className="nav-link" href="/">
                  Home
                </a>
                <a className="nav-link" href="/collection">
                  Collection
                </a>
                <a className="nav-link" href="/shop">
                  Shop
                </a>
                <a className="nav-link" href="/about">
                  About
                </a>
              </nav>

              <div className="d-flex align-items-center ms-3 me-2">
                <button
                  className={`btn btn-sm me-1 ${theme === "A" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setTheme("A")}
                >
                  A
                </button>
                <button
                  className={`btn btn-sm me-1 ${theme === "B" ? "btn-warning" : "btn-outline-warning"}`}
                  onClick={() => setTheme("B")}
                >
                  B
                </button>
                <button
                  className={`btn btn-sm ${theme === "C" ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => setTheme("C")}
                >
                  C
                </button>
              </div>

              <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="btn btn-dark" onClick={() => navigate("/register")}>
                Register
              </button>
            </div>
          </div>

          {/* HERO */}
          <div className="hp-hero" style={{ marginTop: 14 }}>
            <div className="hp-hero-left" style={{ zIndex: 3 }}>
              <h1 className="hero-title">Decorate Your Dream Space<br />With Fine Collections</h1>
              <p className="hero-sub">
                Manage your sellers, monitor products, and grow with clean analytics. Switch themes A/B/C for different looks — all included.
              </p>
              <div className="d-flex gap-2">
                <button
                  className="hp-cta"
                  style={{ background: vars["--accent-color"], color: theme === "C" ? "#0b0c10" : "#07122a" }}
                >
                  Explore Collection
                </button>
                <button className="btn btn-outline-secondary">Learn More</button>
              </div>
            </div>

            <div className="hp-hero-right">
              <div ref={threeRef} className="three-wrap" />
              <div className="hero-image-frame">
                <img src={topProducts[0]?.image ?? "https://picsum.photos/650/420"} alt="hero" loading="lazy" />
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="d-flex gap-3 mt-4" style={{ flexWrap: "wrap" }}>
          {[
            { label: "Total Sellers", value: totalSellers, icon: "👥" },
            { label: "Total Products", value: totalProducts, icon: "📦" },
            { label: "Total Revenue", value: `₹${fmt(totalRevenue)}`, icon: "💰" },
            { label: "Total Stock", value: totalQuantity, icon: "📊" },
          ].map((s, i) => (
            <div key={i} style={{ minWidth: 180, flex: "1 1 220px" }}>
              <div className="card" style={{ padding: 12 }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>
                      {s.icon} {s.value}
                    </div>
                    <div style={{ color: vars["--muted-color"], marginTop: 6 }}>{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <h3 className="section-title">Top Categories</h3>
        <div className="cards-grid">
          {["Furniture", "Vase", "Lighting", "Art"].map((c, i) => (
            <div key={c} className="card">
              <img src={`https://picsum.photos/seed/cat${i}/900/600`} alt={c} />
              <div className="card-body">
                <div style={{ fontWeight: 800 }}>{c}</div>
                <div style={{ color: vars["--muted-color"], marginTop: 6 }}>Handpicked collection</div>
              </div>
            </div>
          ))}
        </div>

        {/* Products */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          <h3 className="section-title">Most Popular</h3>
          <button className="btn btn-outline-secondary">See All →</button>
        </div>
        <div className="cards-grid">
          {topProducts.length ? (
            topProducts.map((p) => (
              <div className="card" key={p._id}>
                <img src={p.image} alt={p.name} />
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ color: vars["--muted-color"], fontSize: 13 }}>{p.category}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="product-price">₹{fmt(p.price)}</div>
                      <div style={{ fontSize: 12, color: vars["--muted-color"] }}>Stock: {p.quantity}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-card card">No products available</div>
          )}
        </div>

        {/* Chart */}
        <h3 className="section-title">Seller & Product Stats</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="products" fill={vars["--accent-color"]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sellers */}
        {sellers.length > 0 && (
          <>
            <h3 className="section-title" style={{ marginTop: 20 }}>
              Active Sellers
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {sellers.slice(0, 8).map((s, idx) => (
                <div className="card" key={idx} style={{ padding: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 999,
                        background: vars["--accent-color"],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        color: theme === "C" ? "#0b0c10" : "#fff",
                      }}
                    >
                      {(s.name || "S")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <div style={{ color: vars["--muted-color"], fontSize: 13 }}>{s.email || "No email"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="hp-footer">
          <div>
            <strong>🛍 Trendzz</strong>
            <div style={{ color: vars["--muted-color"] }}>Your trusted seller platform</div>
          </div>
          <div style={{ color: vars["--muted-color"] }}>© {new Date().getFullYear()} Trendzz</div>
        </div>
      </div>
    </div>
  );
}
