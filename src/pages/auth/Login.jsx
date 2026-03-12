import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeContent from '../../components/auth/WelcomeContent';
import FormInput from '../../components/auth/FormInput';
import SocialButtons from '../../components/auth/SocialButtons';
import '../../styles/Login.css';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const AuthPages = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const brandGreen = '#3a5a40';
  const lightGreen = '#8ec339';
  const softBg = '#f4f7f5';

  const [currentPage, setCurrentPage] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    setError('');
    if (!formData.email.trim()) return setError('Vui lòng nhập email'), false;
    if (!isValidEmail(formData.email)) return setError('Email không hợp lệ'), false;
    if (!formData.password.trim()) return setError('Vui lòng nhập mật khẩu'), false;

    if (currentPage === 'register') {
      if (!formData.name.trim()) return setError('Vui lòng nhập họ và tên'), false;
      if (formData.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự'), false;
      if (formData.password !== formData.confirmPassword)
        return setError('Mật khẩu xác nhận không khớp'), false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('🔍 [Submit] Start - currentPage:', currentPage);
    console.log('🔍 [Submit] FormData:', formData);

    if (!validateForm()) {
      console.log('❌ [Submit] Validation failed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (currentPage === 'login') {
        console.log('🔑 [Login] Starting...');
        const result = await authService.login(
          formData.email,
          formData.password,
          true
        );

        if (result && result.authenticated) {
          console.log('🔑 [Login] Success! Result:', result);
          // 🔥 QUAN TRỌNG: refresh user cache
          await queryClient.invalidateQueries(['me']);

          if (result.isOnboarded === false || result.isOnboarded === null || result.isOnboarded === undefined) {
            // Check both scoped and global flags
            const scopedFlag = localStorage.getItem('ONBOARDING_COMPLETED_' + formData.email);
            const globalFlag = localStorage.getItem('JUST_FINISHED_ONBOARDING');

            if (scopedFlag || globalFlag) {
              console.log('⚠️ [Login] Backend says not onboarded, but local flag says success. Redirecting to Home.');
              navigate('/', { replace: true });

              // Optional: Clear global flag to avoid pollution, but keep scoped
              if (globalFlag) localStorage.removeItem('JUST_FINISHED_ONBOARDING');
            } else {
              console.log('🚀 [Login] User not onboarded, redirecting to /onboarding');
              navigate('/onboarding', { replace: true });
            }
          } else {
            console.log('🏠 [Login] User already onboarded, redirecting to Home');
            navigate('/', { replace: true });
          }
        } else {
          setError('Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else {
        console.log('📝 [Register] Starting...');
        console.log('📝 [Register] Payload:', {
          username: formData.name,
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phoneNumber: formData.phoneNumber
        });

        const result = await authService.register({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phoneNumber: formData.phoneNumber
        });

        console.log('✅ [Register] Success:', result);

        if (result) {
          console.log('🔑 [Auto-Login] Starting...');
          const loginResult = await authService.login(
            formData.email,
            formData.password,
            true
          );

          if (loginResult && loginResult.authenticated) {
            console.log('🔑 [Auto-Login] Success! Result:', loginResult);
            await queryClient.invalidateQueries(['me']);

            if (loginResult.isOnboarded === false || loginResult.isOnboarded === null || loginResult.isOnboarded === undefined) {
              console.log('🚀 [Auto-Login] User not onboarded, redirecting to /onboarding');
              navigate('/onboarding', { replace: true });
            } else {
              console.log('🏠 [Auto-Login] User already onboarded, redirecting to Home');
              navigate('/', { replace: true });
            }
          } else {
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            setCurrentPage('login');
            setFormData({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });
          }
        }
      }
    } catch (e) {
      console.error('❌ [Submit] Error:', e);
      const errorMessage =
        e?.data?.message ||
        e?.message ||
        (currentPage === 'login'
          ? 'Sai email hoặc mật khẩu.'
          : 'Đăng ký thất bại.');

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    console.log('🔑 [Google] Processing credential...');
    setLoading(true);
    setError('');

    try {
      const result = await authService.googleLogin(credential);

      if (result && result.authenticated) {
        console.log('✅ [Google Login] Success!');
        await queryClient.invalidateQueries(['me']);

        if (result.isOnboarded === false || result.isOnboarded === null || result.isOnboarded === undefined) {
          console.log('🚀 [Google Login] User not onboarded, redirecting to /onboarding');
          navigate('/onboarding', { replace: true });
        } else {
          console.log('🏠 [Google Login] User already onboarded, redirecting to Home');
          navigate('/', { replace: true });
        }
      } else {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('❌ [Google Login] Error:', e);
      setError(e?.data?.message || e?.message || 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div style={{
        minHeight: '100vh',
        backgroundColor: softBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '90px 20px 60px',
        fontFamily: "'Be Vietnam Pro', sans-serif"
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet" />

        <div style={{
          maxWidth: '940px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          minHeight: '600px',
        }}>

          <motion.div
            style={{ display: 'flex', width: '100%', flexDirection: currentPage === 'login' ? 'row' : 'row-reverse' }}
            layout
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <motion.div style={{ flex: 1, minHeight: '600px' }} layout>
              <WelcomeContent type={currentPage} brandGreen={brandGreen} lightGreen={lightGreen} />
            </motion.div>

            <motion.div style={{ flex: 1.1, padding: '45px 50px', backgroundColor: '#fff' }} layout>
              <div className="tab-container">
                {['login', 'register'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setCurrentPage(tab);
                      setError(''); // Clear error when switching tabs
                    }}
                    className={`tab-button ${currentPage === tab ? 'active' : ''}`}
                  >
                    {tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 style={{ color: brandGreen, fontWeight: '800', fontSize: '26px', marginBottom: '6px' }}>
                    {currentPage === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
                  </h2>
                  <p style={{ color: '#718096', fontSize: '14px', marginBottom: '30px' }}>
                    {currentPage === 'login' ? 'Vui lòng đăng nhập để tiếp tục.' : 'Đăng ký để trải nghiệm đầy đủ tính năng.'}
                  </p>

                  {currentPage === 'register' && (
                    <FormInput
                      label="Họ và tên"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  )}
                  <FormInput
                    label="Địa chỉ Email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {currentPage === 'register' && (
                    <FormInput
                      label="Số điện thoại"
                      type="tel"
                      placeholder="0123456789"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  )}
                  <FormInput
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  {currentPage === 'register' && (
                    <FormInput
                      label="Nhập lại mật khẩu"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{ marginBottom: '24px' }}
                    />
                  )}
                  {currentPage === 'login' && (
                    <div style={{ marginBottom: '24px' }} />
                  )}

                  {/* Error message display */}
                  {error && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#fee',
                      border: '1px solid #fcc',
                      borderRadius: '8px',
                      color: '#c33',
                      fontSize: '14px',
                      marginBottom: '16px',
                      fontWeight: '500'
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    className={`submit-btn ${currentPage === 'register' ? 'register' : ''}`}
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading
                      ? (currentPage === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...')
                      : (currentPage === 'login' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản')
                    }
                  </button>
                </motion.div>
              </AnimatePresence>

              <div style={{ marginTop: '40px' }}>
                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
                  <hr style={{ border: '0', borderTop: '1px solid #edf2f7' }} />
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '0 12px', color: '#a0aec0', fontSize: '11px', fontWeight: '600' }}>HOẶC TIẾP TỤC VỚI</span>
                </div>
                <SocialButtons onGoogleSuccess={handleGoogleSuccess} loading={loading} />
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </motion.div>

  );
};

export default AuthPages;

