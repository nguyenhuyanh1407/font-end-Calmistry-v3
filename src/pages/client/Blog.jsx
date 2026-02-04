import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, User, Tag, TrendingUp, Heart, MessageCircle, Share2, ChevronRight, Edit, Trash2, Flame, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Blog.css';
import api from '../../services/api';
import authService from '../../services/authService';
import { blogService } from '../../services/blogService';

const Blog = () => {
  const navigate = useNavigate();
  const brandGreen = '#324d3e';
  const lightGreen = '#8ec339';
  const softBg = '#f8fafc';

  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'Tất cả', icon: TrendingUp }
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (api.getToken()) {
          const userData = await authService.getCurrentUser();
          if (userData && userData.result) {
            setUser(userData.result);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user info", e);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const icons = [Heart, User, Tag, Calendar, Share2, Zap, Star];
    const fetchCategories = async () => {
      try {
        const data = await blogService.getCategories();
        const mappedCategories = data.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          icon: icons[index % icons.length]
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

  useEffect(() => {
    const fetchFeatured = async () => {
      setFeaturedLoading(true);
      try {
        const data = await blogService.getFeaturedBlogs();
        setFeaturedBlogs(data || []);
      } catch (error) {
        console.error("Failed to fetch featured blogs", error);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let data = [];
        if (selectedCategory === 'all' && !searchQuery) {
          data = await blogService.getPublishedBlogs();
        } else {
          const params = {};
          if (searchQuery) params.title = searchQuery;
          if (selectedCategory !== 'all') params.categoryId = selectedCategory;
          params.status = 'PUBLISHED';
          data = await blogService.searchBlogs(params);
        }
        setBlogs(data || []);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBlogs, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  const handlePostClick = (postId) => navigate(`/blog/${postId}`);

  const canManagePost = (post) => {
    if (!user) return false;
    const roles = user.roles.map(r => typeof r === 'string' ? r : (r.name || r.authority || ''));
    const isAdmin = roles.includes('ADMIN');
    const isOwner = post.authorId === user.id || post.expertUserId === user.id;
    return isAdmin || (roles.includes('EXPERT') && isOwner);
  };

  const handleQuickDelete = async (e, post) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn xóa bài viết "${post.title}"?`)) {
      try {
        await blogService.deleteBlog(post.id, api.getToken());
        setBlogs(prev => prev.filter(b => b.id !== post.id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const renderHeroCard = (post) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hero-blog-card mb-5 overflow-hidden position-relative rounded-5 shadow-lg"
      onClick={() => handlePostClick(post.id)}
      style={{ height: '500px', cursor: 'pointer' }}
    >
      <img
        src={(post.imageUrls && post.imageUrls[0]) || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070'}
        alt={post.title}
        className="w-100 h-100 object-fit-cover transition-transform"
      />
      <div className="hero-overlay position-absolute bottom-0 start-0 w-100 p-5">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="badge rounded-pill bg-danger px-3 py-2 d-flex align-items-center gap-1 shadow-sm">
            <Flame size={14} /> TRENDING
          </span>
          <span className="badge rounded-pill bg-white text-dark px-3 py-2 shadow-sm fw-bold">
            {post.categoryName}
          </span>
        </div>
        <h1 className="display-4 fw-bold text-white mb-4 hero-title">{post.title}</h1>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3 text-white">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle overflow-hidden bg-white p-1" style={{ width: 40, height: 40 }}>
                <img src={post.authorAvatar} alt={post.authorName} className="w-100 h-100 rounded-circle" />
              </div>
              <span className="fw-medium">{post.authorName}</span>
            </div>
            <div className="d-flex align-items-center gap-1 opacity-75 small">
              <Clock size={16} /> 5 phút đọc
            </div>
          </div>
          <motion.button
            whileHover={{ x: 5 }}
            className="btn btn-light rounded-pill px-4 py-2 fw-bold d-none d-md-flex align-items-center gap-2"
            style={{ color: brandGreen }}
          >
            Đọc ngay <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ backgroundColor: softBg, minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header Section */}
      <section className="blog-hero pt-5 pb-5 mt-5">
        <div className="container mt-5">
          <div className="row justify-content-between align-items-end mb-4">
            <div className="col-lg-6">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="display-5 fw-bold mb-3"
                style={{ color: brandGreen }}
              >
                Calmistry Magazine <span className="text-muted fs-4 fw-normal">/ Blog</span>
              </motion.h1>
              <p className="lead text-muted" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Những góc nhìn mới về tâm lý và cuộc sống cân bằng.</p>
            </div>
            <div className="col-lg-5">
              <div className="d-flex gap-2 justify-content-lg-end">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '300px' }}>
                  <Search size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-muted" />
                  <input
                    type="text"
                    className="form-control rounded-pill border-0 shadow-sm ps-5"
                    placeholder="Tìm từ khóa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ height: '48px' }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/blog/create')}
                  className="btn btn-dark rounded-pill px-4 fw-bold shadow-lg"
                  style={{ backgroundColor: brandGreen, border: 'none' }}
                >
                  + Post
                </motion.button>
              </div>
            </div>
          </div>

          {/* Categories Strip */}
          <div className="d-flex flex-wrap gap-2 pb-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn rounded-pill px-4 py-2 text-nowrap d-flex align-items-center gap-2 transition-all ${selectedCategory === cat.id ? 'active-cat' : 'inactive-cat'}`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? brandGreen : 'white',
                  color: selectedCategory === cat.id ? 'white' : brandGreen,
                  border: 'none',
                  boxShadow: selectedCategory === cat.id ? '0 10px 25px rgba(50,77,62,0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                {<cat.icon size={16} />} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container">
        {/* Featured Section */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="mb-5 mt-4">
            {featuredLoading ? (
              <div className="hero-skeleton rounded-5 bg-white bg-opacity-50" style={{ height: '500px' }}></div>
            ) : (
              featuredBlogs.length > 0 && (
                <>
                  {renderHeroCard(featuredBlogs[0])}

                  {featuredBlogs.length > 1 && (
                    <div className="row g-4">
                      {featuredBlogs.slice(1, 4).map((post, idx) => (
                        <div key={post.id} className="col-md-4">
                          <motion.div
                            whileHover={{ y: -10 }}
                            className="featured-side-card h-100 rounded-5 bg-white shadow-sm overflow-hidden p-3"
                            onClick={() => handlePostClick(post.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="rounded-4 overflow-hidden mb-3" style={{ height: '180px' }}>
                              <img
                                src={(post.imageUrls && post.imageUrls[0]) || 'https://via.placeholder.com/400x300'}
                                alt={post.title}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                            <div className="px-2">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="badge rounded-pill bg-light text-success small px-2 py-1">{post.categoryName}</span>
                                <small className="text-muted d-flex align-items-center gap-1"><Zap size={12} className="text-warning fill-warning" /> HOT</small>
                              </div>
                              <h5 className="fw-bold fs-6 mb-3 text-clamp-2" style={{ color: brandGreen }}>{post.title}</h5>
                              <div className="d-flex align-items-center gap-2 mt-auto">
                                <img src={post.authorAvatar} alt="" className="rounded-circle" style={{ width: 24, height: 24 }} />
                                <span className="small text-muted fw-medium">{post.authorName}</span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            )}
          </section>
        )}

        {/* Regular Feed */}
        <section className="mt-5">
          <div className="d-flex align-items-center justify-content-between mb-4 mt-5">
            <h3 className="fw-bold mb-0" style={{ color: brandGreen }}>
              {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : selectedCategory === 'all' ? 'Dành cho bạn' : `Tất cả về ${categories.find(c => c.id === selectedCategory)?.name}`}
            </h3>
            {user && (user.roles?.some(r => r === 'ADMIN' || r === 'EXPERT')) && (
              <button onClick={() => navigate('/blog/approval')} className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm">Duyệt bài</button>
            )}
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="col-lg-4 col-md-6"><div className="skeleton-card rounded-5 bg-white bg-opacity-50" style={{ height: '350px' }}></div></div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-5 glass-morphism rounded-5">
              <div className="display-1 mb-3">🍃</div>
              <h4 className="text-muted">Hết bài rồi, bạn hãy là người đầu tiên <span className="text-success cursor-pointer" onClick={() => navigate('/blog/create')}>đăng bài</span> mới nhé!</h4>
            </div>
          ) : (
            <div className="row g-4">
              {blogs
                .filter(b => !featuredBlogs.some(fb => fb.id === b.id) || searchQuery || selectedCategory !== 'all')
                .map((post, idx) => (
                  <div key={post.id} className="col-lg-4 col-md-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="blog-grid-card h-100 rounded-5 bg-white shadow-sm overflow-hidden p-3"
                      onClick={() => handlePostClick(post.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="rounded-4 overflow-hidden mb-3 position-relative" style={{ height: '220px' }}>
                        <img src={(post.imageUrls && post.imageUrls[0]) || 'https://via.placeholder.com/400x300'} alt={post.title} className="w-100 h-100 object-fit-cover" />
                        <div className="position-absolute bottom-0 start-0 m-3 px-3 py-1 bg-white bg-opacity-75 rounded-pill small fw-bold text-dark backdrop-blur">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="px-2">
                        <h4 className="fw-bold h5 mb-3 text-clamp-2" style={{ color: brandGreen }}>{post.title}</h4>
                        <p className="text-muted small text-clamp-3 mb-4">{post.content?.replace(/<[^>]+>/g, '')}</p>
                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                          <div className="d-flex align-items-center gap-2">
                            <img src={post.authorAvatar} alt="" className="rounded-circle" style={{ width: 30, height: 30 }} />
                            <span className="small text-muted fw-bold">{post.authorName}</span>
                          </div>
                          <div className="d-flex gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1"><Heart size={14} /> {post.likeCount}</span>
                            <span className="d-flex align-items-center gap-1"><MessageCircle size={14} /> {post.commentCount}</span>
                          </div>
                        </div>

                        {canManagePost(post) && (
                          <div className="mt-3 d-flex justify-content-end gap-2">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/blog/edit/${post.id}`); }} className="btn btn-sm btn-light rounded-circle shadow-sm"><Edit size={14} /></button>
                            <button onClick={(e) => handleQuickDelete(e, post)} className="btn btn-sm btn-outline-danger rounded-circle shadow-sm"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
                .hero-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    transition: all 0.5s ease;
                }
                .hero-blog-card:hover .object-fit-cover { transform: scale(1.05); }
                .hero-blog-card:hover .hero-overlay { padding-bottom: 6rem !important; }
                .text-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .text-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
                .backdrop-blur { backdrop-filter: blur(8px); }
                .blog-grid-card { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(0,0,0,0.03); }
                .blog-grid-card:hover { transform: translateY(-12px); box-shadow: 0 30px 60px rgba(0,0,0,0.08) !important; border-color: ${lightGreen}; }
                .active-cat { transform: scale(1.05); box-shadow: 0 10px 25px rgba(50,77,62,0.3) !important; }
                .custom-scrollbar::-webkit-scrollbar { height: 0; }
                .skeleton-card, .hero-skeleton { animation: pulse 2s infinite ease-in-out; }
                @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
                .fill-warning { fill: #ffc107; }
                .blog-hero { position: sticky; top: 0; z-index: 100; background: rgba(248, 250, 252, 0.8); backdrop-filter: blur(15px); }
            `}</style>
    </div>
  );
};

export default Blog;
