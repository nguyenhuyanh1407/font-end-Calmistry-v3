import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, User, Tag, TrendingUp, Heart, MessageCircle, Share2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from '../../components/blog/BlogCard';
import SearchBar from '../../components/blog/SearchBar';

import '../../styles/Blog.css';

import api from '../../services/api';
import authService from '../../services/authService';

const Blog = () => {
  const navigate = useNavigate();
  const brandGreen = '#324d3e';
  const lightGreen = '#74c655';

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    // Fetch user info to check role
    const fetchUser = async () => {
      try {
        // Try to get from cache first or api
        // Simple way: check api.getToken() and call /auth/me if needed
        // OR use cached user from AuthContext if available. Since we don't have global context accessible here easily without hooking properly, let's just fetch 'me' if token exists
        if (api.getToken()) {
          const userData = await authService.getCurrentUser();
          console.log("Current User Data:", userData); // Debugging
          // API returns { code, result: { ...user } }
          if (userData && userData.result) {
            console.log("User Roles:", userData.result.roles); // Debugging
            setUser(userData.result);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user role", e);
      }
    };
    fetchUser();
  }, []);

  // State for categories
  const [categories, setCategories] = useState([
    { id: 'all', name: 'Tất cả', icon: TrendingUp }
  ]);

  React.useEffect(() => {
    // Icons mapping based on index or name
    const icons = [Heart, User, Tag, Calendar, Share2];

    const fetchCategories = async () => {
      try {
        const service = await import('../../services/blogService').then(m => m.blogService);
        const data = await service.getCategories();

        // Map backend categories to frontend structure
        const mappedCategories = data.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          icon: icons[index % icons.length] // Cycle through icons
        }));

        setCategories([
          { id: 'all', name: 'Tất cả', icon: TrendingUp },
          ...mappedCategories
        ]);
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch blogs
  React.useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let data = [];
        const service = await import('../../services/blogService').then(m => m.blogService);

        if (selectedCategory === 'all' && !searchQuery) {
          data = await service.getPublishedBlogs();
        } else {
          // Use Search API
          const params = {};
          if (searchQuery) params.title = searchQuery;
          if (selectedCategory !== 'all') params.categoryId = selectedCategory;
          params.status = 'PUBLISHED'; // Only show published blogs to users

          data = await service.searchBlogs(params);
        }
        setBlogs(data || []);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchBlogs();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  // Data is now already filtered by API
  const featuredPosts = (blogs.length > 0 && selectedCategory === 'all' && !searchQuery) ? blogs.slice(0, 1) : [];
  const regularPosts = (blogs.length > 0 && selectedCategory === 'all' && !searchQuery) ? blogs.slice(1) : blogs;

  // Hàm xử lý click vào bài viết
  const handlePostClick = (postId) => {
    navigate(`/blog/${postId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

        {/* Hero Section */}
        <section style={{
          background: `linear-gradient(135deg, ${brandGreen} 0%, #2d4435 100%)`,
          color: '#ffffff',
          padding: '80px 0 60px'
        }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className="display-4 fw-bold mb-4">Blog Calmistry</h1>
                <p className="lead mb-5" style={{ opacity: 0.9 }}>
                  Khám phá những bài viết chất lượng về sức khỏe tâm lý, phát triển bản thân và cuộc sống hạnh phúc
                </p>

                {/* Search Bar */}
                <div className="position-relative mx-auto mb-4" style={{ maxWidth: '600px' }}>
                  <Search
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6c757d'
                    }}
                  />
                  <input
                    type="text"
                    className="form-control form-control-lg shadow-sm"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '50px',
                      borderRadius: '50px',
                      border: 'none',
                      fontSize: '16px'
                    }}
                  />
                </div>

                {/* Write Blog Button */}
                <button
                  onClick={() => navigate('/blog/create')}
                  className="btn btn-light rounded-pill px-4 py-2 fw-bold shadow-sm"
                  style={{ color: brandGreen }}
                >
                  + Đăng bài
                </button>

                {/* Approve Button (Only for ADMIN/EXPERT) */}
                {user && user.roles && (user.roles.includes('ADMIN') || user.roles.includes('EXPERT')) && (
                  <button
                    onClick={() => navigate('/blog/approval')}
                    className="btn btn-warning rounded-pill px-4 py-2 fw-bold shadow-sm ms-2"
                  >
                    Duyệt bài viết
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div className="container">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="btn rounded-pill d-flex align-items-center gap-2"
                    style={{
                      backgroundColor: isActive ? brandGreen : '#f8f9fa',
                      color: isActive ? '#ffffff' : brandGreen,
                      border: `1px solid ${isActive ? brandGreen : '#dee2e6'}`,
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.3s',
                      padding: '8px 20px'
                    }}
                  >
                    <Icon size={18} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-5">
          <div className="container">

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <div className="mb-5">
                <div className="d-flex align-items-center mb-4">
                  <TrendingUp size={24} color={brandGreen} className="me-2" />
                  <h2 className="mb-0" style={{ color: brandGreen, fontWeight: '700' }}>Bài viết nổi bật</h2>
                </div>

                <div className="row g-4">
                  {featuredPosts.map(post => (
                    <div key={post.id} className="col-lg-6">
                      <div
                        className="card border-0 shadow-sm h-100"
                        style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          cursor: 'pointer'
                        }}
                        onClick={() => handlePostClick(post.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      >
                        <div style={{
                          height: '280px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <img
                            src={post.image}
                            alt={post.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            backgroundColor: lightGreen,
                            color: '#ffffff',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            Nổi bật
                          </div>
                        </div>
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
                            <div className="d-flex align-items-center gap-1">
                              <User size={16} />
                              <span>{post.author}</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <Calendar size={16} />
                              <span>{post.date}</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <Clock size={16} />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                          <h3 className="h5 fw-bold mb-3" style={{ color: brandGreen }}>
                            {post.title}
                          </h3>
                          <p className="text-muted mb-4">{post.excerpt}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-3 text-muted small">
                              <span className="d-flex align-items-center gap-1">
                                <Heart size={16} />
                                {post.likes}
                              </span>
                              <span className="d-flex align-items-center gap-1">
                                <MessageCircle size={16} />
                                {post.comments}
                              </span>
                            </div>
                            <button
                              className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                              style={{ color: brandGreen, fontWeight: '600' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostClick(post.id);
                              }}
                            >
                              Đọc thêm
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="mb-4" style={{ color: brandGreen, fontWeight: '700' }}>
                {selectedCategory === 'all' ? 'Tất cả bài viết' : `Bài viết về ${categories.find(c => c.id === selectedCategory)?.name}`}
              </h2>

              {blogs.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Không tìm thấy bài viết nào phù hợp.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {regularPosts.map(post => (
                    <div key={post.id} className="col-lg-4 col-md-6">
                      <div
                        className="card border-0 shadow-sm h-100"
                        style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          cursor: 'pointer'
                        }}
                        onClick={() => handlePostClick(post.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      >
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <img
                            src={post.thumbnailUrl || 'https://via.placeholder.com/800x500'} // Map image
                            alt={post.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                            <Calendar size={14} />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span> {/* Map date */}
                            <span>•</span>
                            <Clock size={14} />
                            <span>5 phút đọc</span> {/* Mock readTime */}
                          </div>
                          <h4 className="h6 fw-bold mb-2" style={{ color: brandGreen }}>
                            {post.title}
                          </h4>
                          <p className="text-muted small mb-3" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 100) : ''}... {/* Strip HTML for excerpt */}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted d-flex align-items-center gap-1">
                              <User size={14} />
                              {post.authorName || 'Admin'} {/* Map author */}
                            </span>
                            <div className="d-flex gap-2 small text-muted">
                              <span className="d-flex align-items-center gap-1">
                                <Heart size={14} />
                                {post.likeCount || 0} {/* Map likes */}
                              </span>
                              <span className="d-flex align-items-center gap-1">
                                <MessageCircle size={14} />
                                {post.commentCount || 0} {/* Map comments */}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Load More Button */}
            {blogs.length > 0 && (
              <div className="text-center mt-5">
                <button
                  className="btn rounded-pill px-5 py-3"
                  style={{
                    backgroundColor: brandGreen,
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d4435';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = brandGreen;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Xem thêm bài viết
                </button>
              </div>
            )}
          </div>
        </section>



      </div>
    </motion.div>

  );
};

export default Blog;
