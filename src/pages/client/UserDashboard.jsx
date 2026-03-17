import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/UserDashboard.css';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GuestOnboarding from '../../components/common/GuestOnboarding';
import fuiedsService from '../../services/fuiedsService';
import userService from '../../services/userService';
import api from '../../services/api';
import fileService from '../../services/fileService';
import sleepService from '../../services/sleepService';
import journalService from '../../services/journalService';
import analytics from '../../utils/analytics';
import { toast } from 'react-toastify';
import workshopService from '../../services/workshopService';
import {
  Smile, Meh, Frown, Sparkles,
  Moon, Clock, Zap, Book,
  ArrowRight, MoonStar, Gift
} from 'lucide-react';
const UserDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = api.getToken();
  const authKey = token ? token.slice(-16) : 'anon';
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
    name: "",
    avatar: "",
    address: "",
    phoneNumber: "",
    bio: "Mọi sự thay đổi lớn đều bắt đầu từ những bước chân nhỏ bé nhất.",
    tier: "Bronze",
    currentStreak: 0,
    totalPoints: 0,
    spinBalance: 0,
    email: ""
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true);

  const [tempProfile, setTempProfile] = useState({ ...userProfile });

  // --- ONBOARDING TOUR ---
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenDashboardTour = localStorage.getItem('HAS_SEEN_DASHBOARD_TOUR');
    if (!hasSeenDashboardTour) {
      // Chờ 1.5s để trang load xong trước khi hiển thị tour
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dashboardTourSteps = [
    {
      target: '.tour-welcome-card',
      title: 'Chào mừng bạn đến Dashboard! 🎉',
      content: 'Đây là trung tâm điều khiển cá nhân của bạn. Tại đây bạn có thể xem tổng quan sức khỏe tinh thần và quản lý hồ sơ.',
      placement: 'bottom'
    },
    {
      target: '.tour-edit-profile',
      title: 'Thiết lập hồ sơ cá nhân ✏️',
      content: 'Nhấn vào biểu tượng bút chì để thay đổi ảnh đại diện, tên, địa chỉ và số điện thoại của bạn.',
      placement: 'right'
    },
    {
      target: '.tour-btn-fuieds',
      title: 'Tính điểm FUIEDS Score ✨',
      content: 'FUIEDS đánh giá sức khỏe tinh thần qua 6 yếu tố: F (Familiarity – quen thuộc), U (Utility – hữu ích), I (Interest – hứng thú), E (Emotion – cảm xúc), D (Desire – mong muốn), S (Shareability – lan truyền). Hãy làm bài đánh giá hàng ngày!',
      placement: 'bottom'
    },
    {
      target: '.tour-btn-sleep',
      title: 'Đánh giá giấc ngủ (PSQI) 🌙',
      content: 'PSQI (Pittsburgh Sleep Quality Index) là thang đo chuẩn trong tâm lý học và y học, đánh giá chất lượng giấc ngủ của bạn trong 1 tháng gần nhất. Nhấn để bắt đầu kiểm tra!',
      placement: 'bottom'
    },
    {
      target: '.tour-fuieds-card',
      title: 'Điểm FUIEDS hôm nay 💚',
      content: 'Sau khi hoàn thành bài đánh giá, điểm số và lời khuyên sẽ hiển thị tại đây. AI sẽ gợi ý hành động phù hợp với trạng thái của bạn.',
      placement: 'bottom'
    },
    {
      target: '.tour-journal-card',
      title: 'Ghi chép tâm hồn 📖',
      content: 'Viết nhật ký mỗi ngày để giải tỏa cảm xúc. AI sẽ phân tích và đưa ra lời khuyên hữu ích cho bạn!',
      placement: 'right'
    },
    {
      target: '.tour-health-stats',
      title: 'Tổng quan chỉ số sức khỏe 📊',
      content: 'Khu vực này tổng hợp toàn bộ dữ liệu: tâm trạng, giấc ngủ và điểm FUIED theo tuần/tháng giúp bạn hiểu rõ bản thân hơn.',
      placement: 'top'
    },
    {
      target: '.tour-relaxation',
      title: 'Kho bài tập thư giãn 🧘',
      content: 'Khám phá bài tập hít thở, âm nhạc trắng và podcast chữa lành. Đây là nơi bạn "sạc pin" cho tâm hồn mỗi ngày!',
      placement: 'top'
    },
    {
      target: '.tour-journal-stats',
      title: 'Thống kê tâm trạng 😊',
      content: 'Biểu đồ tâm trạng theo tháng giúp bạn nhìn lại cảm xúc qua từng giai đoạn. AI sẽ phân tích xu hướng và đưa ra nhận xét riêng cho bạn.',
      placement: 'bottom'
    },
    {
      target: '.tour-sleep-stats',
      title: 'Chất lượng giấc ngủ 🌙',
      content: 'Biểu đồ 7 ngày gần nhất cho thấy chất lượng giấc ngủ của bạn. Nhấn "Xem chi tiết" để xem báo cáo đầy đủ hơn.',
      placement: 'bottom'
    },
    {
      target: '.tour-fuieds-stats',
      title: 'Lịch sử điểm FUIEDS 📈',
      content: 'Theo dõi xu hướng điểm sức khỏe tinh thần theo tuần. Điểm ổn định hoặc tăng dần là dấu hiệu rất tích cực!',
      placement: 'bottom'
    }
  ];

  // Sử dụng React Query để lấy user info (cùng queryKey ['me'] với Header)
  const { data: currentUser } = useQuery({
    queryKey: ['me', authKey],
    queryFn: userService.getMyInfo,
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
    retry: false,
  });

  const effectivePlan = (() => {
    if (!currentUser) return 'SILVER';
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : Array.from(currentUser.roles || []);
    const hasGoldRole = roles.some((r) => ['ADMIN', 'EXPERT', 'ROLE_ADMIN', 'ROLE_EXPERT'].includes(String(r).toUpperCase()));
    if (hasGoldRole) return 'GOLD';
    const plan = String(currentUser.plan || '').toUpperCase();
    return plan === 'GOLD' ? 'GOLD' : 'SILVER';
  })();
  const planLabel = effectivePlan === 'GOLD' ? 'Gói Vàng' : 'Gói Bạc';
  const planTrophyColor = effectivePlan === 'GOLD' ? '#d4af37' : '#bfc5cc';

  // Khi currentUser thay đổi, cập nhật userProfile
  useEffect(() => {
    if (currentUser) {
      console.log('📋 Dashboard received user data:', currentUser);
      const points = currentUser.fuedScore || 0;
      let calculatedTier = "Bronze";
      if (points >= 300) calculatedTier = "Gold";
      else if (points >= 100) calculatedTier = "Silver";

      setUserProfile(prev => ({
        ...prev,
        name: currentUser.fullName || currentUser.username || prev.name,
        email: currentUser.email || prev.email,
        avatar: currentUser.avatarUrl || prev.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        phoneNumber: currentUser.phoneNumber || "",
        address: currentUser.address || prev.address || "Hà Nội, Việt Nam",
        currentStreak: currentUser.currentStreak || 0,
        totalPoints: points,
        spinBalance: currentUser.spinBalance ?? 0,
        tier: calculatedTier
      }));
    }
  }, [currentUser]);

  // Fetch các dữ liệu khác (FUIEDS, Sleep, Journal)
  useEffect(() => {
    const fetchOtherData = async () => {
      // 1. Fetch FUIEDS Score & History
      try {
        const fuiedsRes = await fuiedsService.getTodayScore();
        if (fuiedsRes.code === 1000) setFuiedsScore(fuiedsRes.result);

        const historyRes = await fuiedsService.getHistory(30);
        if (historyRes.code === 1000) setFuiedsHistory(historyRes.result);
      } catch (error) {
        console.log('FUIEDS data fetch error:', error);
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

      // 4. Fetch My Vouchers
      try {
        const vouchersRes = await workshopService.getMyVouchers();
        if (vouchersRes.code === 1000) setMyVouchers(vouchersRes.result);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      } finally {
        setIsLoadingVouchers(false);
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
    };

    fetchOtherData();
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
  const handleSaveProfile = async () => {
    try {
      const updateData = {
        fullName: tempProfile.name,
        phoneNumber: tempProfile.phoneNumber,
        address: tempProfile.address,
        avatarUrl: tempProfile.avatar
      };
      
      const updatedUser = await userService.updateProfile(updateData);
      
      if (updatedUser) {
        setUserProfile({ 
          ...tempProfile,
          name: updatedUser.fullName || updatedUser.username,
          phoneNumber: updatedUser.phoneNumber || "",
          address: updatedUser.address || tempProfile.address,
          avatar: updatedUser.avatarUrl || tempProfile.avatar
        });
        // Invalidate cache để Header cũng cập nhật tên mới
        queryClient.invalidateQueries({ queryKey: ['me'] });
        toast.success("Cập nhật thông tin thành công! ✨");
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn một file ảnh!");
        return;
      }

      try {
        // Tải ảnh lên ngay để lấy URL
        const uploadedUrl = await fileService.upload(file);
        if (uploadedUrl) {
          setTempProfile({ ...tempProfile, avatar: uploadedUrl });
          toast.success("Tải ảnh lên thành công! 📸");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
      }
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
            <div className="p-4 p-md-5 rounded-5 shadow-sm position-relative overflow-hidden border-0 bg-white tour-welcome-card">
              <i className="bi bi-flower1 position-absolute" style={{ right: '-20px', top: '-20px', fontSize: '150px', color: '#f0f7f0', zIndex: 0 }}></i>

              <div className="position-relative d-flex flex-column flex-md-row align-items-center" style={{ zIndex: 1 }}>

                {/* Avatar với nút Thiết lập hồ sơ duy nhất ở đây */}
                <div className="position-relative mb-3 mb-md-0 me-md-4">
                  <img src={userProfile.avatar} alt="Avatar" className="rounded-circle border border-4 border-white shadow-sm" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                  <button
                    onClick={() => { setTempProfile({ ...userProfile }); setShowEditModal(true); }}
                    className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 shadow-sm border action-btn-edit tour-edit-profile"
                  >
                    <i className="bi bi-pencil-fill text-muted"></i>
                  </button>
                </div>

                <div className="text-center text-md-start">
                  <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                    {/* Icon thay đổi theo hạng kim loại */}
                    <span className="fw-bold text-uppercase small tracking-wider" style={{ color: lightGreen }}>Hành trình hôm nay</span>
                    <div className="d-flex align-items-center gap-2 ms-3">
                      <i className="bi bi-trophy-fill" style={{ color: planTrophyColor }}></i>
                      <span className="fw-semibold small" style={{ color: planTrophyColor }}>{planLabel}</span>
                    </div>
                  </div>

                  {/* Giữ nguyên câu chào cũ */}
                  <h1 className="display-5 fw-bold mb-1">Chào {userProfile.name}, <br />cứ thong thả thôi.</h1>
                  <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-1"></i>{userProfile.address}</p>

                  {/* Giữ nguyên câu Bio (Twist) cũ */}
                  <p className="lead opacity-75 mb-4 italic" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                    "{userProfile.bio}"
                  </p>

                    <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                      <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center tour-btn-fuieds" style={{ backgroundColor: brandGreen }} onClick={() => {
                        analytics.logEvent('Dashboard', 'click', 'calculate_fuieds_click');
                        navigate('/fuieds-quiz');
                      }}>
                        <Sparkles size={18} className="me-2" /> Tính điểm FUIEDS Score
                      </button>
                      <button className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center tour-btn-sleep" onClick={() => {
                        analytics.logEvent('Dashboard', 'click', 'evaluate_sleep_click');
                        window.open('https://www.calmistry.blog/sleepManagement', '_blank');
                      }}>
                        <MoonStar size={18} className="me-2" /> Đánh giá giấc ngủ
                      </button>
                      <button className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center btn-lucky-slot" onClick={() => {
                         analytics.logEvent('Dashboard', 'click', 'lucky_slot_click');
                         navigate('/lucky-slot');
                      }}>
                        <Gift size={18} className="me-2" /> Lucky Slot ({userProfile.spinBalance})
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
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  placeholder="Ví dụ: Hà Nội, Việt Nam"
                />
              </div>

              {/* Sửa Số điện thoại */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={tempProfile.phoneNumber}
                  onChange={(e) => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })}
                  placeholder="Ví dụ: 0912345678"
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
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0 d-flex flex-column journal-cta-card tour-journal-card">
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
                <div className="p-4 rounded-5 shadow-sm border-0 bg-white card-hover tour-fuieds-card">
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
                  className="p-4 rounded-5 shadow-sm border-0 bg-white d-flex align-items-center justify-content-between card-hover tour-relaxation"
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


                      {/* Vouchers/Offers Card */}
              <div className="col-12 mt-4">
                <div className="p-4 rounded-5 shadow-sm border-0 bg-white">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(116, 198, 85, 0.1)' }}>
                      <Gift size={24} className="text-success" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Ưu đãi của tôi</h5>
                      <p className="small text-muted mb-0">Các Voucher giảm giá bạn đã thắng được từ Lucky Slot.</p>
                    </div>
                  </div>

                  {isLoadingVouchers ? (
                    <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-success"></div></div>
                  ) : myVouchers.length > 0 ? (
                    <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {myVouchers.map((v, idx) => (
                        <div key={idx} className="p-3 rounded-4 border d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f9f9fafb' }}>
                          <div>
                            <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.9rem' }}>{v.title}</h6>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge rounded-pill bg-success-subtle text-success px-2 py-1" style={{ fontSize: '9px' }}>
                                {v.discountType === 'PERCENTAGE' ? `${v.discountValue}% OFF` : `${v.discountValue.toLocaleString()}đ OFF`}
                              </span>
                              <span className={`badge rounded-pill px-2 py-1 ${v.status === 'UNUSED' ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '9px' }}>
                                {v.status === 'UNUSED' ? 'Chưa dùng' : 'Đã dùng'}
                              </span>
                            </div>
                          </div>
                          
                          {v.status === 'UNUSED' && (
                            <div className="d-flex align-items-center gap-1 bg-white rounded-pill p-1 border">
                              <span className="small font-monospace fw-bold text-success px-2" style={{ fontSize: '0.8rem' }}>{v.code}</span>
                              <button 
                                className="btn btn-sm btn-success rounded-pill px-2 fw-bold" 
                                style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                                onClick={() => {
                                  navigator.clipboard.writeText(v.code);
                                  toast.success("📋 Đã sao chép mã Voucher!");
                                }}
                              >
                                Copy
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="small text-muted mb-0">Bạn chưa có voucher nào. Hãy thử vận may tại <strong style={{ cursor: 'pointer', color: '#74c655' }} onClick={() => navigate('/lucky-slot')}>Lucky Slot</strong>!</p>
                    </div>
                  )}
                </div>
              </div>

        {/* --- SECTION: THỐNG KÊ SỨC KHỎE (NEW REPLACEMENT) --- */}
        <div className="row mt-5 g-4 tour-health-stats">
          <div className="col-12">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <Zap size={20} className="me-2" color={lightGreen} /> Chỉ số sức khỏe tinh thần
            </h5>
          </div>

          {/* 1. Thống kê Nhật ký */}
          <div className="col-lg-4">
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0 tour-journal-stats">
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
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0 tour-sleep-stats">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0">Chất lượng giấc ngủ (7 ngày)</h6>
                <span 
                  onClick={() => navigate('/sleepManagement', { state: { step: 'dashboard' } })} 
                  className="small text-primary fw-bold" 
                  style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
                >
                  Xem chi tiết
                </span>
              </div>
              {isLoadingSleep ? (
                <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-success"></div></div>
              ) : sleepStats && sleepStats.sessions?.length > 0 ? (
                <div className="sleep-stats-container">
                  <div className="d-flex justify-content-around align-items-end mb-4" style={{ height: '150px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    {sleepStats.sessions.slice(0, 7).reverse().map((session, idx) => {
                      const scoreValue = session.finalScore100 || 0;
                      // Use a safe height calculation: 70% of 150px = 105px max height for bars
                      const barHeight = Math.max(2, (scoreValue / 100) * 105);
                      const date = new Date(session.recordDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                          <span className="mb-1" style={{ fontSize: '9px', fontWeight: 'bold', color: brandGreen }}>{Math.round(scoreValue)}</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${barHeight}px` }}
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
                    </div>
                    <Moon size={24} className="text-muted opacity-50" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="small text-muted mb-0">Chưa có dữ liệu giấc ngủ 7 ngày qua.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Điểm FUIED Scores */}
          <div className="col-lg-4">
            <div className="p-4 rounded-5 bg-white shadow-sm h-100 border-0 tour-fuieds-stats">
              <h6 className="fw-bold mb-4">Điểm FUIED Scores (7 ngày)</h6>
              {isLoadingFuieds ? (
                <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-success"></div></div>
              ) : fuiedsHistory && fuiedsHistory.length > 0 ? (
                <div className="fuieds-stats-container">
                  <div className="d-flex justify-content-around align-items-end mb-4" style={{ height: '150px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    {/* Only show 10 sample points to avoid clutter, or a scrollable view */}
                    {fuiedsHistory.slice(0, 7).reverse().map((entry, idx) => {
                      const scoreValue = entry.smoothedScore || 0;
                      const barHeight = Math.max(2, (scoreValue / 100) * 105);
                      const date = new Date(entry.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                          <span className="mb-1" style={{ fontSize: '9px', fontWeight: 'bold', color: lightGreen }}>{Math.round(scoreValue)}</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${barHeight}px` }}
                            style={{ width: '12px', backgroundColor: lightGreen, borderRadius: '10px', opacity: 0.6 }}
                            whileHover={{ opacity: 1, scaleY: 1.1 }}
                          />
                          <span className="mt-2 text-muted" style={{ fontSize: '8px' }}>{date}</span>
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

      {/* --- ONBOARDING TOUR --- */}
      {showTour && (
        <GuestOnboarding
          steps={dashboardTourSteps}
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('HAS_SEEN_DASHBOARD_TOUR', 'true');
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;

