import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/UserDashboard.css';
// Đảm bảo bạn đã cài: npm install bootstrap-icons hoặc thêm CDN vào index.html
import { useState, useEffect } from 'react';
import fuiedsService from '../../services/fuiedsService';
import userService from '../../services/userService';
import sleepService from '../../services/sleepService';
import journalService from '../../services/journalService';
import { toast } from 'react-toastify';
import {
  Smile, Meh, Frown, Sparkles,
  Moon, Clock, Zap, Book,
  ArrowRight, MoonStar
} from 'lucide-react';
const UserDashboard = () => {
  const navigate = useNavigate();
  const brandGreen = '#324d3e';
  const lightGreen = '#74c655';
  const bgSoft = '#fcfdfd';

  // Stats states
  const [fuiedsScore, setFuiedsScore] = useState(null);
  const [isLoadingFuieds, setIsLoadingFuieds] = useState(true);
  const [fuiedsHistory, setFuiedsHistory] = useState([]);

  const [sleepStats, setSleepStats] = useState(null);
  const [isLoadingSleep, setIsLoadingSleep] = useState(true);

  const [journalStats, setJournalStats] = useState(null);
  const [isLoadingJournal, setIsLoadingJournal] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: "An Nhiên",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    address: "Hà Nội, Việt Nam",
    bio: "Mọi sự thay đổi lớn đều bắt đầu từ những bước chân nhỏ bé nhất.",
    tier: "Gold",
    currentStreak: 0,
    totalPoints: 0,
    email: ""
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...userProfile });

  // Fetch data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Fetch FUIEDS Score & History
      try {
        const fuiedsRes = await fuiedsService.getTodayScore();
        if (fuiedsRes.code === 1000) setFuiedsScore(fuiedsRes.result);

        const historyRes = await fuiedsService.getHistory(7);
        if (historyRes.code === 1000) setFuiedsHistory(historyRes.result);
      } catch (error) {
        console.log('FUIEDS data fetch error');
      } finally {
        setIsLoadingFuieds(false);
      }

      // 2. Fetch Sleep History
      try {
        const sleepData = await sleepService.getSleepHistory(0, 7);
        setSleepStats(sleepData);
      } catch (error) {
        console.error('Error fetching sleep history:', error);
      } finally {
        setIsLoadingSleep(false);
      }

      // 3. Fetch Journal Stats
      try {
        const journalData = await journalService.getStats();
        setJournalStats(journalData);
      } catch (error) {
        console.error('Error fetching journal stats:', error);
      } finally {
        setIsLoadingJournal(false);
      }

      // 4. Fetch User Info
      try {
        const userInfo = await userService.getMyInfo();
        if (userInfo) {
          const points = userInfo.fuedScore || 0;
          let calculatedTier = "Bronze";
          if (points >= 300) calculatedTier = "Gold";
          else if (points >= 100) calculatedTier = "Silver";

          setUserProfile(prev => ({
            ...prev,
            name: userInfo.fullName || userInfo.username,
            email: userInfo.email,
            currentStreak: userInfo.currentStreak || 0,
            totalPoints: points,
            tier: calculatedTier
          }));
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Hàm xác định Icon và Màu sắc dựa trên hạng thành viên
  const getTierDetails = (tier) => {
    switch (tier) {
      // Sử dụng 'bi-trophy-fill' thay cho 'bi-shield-fill'
      case 'Bronze': return { icon: 'bi-trophy-fill', color: '#cd7f32' }; // Cúp Đồng
      case 'Silver': return { icon: 'bi-trophy-fill', color: '#c0c0c0' }; // Cúp Bạc
      case 'Gold': return { icon: 'bi-trophy-fill', color: '#ffd700' };   // Cúp Vàng
      default: return { icon: 'bi-stars', color: lightGreen };
    }
  };

  const currentTier = getTierDetails(userProfile.tier);

  // Hàm lưu thông tin sau khi sửa
  const handleSaveProfile = () => {
    setUserProfile({ ...tempProfile });
    setShowEditModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file là ảnh
      if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn một file ảnh!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Cập nhật ảnh vào tempProfile dưới dạng base64 để xem trước
        setTempProfile({ ...tempProfile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to generate contextual advice based on score
  const getScoreContext = (score) => {
    if (!score) return null;
    const value = Math.round(score.smoothedScore);

    if (value >= 80) {
      return {
        title: "Trạng thái tuyệt vời 🌟",
        message: "Năng lượng của bạn đang rất rực rỡ! Đây là thời điểm tốt để lan tỏa năng lượng tích cực hoặc bắt đầu một dự án mới.",
        actionText: "Chia sẻ câu chuyện",
        actionIcon: "bi-pencil-square",
        actionPath: "https://www.calmistry.blog/shareStories",
        btnColor: "btn-outline-success"
      };
    } else if (value >= 60) {
      return {
        title: "Tâm trạng khá ổn định 🌿",
        message: "Bạn đang giữ được nhịp độ tốt. Hãy tiếp tục duy trì thói quen hiện tại để nuôi dưỡng sự tĩnh tại từ bên trong.",
        actionText: "Nghe nhạc tần số",
        actionIcon: "bi-headphones",
        actionPath: "/relaxation",
        btnColor: "btn-outline-success"
      };
    } else if (value >= 40) {
      return {
        title: "Năng lượng đang chùng xuống 🔋",
        message: "Có vẻ bạn đang mang một chút mệt mỏi hoặc lo âu. Hãy tạm gác lại bộn bề và dành vài phút cho bản thân nhé.",
        actionText: "Vào Hòn đảo Thư giãn",
        actionIcon: "bi-wind",
        actionPath: "/relaxation",
        btnColor: "btn-outline-warning"
      };
    } else {
      return {
        title: "Cần được ôm ấp ngay lúc này 🫂",
        message: "Việc bạn cảm thấy chênh vênh lúc này là hoàn toàn bình thường. Thay vì cố phân tích, hãy xả những muộn phiền đó ra ngoài.",
        actionText: "Sử dụng Máy Hủy Âu Lo",
        actionIcon: "bi-trash2",
        actionPath: "/relaxation",
        btnColor: "btn-outline-danger"
      };
    }
  };

  const scoreContext = getScoreContext(fuiedsScore);

  return (
    <div style={{ backgroundColor: bgSoft, minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px', color: brandGreen }}>
      <div className="container">

        {/* --- HEADER: CHÀO MỪNG --- */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="p-4 p-md-5 rounded-5 shadow-sm position-relative overflow-hidden border-0 bg-white">
              <i className="bi bi-flower1 position-absolute" style={{ right: '-20px', top: '-20px', fontSize: '150px', color: '#f0f7f0', zIndex: 0 }}></i>

              <div className="position-relative d-flex flex-column flex-md-row align-items-center" style={{ zIndex: 1 }}>

                {/* Avatar với nút Thiết lập hồ sơ duy nhất ở đây */}
                <div className="position-relative mb-3 mb-md-0 me-md-4">
                  <img src={userProfile.avatar} alt="Avatar" className="rounded-circle border border-4 border-white shadow-sm" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                  <button
                    onClick={() => { setTempProfile({ ...userProfile }); setShowEditModal(true); }}
                    className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 shadow-sm border action-btn-edit"
                  >
                    <i className="bi bi-pencil-fill text-muted"></i>
                  </button>
                </div>

                <div className="text-center text-md-start">
                  <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                    {/* Icon thay đổi theo hạng kim loại */}
                    <i className={`bi ${currentTier.icon} me-2 fs-4`} style={{ color: currentTier.color }}></i>
                    <span className="fw-bold text-uppercase small tracking-wider" style={{ color: lightGreen }}>Hành trình hôm nay</span>
                  </div>

                  {/* Giữ nguyên câu chào cũ */}
                  <h1 className="display-5 fw-bold mb-1">Chào {userProfile.name}, <br />cứ thong thả thôi.</h1>
                  <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-1"></i>{userProfile.address}</p>

                  {/* Giữ nguyên câu Bio (Twist) cũ */}
                  <p className="lead opacity-75 mb-4 italic" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                    "{userProfile.bio}"
                  </p>

                    <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                      <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center" style={{ backgroundColor: brandGreen }} onClick={() => navigate('/fuieds-quiz')}>
                        <Sparkles size={18} className="me-2" /> Tính điểm FUIEDS Score
                      </button>
                      <button className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center" onClick={() => navigate('/sleepManagement')}>
                        <MoonStar size={18} className="me-2" /> Đánh giá giấc ngủ
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showEditModal && (
          <div className="custom-modal-backdrop">
            <div className="custom-modal-content">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Thiết lập hồ sơ</h4>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>

              {/* Phần tải ảnh đại diện mới */}
              <div className="mb-4 text-center">
                <label className="form-label small fw-bold text-muted d-block mb-3">Ảnh đại diện</label>
                <div className="d-flex justify-content-center">
                  <label htmlFor="avatar-upload" className="avatar-dashed-circle">
                    {tempProfile.avatar ? (
                      <img src={tempProfile.avatar} alt="Preview" className="avatar-preview-img" />
                    ) : (
                      <div className="text-muted d-flex flex-column align-items-center">
                        <i className="bi bi-cloud-arrow-up fs-2"></i>
                        <span style={{ fontSize: '10px' }}>Tải ảnh lên</span>
                      </div>
                    )}
                    {/* Input file ẩn đi */}
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                    <div className="overlay-upload">
                      <i className="bi bi-camera-fill text-white"></i>
                    </div>
                  </label>
                </div>
                <small className="text-muted mt-2 d-block" style={{ fontSize: '11px' }}>
                  Nhấp vào vòng tròn để thay đổi ảnh
                </small>
              </div>

              {/* Sửa Họ và tên */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Họ và tên</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                />
              </div>

              {/* Sửa Địa chỉ */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  placeholder="Ví dụ: Hà Nội, Việt Nam"
                />
              </div>

              <div className="d-grid gap-2">
                <button onClick={handleSaveProfile} className="btn btn-dark rounded-pill py-3 fw-bold" style={{ backgroundColor: brandGreen }}>
                  Lưu thay đổi
                </button>
                <button onClick={() => setShowEditModal(false)} className="btn btn-link text-muted text-decoration-none">
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="row g-4">
          {/* --- CỘT TRÁI: VIẾT NHẬT KÝ (NEW) --- */}
          <div className="col-lg-4">
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0 d-flex flex-column journal-cta-card">
              <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: `${lightGreen}15`, width: 'fit-content' }}>
                <Book size={28} color={brandGreen} />
              </div>
              <h4 className="fw-bold mb-3">Ghi chép tâm hồn</h4>
              <p className="text-muted mb-4 flex-grow-1">
                Ghi lại những suy nghĩ, cảm xúc và khoảnh khắc đáng nhớ trong ngày để thấu hiểu bản thân hơn.
              </p>

              <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Sparkles size={16} color={lightGreen} />
                  <span className="small fw-bold">Gợi ý hôm nay:</span>
                </div>
                <p className="small text-muted mb-0 italic">
                  "Điều gì đã khiến bạn mỉm cười ngày hôm nay?"
                </p>
              </div>

              <button
                onClick={() => navigate('/journal')}
                className="btn btn-dark w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: brandGreen }}
              >
                Viết nhật ký ngay <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* --- CỘT PHẢI: CÁC TIỆN ÍCH KHÁC --- */}
          <div className="col-lg-8">
            <div className="row g-4">

              {/* FUIEDS Score Card */}
              <div className="col-md-7">
                <div className="p-4 rounded-5 shadow-sm border-0 bg-white card-hover">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(50, 77, 62, 0.05)' }}>
                      <i className="bi bi-heart-pulse fs-4" style={{ color: lightGreen }}></i>
                    </div>
                    <div className="text-end">
                      <span className="badge rounded-pill bg-light text-dark border">Hôm nay</span>
                    </div>
                  </div>

                  {isLoadingFuieds ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                    </div>
                  ) : fuiedsScore ? (
                    <div className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0" style={{ color: fuiedsScore.statusColor }}>
                          {scoreContext.title}
                        </h5>
                        <div className="d-flex align-items-baseline gap-2">
                          <span className="display-4 fw-bold lh-1" style={{ color: fuiedsScore.statusColor }}>
                            {Math.round(fuiedsScore.smoothedScore)}
                          </span>
                          <span className="text-muted small">điểm</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-4 mb-auto" style={{ backgroundColor: fuiedsScore.statusColor + '15', borderLeft: `4px solid ${fuiedsScore.statusColor}` }}>
                        <p className="mb-0" style={{ fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.5' }}>
                          "{scoreContext.message}"
                        </p>
                      </div>

                      <hr className="my-3 opacity-10" />

                      <button
                        onClick={() => {
                          if (scoreContext.actionPath.startsWith('http')) {
                            window.open(scoreContext.actionPath, '_blank');
                          } else {
                            navigate(scoreContext.actionPath);
                          }
                        }}
                        className={`btn ${scoreContext.btnColor} w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-2`}
                        style={{ borderWidth: '2px' }}
                      >
                        <i className={`bi ${scoreContext.actionIcon}`}></i>
                        {scoreContext.actionText}
                      </button>
                    </div>
                  ) : (
                    <>
                      <h5 className="fw-bold mb-2">Chưa đánh giá hôm nay</h5>
                      <p className="small text-muted mb-0">
                        Hoàn thành bài đánh giá FUIEDS để theo dõi sức khỏe tinh thần của bạn.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="col-md-5">
                <div className="p-4 rounded-5 shadow-sm border-0 text-white" style={{ backgroundColor: brandGreen }}>
                  <div className="d-flex justify-content-between mb-4">
                    <i className="bi bi-lightning-charge-fill fs-3 text-warning"></i>
                    <i className="bi bi-three-dots"></i>
                  </div>
                  <h2 className="fw-bold mb-0">{userProfile.currentStreak || 0}</h2>
                  <p className="small opacity-75">Ngày duy trì liên tiếp (Streak)</p>
                  <div className="mt-4 p-2 rounded-4 border border-white-50 text-center small">
                    <i className="bi bi-trophy me-2"></i> Nhận huy hiệu mới
                  </div>
                </div>
              </div>

              {/* Exercises Library */}
              <div className="col-12">
                <div
                  className="p-4 rounded-5 shadow-sm border-0 bg-white d-flex align-items-center justify-content-between card-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/relaxation')}
                >
                  <div className="d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#e8f5e9' }}>
                      <i className="bi bi-collection-play text-success fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Kho bài tập thư giãn</h6>
                      <p className="small text-muted mb-0">Hơi thở, Âm nhạc trắng & Podcast chữa lành.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2 small fw-bold d-none d-md-inline">Khám phá</span>
                    <i className="bi bi-arrow-right-circle-fill fs-3 text-success"></i>
                  </div>
                </div>
              </div>

              {/* Community/Support Card */}
              <div className="col-12">
                <div 
                  className="p-4 rounded-5 shadow-sm border-0 bg-white d-flex align-items-center justify-content-between card-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => window.open('https://www.calmistry.blog/shareStories', '_blank')}
                >
                  <div className="d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#fff3cd' }}>
                      <i className="bi bi-chat-heart text-warning fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Cộng đồng Calmistry</h6>
                      <p className="small text-muted mb-0">Kết nối với những người cùng hành trình với bạn.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-chevron-right fs-4 text-muted"></i>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* --- SECTION: THỐNG KÊ SỨC KHỎE (NEW REPLACEMENT) --- */}
        <div className="row mt-5 g-4">
          <div className="col-12">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <Zap size={20} className="me-2" color={lightGreen} /> Chỉ số sức khỏe tinh thần
            </h5>
          </div>

          {/* 1. Thống kê Nhật ký */}
          <div className="col-lg-4">
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0">
              <h6 className="fw-bold mb-4">Tâm trạng (Tháng này)</h6>
              {isLoadingJournal ? (
                <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-success"></div></div>
              ) : journalStats ? (
                <div className="journal-stats-container">
                  <div className="d-flex justify-content-around align-items-end mb-4" style={{ height: '150px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    {[
                      { label: 'Vui', count: journalStats.happyCount, color: lightGreen, icon: <Smile size={14} /> },
                      { label: 'Ổn', count: journalStats.neutralCount, color: '#6b7280', icon: <Meh size={14} /> },
                      { label: 'Buồn', count: journalStats.sadCount, color: '#3b82f6', icon: <Frown size={14} /> }
                    ].map((item, idx) => {
                      const max = Math.max(journalStats.happyCount, journalStats.neutralCount, journalStats.sadCount, 1);
                      const height = (item.count / max) * 100;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <span className="small fw-bold mb-1" style={{ color: item.color }}>{item.count}</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            style={{ width: '30px', backgroundColor: item.color, borderRadius: '6px 6px 0 0', minHeight: item.count > 0 ? '4px' : '0' }}
                          />
                          <div className="mt-2 text-muted" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {item.icon} {item.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 rounded-4" style={{ backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0' }}>
                    <div className="d-flex align-items-center gap-2 mb-2 text-success" style={{ fontSize: '12px', fontWeight: '700' }}>
                      <Sparkles size={14} /> AI Thấu hiểu
                    </div>
                    <p className="small text-muted mb-0 italic" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      {journalStats.aiAnalysis || "Hãy viết thêm nhật ký để AI có thể phân tích tâm trạng của bạn sâu sắc hơn nhé!"}
                    </p>
                  </div>
                </div>
              ) : <p className="small text-muted">Chưa có dữ liệu nhật ký.</p>}
            </div>
          </div>

          {/* 2. Chất lượng giấc ngủ */}
          <div className="col-lg-4">
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0">
              <h6 className="fw-bold mb-4">Chất lượng giấc ngủ (7 ngày)</h6>
              {isLoadingSleep ? (
                <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-success"></div></div>
              ) : sleepStats && sleepStats.sessions?.length > 0 ? (
                <div className="sleep-stats-container">
                  <div className="d-flex justify-content-around align-items-end mb-4" style={{ height: '150px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    {sleepStats.sessions.slice(0, 7).reverse().map((session, idx) => {
                      const height = (session.finalScore100 / 100) * 100;
                      const date = new Date(session.recordDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <span className="mb-1" style={{ fontSize: '9px', fontWeight: 'bold' }}>{Math.round(session.finalScore100)}</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(session.finalScore100 / 100) * 100}%` }}
                            style={{ width: '20px', backgroundColor: brandGreen, borderRadius: '4px 4px 0 0', opacity: 0.8 }}
                          />
                          <span className="mt-2 text-muted" style={{ fontSize: '8px' }}>{date}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-4 bg-light">
                    <div>
                      <div className="small text-muted">Điểm trung bình</div>
                      <div className="fw-bold fs-5 text-success">{Math.round(sleepStats.averageScore || 0)}/100</div>
                      <div 
                        onClick={() => navigate('/sleepManagement')} 
                        className="small text-primary mt-1" 
                        style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
                      >
                        Xem chi tiết
                      </div>
                    </div>
                    <Moon size={24} className="text-muted opacity-50" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="small text-muted mb-3">Chưa có dữ liệu giấc ngủ 7 ngày qua.</p>
                  <button onClick={() => navigate('/sleepManagement')} className="btn btn-sm btn-outline-success rounded-pill px-3">Bắt đầu theo dõi</button>
                </div>
              )}
            </div>
          </div>

          {/* 3. Điểm FUIED Scores */}
          <div className="col-lg-4">
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0">
              <h6 className="fw-bold mb-4">Điểm FUIED Scores (7 ngày)</h6>
              {isLoadingFuieds ? (
                <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-success"></div></div>
              ) : fuiedsHistory && fuiedsHistory.length > 0 ? (
                <div className="fuieds-stats-container">
                  <div className="d-flex justify-content-around align-items-end mb-4" style={{ height: '150px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    {/* Only show 10 sample points to avoid clutter, or a scrollable view */}
                    {fuiedsHistory.slice(0, 10).reverse().map((entry, idx) => {
                      const height = (entry.smoothedScore / 100) * 100;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            style={{ width: '12px', backgroundColor: lightGreen, borderRadius: '10px', opacity: 0.6 }}
                            whileHover={{ opacity: 1, scaleY: 1.1 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="small text-muted">Xu hướng tuần này:</div>
                    <span className="badge rounded-pill bg-success-subtle text-success px-3">Ổn định</span>
                  </div>
                  <p className="small text-muted mt-3 mb-0" style={{ fontSize: '11px' }}>
                    Điểm FUIED phản ánh mức độ cân bằng cảm xúc dựa trên các hoạt động hàng ngày của bạn.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="small text-muted">Chưa có lịch sử điểm FUIED.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;

