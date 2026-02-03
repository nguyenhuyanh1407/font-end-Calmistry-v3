import React, { useState, useEffect } from 'react';
import workshopService from '../../services/workshopService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Plus, Calendar, User, MapPin, Clock, List, Trash2, Edit2, Users } from 'lucide-react';

const WorkshopManagement = () => {
    const [workshops, setWorkshops] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        speakerName: '',
        speakerBio: '',
        maxParticipants: 20,
        imageUrl: '',
        location: ''
    });

    const brandGreen = '#324d3e';

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            console.log("Fetching workshops...");
            const response = await workshopService.getAllWorkshops();
            console.log("Fetch response:", response);
            if (response && response.code === 1000) {
                setWorkshops(response.result);
            } else {
                toast.error(response?.message || "Không thể tải danh sách workshop.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Không thể kết nối đến server.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting workshop form:", formData);
        try {
            const response = await workshopService.createWorkshop(formData);
            console.log("Create workshop response:", response);
            if (response && response.code === 1000) {
                toast.success("Workshop đã được tạo thành công!");
                setShowForm(false);
                fetchWorkshops();
                setFormData({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    speakerName: '',
                    speakerBio: '',
                    maxParticipants: 20,
                    imageUrl: '',
                    location: ''
                });
            } else {
                toast.error(response?.message || "Lỗi khi tạo workshop từ server.");
            }
        } catch (error) {
            console.error("Create workshop error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Lỗi khi tạo workshop. Hãy kiểm tra lại quyền Admin.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-vh-100 py-5 bg-light" style={{ marginTop: '60px' }}>
            <div className="container">
                <div className="d-flex align-items-center justify-content-between mb-5">
                    <div>
                        <h2 className="fw-900 mb-1" style={{ color: brandGreen }}>Quản Lý Workshop</h2>
                        <p className="text-muted mb-0">Tổ chức và theo dõi các sự kiện cộng đồng Calmistry</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    >
                        {showForm ? 'Hủy bỏ' : <><Plus size={20} /> Tạo Workshop Mới</>}
                    </button>
                </div>

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-sm rounded-5 p-4 mb-5 bg-white"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Tên Workshop</label>
                                    <input type="text" name="title" className="form-control rounded-3" value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Lĩnh vực/Diễn giả</label>
                                    <input type="text" name="speakerName" className="form-control rounded-3" value={formData.speakerName} onChange={handleInputChange} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold">Mô tả chi tiết</label>
                                    <textarea name="description" className="form-control rounded-3" rows="3" value={formData.description} onChange={handleInputChange} required></textarea>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Thời gian bắt đầu</label>
                                    <input type="datetime-local" name="startTime" className="form-control rounded-3" value={formData.startTime} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Thời gian kết thúc</label>
                                    <input type="datetime-local" name="endTime" className="form-control rounded-3" value={formData.endTime} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Số lượng tối đa</label>
                                    <input type="number" name="maxParticipants" className="form-control rounded-3" value={formData.maxParticipants} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Địa điểm/Link Zoom</label>
                                    <input type="text" name="location" className="form-control rounded-3" value={formData.location} onChange={handleInputChange} placeholder="VD: Zoom hoặc Tầng 2, Tòa nhà A..." />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Link ảnh Thumbnail</label>
                                    <input type="text" name="imageUrl" className="form-control rounded-3" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                                </div>
                                <div className="col-12 text-end">
                                    <button type="submit" className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm">Lưu Workshop</button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="card border-0 shadow-sm rounded-5 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3">Workshop</th>
                                    <th className="py-3">Diễn giả</th>
                                    <th className="py-3">Thời gian</th>
                                    <th className="py-3">Tham gia</th>
                                    <th className="py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-end">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workshops.map(ws => (
                                    <tr key={ws.id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={ws.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400"} alt="" className="rounded-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                <h6 className="mb-0 fw-bold">{ws.title}</h6>
                                            </div>
                                        </td>
                                        <td className="py-3 small">{ws.speakerName}</td>
                                        <td className="py-3 small text-muted">
                                            {new Date(ws.startTime).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="badge bg-light text-dark border rounded-pill">
                                                <Users size={12} className="me-1" />
                                                {ws.currentParticipants}/{ws.maxParticipants}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge rounded-pill bg-opacity-10 text-${ws.status === 'UPCOMING' ? 'success' : 'secondary'} bg-${ws.status === 'UPCOMING' ? 'success' : 'secondary'}`}>
                                                {ws.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-light rounded-circle p-2 text-primary" title="Sửa"><Edit2 size={16} /></button>
                                                <button className="btn btn-sm btn-light rounded-circle p-2 text-danger" title="Xóa"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {workshops.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">Chưa có dữ liệu.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopManagement;
