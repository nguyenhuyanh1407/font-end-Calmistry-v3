import api from './api';

const fileService = {
    upload: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Sử dụng api.upload để xử lý FormData đúng cách (không JSON.stringify)
            const response = await api.upload('/files/upload', formData);
            return response.result;
        } catch (error) {
            throw error;
        }
    }
};

export default fileService;
