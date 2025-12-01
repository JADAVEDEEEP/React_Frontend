import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as THREE from "three";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

const API_PRODUCTS = "https://node-backend-4b48.onrender.com/api/allproducts";
const API_SELLERS = "https://node-backend-4b48.onrender.com/auth/getusers";

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const threeRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);

  // Inject enhanced CSS with animations
  useEffect(() => {
    const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;700;900&display=swap');
:root {
  /* Brand – Soft professional tone */
  --primary: #4A5568;         /* Soft dark gray with slight blue tone */
  --primary-light: #EDF2F7;   /* Very light grayish-blue */
  --primary-dark: #2D3748;    /* Deeper professional gray */

  /* Secondary – subtle blue for highlights */
  --secondary: #3B82F6; 
  --secondary-light: #E8F0FE;

  /* Accents – minimal and muted */
  --accent: #F59E0B;         /* Soft warm accent */
  --accent-light: #FEF3C7;

  /* Backgrounds */
  --bg-white: #FFFFFF;
  --bg-light: #F7F7F8;       /* Dashboard clean background */
  --bg-gray: #F0F0F1;        /* Slightly darker section background */

  /* Text */
  --text-dark: #1A1A1A;
  --text-medium: #4B4B4B;
  --text-light: #6F6F6F;

  /* Borders */
  --border: #E5E5E5;
  --border-dark: #D4D4D4;

  /* Status colors */
  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;

  /* Shadows – very minimal */
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);

  /* Radius */
  --radius: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body { 
  font-family: 'Poppins', sans-serif; 
  background: var(--bg-light);
  color: var(--text-dark);
  overflow-x: hidden;
}

.hp-container {
  min-height: 100vh;
  position: relative;
}

/* ========== ANIMATED NAVBAR ========== */
.navbar-wrapper {
  position: fixed;
  top: 20px;              /* move navbar a little down */
  left: 50%;
  transform: translateX(-50%);
  width: 92%;             /* navbar not full width → looks premium */
  border-radius: 20px;    /* rounded corners */
  background: rgba(148, 135, 135, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 6px 25px rgba(0,0,0,0.08);
  transition: all 0.35s ease;
  z-index: 1000;
}


.navbar-wrapper.scrolled {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px); 
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;     /* slightly smaller radius when stuck */
  box-shadow: 0 8px 35px rgba(0,0,0,0.12);
  top: 10px;               /* moves up a bit on scroll */
  width: 94%;              /* slightly expand when sticky */
}


.navbar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: padding 0.3s ease;
}

.navbar-wrapper.scrolled .navbar {
  padding: 1rem 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  animation: slideInLeft 0.6s ease;
}

.nav-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease;
}

.nav-logo:hover {
  transform: rotate(10deg) scale(1.1);
}

.nav-title {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-desktop {
  display: flex;
  gap: 2rem;
  align-items: center;
  animation: slideInDown 0.6s ease;
}

.nav-link {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  animation: slideInRight 0.6s ease;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--text-dark);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: var(--text-dark);
  z-index: 1001;
}

/* ========== MOBILE SIDEBAR ========== */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-overlay.open {
  display: block;
  opacity: 1;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  right: -100%;
  width: 85%;
  max-width: 400px;
  height: 100vh;
  background: var(--bg-white);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-sidebar.open {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.sidebar-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-dark);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.sidebar-close:hover {
  background: var(--bg-light);
  transform: rotate(90deg);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.sidebar-link {
  padding: 1rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-dark);
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-link:hover {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  transform: translateX(8px);
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border);
}

/* ========== HERO SECTION ========== */
.hero {
  padding-top: 140px;
  padding-bottom: 80px;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  animation: slideInLeft 0.8s ease;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05));
  border-radius: 50px;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--text-dark), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-gray);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-gray);
  font-weight: 500;
}

.hero-visual {
  position: relative;
  animation: slideInRight 0.8s ease;
}

.hero-slider {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.slide {
  position: absolute;
  inset: 0;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slider-controls {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.slider-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.slider-btn:hover {
  background: white;
  transform: scale(1.1);
}

.slider-dots {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: white;
  transform: scale(1.3);
}

/* ========== FEATURES ========== */
.features {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-white);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.feature-text {
  color: var(--text-gray);
  line-height: 1.6;
}

/* ========== CATEGORIES ========== */
.section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--text-gray);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.category-card {
  background: var(--bg-white);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.category-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image {
  transform: scale(1.1);
}

.category-info {
  padding: 1.5rem;
  text-align: center;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.category-count {
  color: var(--text-gray);
  font-size: 0.9rem;
}

/* ========== PRODUCTS ========== */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: var(--bg-white);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.product-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
}
.product-image-wrapper {
  height: 280px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;   /* <-- Image perfect fit */
  object-position: center;
}
/* ========== PREMIUM FEATURED PRODUCT HOVER ========== */
.product-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  transition: all 0.35s ease;
  border: 1px solid #e5e7eb;
}

.product-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.15);
  border-color: transparent;
}

/* Glow Outline */
.product-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.product-card:hover::before {
  opacity: 1;
}

/* Smooth Image Zoom */
.product-card .product-image-wrapper img {
  transition: transform 0.45s ease, filter 0.35s ease;
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.12);
  filter: drop-shadow(0 10px 22px rgba(0,0,0,0.25));
}

/* Shine Sweep Effect */
.product-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 120%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255,255,255,0.4) 50%,
    transparent 100%
  );
  transform: skewX(-20deg);
  opacity: 0;
  transition: all 0.5s ease;
}

.product-card:hover::after {
  left: 150%;
  opacity: 1;
}


.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
}

.product-info {
  padding: 1.5rem;
}

.product-category {
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
}

.product-seller {
  font-size: 0.9rem;
  color: var(--text-gray);
  margin-bottom: 1rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid var(--border);
}

.product-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.product-stock {
  font-size: 0.85rem;
  color: var(--text-gray);
}

/* ========== SELLERS ========== */
.sellers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.seller-card {
  background: var(--bg-white);
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 120px;
}

.seller-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.seller-avatar {
  width: 70px;
  height: 70px;
  min-width: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary);
  animation: rotateIn 0.6s ease;
}

.seller-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.seller-name {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.verified-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 50px;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.seller-email {
  color: var(--text-gray);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seller-products {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ========== ANIMATIONS ========== */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotateIn {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0);
  }
  to {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

/* ========== FOOTER ========== */
.footer {
  background: linear-gradient(135deg, var(--secondary), var(--text-dark));
  color: white;
  padding: 4rem 2rem 2rem;
  margin-top: 6rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo-icon {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 800;
}

.footer-desc {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.footer-section h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--primary);
  transform: translateX(4px);
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-slider {
    height: 450px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .nav-desktop,
  .nav-actions {
    display: none;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .hero {
    padding-top: 120px;
    padding-bottom: 40px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-stats {
    gap: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .hero-slider {
    height: 350px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .categories-grid,
  .products-grid,
  .sellers-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}

/* Loading Animation */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: var(--text-gray);
}

.loading::after {
  content: '...';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60%, 100% {
    content: '...';
  }
}
`;

    if (!document.getElementById("redesigned-homepage-styles")) {
      const style = document.createElement("style");
      style.id = "redesigned-homepage-styles";
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch data
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.allSettled([
          axios.get(API_PRODUCTS),
          axios.get(API_SELLERS),
        ]);

        let prodArr = [];
        if (pRes.status === "fulfilled") {
          const d = pRes.value.data;
          if (Array.isArray(d)) prodArr = d;
          else if (Array.isArray(d?.data)) prodArr = d.data;
          else if (Array.isArray(pRes.value.data?.products))
            prodArr = pRes.value.data.products;
        }

        prodArr = prodArr.map((p, i) => ({
          _id: p?._id ?? p?.id ?? `local_${i}`,
          name: p?.name ?? p?.title ?? `Product ${i + 1}`,
          price: Number(p?.price ?? p?.amount ?? 0) || 0,
          quantity: Number(p?.quantity ?? p?.stock ?? 0) || 0,
          image: p?.image ?? p?.img ?? `https://picsum.photos/seed/p${i}/900/600`,
          category: p?.category ?? p?.cat ?? "General",
          desc: p?.description ?? p?.desc ?? "",
          userid: p?.userid ?? p?.userId ?? p?.user_id ?? p?.sellerId ?? null,
        }));

        let sellersArr = [];
        if (sRes.status === "fulfilled") {
          const s = sRes.value.data;
          if (Array.isArray(s)) sellersArr = s;
          else if (Array.isArray(s?.data)) sellersArr = s.data;
          else if (Array.isArray(sRes.value.data?.sellers))
            sellersArr = sRes.value.data.sellers;
        }

        sellersArr = sellersArr.map((u, i) => {
          const userIdCandidates = [u?._id, u?.id, u?.userId, u?._doc?._id]
            .map(String)
            .filter(Boolean);
          const count = prodArr.reduce((acc, prod) => {
            const prodOwner = prod.userid ? String(prod.userid) : "";
            if (!prodOwner) return acc;
            if (userIdCandidates.includes(prodOwner)) return acc + 1;
            return acc;
          }, 0);

          const first = (u?.firstName || u?.firstname || u?.first_name || "").trim();
          const last = (u?.lastName || u?.lastname || u?.last_name || "").trim();

          return {
            _id: u?._id ?? u?.id ?? `user_${i}`,
            firstName: first || "",
            lastName: last || "",
            name:
              first || last
                ? `${first} ${last}`.trim()
                : u?.name || u?.username || `User ${i + 1}`,
            email: u?.email ?? "",
            avatar: u?.avatar ?? `https://i.pravatar.cc/150?u=${i}`,
            products: count,
            rating: Number(u?.rating ?? 3 + Math.floor(Math.random() * 3)),
            raw: u,
          };
        });

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

  // Slider
  const slides = products.slice(0, 5).length
    ? products.slice(0, 5)
    : [
        {
          _id: "p1",
          name: "Elegant Vase",
          image: "https://picsum.photos/900/600?seed=a",
        },
        {
          _id: "p2",
          name: "Ceramic Lamp",
          image: "https://picsum.photos/900/600?seed=b",
        },
        {
          _id: "p3",
          name: "Decor Pillow",
          image: "https://picsum.photos/900/600?seed=c",
        },
      ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSlideIndex((s) => (s + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const prevSlide = () =>
    setSlideIndex((s) => (s - 1 + slides.length) % slides.length);
  const nextSlide = () => setSlideIndex((s) => (s + 1) % slides.length);

  // Counting animation hook
  const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (end === 0) return;
      let startTime = null;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        setCount(Math.floor(end * percentage));
        if (percentage < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
  };

  const totalProducts = products.length;
  const totalSellers = sellers.length;
  const totalRevenue = products.reduce(
    (s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0
  );

  const animatedProducts = useCountUp(totalProducts, 2000);
  const animatedSellers = useCountUp(totalSellers, 2000);
  const animatedRevenue = useCountUp(totalRevenue, 2500);

  const fmt = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const menuItems = [
    { label: "Home", to: "/" },
    { label: "Collection", to: "/collection" },
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <div className="hp-container">
      {/* Navbar */}
      <div className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
        <nav className="navbar">
          <div className="nav-brand" onClick={() => navigate("/")}>
            <div className="nav-logo">🛍️</div>
            <div>
              <div className="nav-title">Lavish</div>
            </div>
          </div>

          <div className="nav-desktop">
            {menuItems.map((item) => (
              <a
                key={item.label}
                className="nav-link"
                href={item.to}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.to);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
  className="btn btn-secondary"
  onClick={() => navigate("/register")}
>
  Register
</button>

          </div>

          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`mobile-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="nav-brand">
            <div className="nav-logo">🛍️</div>
            <div>
              <div className="nav-title">Lavish</div>
            </div>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <a
              key={item.label}
              className="sidebar-link"
              href={item.to}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.to);
                setSidebarOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-actions">
          <button
            className="btn btn-secondary"
            style={{ width: "100%" }}
            onClick={() => {
              navigate("/login");
              setSidebarOpen(false);
            }}
          >
            Login
          </button>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={() => {
              navigate("/register");
              setSidebarOpen(false);
            }}
          >
            Register
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🔥</span>
              <span>Trending Collection </span>
            </div>

            <h1 className="hero-title">
              Discover Premium Lifestyle Products
            </h1>

            <p className="hero-subtitle">
              Handpicked home & lifestyle pieces from verified sellers. Shop with
              confidence and elevate your living space with our curated collection.
            </p>

            <div className="hero-cta">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/collection")}
              >
                🛍️ Shop Collection
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/shop")}
              >
                Browse All Products
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">{fmt(animatedProducts)}+</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{fmt(animatedSellers)}+</div>
                <div className="stat-label">Active Sellers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">₹{fmt(animatedRevenue)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div
              className="hero-slider"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {slides.map((slide, idx) => {
                const distance = idx - slideIndex;
                let offset = distance * 100;
                const isActive = idx === slideIndex;

                return (
                  <div
                    key={slide._id ?? idx}
                    className="slide"
                    style={{
                      transform: `translateX(${offset}%)`,
                      opacity: isActive ? 1 : 0,
                      zIndex: isActive ? 5 : 1,
                    }}
                  >
                    <img src={slide.image} alt={slide.name} loading="lazy" />
                  </div>
                );
              })}

              <div className="slider-controls">
                <button
                  className="slider-btn"
                  onClick={prevSlide}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  className="slider-btn"
                  onClick={nextSlide}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>

              <div className="slider-dots">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`dot ${idx === slideIndex ? "active" : ""}`}
                    onClick={() => setSlideIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3 className="feature-title">Free Shipping</h3>
            <p className="feature-text">
              Free delivery on orders above ₹999. Fast and reliable shipping across
              India.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure Payment</h3>
            <p className="feature-text">
              100% secure transactions with encrypted payment gateway. Shop safely.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3 className="feature-title">Quality Products</h3>
            <p className="feature-text">
              Verified sellers and premium quality products. Satisfaction
              guaranteed.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">24/7 Support</h3>
            <p className="feature-text">
              Round the clock customer support to help you with any queries.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore our handpicked collections</p>
        </div>

        <div className="categories-grid">
          {["Furniture", "Lighting", "Decor", "Textiles", "Art", "Plants"].map(
            (cat, i) => (
              <div
                key={cat}
                className="category-card"
                onClick={() => navigate("/collection")}
              >
                <img
                  src={`https://picsum.photos/seed/cat${i}/600/400`}
                  alt={cat}
                  className="category-image"
                />
                <div className="category-info">
                  <div className="category-name">{cat}</div>
                  <div className="category-count">Explore Collection</div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">
            Discover our most popular items
          </p>
        </div>

        {loading ? (
          <div className="loading">Loading products</div>
        ) : (
          <div className="products-grid">
            {products.slice(0, 8).map((product) => {
              const ownerId = product.userid ? String(product.userid) : "";
              const seller = sellers.find(
                (s) =>
                  String(s._id) === ownerId ||
                  String(s.raw?._id) === ownerId ||
                  String(s.raw?.id) === ownerId
              );

              return (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                    {product.quantity < 5 && product.quantity > 0 && (
                      <div className="product-badge">Low Stock</div>
                    )}
                  </div>

                  <div className="product-info">
                    <div className="product-category">{product.category}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-seller">
                      By {seller ? seller.name : "Unknown Seller"}
                    </div>

                    <div className="product-footer">
                      <div>
                        <div className="product-price">₹{fmt(product.price)}</div>
                        <div className="product-stock">
                          Stock: {product.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sellers */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Active Sellers</h2>
          <p className="section-subtitle">
            Meet our verified marketplace sellers
          </p>
        </div>

        <div className="sellers-grid">
          {sellers.slice(0, 12).map((seller) => (
            <div
              key={seller._id}
              className="seller-card"
              onClick={() => navigate(`/seller/${seller._id}`)}
            >
              <img
                src={seller.avatar}
                alt={seller.name}
                className="seller-avatar"
              />

              <div className="seller-info">
                <div className="seller-name">
                  {seller.name}
                  <span className="verified-badge">
                    <span>✓</span> Verified
                  </span>
                </div>
                <div className="seller-email">{seller.email}</div>
                <div className="seller-products">
                  📦 {seller.products} product{seller.products !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">🛍️</div>
              <div className="footer-title">Lavish</div>
            </div>
            <p className="footer-desc">
              Your trusted marketplace for premium home & lifestyle products.
              Connecting buyers with verified sellers since .
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="/shop" className="footer-link">
                Shop
              </a>
              <a href="/collection" className="footer-link">
                Collections
              </a>
              <a href="/about" className="footer-link">
                About Us
              </a>
              <a href="/contact" className="footer-link">
                Contact
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <div className="footer-links">
              <a href="/faq" className="footer-link">
                FAQ
              </a>
              <a href="/shipping" className="footer-link">
                Shipping
              </a>
              <a href="/returns" className="footer-link">
                Returns
              </a>
              <a href="/privacy" className="footer-link">
                Privacy Policy
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <div className="footer-links">
              <div style={{ color: "rgba(255,255,255,0.8)" }}>
                📧 support@Lavish.com
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                📞 +91 98765 43210
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>
                📍 Ahmedabad, Gujarat, IN
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>©  Lavish. All rights reserved. Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  );
}