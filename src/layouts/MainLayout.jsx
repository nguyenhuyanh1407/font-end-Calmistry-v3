import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import logoCalmWhite from '../assets/logoCalmWhite.png';
import authService from '../services/authService';
import api from '../services/api';
import userService from '../services/userService';
import gamificationService from '../services/gamificationService';
import analytics from '../utils/analytics';

const MainLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sectionAboveColor = '#f8f9fa';

  const brandGreen = '#324d3e';
  const lightGreen = '#74c655';
  const softBg = '#f4f7f5';
  const token = api.getToken();
  const authKey = token ? token.slice(-16) : 'anon';
  const meStorageKey = `me:${authKey}`;

  const cachedMe = useMemo(() => {
    if (!token) return undefined;
    try {
      const raw = localStorage.getItem(meStorageKey);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }, [token, meStorageKey]);

  // Cross-tab realtime gamification updates (so Dashboard/LuckySlot stay in sync)
  useEffect(() => {
    if (!token) return;

    const applyToday = (payload) => {
      const nextBalance = payload?.spinBalance ?? 0;
      const nextEvents = payload?.completedEvents ?? [];

      // Keep LuckySlot's localStorage hydration in sync across tabs/routes
      try {
        localStorage.setItem(`spinBalance:${authKey}`, String(nextBalance));
        localStorage.setItem(`completedEvents:${authKey}`, JSON.stringify(nextEvents));
      } catch { }

      queryClient.setQueryData(['spinBalance', authKey], { spinBalance: nextBalance });
      queryClient.setQueryData(['todayMissions', authKey], payload);
      queryClient.setQueryData(['me', authKey], (prev) => (prev ? { ...prev, spinBalance: nextBalance } : prev));
    };

    let channel;
    const onBroadcast = (e) => {
      const msg = e?.data;
      if (msg?.type === 'today' && msg?.payload) applyToday(msg.payload);
    };

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('calmistry-gamification');
        channel.addEventListener('message', onBroadcast);
      }
    } catch { }

    const onStorage = (e) => {
      if (e.key !== 'gamification:update' || !e.newValue) return;
      try {
        const msg = JSON.parse(e.newValue);
        if (msg?.type === 'today' && msg?.payload) applyToday(msg.payload);
      } catch { }
    };
    window.addEventListener('storage', onStorage);

    const onCustom = (e) => {
      const msg = e?.detail;
      if (msg?.type === 'today' && msg?.payload) applyToday(msg.payload);
    };
    window.addEventListener('calmistry:gamification', onCustom);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('calmistry:gamification', onCustom);
      try {
        channel?.removeEventListener('message', onBroadcast);
        channel?.close();
      } catch { }
    };
  }, [token, authKey, queryClient]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const {
    data: currentUser,
    isLoading,
  } = useQuery({
    queryKey: ['me', authKey],
    queryFn: userService.getMyInfo,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
    initialData: cachedMe,
    onSuccess: (data) => {
      try {
        localStorage.setItem(meStorageKey, JSON.stringify(data));
      } catch { }
    },
  });

  const effectivePlan = useMemo(() => {
    if (!currentUser) return 'SILVER';
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : Array.from(currentUser.roles || []);
    const hasGoldRole = roles.some((r) => ['ADMIN', 'EXPERT', 'ROLE_ADMIN', 'ROLE_EXPERT'].includes(String(r).toUpperCase()));
    if (hasGoldRole) return 'GOLD';
    const plan = String(currentUser.plan || '').toUpperCase();
    return plan === 'GOLD' ? 'GOLD' : 'SILVER';
  }, [currentUser]);

  const planLabel = effectivePlan === 'GOLD' ? 'Gói Vàng' : 'Gói Bạc';
  const planTrophyColor = effectivePlan === 'GOLD' ? '#d4af37' : '#bfc5cc';

  // Warm up gamification queries so Lucky Slot fills instantly on navigation
  useEffect(() => {
    if (!token) return;
    queryClient.prefetchQuery({
      queryKey: ['spinBalance', authKey],
      queryFn: gamificationService.getSpinBalance,
    });
    queryClient.prefetchQuery({
      queryKey: ['todayMissions', authKey],
      queryFn: gamificationService.getToday,
    });
  }, [token, authKey, queryClient]);

  const handleGetStarted = () => {
    analytics.logEvent('Authentication', 'click', 'register_click');
    setIsMobileMenuOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById("pricing-section");
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "pricing-section" } });
    }
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      localStorage.removeItem(meStorageKey);
      localStorage.removeItem(`spinBalance:${authKey}`);
      localStorage.removeItem(`completedEvents:${authKey}`);
    } catch { }
    await authService.logout();
    queryClient.removeQueries({ queryKey: ['me'] });
    navigate('/', { replace: true });
  };

  const brandLogoSrc = logoCalmWhite;

  const dropdownItemStyle = {
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Rubik', sans-serif" }}>
      {/* Navbar */}
      <nav
        className={`navbar navbar-expand-lg fixed-top px-4 py-2 ${isScrolled ? 'shadow-sm' : ''}`}
        style={{
          backgroundColor: isScrolled ? '#ffffff' : brandGreen,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100
        }}
      >
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold fs-3 d-flex align-items-center"
            href="/"
            style={{
              color: isScrolled ? brandGreen : '#ffffff',
              transition: 'color 0.4s'
            }}
          >
            <img
              src={brandLogoSrc}
              alt="Calmistry Logo"
              style={{
                height: '48px',
                marginRight: '10px',
              }}
            />
            Calmistry
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Desktop Navigation */}
          <div className="desktop-nav-items">
            {isLoading ? null : !currentUser ? (
              <>
                <button
                  className="btn rounded-pill px-4 me-2 fw-medium login-target"
                  style={{
                    border: `1px solid ${isScrolled ? brandGreen : '#ffffff'}`,
                    color: isScrolled ? brandGreen : '#ffffff',
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => {
                    analytics.logEvent('Authentication', 'click', 'login_click');
                    navigate('/login');
                  }}
                >
                  Log in
                </button>

                <button
                  onClick={handleGetStarted}
                  className="btn rounded-pill px-4 fw-bold get-started-target"
                  style={{
                    backgroundColor: isScrolled ? brandGreen : '#e8f5e9',
                    color: isScrolled ? '#ffffff' : brandGreen,
                    border: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  Get started
                </button>
              </>
            ) : (
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn d-flex align-items-center border-0 user-profile-target shadow-sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    backgroundColor: isScrolled ? 'rgba(50, 77, 62, 0.08)' : 'rgba(255, 255, 255, 0.15)',
                    color: isScrolled ? brandGreen : '#ffffff',
                    fontWeight: 600,
                    borderRadius: '50px',
                    padding: '8px 18px',
                    backdropFilter: isScrolled ? 'none' : 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: `1px solid ${isScrolled ? 'rgba(50, 77, 62, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm"
                    style={{
                      width: '32px', height: '32px',
                      background: isScrolled ? `linear-gradient(135deg, ${brandGreen}, ${lightGreen})` : '#ffffff',
                      color: isScrolled ? '#ffffff' : brandGreen,
                      fontSize: '1rem'
                    }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span className="me-2 d-none d-sm-inline">
                    {currentUser.fullName || currentUser.name || 'Account'}
                  </span>
                  <motion.i 
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="bi bi-chevron-down small opacity-75"
                  ></motion.i>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                      transition={{ duration: 0.3, cubicBezier: [0.4, 0, 0.2, 1] }}
                      className="user-menu-list-target shadow-lg border-0 p-2"
                      style={{
                        position: 'absolute',
                        top: '120%',
                        right: 0,
                        minWidth: '280px',
                        borderRadius: '24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 1200,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        transformOrigin: 'top right'
                      }}
                    >
                      <div className="px-3 py-4 mb-2 rounded-4 overflow-hidden position-relative" style={{ background: `linear-gradient(135deg, ${brandGreen} 0%, ${lightGreen} 100%)` }}>
                        <div className="position-relative z-1">
                          <div className="fw-bold text-white text-truncate" style={{ fontSize: '1.1rem', letterSpacing: '-0.2px' }}>
                            Xin chào, {currentUser.fullName || currentUser.name.split(' ').pop()}!
                          </div>
                          <div className="text-white small opacity-75 text-truncate">
                            {currentUser.email}
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <i className="bi bi-trophy-fill" style={{ color: planTrophyColor }}></i>
                            <div className="text-white small fw-semibold">{planLabel}</div>
                          </div>
                        </div>
                        {/* Decorative circles */}
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', bottom: '-40px', left: '-10px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
                      </div>

                      <div className="d-flex flex-column gap-1">
                        <MenuLink className="user-dashboard-target" icon="bi-grid-1x2" color="#4361ee" label="Dashboard" onClick={() => { setIsDropdownOpen(false); navigate('/userDashboard'); }} />
                        <MenuLink className="user-workshops-target" icon="bi-calendar-event" color="#2ec4b6" label="Tham gia Workshop" onClick={() => { setIsDropdownOpen(false); navigate('/workshops'); }} />
                        <MenuLink className="user-exercises-target" icon="bi-collection-play" color="#ff9f1c" label="Kho bài tập thư giãn" onClick={() => { setIsDropdownOpen(false); navigate('/relaxation'); }} />
                        <MenuLink className="user-aichat-target" icon="bi-robot" color="#219ebc" label="Trò chuyện AI" onClick={() => { setIsDropdownOpen(false); navigate('/ai-chat'); }} />

                        {currentUser.roles && currentUser.roles.includes('ADMIN') && (
                          <>
                            <div className="px-3 py-2 small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Quản lý hệ thống</div>
                            <MenuLink icon="bi-calendar-plus" color="#e63946" label="Quản lý Workshop" onClick={() => { setIsDropdownOpen(false); navigate('/admin/workshops'); }} />
                            <MenuLink icon="bi-shield-lock" color="#1d3557" label="Manager Account" onClick={() => { setIsDropdownOpen(false); navigate('/admin/accounts'); }} />
                            <MenuLink icon="bi-people-fill" color="#457b9d" label="Manager Number Users" onClick={() => { setIsDropdownOpen(false); navigate('/admin/number-users'); }} />
                          </>
                        )}

                        <div className="my-2 border-top opacity-10 mx-2"></div>

                        <button
                          className="btn d-flex align-items-center gap-3 px-3 py-2 text-danger fw-semibold w-100 rounded-3 logout-btn-hover"
                          style={{ transition: 'all 0.2s ease', backgroundColor: 'transparent', border: 'none' }}
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right fs-5"></i>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !currentUser ? (
            <div className="mobile-auth-buttons">
              <button
                className="mobile-btn mobile-btn-login"
                onClick={() => {
                  analytics.logEvent('Authentication', 'click', 'login_click');
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Log in
              </button>
              <button
                className="mobile-btn mobile-btn-getstarted"
                onClick={handleGetStarted}
              >
                <i className="bi bi-rocket-takeoff me-2"></i>
                Get started
              </button>
            </div>
          ) : (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {(currentUser.fullName || currentUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="mobile-user-name">
                  {currentUser.fullName || currentUser.name}
                </div>
                <div className="mobile-user-email">
                  {currentUser.email}
                </div>
              </div>

              <button
                className="mobile-menu-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/userDashboard');
                }}
              >
                <i className="bi bi-grid-1x2"></i>
                <span>Dashboard</span>
              </button>

              <button
                className="mobile-menu-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/workshops');
                }}
              >
                <i className="bi bi-calendar-event"></i>
                <span>Workshops</span>
              </button>

              <button
                className="mobile-menu-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/relaxation');
                }}
              >
                <i className="bi bi-collection-play"></i>
                <span>Thư giãn</span>
              </button>

              {currentUser.roles && currentUser.roles.includes('ADMIN') && (
                <>
                  <button
                    className="mobile-menu-item"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/admin/accounts');
                    }}
                  >
                    <i className="bi bi-shield-lock"></i>
                    <span>Manager Account</span>
                  </button>

                  <button
                    className="mobile-menu-item"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/admin/number-users');
                    }}
                  >
                    <i className="bi bi-people-fill"></i>
                    <span>Manager number user</span>
                  </button>
                </>
              )}

              <div className="mobile-menu-divider"></div>

              <button
                className="mobile-menu-item"
                onClick={handleLogout}
                style={{ color: '#dc3545' }}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, paddingTop: isScrolled ? '70px' : '0' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        backgroundColor: brandGreen,
        marginTop: 'auto',
        fontFamily: "'Rubik', sans-serif"
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Rubik:wght@400;500;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />

        <div style={{ lineHeight: 0, width: '100%', backgroundColor: softBg, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100px', display: 'block', transform: 'scale(1.02)' }}>
            <path d="M0,80 C320,130 720,30 1120,90 C1280,115 1440,100 1440,100 L1440,120 L0,120 Z" fill={lightGreen} />
            <path d="M0,100 C360,150 720,50 1080,110 C1260,130 1440,120 1440,120 L1440,120 L0,120 Z" fill={brandGreen} />
          </svg>
        </div>

        <div className="container" style={{ paddingTop: '60px', paddingBottom: '40px', color: '#ffffff' }}>
          <div className="row g-5">
            <div className="col-lg-5 col-md-12">
              <div className="d-flex align-items-center mb-4">
                <img src={brandLogoSrc} alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
                <span style={{
                  fontFamily: "'Lora', serif",
                  fontSize: '32px',
                  fontWeight: '700',
                  letterSpacing: '-0.5px'
                }}>Calmistry</span>
              </div>
              <p className="opacity-75 mb-4" style={{ maxWidth: '380px', fontSize: '15px', lineHeight: '1.7' }}>
                Trải nghiệm trị liệu tâm lý trực tuyến 100%. Đồng hành cùng bạn trên hành trình chăm sóc sức khỏe tinh thần bền vững.
              </p>

              <div className="newsletter-box" style={{ maxWidth: '400px' }}>
                <h5 className="mb-3" style={{
                  fontFamily: "'Lora', serif",
                  fontSize: '18px',
                  fontWeight: '600'
                }}>Nhận bản tin từ chuyên gia</h5>
                <div style={{
                  display: 'flex',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease'
                }} className="input-group-custom">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      padding: '10px 15px',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '14px',
                      fontFamily: "'Rubik', sans-serif"
                    }}
                  />
                  <button style={{
                    backgroundColor: lightGreen,
                    color: brandGreen,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 25px',
                    fontWeight: '700',
                    fontFamily: "'Rubik', sans-serif",
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(142, 195, 57, 0.2)'
                  }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.filter = 'brightness(1.1)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.filter = 'brightness(1)';
                    }}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <h5 className="mb-4" style={{ fontFamily: "'Lora', serif", fontWeight: '700' }}>Dịch vụ</h5>
              <ul className="list-unstyled opacity-75" style={{ fontSize: '15px', lineHeight: '2.4' }}>
                <li><a href="#" className="footer-link">Trị liệu cá nhân</a></li>
                <li><a href="#" className="footer-link">Tư vấn cặp đôi</a></li>
                <li><a href="#" className="footer-link">Trị liệu nhóm</a></li>
                <li><a href="/workshops" className="footer-link">Workshop chữa lành</a></li>
                <li><a href="#" className="footer-link">Test tâm lý</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <h5 className="mb-4" style={{ fontFamily: "'Lora', serif", fontWeight: '700' }}>Thông tin</h5>
              <ul className="list-unstyled opacity-75" style={{ fontSize: '15px', lineHeight: '2.4' }}>
                <li><a href="#" className="footer-link">Về Calmistry</a></li>
                <li><a href="#" className="footer-link">Blog sức khỏe</a></li>
                <li><a href="#" className="footer-link">Chính sách</a></li>
                <li><a href="#" className="footer-link">Liên hệ</a></li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-4">
              <h5 className="mb-4" style={{ fontFamily: "'Lora', serif", fontWeight: '700' }}>Theo dõi</h5>
              <div className="d-flex gap-3 mb-4">
                <a href="#" className="social-icon-btn"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-icon-btn"><i className="bi bi-instagram"></i></a>
                <a href="#" className="social-icon-btn"><i className="bi bi-linkedin"></i></a>
              </div>
              <div style={{ fontSize: '14px' }} className="opacity-75">
                <p className="mb-2"><i className="bi bi-envelope-fill me-2"></i> hello@calmistry.vn</p>
                <p><i className="bi bi-geo-alt-fill me-2"></i> Đống Đa, Hà Nội</p>
              </div>
            </div>
          </div>

          <hr style={{ margin: '50px 0 25px', borderColor: 'rgba(255,255,255,0.1)' }} />

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 opacity-50" style={{ fontSize: '13px' }}>
            <span>© 2026 Calmistry. All rights reserved.</span>
            <div className="d-flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>

        <style>{`
          .footer-link {
            color: white;
            text-decoration: none;
            transition: opacity 0.2s ease;
          }
          .footer-link:hover {
            opacity: 1;
            color: #8ec339;
          }
          .social-icon-btn {
            width: 40px;
            height: 40px;
            background-color: rgba(255,255,255,0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 18px;
          }
          .social-icon-btn:hover {
            background-color: #8ec339;
            color: #3a5a40;
            transform: scale(1.1);
          }
          .input-group-custom:focus-within {
            border-color: #8ec339 !important;
            background-color: rgba(255,255,255,0.12) !important;
          }
        `}</style>
      </footer>

      <style>{`
        .navbar-brand, .user-greeting, .footer-brand-text {
          font-family: 'Lora', serif !important;
        }

        .login-target:hover {
          background-color: #ffffff !important;
          color: ${brandGreen} !important;
        }

        .btn-login-custom.scrolled:hover {
          background-color: ${brandGreen} !important;
          color: #ffffff !important;
        }

        .btn-get-started:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .dropdown-item:hover {
          background-color: #f1f3f2 !important;
          transform: translateX(4px);
          color: ${brandGreen} !important;
        }

        .dropdown-item.text-danger:hover {
          background-color: #fff5f5 !important;
          color: #dc3545 !important;
        }

        .login-target:hover {
          background-color: #ffffff !important;
          color: ${brandGreen} !important;
        }

        .get-started-target:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .user-menu-item-hover:hover {
          background-color: rgba(142, 195, 57, 0.08) !important;
          transform: translateX(6px);
          color: ${brandGreen} !important;
        }

        .logout-btn-hover:hover {
          background-color: #fff5f5 !important;
          transform: scale(1.02);
        }

        .dropdown-toggle::after {
          display: none;
        }

        /* ===== MOBILE RESPONSIVE STYLES ===== */

        /* Mobile Menu Toggle Button */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          z-index: 1032;
        }

        .mobile-menu-toggle span {
          display: block;
          width: 25px;
          height: 2px;
          background-color: ${isScrolled ? brandGreen : '#ffffff'};
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .mobile-menu-toggle.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .mobile-menu-toggle.active span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Desktop Nav Items */
        .desktop-nav-items {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 1029;
        }

        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Mobile Menu Panel */
        .mobile-menu-panel {
          position: fixed;
          top: 0;
          right: -100%;
          width: 280px;
          max-width: 85vw;
          height: 100vh;
          background-color: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 1031;
          overflow-y: auto;
          padding: 80px 0 20px 0;
        }

        .mobile-menu-panel.active {
          right: 0;
        }

        .mobile-menu-content {
          padding: 20px;
        }

        /* User Info in Mobile Menu */
        .mobile-user-info {
          padding: 20px;
          background: linear-gradient(135deg, ${brandGreen} 0%, ${lightGreen} 100%);
          border-radius: 12px;
          margin-bottom: 20px;
          color: white;
        }

        .mobile-user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${brandGreen};
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 12px;
        }

        .mobile-user-name {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .mobile-user-email {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        /* Mobile Menu Items */
        .mobile-menu-item {
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 1rem;
          color: #333;
        }

        .mobile-menu-item:hover {
          background-color: ${softBg};
        }

        .mobile-menu-item i {
          width: 20px;
          text-align: center;
          color: ${brandGreen};
        }

        .mobile-menu-divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 15px 0;
        }

        /* Buttons in Mobile Menu */
        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 20px;
        }

        .mobile-btn {
          width: 100%;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .mobile-btn-login {
          background-color: white;
          color: ${brandGreen};
          border: 2px solid ${brandGreen};
        }

        .mobile-btn-login:hover {
          background-color: ${brandGreen};
          color: white;
        }

        .mobile-btn-getstarted {
          background: linear-gradient(135deg, ${brandGreen} 0%, ${lightGreen} 100%);
          color: white;
        }

        .mobile-btn-getstarted:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(116, 198, 85, 0.3);
        }

        /* Responsive Breakpoints */
        @media (max-width: 991px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .desktop-nav-items {
            display: none;
          }

          .navbar-brand {
            font-size: 1.5rem !important;
          }

          .navbar-brand img {
            height: 35px !important;
          }
        }

        @media (min-width: 992px) {
          .mobile-menu-overlay,
          .mobile-menu-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const MenuLink = ({ icon, label, onClick, color, className = '' }) => (
  <button
    className={`btn d-flex align-items-center gap-3 px-3 py-2 w-100 rounded-3 user-menu-item-hover ${className}`}
    style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', backgroundColor: 'transparent', border: 'none', textAlign: 'left' }}
    onClick={onClick}
  >
    <div className="d-flex align-items-center justify-content-center rounded-3 shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: `${color}15`, color: color }}>
      <i className={`bi ${icon} fs-5`}></i>
    </div>
    <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>{label}</span>
  </button>
);

export default MainLayout;





