import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/BlogDetail.css';

import {
  Calendar,
  Clock,
  User,
  Heart,
  MessageCircle,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Eye,
  Tag,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const brandGreen = '#324d3e';
  const lightGreen = '#74c655';

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Comment states
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Auth (Mock for now, assume context or storage)
  const getToken = () => localStorage.getItem("token"); // Or however you store it
  const isLoggedIn = !!getToken();

  React.useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        // Load module dynamically (or normally if preferred)
        const service = await import('../../services/blogService').then(m => m.blogService);
        const data = await service.getBlogById(id);

        setArticle(data);
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount || 0);

        // Fetch comments
        const commentsData = await service.getComments(id);
        setComments(commentsData);

        // Fetch user info if logged in
        if (isLoggedIn) {
          const authService = await import('../../services/authService').then(m => m.default);
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData.result);
        }

      } catch (e) {
        console.error("Failed to fetch blog detail", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlogDetail();
  }, [id, isLoggedIn]);

  const canEditDelete = () => {
    if (!currentUser || !article) {
      console.log("Missing data for permission check:", { hasUser: !!currentUser, hasArticle: !!article });
      return false;
    }

    // Handle both array of strings and array of objects
    const roles = currentUser.roles.map(r => typeof r === 'string' ? r : (r.name || r.authority || ''));
    const isAdmin = roles.includes('ADMIN');

    // Check ownership: author OR tagged expert
    const isOwner = article.authorId === currentUser.id || article.expertUserId === currentUser.id;

    if (isAdmin) return true;
    if (roles.includes('EXPERT') && isOwner) return true;
    return false;
  };

  const handleDeleteBlog = async () => {
    setIsDeleting(true);
    try {
      const service = await import('../../services/blogService').then(m => m.blogService);
      await service.deleteBlog(id, getToken());
      toast.success("Xóa bài viết thành công!");
      navigate('/blog');
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Xóa bài viết thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLikeBlog = async () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để thích bài viết!");
      return;
    }

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      const service = await import('../../services/blogService').then(m => m.blogService);
      const token = getToken();
      if (newIsLiked) {
        await service.likeBlog(id, token);
      } else {
        await service.unlikeBlog(id, token);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert
      setIsLiked(!newIsLiked);
      setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }

    setCommentLoading(true);
    try {
      const service = await import('../../services/blogService').then(m => m.blogService);
      const token = getToken();
      const newComment = await service.createComment(id, commentText, token);

      setComments(prev => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Có lỗi xảy ra khi gửi bình luận.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId, currentIsLiked) => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để thích bình luận!");
      return;
    }

    // Optimistic update for specific comment
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !currentIsLiked,
          likeCount: (c.likeCount || 0) + (!currentIsLiked ? 1 : -1)
        };
      }
      return c;
    }));

    try {
      const service = await import('../../services/blogService').then(m => m.blogService);
      const token = getToken();
      if (!currentIsLiked) {
        await service.likeComment(commentId, token);
      } else {
        await service.unlikeComment(commentId, token);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // Revert
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: currentIsLiked,
            likeCount: (c.likeCount || 0) + (currentIsLiked ? 1 : -1)
          };
        }
        return c;
      }));
    }
  };

  const handleShare = (platform) => {
    console.log(`Sharing on ${platform}`);
    setShowShareMenu(false);
  };

  // Fallback for loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-5">Bài viết không tồn tại.</div>;
  }

  // Bài viết liên quan (Mock)
  const relatedPosts = [
    {
      id: 2,
      title: 'Thiền Định: Hành Trình Tìm Về Chính Mình',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
      date: '10 Tháng 12, 2024',
      readTime: '6 phút đọc'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

        {/* Breadcrumb - Fixed navbar overlap */}
        <section
          className="py-3"
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e9ecef',
            marginTop: '70px'
          }}
        >
          <div className="container">
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/" style={{ color: '#2d4a3e', textDecoration: 'none' }}>Trang chủ</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} style={{ color: '#2d4a3e', textDecoration: 'none' }}>Blog</a>
                </li>
                <li className="breadcrumb-item active text-muted">Bài viết</li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Article Header */}
        <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">

                <div className="mb-3">
                  <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: `${lightGreen}20`, color: brandGreen }}>
                    {article.categoryName || 'General'}
                  </span>
                </div>

                <h1 className="display-5 fw-bold mb-3" style={{ color: brandGreen }}>{article.title}</h1>

                <div className="d-flex flex-wrap align-items-center gap-4 mb-4 pb-4 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.authorName || 'User'}`}
                      alt={article.authorName}
                      className="rounded-circle"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-semibold" style={{ color: brandGreen }}>{article.authorName || 'Admin'}</div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-3 text-muted small ms-auto">
                    <span className="d-flex align-items-center gap-1">
                      <Calendar size={16} />
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <Eye size={16} />
                      {(article.viewCount || 0).toLocaleString()} lượt xem
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mb-4">
                  <button
                    className="btn d-flex align-items-center gap-2"
                    onClick={handleLikeBlog}
                    style={{
                      backgroundColor: isLiked ? `${lightGreen}20` : '#f8f9fa',
                      color: isLiked ? lightGreen : '#6c757d',
                      border: 'none',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Heart size={18} fill={isLiked ? lightGreen : 'none'} />
                    {likeCount}
                  </button>

                  <button
                    className="btn d-flex align-items-center gap-2"
                    style={{ backgroundColor: '#f8f9fa', color: '#6c757d', border: 'none' }}
                  >
                    <MessageCircle size={18} />
                    {comments.length}
                  </button>

                  <div className="position-relative">
                    <button
                      className="btn d-flex align-items-center gap-2"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      style={{ backgroundColor: '#f8f9fa', color: '#6c757d', border: 'none' }}
                    >
                      <Share2 size={18} />
                      Chia sẻ
                    </button>
                    {showShareMenu && (
                      <div className="position-absolute bg-white shadow-lg rounded p-3" style={{ top: '110%', right: 0, zIndex: 1000, minWidth: '200px' }}>
                        {/* Share options ... */}
                        <div className="d-flex flex-column gap-2">
                          <button className="btn btn-sm text-start" onClick={() => handleShare('copy')}>Sao chép link</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Featured Image Carousel */}
        <section className="py-4" style={{ backgroundColor: '#ffffff' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {article.imageUrls && article.imageUrls.length > 0 && (
                  article.imageUrls.length === 1 ? (
                    /* Single image - no carousel needed */
                    <img
                      src={article.imageUrls[0]}
                      alt={article.title}
                      className="rounded-3 shadow-sm mx-auto d-block"
                      style={{
                        maxHeight: '600px',
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    /* Multiple images - show carousel */
                    <div id="blogImageCarousel" className="carousel slide" data-bs-ride="carousel">
                      <div className="carousel-indicators">
                        {article.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            data-bs-target="#blogImageCarousel"
                            data-bs-slide-to={index}
                            className={index === 0 ? 'active' : ''}
                            aria-current={index === 0 ? 'true' : 'false'}
                            aria-label={`Slide ${index + 1}`}
                          ></button>
                        ))}
                      </div>
                      <div className="carousel-inner rounded-3 shadow-sm">
                        {article.imageUrls.map((url, index) => (
                          <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <img
                              src={url}
                              className="d-block mx-auto"
                              alt={`${article.title} - Ảnh ${index + 1}`}
                              style={{
                                maxHeight: '600px',
                                maxWidth: '100%',
                                height: 'auto',
                                objectFit: 'contain'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <button className="carousel-control-prev" type="button" data-bs-target="#blogImageCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button className="carousel-control-next" type="button" data-bs-target="#blogImageCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">

                {/* Management tools */}
                {canEditDelete() && (
                  <div className="d-flex gap-2 mb-4 p-3 rounded-3 bg-light border align-items-center">
                    <div className="me-auto d-flex align-items-center">
                      <AlertTriangle size={18} className="text-warning me-2" />
                      <span className="text-muted small fw-medium">Công cụ quản lý bài viết</span>
                    </div>
                    <button
                      className="btn btn-sm px-3 rounded-pill d-flex align-items-center gap-2"
                      onClick={() => navigate(`/blog/edit/${id}`)}
                      style={{ backgroundColor: `${brandGreen}10`, color: brandGreen, border: `1px solid ${brandGreen}20` }}
                    >
                      <Edit size={16} /> Sửa
                    </button>
                    <button
                      className="btn btn-sm px-3 rounded-pill d-flex align-items-center gap-2 text-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                )}

                <article className="article-content" style={{ fontSize: '18px', lineHeight: '1.8', color: '#212529' }}>
                  <div dangerouslySetInnerHTML={{ __html: article.content }} style={{ whiteSpace: 'pre-wrap' }} />
                </article>

                <div className="mt-5 p-4 rounded-3" style={{ backgroundColor: `${brandGreen}05`, border: `1px solid ${brandGreen}20` }}>
                  <div className="d-flex gap-3">
                    <img
                      src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.authorName || 'User'}`}
                      alt={article.authorName}
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h4 className="h5 fw-bold mb-2" style={{ color: brandGreen }}>{article.authorName || 'Admin'}</h4>
                      <button className="btn btn-sm rounded-pill px-4" style={{ backgroundColor: brandGreen, color: '#ffffff', border: 'none' }}>Theo dõi</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">

                <h3 className="h4 fw-bold mb-4" style={{ color: brandGreen }}>
                  Bình luận ({comments.length})
                </h3>

                {/* Comment Form */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body p-4">
                    <textarea
                      className="form-control border-0 mb-3"
                      rows="3"
                      placeholder="Viết bình luận của bạn..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ backgroundColor: '#f8f9fa', color: '#324d3e', resize: 'none' }}
                    ></textarea>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn rounded-pill px-4"
                        onClick={handleSubmitComment}
                        disabled={commentLoading || !commentText.trim()}
                        style={{
                          backgroundColor: brandGreen,
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '600',
                          opacity: commentLoading ? 0.7 : 1
                        }}
                      >
                        {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="d-flex flex-column gap-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                      <div className="card-body p-4">
                        <div className="d-flex gap-3">
                          <img
                            src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.fullName || 'User'}`}
                            alt={comment.user?.fullName}
                            className="rounded-circle"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h5 className="h6 fw-bold mb-1" style={{ color: brandGreen }}>
                                  {comment.user?.fullName || 'Người dùng ẩn danh'}
                                </h5>
                                <p className="text-muted small mb-0">
                                  {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <p className="mb-3">{comment.content}</p>
                            <div className="d-flex gap-3">
                              <button
                                className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                                onClick={() => handleLikeComment(comment.id, comment.isLiked)}
                                style={{ color: comment.isLiked ? lightGreen : '#6c757d' }}
                              >
                                <Heart size={16} fill={comment.isLiked ? lightGreen : 'none'} />
                                <span>{comment.likeCount || 0}</span>
                              </button>
                              <button className="btn btn-sm btn-link p-0 text-decoration-none" style={{ color: '#6c757d' }}>
                                Trả lời
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Related Posts is kept simple for now */}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Xác nhận xóa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(false)}
                ></button>
              </div>
              <div className="modal-body py-4">
                Bạn có chắc chắn muốn xóa bài viết <strong>"{article.title}"</strong>?
                <p className="text-danger small mt-2 mb-0">
                  <AlertTriangle size={14} className="me-1" /> Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  onClick={handleDeleteBlog}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogDetail;
