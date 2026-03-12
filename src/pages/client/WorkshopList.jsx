import React, { useState, useEffect } from 'react';
import workshopService from '../../services/workshopService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, User, MapPin, Clock, Star, Sparkles, ChevronRight } from 'lucide-react';

const WorkshopList = () => {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const brandGreen = '#324d3e';

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            const response = await workshopService.getUpcomingWorkshops();
            if (response && response.code === 1000) {
                setWorkshops(response.result);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách workshop.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (workshopId) => {
        try {
            const response = await workshopService.bookWorkshop(workshopId);
            if (response && response.code === 1000) {
                if (response.result?.checkoutUrl) {
                    toast.info("Đang chuyển hướng sang trang thanh toán...");
                    window.location.href = response.result.checkoutUrl;
                } else {
                    toast.success("✨ Đặt chỗ thành công! Hẹn gặp bạn tại workshop.");
                    fetchWorkshops(); // Refresh to update participant count
                }
            } else {
                toast.error(response?.message || "Lỗi đặt chỗ.");
            }
        } catch (error) {
            toast.error(error.message || "Có lỗi xảy ra khi đặt workshop.");
        }
    };

    const handleCancel = async (workshopId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký tham gia workshop này?")) {
            return;
        }
        try {
            const response = await workshopService.cancelBooking(workshopId);
            if (response && response.code === 1000) {
                toast.success("Đã hủy đăng ký thành công.");
                fetchWorkshops(); // Refresh to update participant count
            } else {
                toast.error(response?.message || "Lỗi hủy đăng ký.");
            }
        } catch (error) {
            toast.error(error.message || "Không thể hủy đăng ký. Có thể đã quá 1 giờ từ lúc đăng ký?");
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-success">
                <Sparkles size={40} />
            </motion.div>
        </div>
    );

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', marginTop: '60px' }}>
            <div className="container py-4">
                <div className="text-center mb-5">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-900 display-4 mb-3"
                        style={{ color: brandGreen }}
                    >
                        Hành Trình Chữa Lành
                    </motion.h1>
                    <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
                        Tham gia các buổi workshop chuyên sâu cùng chuyên gia để tìm lại sự bình yên và cân bằng trong tâm hồn.
                    </p>
                </div>

                {workshops.length === 0 ? (
                    <div className="text-center p-5 bg-white rounded-5 shadow-sm">
                        <Calendar size={60} className="text-muted mb-3 opacity-20" />
                        <h4 className="text-muted">Hiện chưa có workshop nào sắp tới.</h4>
                        <p>Quay lại sau bạn nhé!</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {workshops.map((ws, index) => (
                            <motion.div
                                key={ws.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="col-lg-6"
                            >
                                <div className="card border-0 shadow-sm rounded-5 overflow-hidden h-100 hover-lift bg-white">
                                    <div className="row g-0 h-100">
                                        <div className="col-md-5">
                                            <div className="h-100 position-relative">
                                                <img
                                                    src={ws.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"}
                                                    alt={ws.title}
                                                    className="w-100 h-100 object-fit-cover"
                                                    style={{ minHeight: '250px' }}
                                                />
                                                <div className="position-absolute top-0 start-0 m-3">
                                                    <span className="badge bg-white text-success rounded-pill px-3 py-2 shadow-sm border">
                                                        {ws.currentParticipants < ws.maxParticipants ? 'Đang mở' : 'Hết chỗ'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-7 p-4 d-flex flex-column">
                                            <div className="mb-3">
                                                <h4 className="fw-bold mb-2" style={{ color: brandGreen }}>{ws.title}</h4>
                                                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                                    <Clock size={14} />
                                                    <span>{formatDate(ws.startTime)}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                                    <MapPin size={14} />
                                                    <span>{ws.location || "Online qua Zoom"}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 mt-2">
                                                    <span className={`badge ${ws.price > 0 ? 'bg-success' : 'bg-primary'} rounded-pill px-3 py-2 fw-bold`}>
                                                        {ws.price > 0 ? `${ws.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="small text-muted mb-4 flex-grow-1 line-clamp-3">
                                                {ws.description}
                                            </p>

                                            <div className="bg-light rounded-4 p-3 mb-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-white rounded-circle p-2 shadow-sm">
                                                        <User size={20} className="text-success" />
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold small">{ws.speakerName}</h6>
                                                        <small className="text-muted">Diễn giả chuyên môn</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between mt-auto">
                                                <div className="d-flex align-items-center gap-2 text-muted">
                                                    <Users size={16} />
                                                    <span className="small fw-bold">
                                                        {ws.currentParticipants}/{ws.maxParticipants} <small>người đã đặt</small>
                                                    </span>
                                                </div>

                                                {ws.isBooked ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2" style={{ cursor: 'default' }}>
                                                            Đã đăng ký
                                                        </span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleCancel(ws.id)}
                                                            className="btn btn-danger rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                                                        >
                                                            Hủy
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleBook(ws.id)}
                                                        disabled={ws.currentParticipants >= ws.maxParticipants}
                                                        className={`btn ${ws.currentParticipants >= ws.maxParticipants ? 'btn-secondary' : 'btn-success'} rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2`}
                                                        style={ws.currentParticipants < ws.maxParticipants ? { backgroundColor: brandGreen, borderColor: brandGreen } : {}}
                                                    >
                                                        {ws.price > 0 ? 'Thanh toán & Đăng ký' : 'Đăng ký ngay'}
                                                        <ChevronRight size={16} />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkshopList;
