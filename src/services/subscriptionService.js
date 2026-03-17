import api from './api';

const subscriptionService = {
  createGoldCheckout: async ({ voucherCode } = {}) => {
    const response = await api.post('/subscriptions/gold/checkout', { voucherCode });
    if (response && typeof response === 'object' && response.result) return response.result;
    return response;
  }
};

export default subscriptionService;
