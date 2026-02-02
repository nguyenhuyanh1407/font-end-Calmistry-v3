import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { blogService } from '../../services/blogService';

const EditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const brandGreen = '#324d3e';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        categoryId: '',
        imageUrls: [],
        status: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const cats = await blogService.getCategories();
                setCategories(cats);

                // Fetch blog details
                const blog = await blogService.getBlogById(id);

                // Permission check (Client side)
                const authService = await import('../../services/authService').then(m => m.default);
                const currentUser = await authService.getCurrentUser();
                const roles = currentUser.result.roles.map(r => r.name);

                const isAdmin = roles.includes('ADMIN');
                const isAuthor = blog.authorId === currentUser.result.id;

                if (!isAdmin && !isAuthor) {
                    toast.error("Bạn không có quyền sửa bài viết này!");
                    navigate(`/blog/${id}`);
                    return;
                }

                setFormData({
                    title: blog.title,
                    content: blog.content,
                    categoryId: blog.categoryId,
                    imageUrls: blog.imageUrls || [],
                    status: blog.status
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải thông tin bài viết.");
                navigate('/blog');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalImages = formData.imageUrls.length + files.length;
        if (totalImages > 7) {
            toast.error(`Tối đa 7 ảnh. Bạn đã có ${formData.imageUrls.length} ảnh.`);
            return;
        }

        setUploading(true);
        try {
            const uploadedUrls = await blogService.uploadImages(files);
            setFormData(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...uploadedUrls]
            }));
            toast.success(`Đã thêm ${files.length} ảnh!`);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error('Upload ảnh thất bại.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setSubmitting(true);
        try {
            const token = api.getToken();
            await blogService.updateBlog(id, {
                ...formData,
                categoryId: Number(formData.categoryId)
            }, token);

            toast.success('Cập nhật bài viết thành công!');
            navigate(`/blog/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Cập nhật thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', marginTop: '80px' }}>
                <Loader2 className="animate-spin text-muted" size={48} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container py-5"
            style={{ marginTop: '80px', minHeight: '80vh' }}
        >
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <button
                        onClick={() => navigate(`/blog/${id}`)}
                        className="btn btn-link text-decoration-none mb-4 d-flex align-items-center gap-2"
                        style={{ color: '#6c757d' }}
                    >
                        <ArrowLeft size={20} /> Quay lại bài viết
                    </button>

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white p-4 border-bottom-0">
                            <h2 className="fw-bold mb-0" style={{ color: brandGreen }}>Chỉnh sửa bài viết</h2>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">Tiêu đề bài viết</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-control form-control-lg"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

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

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">
                                        Ảnh bài viết ({formData.imageUrls.length}/7)
                                    </label>

                                    {formData.imageUrls.length < 7 && (
                                        <div className="mb-3">
                                            <label className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2" style={{ cursor: 'pointer' }}>
                                                <Upload size={20} />
                                                {uploading ? 'Đang upload...' : 'Thêm ảnh'}
                                                <input type="file" className="d-none" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    )}

                                    {formData.imageUrls.length > 0 && (
                                        <div className="row g-3">
                                            {formData.imageUrls.map((url, index) => (
                                                <div key={index} className="col-md-4">
                                                    <div className="position-relative">
                                                        <img src={url} alt="Preview" className="img-fluid rounded shadow-sm" style={{ height: '150px', width: '100%', objectFit: 'contain', backgroundColor: '#f8f9fa' }} />
                                                        <button type="button" onClick={() => handleRemoveImage(index)} className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle" style={{ width: '28px', height: '28px', padding: 0 }}>
                                                            <X size={14} />
                                                        </button>
                                                        {index === 0 && <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">Đại diện</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted">Nội dung</label>
                                    <textarea
                                        name="content"
                                        className="form-control"
                                        rows="12"
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                <div className="d-flex justify-content-end gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-pill px-4"
                                        onClick={() => navigate(`/blog/${id}`)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || uploading}
                                        className="btn rounded-pill px-5 d-flex align-items-center gap-2"
                                        style={{ backgroundColor: brandGreen, color: '#fff', fontWeight: '600' }}
                                    >
                                        {submitting ? 'Đang lưu...' : <><Save size={20} /> Lưu thay đổi</>}
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

export default EditBlog;
