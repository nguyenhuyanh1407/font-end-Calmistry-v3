import api from './api';

const workshopService = {
    getUpcomingWorkshops: async () => {
        return api.get('/workshops/upcoming');
    },

    getAllWorkshops: async () => {
        return api.get('/workshops');
    },

    createWorkshop: async (workshopData) => {
        return api.post('/workshops/admin/create', workshopData);
    },

    updateWorkshop: async (id, workshopData) => {
        return api.put(`/workshops/admin/${id}`, workshopData);
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.upload('/files/upload', formData);
    },

    deleteWorkshop: async (id) => {
        return api.delete(`/workshops/admin/${id}`);
    },

    bookWorkshop: async (workshopId) => {
        return api.post(`/workshops/${workshopId}/book`);
    },

    cancelBooking: async (workshopId) => {
        return api.delete(`/workshops/${workshopId}/cancel`);
    }
};

export default workshopService;
