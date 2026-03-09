/**
 * Authentication Service
 * Sử dụng API service để xử lý authentication
 */

import api from './api';

const authService = {
  /**
   * Đăng nhập
   * @param {string} email
   * @param {string} password
   * @param {boolean} remember - Lưu token vào localStorage nếu true
   * @returns {Promise<{token: string, authenticated: boolean}>}
   */
  login: async (email, password, remember = false) => {
    try {
      // api.post dùng fetch → response chính là JSON backend trả về
      const response = await api.post('/auth/token', {
        email,
        password
      });

      // Backend trả: { code, result: { token, authenticated } }
      const { token, authenticated } = response.result;

      if (authenticated && token) {
        api.setToken(token, remember);
      }

      // Trả về result cho component sử dụng
      return response.result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng nhập bằng Google
   * @param {string} credential - Google ID token (credential) từ Google Sign-In
   * @returns {Promise<{token: string, authenticated: boolean, isOnboarded: boolean}>}
   */
  googleLogin: async (credential) => {
    try {
      const response = await api.post('/auth/google', {
        idToken: credential
      });

      const { token, authenticated } = response.result;

      if (authenticated && token) {
        api.setToken(token, true); // Always remember for Google login
      }

      return response.result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng ký
   * @param {object} userData
   * @returns {Promise}
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      // Nếu backend trả token khi register
      if (response?.result?.token) {
        api.setToken(response.result.token, false);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    try {
      const token = api.getToken();
      await api.post('/auth/logout', { token });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      api.removeToken();
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async () => {
    try {
      return await api.get('/users/my-info');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');

      if (response?.result?.token) {
        api.setToken(response.result.token, true);
      }

      return response;
    } catch (error) {
      api.removeToken();
      throw error;
    }
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      return await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (email) => {
    try {
      return await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset mật khẩu
   */
  resetPassword: async (token, newPassword) => {
    try {
      return await api.post('/auth/reset-password', {
        token,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!api.getToken();
  }
};

export default authService;
