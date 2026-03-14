import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import logoCalmWhite from '../assets/logoCalmWhite.png';
import authService from '../services/authService';
import userService from '../services/userService';
import analytics from '../utils/analytics';

const MainLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const sectionAboveColor = '#f8f9fa';

  const brandGreen = '#324d3e';
  const lightGreen = '#74c655';
  const softBg = '#f4f7f5';

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    queryKey: ['me'],
    queryFn: userService.getMyInfo,
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

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
    await authService.logout();
    queryClient.removeQueries(['me']);
    navigate('/', { replace: true });
  };

  const greenFilter =
    'invert(26%) sepia(13%) saturate(1005%) hue-rotate(101deg) brightness(33%) contrast(87%)';

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
              src={logoCalmWhite}
              alt="Calmistry Logo"
              style={{
                height: '40px',
                marginRight: '10px',
                filter: isScrolled ? greenFilter : 'none',
                transition: 'filter 0.4s'
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
                  className="btn rounded-pill px-4 fw-bold"
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
              <div className="dropdown">
                <button
                  className="btn d-flex align-items-center dropdown-toggle border-0 user-profile-target"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    backgroundColor: isScrolled ? 'rgba(50, 77, 62, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    color: isScrolled ? brandGreen : '#ffffff',
                    fontWeight: 500,
                    borderRadius: '50px',
                    padding: '6px 16px'
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: '30px', height: '30px',
                      backgroundColor: isScrolled ? brandGreen : '#ffffff',
                      color: isScrolled ? '#ffffff' : brandGreen,
                      fontSize: '0.9rem'
                    }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span className="me-1">
                    {currentUser.fullName || currentUser.name || 'Account'}
                  </span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2 user-menu-list-target" style={{ minWidth: '260px', borderRadius: '15px' }}>
                  <li className="px-3 py-3 mb-2 border-bottom bg-light rounded-top-4">
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '1rem' }}>
                      Xin chào, {currentUser.fullName || currentUser.name}!
                    </div>
                    <div className="text-muted small text-truncate">
                      {currentUser.email}
                    </div>
                  </li>

                  <li>
                    <button className="dropdown-item user-dashboard-target" style={dropdownItemStyle} onClick={() => navigate('/userDashboard')}>
                      <i className="bi bi-grid-1x2 text-primary"></i>
                      Dashboard
                    </button>
                  </li>

                  <li>
                    <button className="dropdown-item user-workshops-target" style={dropdownItemStyle} onClick={() => navigate('/workshops')}>
                      <i className="bi bi-calendar-event text-success"></i>
                      Tham gia Workshop
                    </button>
                  </li>

                  <li>
                    <button className="dropdown-item user-exercises-target" style={dropdownItemStyle} onClick={() => navigate('/relaxation')}>
                      <i className="bi bi-collection-play text-warning"></i>
                      Kho bài tập thư giãn
                    </button>
                  </li>

                  <li>
                    <button className="dropdown-item user-aichat-target" style={dropdownItemStyle} onClick={() => navigate('/ai-chat')}>
                      <i className="bi bi-robot text-info"></i>
                      Trò chuyện AI
                    </button>
                  </li>

                  {currentUser.roles && currentUser.roles.includes('ADMIN') && (
                    <li>
                      <button className="dropdown-item" style={dropdownItemStyle} onClick={() => navigate('/admin/workshops')}>
                        <i className="bi bi-calendar-plus text-warning"></i>
                        Quản lý Workshop
                      </button>
                    </li>
                  )}

                  {currentUser.roles && currentUser.roles.includes('ADMIN') && (
                    <li>
                      <button className="dropdown-item" style={dropdownItemStyle} onClick={() => navigate('/admin/accounts')}>
                        <i className="bi bi-shield-lock text-danger"></i>
                        Manager Account
                      </button>
                    </li>
                  )}

                  {currentUser.roles && currentUser.roles.includes('ADMIN') && (
                    <li>
                      <button className="dropdown-item" style={dropdownItemStyle} onClick={() => navigate('/admin/number-users')}>
                        <i className="bi bi-people-fill text-primary"></i>
                        Manager number user
                      </button>
                    </li>
                  )}

                  <li><hr className="dropdown-divider mx-2" /></li>

                  <li>
                    <button
                      className="dropdown-item text-danger fw-medium"
                      style={dropdownItemStyle}
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
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
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />

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
                <img src={logoCalmWhite} alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
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

export default MainLayout;





