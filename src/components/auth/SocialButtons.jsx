import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const SocialButtons = ({ onGoogleSuccess, loading: externalLoading }) => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const socialBtnStyle = {
    flex: 1,
    padding: '12px',
    border: '1.5px solid #edf2f7',
    borderRadius: '12px',
    backgroundColor: '#fff',
    cursor: 'not-allowed',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#4a5568',
    opacity: 0.5
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('✅ [Google] Credential received');
    setGoogleLoading(true);
    try {
      if (onGoogleSuccess) {
        await onGoogleSuccess(credentialResponse.credential);
      }
    } catch (error) {
      console.error('❌ [Google] Login error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ [Google] Login failed');
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        {googleLoading ? (
          <div style={{
            padding: '12px',
            border: '1.5px solid #edf2f7',
            borderRadius: '12px',
            backgroundColor: '#fff',
            fontWeight: '700',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: '#4a5568'
          }}>
            ⏳ Đang đăng nhập...
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="pill"
            locale="vi_VN"
          />
        )}
      </div>
      <button style={socialBtnStyle} disabled>
        <i className="bi bi-facebook"></i> Facebook
      </button>
    </div>
  );
};

export default SocialButtons;
