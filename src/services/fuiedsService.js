import api from './api';
import gamificationService from './gamificationService';

const fuiedsService = {
    /**
     * Submit FUIEDS quiz response
     */
    submitResponse: async (answers) => {
        const response = await api.post('/fuieds/submit', answers);
        gamificationService.optimisticAward('FUIEDS_SCORE');
        gamificationService.refreshTodayAndBroadcast().catch(() => { });
        return response;
    },

    /**
     * Get today's FUIEDS score
     */
    getTodayScore: async () => {
        const response = await api.get('/fuieds/today');
        return response;
    },

    /**
     * Get FUIEDS history
     * @param {number} days - Number of days to retrieve (default 7)
     */
    getHistory: async (days = 7) => {
        const response = await api.get(`/fuieds/history?days=${days}`);
        return response;
    }
};

export default fuiedsService;
