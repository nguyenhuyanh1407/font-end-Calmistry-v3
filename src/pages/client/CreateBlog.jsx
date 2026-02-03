import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, X, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { blogService } from '../../services/blogService';

const CreateBlog = () => {
    const navigate = useNavigate();
    const brandGreen = '#324d3e';

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        categoryId: 1,
        imageUrls: []
    });

    const categories = [
        { id: 1, name: 'Sức khỏe tâm lý' },
        { id: 2, name: 'Thiền định' },
        { id: 3, name: 'Lối sống' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        const totalImages = formData.imageUrls.length + files.length;
        if (totalImages > 20) {
            toast.error(`Tối đa 20 ảnh. Bạn đã có ${formData.imageUrls.length} ảnh.`);
            return;
        }

        setUploading(true);
        try {
            const uploadedUrls = await blogService.uploadImages(files);
            setFormData(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...uploadedUrls]
            }));
            toast.success(`Đã upload ${files.length} ảnh thành công!`);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error('Upload ảnh thất bại.');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index)
        }));
        toast.info('Đã xóa ảnh');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            toast.error('Vui lòng nhập tiêu đề và nội dung!');
            return;
        }

        setLoading(true);
        try {
            const token = api.getToken();
            if (!token) {
                toast.error('Bạn cần đăng nhập để đăng bài!');
                navigate('/login');
                return;
            }

            await blogService.createBlog({
                ...formData,
                categoryId: Number(formData.categoryId)
            }, token);

            toast.success('Đăng bài thành công!');
            navigate('/blog');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi đăng bài.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="container py-5"
            style={{ marginTop: '80px', minHeight: '80vh' }}
        >
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <button
                        onClick={() => navigate('/blog')}
                        className="btn btn-link text-decoration-none mb-4 d-flex align-items-center gap-2"
                        style={{ color: '#6c757d' }}
                    >
                        <ArrowLeft size={20} /> Quay lại Blog
                    </button>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-white p-4 border-bottom-0">
                            <h2 className="fw-bold mb-0" style={{ color: brandGreen }}>Viết bài mới</h2>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Title */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">Tiêu đề bài viết</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-control form-control-lg"
                                        placeholder="Nhập tiêu đề..."
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">Danh mục</label>
                                    <select
                                        name="categoryId"
                                        className="form-select"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Images Upload */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">
                                        Ảnh bài viết ({formData.imageUrls.length}/20)
                                    </label>

                                    {/* Upload Button */}
                                    {formData.imageUrls.length < 20 && (
                                        <div className="mb-3">
                                            <label
                                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Upload size={20} />
                                                {uploading ? 'Đang upload...' : 'Chọn ảnh'}
                                                <input
                                                    type="file"
                                                    className="d-none"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                            <small className="text-muted d-block mt-2">
                                                Bạn có thể chọn nhiều ảnh cùng lúc (tối đa {20 - formData.imageUrls.length} ảnh)
                                            </small>
                                        </div>
                                    )}

                                    {/* Image Preview Carousel */}
                                    {formData.imageUrls.length > 0 && (
                                        <div className="row g-3">
                                            {formData.imageUrls.map((url, index) => (
                                                <div key={index} className="col-md-4">
                                                    <div className="position-relative">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="img-fluid rounded shadow-sm"
                                                            style={{
                                                                height: '200px',
                                                                width: '100%',
                                                                objectFit: 'contain',
                                                                backgroundColor: '#f8f9fa'
                                                            }}
                                                        />
                                                        {/* Delete button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        {/* First image badge */}
                                                        {index === 0 && (
                                                            <span
                                                                className="badge bg-primary position-absolute bottom-0 start-0 m-2"
                                                            >
                                                                Ảnh đại diện
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">Nội dung</label>
                                    <textarea
                                        name="content"
                                        className="form-control"
                                        rows="10"
                                        placeholder="Viết nội dung của bạn ở đây (hỗ trợ HTML cơ bản)..."
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <div className="d-flex justify-content-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-lg rounded-pill px-5 d-flex align-items-center gap-2"
                                        style={{
                                            backgroundColor: brandGreen,
                                            color: '#fff',
                                            border: 'none',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Đang đăng...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} /> Đăng bài
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CreateBlog;
