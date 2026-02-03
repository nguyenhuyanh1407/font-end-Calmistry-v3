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

    bookWorkshop: async (workshopId) => {
        return api.post(`/workshops/${workshopId}/book`);
    }
};

export default workshopService;
