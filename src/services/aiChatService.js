import api from './api';

const aiChatService = {
    sendMessage: async (message) => {
        const response = await api.post('/ai/chat', { message });
        // The backend returns { code: 1000, result: "AI Response Text" }
        // We wrap it in an object that AIChatButton expects
        return { aiResponse: response.result };
    },

    /**
     * Get chat history from the backend
     */
    getChatHistory: async (page = 0, size = 50) => {
        const response = await api.get(`/ai/history?page=${page}&size=${size}`);
        if (response.code === 1000) {
            // Map backend AiChatLog format to frontend message format
            const messages = [];
            response.result.content.reverse().forEach(log => {
                messages.push({
                    id: `user-${log.id}`,
                    text: log.userMessage,
                    sender: 'user',
                    timestamp: log.createdAt
                });
                messages.push({
                    id: `ai-${log.id}`,
                    text: log.aiResponse,
                    sender: 'ai',
                    timestamp: log.createdAt
                });
            });
            return { messages };
        }
        return { messages: [] };
    }
};

export default aiChatService;
