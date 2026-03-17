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

    bookWorkshop: async (workshopId, voucherCode = '') => {
        const url = voucherCode ? `/workshops/${workshopId}/book?voucherCode=${voucherCode}` : `/workshops/${id}/book`;
        // wait, inside service context, use parameter workshopId.
        const actualUrl = voucherCode ? `/workshops/${workshopId}/book?voucherCode=${voucherCode}` : `/workshops/${workshopId}/book`;
        return api.post(actualUrl);
    },

    cancelBooking: async (workshopId) => {
        return api.delete(`/workshops/${workshopId}/cancel`);
    },

    validateVoucher: async (code) => {
        return api.get(`/vouchers/validate?code=${code}`);
    },

    getMyVouchers: async () => {
        return api.get('/vouchers/my-vouchers');
    }
};

export default workshopService;
