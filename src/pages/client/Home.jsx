import React, { useEffect, useState } from 'react';
import moodTracker from "../../assets/moodTracker.jpg";
import moodTracker1 from "../../assets/moodTracker1.jpg";
import blogImg from "../../assets/blogImg.jpg";
import blogImg1 from "../../assets/blogImg1.jpg";
import aiChatBot from "../../assets/aiChatbot.jpg";
import aiChatBot1 from "../../assets/aiChatbot1.jpg";


import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, PencilSquare, EmojiExpressionless,
  People, ChatDots, Stars,
  Robot, Check2Circle
} from 'react-bootstrap-icons';

import TetSale from "../../components/common/TetSale";
import { useNavigate } from "react-router-dom";
import FadeInUp from "../../components/ui/FadeInUp";
import TherapyCard from "../../components/common/TherapyCard";
import WaveDivider from "../../components/common/WaveDivider";
import StatsSection from "../../components/common/StatsSection";
import GuestOnboarding from "../../components/common/GuestOnboarding";
import userService from "../../services/userService";
import api from "../../services/api";
import "../../styles/Home.css";

const Home = () => {
  const brandGreen = '#324d3e';
  const statsBg = '#fcf7f0';
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ ---
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showGuestTour, setShowGuestTour] = useState(false);


  // 🔥 SỬA LỖI: Tự động chạy khi Component Mount
  useEffect(() => {
    const checkOnboarding = async () => {
      const token = api.getToken();
      console.log('🔍 [Home] Checking onboarding status, token found:', !!token);

      if (token) {
        try {
          const user = await userService.getMyInfo();
          console.log('👤 [Home] User data:', { username: user?.username, isOnboarded: user?.isOnboarded });

          if (user && user.isOnboarded === false) {
            console.log('🚀 [Home] Redirecting to onboarding...');
            navigate('/onboarding');
            return;
          }
        } catch (error) {
          console.error("Failed to fetch user info for onboarding check:", error);
        }
      } else {
        // Guest mode - Check if they should see the tour
        const hasSeenTour = localStorage.getItem('HAS_SEEN_GUEST_TOUR');
        if (!hasSeenTour) {
          setTimeout(() => setShowGuestTour(true), 1500);
        }
      }

    };

    checkOnboarding();
  }, [navigate]);

  const handleOnboardingStepChange = (stepIndex) => {
    // Tự động mở card tương ứng khi đến các bước liên quan
    if (stepIndex >= 1 && stepIndex <= 4) {
      setExpandedIndex(0);
    } else if (stepIndex >= 5 && stepIndex <= 8) {
      setExpandedIndex(1);
    } else if (stepIndex >= 9 && stepIndex <= 10) {
      setExpandedIndex(2);
    } else {
      setExpandedIndex(null);
    }
  };


  const therapyTypes = [
    {
      title: "Hoạt động chữa lành",
      desc: "Hãy làm điều gì đó thú vị nào",
      bgColor: "#325343",
      textColor: "#e0f2f1",
      img: moodTracker,
      activeImg: moodTracker1,
      subOptions: [
        { title: "Blog chữa lành", icon: <Book />, action: () => navigate("/blog") },
        { title: "Viết nhật kí", icon: <PencilSquare />, action: () => navigate("/journal") },
        { title: "Điểm chất lượng giấc ngủ", icon: <EmojiExpressionless />, action: () => navigate("/sleepManagement") }
      ]
    },
    {
      title: "Cộng đồng",
      desc: "Chia sẻ câu chuyện của bạn",
      bgColor: "#83a6ad",
      textColor: "#1a2e35",
      img: blogImg,
      activeImg: blogImg1,
      subOptions: [
        { title: "Đặt lịch tham gia workshop", icon: <People />, action: () => navigate("/workshops") },
        { title: "Nhóm chat chữa lành", icon: <ChatDots />, action: () => navigate("/group-chat") },
        { title: "Chia sẻ câu chuyện của bạn", icon: <Stars />, action: () => navigate("/shareStories") }
      ]
    },
    {
      title: "Kết nối",
      desc: "Cá nhân hóa bạn đồng hành",
      bgColor: "#bb722b",
      textColor: "#ffffff",
      img: aiChatBot,
      activeImg: aiChatBot1,
      subOptions: [
        { title: "AI cá nhân hóa", icon: <Robot />, action: () => navigate("/ai-chat") },
      ]
    }
  ];

  const guestTourSteps = [
    {
      target: '.home-hero-text',
      title: 'Chào mừng bạn đến với Calmistry',
      content: 'Nơi bạn tìm thấy sự bình yên và hỗ trợ cho sức khỏe tinh thần của mình. Hãy bắt đầu hành trình chữa lành ngay hôm nay.'
    },
    {
      target: '.therapy-card-0', // Bước này giới thiệu tổng quan và mở card
      title: 'Hoạt động chữa lành',
      content: 'Khám phá các phương pháp tự chữa lành đa dạng dành riêng cho bạn.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-0-0',
      title: 'Blog chữa lành',
      content: 'Đọc các bài viết chuyên sâu về tâm lý và các câu chuyện truyền cảm hứng để vỗ về tâm hồn.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-0-1',
      title: 'Viết nhật kí',
      content: 'Ghi lại những cảm xúc trong ngày để thấu hiểu bản thân hơn từng chút một.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-0-2',
      title: 'Chất lượng giấc ngủ',
      content: 'Theo dõi và cải thiện giấc ngủ - chìa khóa cho một tinh thần minh mẫn và khỏe mạnh.',
      placement: 'bottom'
    },
    {
      target: '.therapy-card-1',
      title: 'Cộng đồng',
      content: 'Chia sẻ và kết nối với những người cùng chí hướng trong không gian an toàn.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-1-0',
      title: 'Workshop',
      content: 'Tham gia các buổi thảo luận và đào tạo trực tiếp cùng chuyên gia.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-1-1',
      title: 'Nhóm chat',
      content: 'Thảo luận và nhận hỗ trợ tức thì từ cộng đồng những người đồng hành.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-1-2',
      title: 'Chia sẻ câu chuyện',
      content: 'Kể lại hành trình của bạn để truyền cảm hứng và nhận lại sự thấu cảm.',
      placement: 'bottom'
    },
    {
      target: '.therapy-card-2',
      title: 'Kết nối',
      content: 'Cá nhân hóa hành trình của bạn với công nghệ AI tiên tiến.',
      placement: 'bottom'
    },
    {
      target: '.sub-card-item-2-0',
      title: 'AI cá nhân hóa',
      content: 'Trò chuyện với AI được huấn luyện riêng để thấu hiểu trạng thái tâm lý của bạn.',
      placement: 'bottom'
    },
    {
      target: '.ai-chat-fab',
      title: 'Trợ lý AI 24/7',
      content: 'Bất cứ lúc nào bạn cần, AI của chúng tôi luôn sẵn sàng lắng nghe và phản hồi ngay lập tức.',
      placement: 'top'
    },
    {
      target: '.therapist-image-grid',
      title: 'Chuyên gia tin cậy',
      content: 'Kết nối với mạng lưới nhà tư vấn tâm lý có trình độ, giúp bạn vượt qua lo âu và tìm lại sự cân bằng.'
    },
    {
      target: '#pricing-section',
      title: 'Lựa chọn gói hội viên',
      content: 'Chọn gói dịch vụ phù hợp nhất với nhu cầu của bạn để tận hưởng đầy đủ các tiện ích chăm sóc sức khỏe.',
      placement: 'bottom'
    },
    {
      target: '.login-target',
      title: 'Bắt đầu ngay',
      content: 'Đăng nhập ngay để bắt đầu hành trình chữa lành và khám phá đầy đủ các tính năng tuyệt vời của Calmistry!',
      placement: 'bottom'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 1. GUEST ONBOARDING */}
      {showGuestTour && (
        <GuestOnboarding 
          steps={guestTourSteps} 
          onComplete={() => setShowGuestTour(false)} 
          onStepChange={handleOnboardingStepChange}
          onFinish={() => {
            setShowGuestTour(false);
            localStorage.setItem('HAS_SEEN_GUEST_TOUR', 'true');
            navigate('/login');
          }}
        />
      )}






      <div style={{ backgroundColor: brandGreen, overflowX: 'hidden' }}>
        <section className="container py-5 text-white" style={{ position: 'relative', zIndex: 1 }}>
          <header className="text-center mb-5" style={{ paddingTop: '80px' }}>
            <h1 className="display-3 fw-normal mb-3">
              Mọi người đều xứng đáng được hạnh phúc.
            </h1>
            {/* THÊM CLASS ĐÚNG TARGET */}
            <p
              className="fs-4 opacity-75 home-hero-text d-inline-block"
              onClick={() => {
                navigate('/fuieds-quiz');
              }}
              style={{ cursor: 'pointer', fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: '0.5px' }}
            >

              Hãy để chúng tôi giúp bạn tìm ra phương pháp chữa lành phù hợp với bản thân mình!
            </p>
          </header>

          <div className="row g-4 justify-content-center mt-2">
            {therapyTypes.map((item, index) => (
              <TherapyCard
                key={index}
                item={item}
                index={index}
                expandedIndex={expandedIndex}
                hoveredIndex={hoveredIndex}
                onToggle={(i) => setExpandedIndex(expandedIndex === i ? null : i)}
                onMouseEnter={setHoveredIndex}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </div>
        </section>

        <WaveDivider fillColor="#74c655" statsBg={statsBg} />
        <StatsSection
          stats={[
            "Calmistry – Bạn đồng hành số cho sức khỏe tinh thần.",
            "Lắng nghe không phán xét.",
            "Bảo mật tuyệt đối.",
            "Hỗ trợ mọi lúc, mọi nơi."
          ]}
          statsBg={statsBg}
          brandGreen={brandGreen}
        />

        <div style={{ backgroundColor: '#fcf7f0', lineHeight: 0, width: '100%' }}>
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '80px', display: 'block' }}
          >
            {/* Vẽ một đường cong nhẹ với màu của Section bên dưới (#fefaf6) */}
            <path
              d="M0,0 Q720,100 1440,0 L1440,100 L0,100 Z"
              fill="#fefaf6"
            />
          </svg>
        </div>
        {/* 4. SECTION: THERAPIST GRID (Giao diện ảnh bác sĩ) */}
        <section style={{ backgroundColor: '#fefaf6', padding: '80px 0' }}>
          <div className="container">
            <div className="row align-items-center">

              {/* CỘT TRÁI: NỘI DUNG TEXT */}
              <div className="col-lg-6 mb-5 mb-lg-0">
                <FadeInUp>
                  <div className="pe-lg-5">
                    {/* Badge nhỏ tạo điểm nhấn chuyên nghiệp */}
                    <span className="text-uppercase fw-bold mb-3 d-inline-block"
                      style={{ color: '#74c655', letterSpacing: '2px', fontSize: '0.85rem', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      Đội ngũ chuyên gia
                    </span>

                    <h2 className="display-4 mb-4" style={{ color: '#324d3e', lineHeight: '1.2', fontWeight: '600', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      Chuyên gia trị liệu <br /> bạn có thể tin tưởng.
                    </h2>

                    {/* Chia nhỏ nội dung bằng list để dễ đọc hơn thay vì một đoạn văn dài */}
                    <p className="fs-5 mb-4" style={{ color: '#4a5e54', lineHeight: '1.7', textAlign: 'justify', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      Kết nối với mạng lưới nhà tư vấn tâm lý có trình độ, giúp bạn vượt qua trầm cảm, lo âu và tìm lại sự cân bằng trong cuộc sống.
                    </p>

                    <ul className="list-unstyled mb-5" style={{ color: '#4a5e54', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      <li className="mb-2" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}><i className="bi bi-check2-circle me-2 text-success"></i> Chuyên gia có bằng cấp quốc tế</li>
                      <li className="mb-2" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}><i className="bi bi-check2-circle me-2 text-success"></i> Bảo mật thông tin tuyệt đối</li>
                      <li className="mb-2" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}><i className="bi bi-check2-circle me-2 text-success"></i> Thời gian linh hoạt theo ý bạn</li>
                    </ul>

                    <button className="btn-get-matched-refined" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      Tìm người trị liệu phù hợp
                    </button>
                  </div>
                </FadeInUp>
              </div>

              {/* CỘT PHẢI: CỤM ẢNH BÁC SĨ (ORGANIC SHAPES) */}
              <div className="col-lg-6">
                <div className="therapist-image-grid">
                  {/* Ảnh chính giữa */}
                  <div className="img-wrapper main-img shadow-sm">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Therapist" />
                    {/* Icon tia sáng vẽ tay */}
                    <div className="accent-sparkle"></div>
                  </div>

                  {/* Các ảnh nhỏ xung quanh */}
                  <div className="img-wrapper sub-img top-left shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200"
                      alt="Therapist 1"
                    />
                  </div>
                  <div className="img-wrapper sub-img top-right shadow-sm">
                    <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200" alt="Therapist" />
                  </div>
                  <div className="img-wrapper sub-img bottom-left shadow-sm">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200" alt="Therapist" />
                  </div>
                  <div className="img-wrapper sub-img bottom-center shadow-sm">
                    <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200" alt="Therapist" />
                  </div>
                  <div className="img-wrapper sub-img bottom-right shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200" alt="Therapist" />
                    {/* Icon lò xo vẽ tay */}
                    <div className="accent-swirl"></div>
                  </div>
                </div>
              </div>



            </div>
          </div>
        </section>


        {/* 5. SECTION: HOW IT WORKS (UNIFIED FLOW) */}
        <section style={{ backgroundColor: '#ffffff', padding: '100px 0', position: 'relative' }}>
          {/* Đường kẻ trang trí góc trên */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '35%', height: '8px', backgroundColor: '#74c655', borderRadius: '0 0 0 10px' }}></div>

          <div className="container">
            {/* Tiêu đề chính của khối */}
            <div className="text-center mb-5">
              <FadeInUp>
                <h2 className="display-6 fw-normal" style={{ color: '#2d4337' }}>Cách thức chúng tôi hoạt động</h2>
              </FadeInUp>
            </div>

            {/* BƯỚC 1: GET MATCHED */}
            <div className="row align-items-center how-it-works-step">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="step-collage collage-1">
                  <div className="shape-semi-orange-top"></div>
                  <div className="img-box woman-box shadow-sm"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300" alt="User" /></div>
                  <div className="img-box doctor-box shadow-sm"><img src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Doctor" /></div>
                  <div className="illustration-puzzle-box shadow-sm">🧩</div>
                  <div className="shape-dot-green"></div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5">
                <FadeInUp>
                  <h3 className="h3 mb-3" style={{ color: '#324d3e' }}>Tìm kiếm các hoạt động chữa lành phù hợp với bạn.</h3>
                  <p className="text-muted fs-5" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Trả lời một vài câu hỏi để xác định điểm tâm lí của bạn trong ngày.</p>
                </FadeInUp>
              </div>
            </div>

            {/* MŨI TÊN KẾT NỐI 1-2 */}
            <div className="step-connector">
              <div className="bouncing-arrow">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 13l5 5 5-5M12 18V6" />
                </svg>
              </div>
            </div>

            {/* BƯỚC 2: COMMUNICATE */}
            <div className="row align-items-center how-it-works-step">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="step-collage collage-2">
                  <div className="shape-half-yellow"></div>
                  <div className="img-box man-tablet-box shadow-sm"><img src="https://images.unsplash.com/photo-1552581234-26160f608093?w=400" alt="Session" /></div>
                  <div className="laptop-overlay shadow-sm"><i className="bi bi-moon-stars-fill text-primary fs-2"></i></div>
                  <div className="img-box portrait-box shadow-sm"><img src="https://images.unsplash.com/photo-1548142813-c348350df52b?w=200" alt="Therapist" /></div>
                  <div className="shape-square-teal"></div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5">
                <FadeInUp>
                  <h3 className="h3 mb-3" style={{ color: '#324d3e' }}>Tính điểm chất lượng giấc ngủ của bạn theo chỉ số PSQI</h3>
                  <p className="text-muted fs-5" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Việc quản lí chất lượng giấc ngủ ảnh hưởng lớn tới sức khỏe tâm lí của bạn. Việc này sẽ giúp việc xác định điểm tâm lí chuẩn xác hơn.</p>
                </FadeInUp>
              </div>
            </div>

            {/* MŨI TÊN KẾT NỐI 2-3 */}

            <div className="step-connector">
              <div className="bouncing-arrow">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 13l5 5 5-5M12 18V6" />
                </svg>
              </div>
            </div>

            {/* BƯỚC 3: WHEN YOU NEED IT */}
            <div className="row align-items-center how-it-works-step">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="step-collage collage-3">
                  <div className="shape-circle-green-bg"></div>
                  <div className="phone-frame phone-1 shadow-lg">
                    <div className="chat-demo"><span>Hi!</span><span className="alt">I'm here.</span></div>
                  </div>
                  <div className="phone-frame phone-2 shadow-lg">
                    <img src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=800&auto=format&fit=crop" alt="Video" />
                  </div>
                  <div className="shape-rect-orange"></div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5">
                <FadeInUp>
                  <h3 className="h3 mb-3" style={{ color: '#324d3e' }}>Giao tiếp và thực hiện các hoạt động chữa lành</h3>
                  <p className="text-muted fs-5" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Nhắn tin tới chuyên gia tâm lí bất cứ lúc nào, chia sẻ câu chuyện của riêng bạn, viết nhật kí và nhận những bài biết hay, chất lượng từ các nguồn uy tín.</p>
                </FadeInUp>
              </div>
            </div>
          </div>
        </section>

        {/* CHÈN ĐƯỜNG WAVE VÀO ĐÂY */}
        <div style={{ backgroundColor: '#ffffff', lineHeight: 0, width: '100%' }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: '70px', display: 'block' }}>
            <path d="M0,0 C480,80 960,80 1440,0 L1440,100 L0,100 Z" fill="#fcf7f0" />
          </svg>
        </div>

        {/* 6. SECTION: PRICING / MEMBERSHIP PLANS */}
        <section id="pricing-section" style={{ backgroundColor: '#fcf7f0', padding: '100px 0' }}>
          <div className="container">
            <div className="text-center mb-5">
              <FadeInUp>
                <h2 className="display-5 fw-normal mb-3" style={{ color: '#324d3e' }}>Chọn hành trình chữa lành của riêng bạn</h2>
                <p className="text-muted fs-5" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Giá cả minh bạch vì sức khỏe tinh thần của bạn</p>
              </FadeInUp>
            </div>

            <div className="row g-4">
              {/* GÓI BẠC */}
              <div className="col-lg-4">
                <FadeInUp delay={0.1}>
                  <div className="pricing-card silver-plan h-100 p-5 rounded-5 bg-white shadow-sm border-0 position-relative overflow-hidden">
                    <div className="plan-badge">Phổ biến nhất cho người mới bắt đầu!</div>
                    <h3 className="h2 fw-bold mb-2">Gói Bạc</h3>
                    <div className="price-tag mb-4">
                      <span className="display-4 fw-bold">Miễn phí</span>
                      <span className="text-muted"><br /> <br /> / 7 ngày dùng thử</span> <br /><br />
                    </div>
                    <ul className="list-unstyled mb-5">
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-success me-2" /> Theo dõi tâm trạng hàng ngày</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-success me-2" /> Truy cập AI trợ lý cơ bản</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-success me-2" /> Đọc tất cả bài viết chữa lành</li>
                      <li className="text-muted opacity-50 d-flex align-items-center"><Check2Circle className="me-2" /> Buổi tư vấn riêng 1-1</li>
                    </ul>
                    <button className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Bắt đầu hành trình nào!</button>
                  </div>
                </FadeInUp>
              </div>

              {/* GÓI VÀNG */}
              <div className="col-lg-4">
                <FadeInUp delay={0.2}>
                  <div className="pricing-card gold-plan h-100 p-5 rounded-5 text-white shadow-lg border-0 position-relative" style={{ backgroundColor: brandGreen }}>
                    <div className="popular-ribbon">Khuyến nghị</div>
                    <h3 className="h2 fw-bold mb-2">Gói Vàng</h3>
                    <div className="price-tag mb-4">
                      <span className="display-4 fw-bold">49.000 VNĐ</span>
                      <span className="opacity-75"> / tháng</span>
                    </div>
                    <ul className="list-unstyled mb-5">
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> Tất cả tính năng gói Bạc</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> 2 buổi tư vấn riêng / tháng</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> Workshop chữa lành nhóm</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> Hỗ trợ chat ưu tiên</li>
                    </ul>
                    <button className="btn btn-light w-100 rounded-pill py-3 fw-bold" style={{ color: brandGreen, fontFamily: "'Be Vietnam Pro', sans-serif" }}>Bắt đầu ngay</button>
                  </div>
                </FadeInUp>
              </div>

              {/* GÓI KIM CƯƠNG */}
              <div className="col-lg-4">
                <FadeInUp delay={0.3}>
                  <div className="pricing-card diamond-plan h-100 p-5 rounded-5 bg-white shadow-sm border-0 position-relative">
                    <h3 className="h2 fw-bold mb-2">Gói Kim Cương</h3>
                    <div className="price-tag mb-4">
                      <span className="display-4 fw-bold">99.000 VNĐ</span>
                      <span className="text-muted"> / tháng</span>
                    </div>
                    <ul className="list-unstyled mb-5">
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Buổi tư vấn riêng không giới hạn</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Quản lý chăm sóc cá nhân</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Hỗ trợ khẩn cấp 24/7</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Tài khoản gia đình (Tối đa 3 người)</li>
                    </ul>
                    <button className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Nâng cấp lên gói kim cương</button>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CHÈN SECTION TẾT VÀO ĐÂY */}
        <TetSale />
      </div>
    </motion.div>

  );
};

export default Home;


