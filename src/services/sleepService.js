/**
 * Sleep Management Service
 * Handles API calls for sleep quiz and history
 */

import api from './api';
import gamificationService from './gamificationService';

const sleepService = {
    /**
     * Submit sleep quiz answers
     * @param {Object} quizData - { recordDate, answers: [{questionCode, answerValue}] }
     * @returns {Promise<Object>} Session response with score
     */
    submitSleepQuiz: async (quizData) => {
        try {
            const response = await api.post('/sleep/submit', quizData);
            gamificationService.optimisticAward('SLEEP_QUALITY_REVIEW');
            gamificationService.refreshTodayAndBroadcast().catch(() => { });
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get sleep history
     * @param {number} page - Page number (default 0)
     * @param {number} size - Page size (default 30)
     * @returns {Promise<Object>} History with sessions array and statistics
     */
    getSleepHistory: async (page = 0, size = 30) => {
        try {
            const response = await api.get('/sleep/history', { page, size });
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get latest sleep session
     * @returns {Promise<Object>} Latest session with score
     */
    getLatestSleep: async () => {
        try {
            const response = await api.get('/sleep/latest');
            return response.result;
        } catch (error) {
            throw error;
        }
    }
};

export default sleepService;
