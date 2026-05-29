import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { waitlistApi } from '../services/api';
import { toast } from 'react-hot-toast';

export const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      const res = await waitlistApi.join(email);
      toast.success(res.data.message || 'Joined waitlist successfully! 🚀');
      setEmail('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to join waitlist. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-page-root">
      {/* Dynamic Embedded CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-page-root {
          --white: #ffffff;
          --off-white: #f5f8fc;
          --surface: #eaf3fb;
          --border: #d6e8f5;
          --border-strong: #b0d0e8;
          --text-primary: #00274d;
          --text-secondary: #2e5a7a;
          --text-muted: #7aa3be;
          --accent: #00b9f1;
          --accent-light: #e0f6fe;
          --accent-mid: #40ccf5;
          --accent-dark: #0090c4;
          --navy: #00274d;
          --navy-deep: #001a38;
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 24px; --r-full: 9999px;
          font-family: var(--font-body);
          background: var(--white);
          color: var(--text-primary);
          line-height: 1.6;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        .landing-nav { position: fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:64px; background:rgba(255,255,255,0.92); backdrop-filter:blur(20px); border-bottom:1px solid rgba(0,39,77,0.08); }
        .nav-logo { font-family:var(--font-display); font-size:22px; color:var(--text-primary); letter-spacing:-0.5px; text-decoration:none; display:flex; align-items:center; gap:6px; }
        .nav-logo .dot { width:8px; height:8px; background:var(--accent); border-radius:50%; margin-bottom:2px; }
        .nav-links { display:flex; align-items:center; gap:36px; list-style:none; }
        .nav-links a { font-size:14px; font-weight:400; color:var(--text-secondary); text-decoration:none; transition:color 0.2s; }
        .nav-links a:hover { color:var(--text-primary); }
        .nav-cta { background:var(--navy) !important; color:var(--white) !important; padding:9px 20px; border-radius:var(--r-full); font-size:14px !important; font-weight:500 !important; text-decoration:none; transition:opacity 0.2s, transform 0.2s !important; display:inline-block; }
        .nav-cta:hover { opacity:0.85; transform:translateY(-1px); }

        /* HERO */
        .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:120px 48px 80px; text-align:center; position:relative; overflow:hidden; }
        .hero-bg { position:absolute; inset:0; pointer-events:none; z-index:0; }
        .hero-content { position:relative; z-index:1; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:var(--accent-light); color:var(--accent-dark); font-size:12px; font-weight:500; padding:6px 14px; border-radius:var(--r-full); margin-bottom:40px; letter-spacing:0.03em; text-transform:uppercase; border:1px solid rgba(0,185,241,0.25); }
        .hero-badge::before { content:''; width:6px; height:6px; background:var(--accent); border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        .hero-headline { font-family:var(--font-display); font-size:clamp(56px,7.5vw,108px); line-height:1.0; letter-spacing:-3px; color:var(--text-primary); max-width:900px; margin-bottom:12px; }
        .hero-headline .line2 { color:var(--text-muted); font-style:italic; }
        .hero-sub { font-size:18px; font-weight:300; color:var(--text-secondary); max-width:540px; margin:32px auto 48px; line-height:1.65; }
        .hero-actions { display:flex; align-items:center; gap:16px; justify-content:center; margin-bottom:80px; }
        .btn-primary { background:var(--navy); color:var(--white); border:none; padding:14px 28px; border-radius:var(--r-full); font-family:var(--font-body); font-size:15px; font-weight:500; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:transform 0.2s, opacity 0.2s, box-shadow 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.12),0 4px 16px rgba(0,0,0,0.06); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.15); }
        .btn-secondary { background:transparent; color:var(--text-secondary); border:none; padding:14px 20px; font-family:var(--font-body); font-size:15px; font-weight:400; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:color 0.2s; }
        .btn-secondary:hover { color:var(--text-primary); }
        .btn-secondary svg { transition:transform 0.2s; }
        .btn-secondary:hover svg { transform:translateX(3px); }

        /* FLOATING CARDS */
        .hero-cards { position:relative; width:100%; max-width:960px; height:300px; margin:0 auto; }
        .float-card { position:absolute; background:var(--white); border:1px solid var(--border); border-radius:var(--r-lg); padding:16px 20px; box-shadow:0 2px 8px rgba(0,39,77,0.06),0 12px 32px rgba(0,39,77,0.04); animation:floaty linear infinite; will-change:transform; text-align: left; }
        .float-card:nth-child(1){left:0%;top:20px;width:200px;animation-duration:7s;animation-delay:0s}
        .float-card:nth-child(2){left:22%;top:60px;width:215px;animation-duration:8s;animation-delay:-2s}
        .float-card:nth-child(3){right:22%;top:10px;width:215px;animation-duration:7.5s;animation-delay:-4s}
        .float-card:nth-child(4){right:0%;top:50px;width:200px;animation-duration:9s;animation-delay:-1s}
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .card-chip { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); margin-bottom:10px; }
        .card-chip .dot { width:5px; height:5px; border-radius:50%; }
        .dot-blue{background:var(--accent)} .dot-green{background:#22c55e} .dot-orange{background:#f97316} .dot-indigo{background:#6366f1}
        .card-title { font-size:14px; font-weight:500; color:var(--text-primary); margin-bottom:4px; }
        .card-value { font-family:var(--font-display); font-size:22px; color:var(--text-primary); letter-spacing:-0.5px; }
        .card-tag { display:inline-block; background:var(--surface); color:var(--text-secondary); font-size:11px; font-weight:500; padding:3px 8px; border-radius:var(--r-full); margin-top:8px; }
        .swap-row { display:flex; align-items:center; gap:8px; margin-top:10px; }
        .swap-item { flex:1; background:var(--surface); border-radius:var(--r-sm); padding:6px 8px; font-size:11px; font-weight:500; color:var(--text-primary); text-align:center; }
        .points-row { display:flex; align-items:center; gap:8px; margin-top:10px; }
        .points-badge { background:var(--accent-light); color:var(--accent-dark); font-size:13px; font-weight:600; padding:4px 10px; border-radius:var(--r-full); }
        .market-price { display:flex; align-items:baseline; gap:4px; margin-top:8px; }
        .market-pts { font-family:var(--font-display); font-size:20px; color:var(--accent); }
        .market-unit { font-size:11px; color:var(--text-muted); font-weight:400; }

        /* SECTIONS */
        .landing-section { padding:120px 48px; }
        .landing-container { max-width:1100px; margin:0 auto; text-align: left; }
        .section-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent); margin-bottom:20px; }
        .section-headline { font-family:var(--font-display); font-size:clamp(36px,4vw,58px); line-height:1.1; letter-spacing:-1.5px; color:var(--text-primary); max-width:700px; }
        .section-sub { font-size:17px; font-weight:300; color:var(--text-secondary); max-width:500px; margin-top:20px; line-height:1.7; }

        /* PROBLEM */
        .problem-section { background:var(--off-white); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .problem-layout { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; margin-top:64px; }
        .problem-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; background:var(--border); border-radius:var(--r-lg); overflow:hidden; }
        .problem-card { background:var(--white); padding:32px 24px; display:flex; flex-direction:column; gap:10px; }
        .problem-stat { font-family:var(--font-display); font-size:48px; letter-spacing:-2px; color:var(--text-primary); line-height:1; }
        .problem-stat span { color:var(--accent); }
        .problem-card-title { font-size:14px; font-weight:500; color:var(--text-primary); }
        .problem-card-desc { font-size:12px; color:var(--text-muted); font-weight:300; line-height:1.6; }
        .problem-illus { display:flex; justify-content:center; }

        /* HOW IT WORKS */
        .how-it-works .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:64px; background:var(--border); border-radius:var(--r-lg); overflow:hidden; }
        .step { background:var(--white); padding:48px 36px; position:relative; }
        .step-num { font-family:var(--font-display); font-size:64px; color:var(--surface); line-height:1; margin-bottom:20px; letter-spacing:-3px; }
        .step-illus { margin-bottom:20px; }
        .step-title { font-size:20px; font-weight:500; color:var(--text-primary); margin-bottom:10px; letter-spacing:-0.3px; }
        .step-desc { font-size:14px; color:var(--text-secondary); font-weight:300; line-height:1.65; }

        /* MARKETPLACE */
        .marketplace-section { background:var(--navy); color:var(--white); }
        .marketplace-section .section-label { color:var(--accent-mid); }
        .marketplace-section .section-headline { color:var(--white); }
        .marketplace-section .section-sub { color:rgba(255,255,255,0.5); }
        .market-layout { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; margin-top:64px; }
        .market-grid-small { display:grid; grid-template-columns:1fr 1fr; gap:12px; text-align: left; }
        .market-card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:var(--r-lg); padding:20px 16px; cursor:pointer; transition:background 0.2s,transform 0.2s,border-color 0.2s; }
        .market-card:hover { background:rgba(0,185,241,0.1); transform:translateY(-3px); border-color:rgba(0,185,241,0.35); }
        .market-card-icon { width:40px; height:40px; border-radius:var(--r-md); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .market-card-brand { font-size:13px; font-weight:500; color:rgba(255,255,255,0.9); margin-bottom:3px; }
        .market-card-name { font-size:11px; color:rgba(255,255,255,0.4); font-weight:300; margin-bottom:16px; }
        .market-card-pts { font-family:var(--font-display); font-size:22px; color:var(--white); letter-spacing:-0.5px; }
        .market-card-unit { font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.05em; font-weight:500; }

        /* FEATURES */
        .features-section { background:var(--off-white); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; margin-top:64px; background:var(--border); border-radius:var(--r-lg); overflow:hidden; }
        .feature-card { background:var(--white); padding:36px 32px; transition:background 0.2s; text-align: left; }
        .feature-card:hover { background:var(--surface); }
        .feature-illus { margin-bottom:20px; }
        .feature-title { font-size:16px; font-weight:500; color:var(--text-primary); margin-bottom:8px; letter-spacing:-0.2px; }
        .feature-desc { font-size:13px; color:var(--text-muted); font-weight:300; line-height:1.65; }

        /* VISION */
        .vision-section { overflow:hidden; position:relative; }
        .vision-section::before { content:''; position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:600px; height:600px; background:radial-gradient(circle,rgba(0,185,241,0.07) 0%,transparent 70%); pointer-events:none; }
        .vision-headline { font-family:var(--font-display); font-size:clamp(40px,5vw,72px); line-height:1.05; letter-spacing:-2px; color:var(--text-primary); max-width:800px; margin-bottom:64px; text-align: left; }
        .vision-headline em { font-style:italic; color:var(--text-muted); }
        .roadmap-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; text-align: left; }
        .roadmap-item { border:1px solid var(--border); border-radius:var(--r-lg); padding:28px 24px; background:var(--white); transition:border-color 0.2s,transform 0.2s; }
        .roadmap-item:hover { border-color:var(--accent); transform:translateY(-2px); }
        .roadmap-illus { margin-bottom:16px; }
        .roadmap-tag { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent); margin-bottom:10px; display:block; }
        .roadmap-title { font-size:15px; font-weight:500; color:var(--text-primary); margin-bottom:6px; }
        .roadmap-desc { font-size:13px; color:var(--text-muted); font-weight:300; line-height:1.6; }

        /* CTA */
        .cta-section { background:var(--navy-deep); text-align:center; padding:140px 48px; position:relative; overflow:hidden; }
        .cta-bg { position:absolute; inset:0; pointer-events:none; opacity:0.15; }
        .cta-inner { position:relative; z-index:1; }
        .cta-eyebrow { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent-mid); margin-bottom:28px; }
        .cta-headline { font-family:var(--font-display); font-size:clamp(44px,6vw,82px); line-height:1.05; letter-spacing:-2px; color:var(--white); max-width:700px; margin:0 auto 20px; }
        .cta-sub { font-size:17px; font-weight:300; color:rgba(255,255,255,0.45); margin:0 auto 52px; max-width:420px; line-height:1.65; }
        .btn-light { background:var(--accent); color:var(--navy-deep); border:none; padding:14px 32px; border-radius:var(--r-full); font-family:var(--font-body); font-size:15px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:transform 0.2s,opacity 0.2s; }
        .btn-light:hover { transform:translateY(-2px); opacity:0.92; }
        .cta-note { font-size:13px; color:rgba(255,255,255,0.2); margin-top:24px; font-weight:300; }

        /* FOOTER */
        .landing-footer { padding:48px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
        .footer-logo { font-family:var(--font-display); font-size:18px; color:var(--text-primary); text-decoration:none; }
        .footer-links { display:flex; gap:28px; list-style:none; }
        .footer-links a { font-size:13px; color:var(--text-muted); text-decoration:none; transition:color 0.2s; }
        .footer-links a:hover { color:var(--text-primary); }
        .footer-copy { font-size:13px; color:var(--text-muted); }

        /* TICKER */
        .ticker-wrap { overflow:hidden; border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:14px 0; background:var(--white); }
        .ticker { display:flex; animation:ticker 22s linear infinite; white-space:nowrap; }
        .ticker-item { display:inline-flex; align-items:center; gap:8px; padding:0 32px; font-size:13px; font-weight:400; color:var(--text-muted); }
        .ticker-item .sep { width:4px; height:4px; background:var(--border-strong); border-radius:50%; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* REVEAL */
        .reveal { opacity:1; transform:none; }

        @media(max-width:900px){
          .landing-nav{padding:0 24px} .landing-nav .nav-links{display:none} .landing-section{padding:80px 24px}
          .hero{padding:100px 24px 60px} .hero-cards{display:none}
          .problem-layout,.market-layout{grid-template-columns:1fr}
          .problem-grid{grid-template-columns:1fr 1fr}
          .how-it-works .steps{grid-template-columns:1fr}
          .features-grid{grid-template-columns:1fr}
          .roadmap-grid{grid-template-columns:1fr}
          .landing-footer{flex-direction:column;gap:24px;text-align:center}
          .footer-links{flex-wrap:wrap;justify-content:center}
        }
      `}} />

      {/* NAV */}
      <nav className="landing-nav">
        <a href="#" className="nav-logo">reXa<span className="dot"></span></a>
        <ul className="nav-links">
          <li><a href="#how">How it works</a></li>
          <li><a href="#marketplace">Marketplace</a></li>
          <li><a href="#vision">Vision</a></li>
          {isAuthenticated && (
            <li>
              <Link to="/marketplace" className="nav-cta">
                Go to Marketplace
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#d6e8f5"/>
              </pattern>
            </defs>
            <rect width="1440" height="900" fill="url(#dots)"/>
            <circle cx="0" cy="0" r="380" fill="none" stroke="#d6e8f5" stroke-width="1" opacity="0.6"/>
            <circle cx="0" cy="0" r="560" fill="none" stroke="#d6e8f5" stroke-width="0.8" opacity="0.4"/>
            <circle cx="1440" cy="900" r="320" fill="none" stroke="#d6e8f5" stroke-width="1" opacity="0.5"/>
            <ellipse cx="200" cy="700" rx="180" ry="120" fill="rgba(0,185,241,0.04)"/>
            <ellipse cx="1280" cy="180" rx="200" ry="140" fill="rgba(0,185,241,0.04)"/>
            <g opacity="0.18" transform="translate(120,140)">
              <rect x="0" y="4" width="36" height="22" rx="3" fill="none" stroke="#00274d" stroke-width="1.2"/>
              <circle cx="36" cy="15" r="3" fill="none" stroke="#00274d" stroke-width="1.2"/>
              <line x1="8" y1="11" x2="28" y2="11" stroke="#00274d" stroke-width="1"/>
              <line x1="8" y1="16" x2="22" y2="16" stroke="#00274d" stroke-width="1"/>
            </g>
            <g opacity="0.13" transform="translate(1280,80)">
              <polygon points="20,2 24,14 37,14 27,22 31,34 20,27 9,34 13,22 3,14 16,14" fill="none" stroke="#00274d" stroke-width="1.3"/>
            </g>
            <g opacity="0.12" transform="translate(1360,420)">
              <polyline points="18,2 8,18 16,18 6,34" fill="none" stroke="#00274d" stroke-width="1.5" stroke-linejoin="round"/>
            </g>
            <g opacity="0.14" transform="translate(60,750)">
              <rect x="2" y="14" width="32" height="22" rx="2" fill="none" stroke="#00274d" stroke-width="1.2"/>
              <rect x="0" y="8" width="36" height="8" rx="2" fill="none" stroke="#00274d" stroke-width="1.2"/>
              <line x1="18" y1="8" x2="18" y2="36" stroke="#00274d" stroke-width="1"/>
              <path d="M18 8 C18 8 12 2 8 5 C4 8 10 10 18 8Z" fill="none" stroke="#00274d" stroke-width="1"/>
              <path d="M18 8 C18 8 24 2 28 5 C32 8 26 10 18 8Z" fill="none" stroke="#00274d" stroke-width="1"/>
            </g>
            <g opacity="0.13" transform="translate(1100,750)">
              <path d="M4 10 L28 10 M22 4 L28 10 L22 16" fill="none" stroke="#00274d" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M28 22 L4 22 M10 16 L4 22 L10 28" fill="none" stroke="#00274d" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </div>

        <div className="hero-content">
          <h1 className="hero-headline">
            Stop letting rewards<br />
            <span className="line2">expire.</span>
          </h1>
          <p className="hero-sub">A marketplace where unused coupons, cashback offers, subscriptions, and loyalty perks become real value — for you or someone else.</p>
          <div className="hero-actions">
            <a href="#waitlist" className="btn-primary">
              Join Waitlist
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"/></svg>
            </a>
            {isAuthenticated && (
              <Link to="/marketplace" className="btn-secondary">
                Go to Dashboard
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"/></svg>
              </Link>
            )}
          </div>

          {/* Floating UI Cards */}
          <div className="hero-cards">
            {/* Card 1: Coupon */}
            <div className="float-card">
              <div className="card-chip"><span className="dot dot-orange"></span>Reward</div>
              <div className="card-title">Amazon Coupon</div>
              <div className="card-value">₹500</div>
              <div className="card-tag">Expires in 3 days</div>
            </div>
            {/* Card 2: Swap */}
            <div className="float-card">
              <div className="card-chip"><span className="dot dot-blue"></span>Exchange</div>
              <div className="card-title">Direct Swap</div>
              <div className="swap-row">
                <div className="swap-item">Netflix</div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6h9M8 3l3 3-3 3"/><path d="M14 10H5m3 3l-3-3 3-3"/></svg>
                <div className="swap-item">Spotify</div>
              </div>
            </div>
            {/* Card 3: Points conversion */}
            <div className="float-card">
              <div className="card-chip"><span className="dot dot-indigo"></span>Convert</div>
              <div className="card-title">Starbucks Coupon</div>
              <div className="points-row">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#00b9f1" strokeWidth="1.5"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"/></svg>
                <div className="points-badge">450 reX pts</div>
              </div>
            </div>
            {/* Card 4: Marketplace */}
            <div className="float-card">
              <div className="card-chip"><span className="dot dot-green"></span>Marketplace</div>
              <div className="card-title">Uber ₹300 Off</div>
              <div className="market-price">
                <div className="market-pts">320</div>
                <div className="market-unit">reX pts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          <span className="ticker-item">Amazon Vouchers<span className="sep"></span></span>
          <span className="ticker-item">Swiggy Cashback<span className="sep"></span></span>
          <span className="ticker-item">Netflix Upgrade<span className="sep"></span></span>
          <span className="ticker-item">Uber Discounts<span className="sep"></span></span>
          <span className="ticker-item">Starbucks Coupons<span className="sep"></span></span>
          <span className="ticker-item">Zomato Credits<span className="sep"></span></span>
          <span className="ticker-item">BookMyShow Offers<span className="sep"></span></span>
          <span className="ticker-item">Flipkart Rewards<span className="sep"></span></span>
          <span className="ticker-item">Myntra Vouchers<span className="sep"></span></span>
          <span className="ticker-item">Airtel Benefits<span className="sep"></span></span>
          {/* Ticker duplicates for seamless loop */}
          <span className="ticker-item">Amazon Vouchers<span className="sep"></span></span>
          <span className="ticker-item">Swiggy Cashback<span className="sep"></span></span>
          <span className="ticker-item">Netflix Upgrade<span className="sep"></span></span>
          <span className="ticker-item">Uber Discounts<span className="sep"></span></span>
          <span className="ticker-item">Starbucks Coupons<span className="sep"></span></span>
          <span className="ticker-item">Zomato Credits<span className="sep"></span></span>
          <span className="ticker-item">BookMyShow Offers<span className="sep"></span></span>
          <span className="ticker-item">Flipkart Rewards<span className="sep"></span></span>
          <span className="ticker-item">Myntra Vouchers<span className="sep"></span></span>
          <span className="ticker-item">Airtel Benefits<span className="sep"></span></span>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="landing-section problem-section">
        <div className="landing-container">
          <div className="section-label">The Problem</div>
          <h2 class="section-headline">Most rewards are wasted.</h2>
          <p className="section-sub">Billions of rupees in reward value expire every year — not because people don't want them, but because the right reward never found the right person.</p>

          <div className="problem-layout">
            <div className="problem-illus">
              <svg width="420" height="340" viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="210" cy="170" r="150" fill="#eaf3fb" opacity="0.6"/>
                <rect x="148" y="195" width="124" height="100" rx="8" fill="white" stroke="#d6e8f5" strokeWidth="2"/>
                <rect x="138" y="178" width="144" height="22" rx="5" fill="white" stroke="#d6e8f5" strokeWidth="2"/>
                <rect x="193" y="168" width="34" height="14" rx="4" fill="white" stroke="#d6e8f5" strokeWidth="2"/>
                <line x1="185" y1="210" x2="185" y2="282" stroke="#d6e8f5" strokeWidth="2" strokeLinecap="round"/>
                <line x1="210" y1="210" x2="210" y2="282" stroke="#d6e8f5" strokeWidth="2" strokeLinecap="round"/>
                <line x1="235" y1="210" x2="235" y2="282" stroke="#d6e8f5" strokeWidth="2" strokeLinecap="round"/>

                <g transform="rotate(-18,210,120)" opacity="0.9">
                  <rect x="150" y="80" width="80" height="52" rx="6" fill="white" stroke="#00b9f1" strokeWidth="1.5"/>
                  <rect x="150" y="80" width="22" height="52" rx="4" fill="#e0f6fe"/>
                  <line x1="182" y1="96" x2="218" y2="96" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="182" y1="106" x2="212" y2="106" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="182" y1="116" x2="208" y2="116" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <text x="156" y="111" fontFamily="Georgia,serif" fontSize="11" fontStyle="italic" fill="#00b9f1">₹</text>
                </g>

                <g transform="rotate(12,230,100)">
                  <rect x="230" y="75" width="72" height="46" rx="6" fill="white" stroke="#7aa3be" strokeWidth="1.5" opacity="0.7"/>
                  <rect x="230" y="75" width="18" height="46" rx="4" fill="#eaf3fb"/>
                  <line x1="258" y1="90" x2="292" y2="90" stroke="#d6e8f5" strokeWidth="1.2"/>
                  <line x1="258" y1="99" x2="286" y2="99" stroke="#d6e8f5" strokeWidth="1.2"/>
                </g>

                <g transform="rotate(-6,176,140)">
                  <rect x="130" y="140" width="88" height="36" rx="18" fill="white" stroke="#00b9f1" strokeWidth="1.5"/>
                  <line x1="114" y1="158" x2="134" y2="158" stroke="#00b9f1" strokeWidth="1.5"/>
                  <circle cx="110" cy="158" r="5" fill="none" stroke="#00b9f1" strokeWidth="1.5"/>
                  <text x="148" y="163" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#2e5a7a">EXPIRED</text>
                </g>

                <g transform="translate(270,130)">
                  <circle cx="20" cy="20" r="18" fill="white" stroke="#7aa3be" strokeWidth="1.5"/>
                  <line x1="20" y1="8" x2="20" y2="20" stroke="#00274d" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="20" y1="20" x2="28" y2="26" stroke="#00b9f1" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="20" cy="20" r="2" fill="#00274d"/>
                  <line x1="30" y1="6" x2="42" y2="18" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="42" y1="6" x2="30" y2="18" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                </g>

                <text x="98" y="155" fontFamily="Georgia,serif" fontSize="28" fill="#d6e8f5" fontStyle="italic">₹</text>
                <text x="315" y="175" fontFamily="Georgia,serif" fontSize="20" fill="#d6e8f5" fontStyle="italic">₹</text>
                <text x="108" y="240" fontFamily="Georgia,serif" fontSize="16" fill="#eaf3fb" fontStyle="italic">₹</text>
              </svg>
            </div>

            <div className="problem-grid">
              <div className="problem-card">
                <div className="problem-stat">73<span>%</span></div>
                <div className="problem-card-title">Coupons expire unused</div>
                <div className="problem-card-desc">Most coupons are irrelevant to their recipients and quietly disappear.</div>
              </div>
              <div className="problem-card">
                <div className="problem-stat">₹4<span>k</span></div>
                <div className="problem-card-title">Cashback never claimed</div>
                <div className="problem-card-desc">The average Indian has over ₹4,000 in unclaimed rewards sitting idle.</div>
              </div>
              <div className="problem-card">
                <div className="problem-stat">60<span>%</span></div>
                <div className="problem-card-title">Memberships underused</div>
                <div className="problem-card-desc">Subscription perks and benefits go untouched every billing cycle.</div>
              </div>
              <div className="problem-card">
                <div className="problem-stat">0<span>₹</span></div>
                <div className="problem-card-title">Value recovered</div>
                <div className="problem-card-desc">Once expired, that value is gone forever. Until now.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section how-it-works" id="how">
        <div className="landing-container">
          <div className="section-label">How reXa works</div>
          <h2 className="section-headline">Three steps to unlock reward value.</h2>
          <div className="steps">
            {/* Step 1 */}
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-illus">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="80" rx="16" fill="#e0f6fe"/>
                  <rect x="16" y="22" width="48" height="32" rx="5" fill="white" stroke="#00b9f1" strokeWidth="1.5"/>
                  <rect x="16" y="22" width="14" height="32" rx="4" fill="#e0f6fe"/>
                  <line x1="36" y1="30" x2="36" y2="46" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="40" y1="28" x2="40" y2="46" stroke="#d6e8f5" strokeWidth="2"/>
                  <line x1="44" y1="30" x2="44" y2="46" stroke="#d6e8f5" strokeWidth="1"/>
                  <line x1="48" y1="29" x2="48" y2="46" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="52" y1="31" x2="52" y2="46" stroke="#d6e8f5" strokeWidth="1"/>
                  <circle cx="57" cy="54" r="10" fill="#00b9f1"/>
                  <line x1="57" y1="49" x2="57" y2="59" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="52" y1="54" x2="62" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="step-title">Add Your Reward</div>
              <div className="step-desc">Enter your reward details — a coupon code, cashback offer, subscription perk, or loyalty points. Takes under a minute.</div>
            </div>
            {/* Step 2 */}
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-illus">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="80" rx="16" fill="#e0f6fe"/>
                  <rect x="10" y="28" width="26" height="18" rx="4" fill="white" stroke="#7aa3be" strokeWidth="1.3"/>
                  <rect x="10" y="28" width="8" height="18" rx="3" fill="#eaf3fb"/>
                  <line x1="22" y1="34" x2="32" y2="34" stroke="#d6e8f5" strokeWidth="1"/>
                  <line x1="22" y1="39" x2="30" y2="39" stroke="#d6e8f5" strokeWidth="1"/>
                  <path d="M38 37 L46 37 M43 33 L47 37 L43 41" stroke="#00b9f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="58" cy="37" r="13" fill="white" stroke="#00b9f1" strokeWidth="1.8"/>
                  <circle cx="58" cy="37" r="9" fill="#e0f6fe"/>
                  <text x="53" y="41" fontFamily="Georgia,serif" fontSize="10" fontStyle="italic" fill="#00274d">rX</text>
                  <line x1="55" y1="16" x2="55" y2="22" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="52" y1="19" x2="58" y2="19" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="67" y1="20" x2="71" y2="24" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                  <line x1="71" y1="20" x2="67" y2="24" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <div className="step-title">Earn reX Points</div>
              <div className="step-desc">Convert your reward into reX Points — the universal reward currency on the platform. Instantly tradeable.</div>
            </div>
            {/* Step 3 */}
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-illus">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="80" rx="16" fill="#e0f6fe"/>
                  <path d="M22 34 L24 58 L56 58 L58 34 Z" fill="white" stroke="#00b9f1" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M30 34 C30 26 50 26 50 34" fill="none" stroke="#00b9f1" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M30 46 L37 53 L52 38" stroke="#00b9f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <div className="step-title">Redeem Better Rewards</div>
              <div className="step-desc">Browse the marketplace and get rewards you actually want. Spend reX Points on offers that matter to you.</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="landing-section marketplace-section" id="marketplace">
        <div className="landing-container">
          <div className="section-label">Marketplace</div>
          <h2 className="section-headline" style={{ color: 'var(--white)' }}>Rewards people actually want.</h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.45)' }}>Browse hundreds of live offers. Every reward was posted by someone who didn't need it — but you might.</p>

          <div className="market-layout">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="400" height="380" viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="190" r="160" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <circle cx="200" cy="190" r="110" fill="rgba(255,255,255,0.03)" stroke="rgba(0,185,241,0.15)" strokeWidth="1"/>
                <circle cx="200" cy="190" r="42" fill="rgba(0,185,241,0.15)" stroke="#00b9f1" strokeWidth="1.5"/>
                <circle cx="200" cy="190" r="28" fill="rgba(0,185,241,0.2)" stroke="#00b9f1" strokeWidth="1"/>
                <text x="188" y="196" fontFamily="Georgia,serif" fontSize="16" fontStyle="italic" fill="#00b9f1">reX</text>

                <line x1="200" y1="148" x2="200" y2="64" stroke="rgba(0,185,241,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="200" y1="232" x2="200" y2="316" stroke="rgba(0,185,241,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="158" y1="162" x2="92" y2="114" stroke="rgba(0,185,241,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="242" y1="162" x2="308" y2="114" stroke="rgba(0,185,241,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="158" y1="218" x2="92" y2="266" stroke="rgba(0,185,241,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="242" y1="218" x2="308" y2="266" stroke="rgba(0,185,241,0.3)" strokeWidth="1" strokeDasharray="4 4"/>

                <g transform="translate(162,28)">
                  <rect width="76" height="42" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <rect width="76" height="42" rx="8" fill="rgba(255,153,0,0.08)"/>
                  <text x="10" y="17" fontFamily="DM Sans,sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="500">AMAZON</text>
                  <text x="10" y="31" fontFamily="Georgia,serif" fontSize="12" fill="white">₹500 off</text>
                </g>
                <g transform="translate(285,86)">
                  <rect width="72" height="42" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <rect width="72" height="42" rx="8" fill="rgba(229,9,20,0.08)"/>
                  <text x="9" y="17" fontFamily="DM Sans,sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="500">NETFLIX</text>
                  <text x="9" y="31" fontFamily="Georgia,serif" fontSize="12" fill="white">1 Month</text>
                </g>
                <g transform="translate(285,238)">
                  <rect width="72" height="42" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <rect width="72" height="42" rx="8" fill="rgba(252,88,0,0.08)"/>
                  <text x="9" y="17" fontFamily="DM Sans,sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="500">SWIGGY</text>
                  <text x="9" y="31" fontFamily="Georgia,serif" fontSize="12" fill="white">₹300 off</text>
                </g>
                <g transform="translate(162,312)">
                  <rect width="76" height="42" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <rect width="76" height="42" rx="8" fill="rgba(30,215,96,0.08)"/>
                  <text x="10" y="17" fontFamily="DM Sans,sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="500">SPOTIFY</text>
                  <text x="10" y="31" fontFamily="Georgia,serif" fontSize="12" fill="white">3 Months</text>
                </g>
                <g transform="translate(42,238)">
                  <rect width="72" height="42" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <text x="9" y="17" fontFamily="DM Sans,sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="500">UBER</text>
                  <text x="9" y="31" fontFamily="Georgia,serif" fontSize="12" fill="white">₹200 ride</text>
                </g>
                <g transform="translate(42,86)">
                  <rect width="78" height="42" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <rect width="78" height="42" rx="8" fill="rgba(0,112,74,0.1)"/>
                  <text x="9" y="17" fontFamily="DM Sans,sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="500">STARBUCKS</text>
                  <text x="9" y="31" fontFamily="Georgia,serif" fontSize="12" fill="white">₹150 off</text>
                </g>
              </svg>
            </div>

            {/* Preview cards list */}
            <div className="market-grid-small">
              <div className="market-card">
                <div className="market-card-icon" style={{ background: 'rgba(255,153,0,0.15)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,153,0,0.9)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                </div>
                <div className="market-card-brand">Amazon</div>
                <div className="market-card-name">₹500 Off Voucher</div>
                <div className="market-card-pts">480</div>
                <div className="market-card-unit">reX points</div>
              </div>
              <div className="market-card">
                <div className="market-card-icon" style={{ background: 'rgba(229,9,20,0.15)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(229,9,20,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="3"/><polygon points="10 8 16 12 10 16 10 8" fill="rgba(229,9,20,0.5)" stroke="none"/></svg>
                </div>
                <div className="market-card-brand">Netflix</div>
                <div className="market-card-name">1 Month Premium</div>
                <div className="market-card-pts">620</div>
                <div className="market-card-unit">reX points</div>
              </div>
              <div className="market-card">
                <div className="market-card-icon" style={{ background: 'rgba(252,88,0,0.12)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(252,88,0,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l1 9H4L5 8z"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="20" r="1.5"/><circle cx="16" cy="20" r="1.5"/></svg>
                </div>
                <div className="market-card-brand">Swiggy</div>
                <div className="market-card-name">₹300 Off Order</div>
                <div className="market-card-pts">260</div>
                <div className="market-card-unit">reX points</div>
              </div>
              <div className="market-card">
                <div className="market-card-icon" style={{ background: 'rgba(30,215,96,0.1)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(30,215,96,0.85)" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <div className="market-card-brand">Spotify</div>
                <div className="market-card-name">3 Month Premium</div>
                <div className="market-card-pts">540</div>
                <div className="market-card-unit">reX points</div>
              </div>
              <div className="market-card" style={{ gridColumn: '1/-1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="market-card-icon" style={{ background: 'rgba(255,255,255,0.08)', margin: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3v-4l3-6h12l3 6v4h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
                    </div>
                    <div>
                      <div className="market-card-brand">Uber</div>
                      <div className="market-card-name" style={{ margin: 0 }}>₹200 Ride Credit</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="market-card-pts">190</div>
                    <div className="market-card-unit">reX points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section features-section">
        <div className="landing-container">
          <div className="section-label">Why reXa</div>
          <h2 className="section-headline">Built for real reward behaviour.</h2>
          <p className="section-sub">Not another loyalty program. A genuine marketplace that creates value from waste.</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-illus">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="12" fill="#eaf3fb"/>
                  <rect x="8" y="16" width="22" height="14" rx="3" fill="white" stroke="#00b9f1" strokeWidth="1.3"/>
                  <rect x="26" y="26" width="22" height="14" rx="3" fill="white" stroke="#2e5a7a" strokeWidth="1.3"/>
                  <path d="M23 20 L33 20 M30 17 L33 20 L30 23" stroke="#00b9f1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M33 32 L23 32 M26 29 L23 32 L26 35" stroke="#2e5a7a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <div className="feature-title">Reward Exchange</div>
              <div className="feature-desc">Trade rewards directly with other users. No cash, no friction — just a clean swap.</div>
            </div>
            <div className="feature-card">
              <div className="feature-illus">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="12" fill="#eaf3fb"/>
                  <circle cx="28" cy="28" r="16" fill="white" stroke="#00b9f1" strokeWidth="1.5"/>
                  <circle cx="28" cy="28" r="10" fill="#e0f6fe"/>
                  <text x="22" y="32" fontFamily="Georgia,serif" fontSize="10" fontStyle="italic" fill="#00274d">rX</text>
                  <circle cx="28" cy="9" r="2.5" fill="#00b9f1" opacity="0.4"/>
                  <circle cx="47" cy="28" r="2.5" fill="#00b9f1" opacity="0.4"/>
                  <circle cx="28" cy="47" r="2.5" fill="#00b9f1" opacity="0.4"/>
                  <circle cx="9" cy="28" r="2.5" fill="#00b9f1" opacity="0.4"/>
                </svg>
              </div>
              <div className="feature-title">Point Economy</div>
              <div className="feature-desc">reX Points act as a universal reward currency, making all rewards comparable and liquid.</div>
            </div>
            <div className="feature-card">
              <div className="feature-illus">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="12" fill="#eaf3fb"/>
                  <circle cx="28" cy="20" r="5" fill="white" stroke="#00b9f1" strokeWidth="1.3"/>
                  <circle cx="16" cy="34" r="4" fill="white" stroke="#7aa3be" strokeWidth="1.3"/>
                  <circle cx="40" cy="34" r="4" fill="white" stroke="#7aa3be" strokeWidth="1.3"/>
                  <circle cx="28" cy="42" r="4" fill="white" stroke="#00b9f1" strokeWidth="1.3"/>
                  <line x1="28" y1="25" x2="20" y2="31" stroke="#d6e8f5" strokeWidth="1.3"/>
                  <line x1="28" y1="25" x2="36" y2="31" stroke="#d6e8f5" strokeWidth="1.3"/>
                  <line x1="20" y1="37" x2="24" y2="39" stroke="#d6e8f5" strokeWidth="1.3"/>
                  <line x1="36" y1="37" x2="32" y2="39" stroke="#d6e8f5" strokeWidth="1.3"/>
                  <line x1="28" y1="12" x2="28" y2="16" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="24" y1="14" x2="32" y2="14" stroke="#00b9f1" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="feature-title">Smart Discovery</div>
              <div className="feature-desc">Personalized reward recommendations based on what you actually use and buy.</div>
            </div>
            <div className="feature-card">
              <div className="feature-illus">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="12" fill="#eaf3fb"/>
                  <path d="M28 10 L44 17 L44 28 C44 36 36 43 28 46 C20 43 12 36 12 28 L12 17 Z" fill="white" stroke="#00b9f1" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M20 28 L25 33 L36 22" stroke="#00b9f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <div className="feature-title">Secure Transactions</div>
              <div className="feature-desc">Every exchange is verified and escrow-protected. Your rewards are safe.</div>
            </div>
            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-illus">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="12" fill="#eaf3fb"/>
                  <circle cx="28" cy="20" r="6" fill="white" stroke="#00b9f1" strokeWidth="1.4"/>
                  <circle cx="14" cy="38" r="5" fill="white" stroke="#7aa3be" stroke-width="1.3"/>
                  <circle cx="42" cy="38" r="5" fill="white" stroke="#7aa3be" stroke-width="1.3"/>
                  <line x1="22" y1="24" x2="16" y2="33" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="34" y1="24" x2="40" y2="33" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="19" y1="38" x2="37" y2="38" stroke="#d6e8f5" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="feature-title">Community Swap Pools</div>
              <div className="feature-desc">Connect with secondary swappers and pools to easily liquidate low-demand gift tags.</div>
            </div>
            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-illus">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="12" fill="#eaf3fb"/>
                  <rect x="16" y="16" width="24" height="24" rx="4" fill="white" stroke="#00b9f1" strokeWidth="1.5"/>
                  <line x1="20" y1="24" x2="36" y2="24" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="20" y1="28" x2="32" y2="28" stroke="#d6e8f5" strokeWidth="1.5"/>
                  <line x1="20" y1="32" x2="28" y2="32" stroke="#d6e8f5" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="feature-title">Audit Reports</div>
              <div className="feature-desc">View real-time conversion rates, global transaction ledgers, and audit-checked logs.</div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION / ROADMAP */}
      <section className="landing-section vision-section" id="vision">
        <div className="landing-container">
          <div className="section-label">Vision</div>
          <h2 className="vision-headline">Reclaiming expired value is just <em>the start.</em></h2>
          <div className="roadmap-grid">
            <div className="roadmap-item">
              <div className="roadmap-tag">Phase 1</div>
              <h4 className="roadmap-title">P2P Swapping Engine</h4>
              <p className="roadmap-desc">Direct matching algorithms connecting voucher holders with real-time valuation calculators.</p>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-tag">Phase 2</div>
              <h4 className="roadmap-title">Auto OCR Scanner</h4>
              <p className="roadmap-desc">AI-powered reading models that convert any paper sheet or promo email into digital listings.</p>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-tag">Phase 3</div>
              <h4 className="roadmap-title">Decentralized Token Pools</h4>
              <p className="roadmap-desc">Cross-app integrations converting local points directly into partner ecosystem benefits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / JOIN WAITLIST */}
      <section className="cta-section" id="waitlist">
        <div className="cta-bg" />
        <div className="cta-inner">
          <div className="cta-eyebrow">Get Early Access</div>
          <h2 className="cta-headline">Join the reXa waitlist today.</h2>
          <p className="cta-sub">Sign up with your email to claim 100 free reX points upon beta launch.</p>
          
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  fontFamily: 'inherit',
                  outline: 'none',
                  fontSize: '15px'
                }}
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-light"
                style={{ borderRadius: '9999px', fontWeight: 700, strokeWidth: '0px', whiteSpace: 'nowrap' }}
              >
                {submitting ? 'Signing up...' : 'Join Waitlist'}
              </button>
            </form>
          </div>
          <div className="cta-note">Waitlist entries are secured in the reXa cluster database.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <a href="#" className="footer-logo">reXa</a>
        <div className="footer-copy">© 2026 reXa. All rights reserved.</div>
      </footer>
    </div>
  );
};
