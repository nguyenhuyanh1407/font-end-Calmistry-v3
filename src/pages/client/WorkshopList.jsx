import React, { useState, useEffect } from 'react';
import workshopService from '../../services/workshopService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, User, MapPin, Clock, Star, Sparkles, ChevronRight } from 'lucide-react';

const WorkshopList = () => {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voucherCodes, setVoucherCodes] = useState({});
    const [appliedDiscounts, setAppliedDiscounts] = useState({});
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
            const code = voucherCodes[workshopId] || '';
            const response = await workshopService.bookWorkshop(workshopId, code);
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

    const handleApplyVoucher = async (workshopId) => {
        const code = voucherCodes[workshopId];
        if (!code || !code.trim()) {
            toast.warning("Vui lòng nhập mã voucher.");
            return;
        }
        try {
            const response = await workshopService.validateVoucher(code.trim());
            if (response && response.result && response.result.valid) {
                setAppliedDiscounts(prev => ({ ...prev, [workshopId]: response.result }));
                toast.success(`🎉 Đã áp dụng ${response.result.title}!`);
            } else {
                toast.error(response?.message || "Mã Voucher không hợp lệ.");
            }
        } catch (error) {
            toast.error(error.message || "Mã không hợp lệ hoặc đã dùng.");
        }
    };

    const calculateDiscountedPrice = (price, discount) => {
        if (!discount) return price;
        if (discount.discountType === 'PERCENTAGE') {
            return price * (1 - discount.discountValue / 100);
        }
        return Math.max(0, price - discount.discountValue);
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
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', marginTop: '60px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <div className="container py-4">
                <div className="text-center mb-5">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-900 display-4 mb-3"
                        style={{ color: brandGreen, fontWeight: 900, letterSpacing: '-0.02em' }}
                    >
                        Hành Trình Chữa Lành
                    </motion.h1>
                    <p className="text-muted lead mx-auto" style={{ maxWidth: '600px', fontWeight: 500 }}>
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="col-lg-6"
                            >
                                <div className="card border-0 shadow-sm rounded-5 overflow-hidden h-100 hover-lift bg-white" style={{ transition: 'all 0.3s ease' }}>
                                    <div className="row g-0 h-100">
                                        <div className="col-md-5">
                                            <div className="h-100 position-relative">
                                                <img
                                                    src={ws.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"}
                                                    alt={ws.title}
                                                    className="w-100 h-100 object-fit-cover"
                                                    style={{ minHeight: '280px' }}
                                                />
                                                <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-2">
                                                    <span className="badge bg-white text-success rounded-pill px-3 py-2 shadow-sm border fw-bold" style={{ fontSize: '0.75rem' }}>
                                                        <span className="me-1" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ws.currentParticipants < ws.maxParticipants ? '#28a745' : '#dc3545' }}></span>
                                                        {ws.currentParticipants < ws.maxParticipants ? 'Đang mở' : 'Hết chỗ'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-7 p-4 d-flex flex-column">
                                            <div className="mb-3">
                                                <h4 className="fw-bold mb-3" style={{ color: brandGreen, lineHeight: 1.3 }}>{ws.title}</h4>
                                                <div className="d-flex flex-column gap-2 mb-4">
                                                    <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
                                                        <div className="bg-light p-1 rounded-2"><Clock size={16} className="text-success" /></div>
                                                        <span>{formatDate(ws.startTime)}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
                                                        <div className="bg-light p-1 rounded-2"><MapPin size={16} className="text-success" /></div>
                                                        <span>{ws.location || "Online qua Zoom"}</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {appliedDiscounts[ws.id] ? (
                                                        <>
                                                            <span className="text-muted text-decoration-line-through small me-1">
                                                                {ws.price.toLocaleString('vi-VN')} đ
                                                            </span>
                                                            <span className="bg-success text-white rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '1rem' }}>
                                                                {calculateDiscountedPrice(ws.price, appliedDiscounts[ws.id]).toLocaleString('vi-VN')} đ
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.95rem' }}>
                                                            {ws.price > 0 ? `${ws.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="small text-muted mb-4 flex-grow-1 line-clamp-3" style={{ lineHeight: 1.6 }}>
                                                {ws.description}
                                            </p>

                                            <div className="bg-light-subtle rounded-4 p-3 mb-4 border border-light">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-white rounded-circle p-2 shadow-sm border">
                                                        <User size={20} className="text-success" />
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold small text-dark">{ws.speakerName}</h6>
                                                        <small className="text-muted fw-medium">Diễn giả chuyên môn</small>
                                                    </div>
                                                </div>
                                            </div>

                                            {!ws.isBooked && ws.price > 0 && (
                                                <div className="d-flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập mã Voucher..."
                                                        className="form-control form-control-sm rounded-pill px-3"
                                                        style={{ maxWidth: '180px', fontSize: '0.85rem' }}
                                                        value={voucherCodes[ws.id] || ''}
                                                        onChange={(e) => setVoucherCodes(prev => ({ ...prev, [ws.id]: e.target.value.toUpperCase() }))}
                                                        disabled={!!appliedDiscounts[ws.id]}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${appliedDiscounts[ws.id] ? 'btn-success text-white' : 'btn-outline-success'}`}
                                                        style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                                                        onClick={() => handleApplyVoucher(ws.id)}
                                                        disabled={!!appliedDiscounts[ws.id]}
                                                    >
                                                        {appliedDiscounts[ws.id] ? 'Đã áp dụng' : 'Áp dụng'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Fix button overlap: use wrap or stack on narrow viewports */}
                                            <div className="d-flex flex-wrap align-items-center justify-content-between mt-auto gap-3 pt-3 border-top border-light">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                                        <Users size={14} />
                                                    </div>
                                                    <span className="small text-dark">
                                                        <span className="fw-bold fs-6">{ws.currentParticipants}/{ws.maxParticipants}</span> <small className="text-muted fw-medium">người đã đặt</small>
                                                    </span>
                                                </div>

                                                {ws.isBooked ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="bg-secondary-subtle text-secondary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 small" style={{ cursor: 'default' }}>
                                                            Đã đăng ký
                                                        </span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleCancel(ws.id)}
                                                            className="btn btn-danger rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center"
                                                        >
                                                            Hủy
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <motion.button
                                                        whileHover={ws.currentParticipants < ws.maxParticipants ? { scale: 1.02, translateY: -2 } : {}}
                                                        whileTap={ws.currentParticipants < ws.maxParticipants ? { scale: 0.98 } : {}}
                                                        onClick={() => handleBook(ws.id)}
                                                        disabled={ws.currentParticipants >= ws.maxParticipants}
                                                        className={`btn ${ws.currentParticipants >= ws.maxParticipants ? 'btn-secondary' : 'btn-success'} rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2`}
                                                        style={ws.currentParticipants < ws.maxParticipants ? { 
                                                            backgroundColor: brandGreen, 
                                                            borderColor: brandGreen, 
                                                            boxShadow: '0 4px 15px rgba(50, 77, 62, 0.2)',
                                                            fontSize: '0.9rem',
                                                            whiteSpace: 'nowrap'
                                                        } : {}}
                                                    >
                                                        {ws.price > 0 ? 'Thanh toán & Đăng ký' : 'Đăng ký ngay'}
                                                        <ChevronRight size={18} />
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
            <style>{`
                .hover-lift:hover {
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
                    transform: translateY(-5px);
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default WorkshopList;
