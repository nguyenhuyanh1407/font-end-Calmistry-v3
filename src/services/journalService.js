/**
 * Journal Service
 * Handles API calls for journal entries
 */

import api from './api';
import gamificationService from './gamificationService';

const journalService = {
    /**
     * Get all journals with optional filters
     * @param {string} search - Search keyword (optional)
     * @param {string} mood - Mood filter: all, happy, neutral, sad (optional)
     * @returns {Promise<Array>} List of journal entries
     */
    getJournals: async (search = '', mood = '') => {
        try {
            const params = {};
            if (search && search.trim()) params.search = search;
            if (mood && mood !== 'all') params.mood = mood;

            console.log('🔍 [Journal API] Calling GET /journals with params:', JSON.stringify(params));
            const response = await api.get('/journals', params);
            console.log('✅ [Journal API] Success! Response:', JSON.stringify(response));
            return response.result;
        } catch (error) {
            console.error('❌ [Journal API] Error details:', {
                message: error.message,
                status: error.status,
                data: error.data
            });
            throw error;
        }
    },

    /**
     * Get single journal by ID
     * @param {number} id - Journal ID
     * @returns {Promise<Object>} Journal entry
     */
    getJournalById: async (id) => {
        try {
            const response = await api.get(`/journals/${id}`);
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create new journal entry
     * @param {Object} data - { title, content, mood }
     * @returns {Promise<Object>} Created journal entry
     */
    createJournal: async (data) => {
        try {
            const response = await api.post('/journals', data);
            gamificationService.optimisticAward('JOURNAL_ENTRY');
            gamificationService.refreshTodayAndBroadcast().catch(() => { });
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update existing journal entry
     * @param {number} id - Journal ID
     * @param {Object} data - { title, content, mood }
     * @returns {Promise<Object>} Updated journal entry
     */
    updateJournal: async (id, data) => {
        try {
            const response = await api.put(`/journals/${id}`, data);
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete journal entry
     * @param {number} id - Journal ID
     * @returns {Promise<void>}
     */
    deleteJournal: async (id) => {
        try {
            await api.delete(`/journals/${id}`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get AI daily writing prompt
     * @returns {Promise<string>} AI prompt
     */
    getAiPrompt: async () => {
        try {
            const response = await api.get('/journals/v1/ai-prompt');
            return response.result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get journal statistics and AI analysis
     * @returns {Promise<Object>} Statistics data
     */
    getStats: async () => {
        try {
            const response = await api.get('/journals/v1/stats');
            return response.result;
        } catch (error) {
            throw error;
        }
    }
};

export default journalService;
