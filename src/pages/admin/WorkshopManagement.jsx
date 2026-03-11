import React, { useState, useEffect } from 'react';
import workshopService from '../../services/workshopService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Plus, Calendar, User, MapPin, Clock, List, Trash2, Edit2, Users } from 'lucide-react';

const WorkshopManagement = () => {
    const [workshops, setWorkshops] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = (workshop) => {
        setEditingId(workshop.id);
        const startTimeStr = new Date(workshop.startTime).toISOString().slice(0, 16);
        const endTimeStr = new Date(workshop.endTime).toISOString().slice(0, 16);

        setFormData({
            title: workshop.title,
            description: workshop.description,
            startTime: startTimeStr,
            endTime: endTimeStr,
            speakerName: workshop.speakerName,
            speakerBio: workshop.speakerBio || '',
            maxParticipants: workshop.maxParticipants,
            imageUrl: workshop.imageUrl || '',
            location: workshop.location || ''
        });
        setImagePreview(workshop.imageUrl || '');
        setSelectedImage(null);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
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
        setSelectedImage(null);
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalImageUrl = formData.imageUrl;

            // 1. Upload ảnh nếu có chọn file mới
            if (selectedImage) {
                toast.info("Đang tải ảnh lên...", { autoClose: 1500 });
                const uploadRes = await workshopService.uploadImage(selectedImage);
                if (uploadRes && uploadRes.result) {
                    finalImageUrl = uploadRes.result;
                } else {
                    throw new Error("Tải ảnh thất bại");
                }
            }

            const submitData = { ...formData, imageUrl: finalImageUrl };

            // 2. Tạo mới hoặc Cập nhật
            let response;
            if (editingId) {
                response = await workshopService.updateWorkshop(editingId, submitData);
            } else {
                response = await workshopService.createWorkshop(submitData);
            }

            if (response && response.code === 1000) {
                toast.success(editingId ? "Cập nhật workshop thành công!" : "Tạo workshop thành công!");
                handleCancel();
                fetchWorkshops();
            } else {
                toast.error(response?.message || "Có lỗi từ server.");
            }
        } catch (error) {
            console.error("Submit error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Lỗi. Hãy kiểm tra lại.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa workshop này không? Việc này cũng sẽ xóa các đăng ký tham gia.")) {
            try {
                const response = await workshopService.deleteWorkshop(id);
                if (response && response.code === 1000) {
                    toast.success("Đã xóa workshop thành công!");
                    fetchWorkshops();
                } else {
                    toast.error(response?.message || "Có lỗi từ server khi xóa.");
                }
            } catch (error) {
                console.error("Delete error:", error);
                const errorMessage = error.response?.data?.message || error.message || "Lỗi khi xóa workshop.";
                toast.error(errorMessage);
            }
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
                        onClick={showForm ? handleCancel : () => setShowForm(true)}
                        className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-success'} rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm`}
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
                                    <label className="form-label fw-bold">Ảnh Thumbnail</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control rounded-3"
                                        onChange={handleImageChange}
                                        required={!editingId && !formData.imageUrl}
                                    />
                                    {imagePreview && (
                                        <div className="mt-2 text-center">
                                            <img src={imagePreview} alt="Preview" style={{ height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                        </div>
                                    )}
                                </div>
                                <div className="col-12 text-end mt-4">
                                    <button type="submit" disabled={isSubmitting} className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm">
                                        {isSubmitting ? 'Đang xử lý...' : (editingId ? 'Cập nhật Workshop' : 'Lưu Workshop')}
                                    </button>
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
                                                <button onClick={() => handleEdit(ws)} className="btn btn-sm btn-light rounded-circle p-2 text-primary" title="Sửa"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(ws.id)} className="btn btn-sm btn-light rounded-circle p-2 text-danger" title="Xóa"><Trash2 size={16} /></button>
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
