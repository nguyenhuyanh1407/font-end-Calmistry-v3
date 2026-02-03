import React, { useState, useEffect } from 'react';
import '../../styles/ShareStories.css';
import userService from '../../services/userService';
import storyService from '../../services/storyService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Shield, Zap, User, Circle, Star, Info, Ghost } from 'lucide-react';

const BackgroundBlobs = () => (
  <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1, opacity: 0.5 }}>
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 80, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute',
        top: '5%',
        right: '5%',
        width: '35vw',
        height: '35vw',
        background: 'radial-gradient(circle, rgba(142, 195, 57, 0.15) 0%, rgba(142, 195, 57, 0) 70%)',
        borderRadius: '50%',
      }}
    />
    <motion.div
      animate={{
        scale: [1.2, 1, 1.2],
        x: [0, -80, 0],
        y: [0, -40, 0],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(50, 77, 62, 0.1) 0%, rgba(50, 77, 62, 0) 70%)',
        borderRadius: '50%',
      }}
    />
  </div>
);

const ShareStories = () => {
  const brandGreen = '#324d3e';
  const lightGreen = '#8ec339';
  const softBg = '#f8fafc';

  const [currentUser, setCurrentUser] = useState({
    name: "...",
    fuedScore: 0,
    requiredFUED: 100
  });

  const [stories, setStories] = useState([]);
  const [isAnonPost, setIsAnonPost] = useState(false);
  const [newStoryContent, setNewStoryContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userInfo, storiesData] = await Promise.all([
        userService.getMyInfo(),
        storyService.getStories(0, 50)
      ]);

      setCurrentUser({
        name: userInfo.fullName || userInfo.username,
        fuedScore: userInfo.fuedScore || 0,
        requiredFUED: 100
      });

      setStories(storiesData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostStory = async () => {
    if (!newStoryContent.trim()) return;

    try {
      const newStory = await storyService.createStory(newStoryContent, isAnonPost);
      setStories([newStory, ...stories]);
      setNewStoryContent("");
      setCurrentUser(prev => ({
        ...prev,
        fuedScore: prev.fuedScore + 10
      }));
      toast.success("Đã đăng câu chuyện thành công (+10 FUED)");
    } catch (error) {
      console.error("Failed to post story", error);
      toast.error("Không thể đăng bài. Vui lòng thử lại.");
    }
  };

  const handleLikeStory = async (storyId) => {
    try {
      setStories(stories.map(story => {
        if (story.id === storyId) {
          const newIsLiked = !story.isLiked;
          return {
            ...story,
            isLiked: newIsLiked,
            hearts: newIsLiked ? story.hearts + 1 : story.hearts - 1
          };
        }
        return story;
      }));

      await storyService.likeStory(storyId);
    } catch (error) {
      console.error("Failed to like story", error);
      fetchData();
    }
  };

  const renderAvatar = (avatar) => {
    if (!avatar) return '🌱';
    // Handle legacy bootstrap classes from database
    if (typeof avatar === 'string' && avatar.includes('bi-')) {
      if (avatar.includes('person')) return <User size={24} className="text-success" />;
      if (avatar.includes('incognito')) return <Ghost size={24} className="text-secondary" />;
      if (avatar.includes('lightning')) return <Zap size={24} className="text-warning" />;
      return <Circle size={24} className="text-muted" />;
    }
    return <span className="fs-3">{avatar}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '100px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: softBg, minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', position: 'relative' }}>
      <BackgroundBlobs />
      <div className="container position-relative">
        <div className="row justify-content-center">

          {/* --- CỘT TRÁI: FEED CÂU CHUYỆN --- */}
          <div className="col-lg-7">
            {/* Box Đăng bài */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-5 glass-card mb-5 shadow-sm"
            >
              <div className="d-flex align-items-center mb-4 gap-2">
                <div className="p-2 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, color: brandGreen }}>
                  {isAnonPost ? <Ghost size={22} /> : <User size={22} />}
                </div>
                <span className="fw-bold fs-5" style={{ color: brandGreen }}>
                  {isAnonPost ? 'Đăng bài ẩn danh' : currentUser.name}
                </span>
              </div>
              <textarea
                className="form-control border-0 bg-white bg-opacity-50 rounded-4 p-4 mb-4 shadow-inner"
                rows="3"
                placeholder="Chia sẻ câu chuyện hoặc cảm xúc của bạn..."
                style={{ resize: 'none', color: brandGreen, fontSize: '16px' }}
                value={newStoryContent}
                onChange={(e) => setNewStoryContent(e.target.value)}
              ></textarea>

              <div className="d-flex justify-content-between align-items-center">
                <div className="form-check form-switch custom-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="anonSwitch"
                    checked={isAnonPost}
                    onChange={() => setIsAnonPost(!isAnonPost)}
                  />
                  <label className="form-check-label small fw-medium text-muted ms-2" htmlFor="anonSwitch">🛡️ Chế độ ẩn danh</label>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-dark rounded-pill px-5 py-2 fw-bold shadow-lg d-flex align-items-center gap-2"
                  style={{ backgroundColor: brandGreen, border: 'none' }}
                  onClick={handlePostStory}
                  disabled={!newStoryContent.trim()}
                >
                  Chia sẻ <Send size={18} />
                </motion.button>
              </div>
            </motion.div>

            {/* Danh sách Story */}
            <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: brandGreen }}>
                <Heart size={22} className="text-danger fill-danger" />
                Câu chuyện từ cộng đồng
              </h5>
              <div className="badge rounded-pill bg-white text-muted border py-2 px-3 shadow-xs fw-medium">
                Mới nhất
              </div>
            </div>

            <AnimatePresence>
              {stories.map((story, idx) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-5 glass-card mb-4 card-story hover-lift shadow-sm"
                >
                  <div className="d-flex justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <div className="p-1 rounded-circle border border-2 border-white bg-light me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                        {renderAvatar(story.avatar)}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{story.author}</div>
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <Circle size={4} className="fill-muted" /> {story.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 px-1" style={{ lineHeight: '1.8', color: '#2d3748', whiteSpace: 'pre-wrap', fontSize: '16px' }}>
                    {story.content}
                  </p>

                  <div className="d-flex align-items-center gap-4 border-top pt-4 mt-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="d-flex align-items-center cursor-pointer interaction-item gap-2 px-3 py-2 rounded-pill hover-bg-light"
                      onClick={() => handleLikeStory(story.id)}
                    >
                      <Heart className={`${story.isLiked ? 'text-danger fill-danger' : 'text-muted'}`} size={20} />
                      <span className={`fw-bold ${story.isLiked ? 'text-danger' : 'text-muted'}`}>{story.hearts}</span>
                    </motion.div>

                    <div className={`d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${currentUser.fuedScore < currentUser.requiredFUED ? 'opacity-50' : 'cursor-pointer interaction-item hover-bg-light'}`}>
                      <MessageCircle className="text-muted" size={20} />
                      <span className="fw-bold text-muted">Bình luận</span>
                    </div>
                  </div>

                  {currentUser.fuedScore < currentUser.requiredFUED && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-3 p-3 rounded-4 bg-white bg-opacity-40 text-center border-dashed"
                    >
                      <small className="text-muted d-flex align-items-center justify-content-center gap-2">
                        <Info size={14} className="text-warning" />
                        Cần <strong>{currentUser.requiredFUED} FUED</strong> để thảo luận. (Có: {currentUser.fuedScore})
                      </small>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {stories.length === 0 && (
              <div className="text-center text-muted py-5 glass-card rounded-5 mt-4">
                <div className="mb-3 fs-1">✨</div>
                Chưa có câu chuyện nào. Hãy là người đầu tiên chia sẻ!
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN CÁ NHÂN & QUY TẮC --- */}
          <div className="col-lg-4 mt-5 mt-lg-0 ps-lg-4">
            <div className="sticky-top" style={{ top: '120px' }}>
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-5 glass-card mb-4 shadow-sm text-center border-0 overflow-hidden position-relative"
              >
                <div className="p-4 d-inline-block rounded-circle mb-4 shadow-lg bg-white" style={{ position: 'relative', zIndex: 2 }}>
                  <Zap size={32} color={lightGreen} className="fill-success" style={{ fill: lightGreen }} />
                </div>
                <h6 className="fw-bold text-muted mb-1 text-uppercase tracking-wider">My Power Level</h6>
                <div className="display-4 fw-bold mb-3" style={{ color: brandGreen }}>{currentUser.fuedScore} <small className="fs-5 text-muted">FUED</small></div>

                <div className="px-3">
                  <div className="progress rounded-pill bg-white bg-opacity-50 shadow-inner mb-2" style={{ height: '12px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentUser.fuedScore / currentUser.requiredFUED) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="progress-bar rounded-pill"
                      style={{ backgroundColor: lightGreen }}
                    ></motion.div>
                  </div>
                  <p className="small text-muted fw-medium">
                    + <span className="text-success fw-bold">{Math.max(0, currentUser.requiredFUED - currentUser.fuedScore)}</span> điểm để mở khóa chat
                  </p>
                </div>

                <div className="mt-4 pt-4 border-top text-start px-2">
                  <h6 className="fw-bold small mb-3 text-muted d-flex align-items-center gap-2">
                    <Star size={14} className="text-warning fill-warning" /> Skill Up System
                  </h6>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                    <li className="d-flex align-items-center justify-content-between p-2 rounded-4 bg-white bg-opacity-40 shadow-xs border">
                      <span className="small text-dark fw-medium">📝 Chia sẻ câu chuyện</span>
                      <span className="badge rounded-pill bg-success px-2 py-1">+10</span>
                    </li>
                    <li className="d-flex align-items-center justify-content-between p-2 rounded-4 bg-white bg-opacity-40 shadow-xs border">
                      <span className="small text-dark fw-medium">❤️ Nhận Tim (tym)</span>
                      <span className="badge rounded-pill bg-danger px-2 py-1">+2</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Safe Space Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-5 glass-card shadow-sm border-0"
                style={{ background: `linear-gradient(135deg, #fff, #fff0f0)` }}
              >
                <h6 className="fw-bold fs-6 text-danger d-flex align-items-center mb-3">
                  <Shield size={20} className="me-2" /> Vibe Check
                </h6>
                <p className="mb-0 lh-lg" style={{ fontSize: '13px', color: '#718096' }}>
                  Đây là khoảng trời riêng để bạn trút bỏ muộn phiền. Calmistry <strong>nói không với sự phán xét</strong>. Mọi hành vi làm tổn thương cộng đồng sẽ bị trừ điểm FUED ngay lập tức.
                </p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
                .glass-card { 
                    background: rgba(255, 255, 255, 0.7); 
                    backdrop-filter: blur(14px); 
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-lift:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06) !important;
                    background: rgba(255, 255, 255, 0.9);
                    border-color: #8ec339;
                }
                .hover-bg-light:hover {
                    background-color: rgba(0,0,0,0.05);
                }
                .shadow-inner {
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
                }
                .border-dashed {
                    border: 1px dashed rgba(0,0,0,0.15);
                }
                .custom-switch .form-check-input {
                    width: 3em;
                    height: 1.5em;
                }
                .custom-switch .form-check-input:checked {
                    background-color: ${brandGreen};
                    border-color: ${brandGreen};
                }
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .tracking-wider { letter-spacing: 0.08em; }
                .cursor-pointer { cursor: pointer; }
                .fill-danger { fill: #dc3545; }
                .fill-muted { fill: #6c757d; }
                .fill-warning { fill: #ffc107; }
                .fill-success { fill: #8ec339; }
            `}</style>
    </div>
  );
};

export default ShareStories;
