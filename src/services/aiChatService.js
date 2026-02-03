import api from './api';

const aiChatService = {
    sendMessage: async (message) => {
        return api.post('/ai/chat', { message });
    }
};

export default aiChatService;
