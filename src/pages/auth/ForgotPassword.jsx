import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import '../../styles/Login.css';

const OTP_LENGTH = 6;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const otpRefs = useRef([]);
  const brandGreen = '#324d3e';

  const otpValue = useMemo(() => otp.join(''), [otp]);

  const validateEmail = () => {
    if (!email.trim()) {
      toast.error('Vui lòng nhập email.');
      return false;
    }
    return true;
  };

  const handleRequestOtp = async () => {
    if (!validateEmail()) return;
    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      toast.success('Nếu email tồn tại, Calmistry đã gửi OTP. Vui lòng kiểm tra hộp thư.');
      setStep(2);
      setTimeout(() => otpRefs.current?.[0]?.focus?.(), 200);
    } catch (e) {
      toast.error(e?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const v = value.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < OTP_LENGTH - 1) {
      otpRefs.current?.[index + 1]?.focus?.();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        setOtp((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
        return;
      }
      if (index > 0) otpRefs.current?.[index - 1]?.focus?.();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current?.[index - 1]?.focus?.();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) otpRefs.current?.[index + 1]?.focus?.();
  };

  const handleOtpPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const chars = text.split('');
    setOtp((prev) => prev.map((_, i) => chars[i] || ''));
    const nextIndex = Math.min(chars.length, OTP_LENGTH - 1);
    setTimeout(() => otpRefs.current?.[nextIndex]?.focus?.(), 0);
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    if (otpValue.length !== OTP_LENGTH) {
      toast.error('Vui lòng nhập đủ mã OTP.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email.trim(), otpValue, newPassword);
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/login', { replace: true });
    } catch (e) {
      toast.error(e?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="auth-wrapper"
      style={{ background: '#fcf7f0', paddingTop: 110, paddingBottom: 50 }}
    >
      <div className="container" style={{ maxWidth: 520 }}>
        <div
          className="auth-card"
          style={{
            borderRadius: 22,
            background: '#fff',
            boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
            padding: 28
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 style={{ color: brandGreen, fontWeight: 900, marginBottom: 6 }}>Quên mật khẩu</h2>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Nhập email để nhận mã OTP, sau đó đặt lại mật khẩu.
              </p>
            </div>
            <button
              className="btn btn-outline-secondary rounded-pill"
              onClick={() => navigate('/login')}
              type="button"
            >
              Quay lại
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              className="form-control"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || step === 2}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  className="btn w-100 rounded-pill fw-bold"
                  style={{ background: brandGreen, color: '#fff', padding: '12px 16px' }}
                  onClick={handleRequestOtp}
                  disabled={loading}
                  type="button"
                >
                  {loading ? 'Đang gửi OTP…' : 'Gửi OTP qua email'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-3">
                  <label className="form-label fw-semibold">Mã OTP</label>
                  <div className="d-flex gap-2" onPaste={handleOtpPaste}>
                    {otp.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        value={val}
                        inputMode="numeric"
                        className="form-control text-center"
                        style={{ width: 52, height: 52, fontSize: 18, fontWeight: 800, borderRadius: 14 }}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <div className="text-muted small mt-2">
                    Không thấy email? Hãy kiểm tra Spam/Quảng cáo hoặc bấm “Gửi lại OTP”.
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-outline-secondary rounded-pill fw-bold"
                    style={{ padding: '12px 16px', flex: 1 }}
                    onClick={handleRequestOtp}
                    disabled={loading}
                    type="button"
                  >
                    Gửi lại OTP
                  </button>
                  <button
                    className="btn rounded-pill fw-bold"
                    style={{ background: brandGreen, color: '#fff', padding: '12px 16px', flex: 1 }}
                    onClick={handleResetPassword}
                    disabled={loading}
                    type="button"
                  >
                    {loading ? 'Đang lưu…' : 'Đặt lại mật khẩu'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;

