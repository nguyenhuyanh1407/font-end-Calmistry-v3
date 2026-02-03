import api from './api';

const userService = {
    getMyInfo: async () => {
        try {
            const response = await api.get('/users/my-info');
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const response = await api.get('/users/all-accounts');
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    updateUserRole: async (userId, roleName) => {
        try {
            const response = await api.put(`/users/${userId}/role`, { roleName });
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    completeOnboarding: async (onboardingData) => {
        try {
            const response = await api.post('/users/onboarding', onboardingData);
            return response.result;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
