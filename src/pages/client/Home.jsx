import React, { useEffect, useState } from 'react';
import moodTracker from "../../assets/moodTracker.jpg";
import moodTracker1 from "../../assets/moodTracker1.jpg";
import blogImg from "../../assets/blogImg.jpg";
import blogImg1 from "../../assets/blogImg1.jpg";
import aiChatBot from "../../assets/aiChatbot.jpg";
import aiChatBot1 from "../../assets/aiChatbot1.jpg";

// Import ảnh mũi tên của bạn
import arrowFirst from "../../assets/arrowfirst.png";

import { motion } from 'framer-motion';
import Joyride, { STATUS } from 'react-joyride';
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
import "../../styles/Home.css";

const Home = () => {
  const brandGreen = '#324d3e';
  const statsBg = '#fcf7f0';
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ ---
  const [runOnboarding, setRunOnboarding] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (runOnboarding) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [runOnboarding]);

  // 🔥 SỬA LỖI: Tự động chạy khi Component Mount
  useEffect(() => {
    const hasSeen = localStorage.getItem('HAS_SEEN_HOME_ONBOARDING');
    if (!hasSeen) {
      // Delay một chút để đảm bảo DOM đã render xong các class target
      const timer = setTimeout(() => {
        setRunOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('HAS_SEEN_HOME_ONBOARDING', 'true');
      setRunOnboarding(false);
    }
  };

  // Cấu hình các bước với ảnh mũi tên của bạn
  const joyrideSteps = [
    {
      target: '.home-hero-text',
      disableBeacon: true,
      placement: 'bottom',
      floaterProps: {
        styles: {
          arrow: {
            display: 'none'
          }
        }
      },
      content: (
        <div
          className="custom-onboarding-content"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            minWidth: '260px'
          }}
        >
          {/* LEFT: Arrow + Text (stack dọc) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginLeft: -450,
              paddingLeft: 0
            }}
          >
            <img
              src={arrowFirst}
              alt="arrow"
              className="onboarding-arrow-animation"
              style={{ width: '120px' }}
            />
            <p className="fw-bold text-white mt-2 mb-0"
              style={{ textAlign: 'left', marginLeft: '-62px', fontFamily: 'Rubik, sans-serif' }}>
              Khám phá ngay!
            </p>

          </div>


        </div>
      ),
    }

  ];

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
        { title: "Chia sẽ câu chuyện của bạn", icon: <Stars />, action: () => navigate("/shareStories") }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 1. JOYRIDE LUÔN Ở TRÊN CÙNG */}
      <Joyride
        steps={joyrideSteps}
        run={runOnboarding}
        continuous={false}

        disableScrolling={true}       // 🔥 KHÔNG CHO JOYRIDE TỰ CUỘN
        scrollToFirstStep={false}    // 🔥 KHÔNG TỰ SCROLL STEP ĐẦU

        disableOverlayClose={false}
        spotlightClicks={true}
        callback={handleJoyrideCallback}
        showSkipButton={false}
        showProgress={false}
        styles={{
          options: {
            zIndex: 100000,
            primaryColor: brandGreen,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
          tooltip: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: 0,
            borderRadius: 0,
            pointerEvents: 'none',
          },
          tooltipContainer: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: 0,
            pointerEvents: 'none',
          },
          tooltipArrow: { display: 'none' },
          buttonNext: { display: 'none' },
          buttonBack: { display: 'none' },
          buttonSkip: { display: 'none' },
        }}
      />




      {/* CSS cho mũi tên nhún nhảy */}
      <style>{`
        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .onboarding-arrow-animation {
          animation: bounceArrow 1.5s infinite;
        }

        .custom-onboarding-content {
          text-align: center;
        }

        .custom-skip-btn {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          margin-top: 6px;
        }

        .custom-skip-btn:hover {
          opacity: 0.8;
        }
      `}</style>


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
                localStorage.setItem('HAS_SEEN_HOME_ONBOARDING', 'true');
                setRunOnboarding(false);
                navigate('/fuieds-quiz');
              }}
              style={{ cursor: 'pointer' }}
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
            { val: 458415597, label: "Số lượng tin nhắn, câu chuyện đã được chia sẻ, blog" },
            { val: 32188, label: "Các nhà trị liệu đủ điều kiện sẵn sàng giúp đỡ" },
            { val: 6150865, label: "Số lượng người đã sử dụng dịch vụ" }
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
                      style={{ color: '#74c655', letterSpacing: '2px', fontSize: '0.85rem' }}>
                      Đội ngũ chuyên gia
                    </span>

                    <h2 className="display-4 mb-4" style={{ color: '#324d3e', lineHeight: '1.2', fontWeight: '600' }}>
                      Chuyên gia trị liệu <br /> bạn có thể tin tưởng.
                    </h2>

                    {/* Chia nhỏ nội dung bằng list để dễ đọc hơn thay vì một đoạn văn dài */}
                    <p className="fs-5 mb-4" style={{ color: '#4a5e54', lineHeight: '1.7', textAlign: 'justify' }}>
                      Kết nối với mạng lưới nhà tư vấn tâm lý có trình độ, giúp bạn vượt qua trầm cảm, lo âu và tìm lại sự cân bằng trong cuộc sống.
                    </p>

                    <ul className="list-unstyled mb-5" style={{ color: '#4a5e54' }}>
                      <li className="mb-2"><i className="bi bi-check2-circle me-2 text-success"></i> Chuyên gia có bằng cấp quốc tế</li>
                      <li className="mb-2"><i className="bi bi-check2-circle me-2 text-success"></i> Bảo mật thông tin tuyệt đối</li>
                      <li className="mb-2"><i className="bi bi-check2-circle me-2 text-success"></i> Thời gian linh hoạt theo ý bạn</li>
                    </ul>

                    <button className="btn-get-matched-refined">
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
                  <div className="img-box doctor-box shadow-sm"><img src="https://images.unsplash.com/photo-1559839734-2b71f1536783?w=300" alt="Doctor" /></div>
                  <div className="illustration-puzzle-box shadow-sm">🧩</div>
                  <div className="shape-dot-green"></div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5">
                <FadeInUp>
                  <h3 className="h3 mb-3" style={{ color: '#324d3e' }}>Tìm kiếm các hoạt động chữa lành phù hợp với bạn.</h3>
                  <p className="text-muted fs-5">Trả lời một vài câu hỏi để xác định điểm tâm lí của bạn trong ngày.</p>
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
                  <div className="laptop-overlay shadow-sm">💻</div>
                  <div className="img-box portrait-box shadow-sm"><img src="https://images.unsplash.com/photo-1548142813-c348350df52b?w=200" alt="Therapist" /></div>
                  <div className="shape-square-teal"></div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5">
                <FadeInUp>
                  <h3 className="h3 mb-3" style={{ color: '#324d3e' }}>Tính điểm chất lượng giấc ngủ của bạn theo chỉ số PSQI</h3>
                  <p className="text-muted fs-5">Việc quản lí chất lượng giấc ngủ ảnh hưởng lớn tới sức khỏe tâm lí của bạn. Việc này sẽ giúp việc xác định điểm tâm lí chuẩn xác hơn.</p>
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
                    <img src="https://images.unsplash.com/photo-1580281658626-ee379f3cce94?w=200" alt="Video" />
                  </div>
                  <div className="shape-rect-orange"></div>
                </div>
              </div>
              <div className="col-lg-6 ps-lg-5">
                <FadeInUp>
                  <h3 className="h3 mb-3" style={{ color: '#324d3e' }}>Giao tiếp và thực hiện các hoạt động chữa lành</h3>
                  <p className="text-muted fs-5">Nhắn tin tới chuyên gia tâm lí bất cứ lúc nào, chia sẻ câu chuyện của riêng bạn, viết nhật kí và nhận những bài biết hay, chất lượng từ các nguồn uy tín.</p>
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
                <p className="text-muted fs-5">Giá cả minh bạch vì sức khỏe tinh thần của bạn</p>
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
                      <span className="text-muted"> / 7 ngày dùng thử</span>
                    </div>
                    <ul className="list-unstyled mb-5">
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-success me-2" /> Daily Mood Tracking</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-success me-2" /> Basic AI Assistant access</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-success me-2" /> Read all Healing Articles</li>
                      <li className="text-muted opacity-50 d-flex align-items-center"><Check2Circle className="me-2" /> 1-on-1 Private Session</li>
                    </ul>
                    <button className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold">Bắt đầu hành trình nào!</button>
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
                      <span className="display-4 fw-bold">$49</span>
                      <span className="opacity-75"> / month</span>
                    </div>
                    <ul className="list-unstyled mb-5">
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> Everything in Silver</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> 2 Private Sessions / month</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> Group Healing Workshops</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-warning me-2" /> Priority Chat Support</li>
                    </ul>
                    <button className="btn btn-light w-100 rounded-pill py-3 fw-bold" style={{ color: brandGreen }}>Bắt đầu ngay</button>
                  </div>
                </FadeInUp>
              </div>

              {/* GÓI KIM CƯƠNG */}
              <div className="col-lg-4">
                <FadeInUp delay={0.3}>
                  <div className="pricing-card diamond-plan h-100 p-5 rounded-5 bg-white shadow-sm border-0 position-relative">
                    <h3 className="h2 fw-bold mb-2">Gói Kim Cương</h3>
                    <div className="price-tag mb-4">
                      <span className="display-4 fw-bold">$99</span>
                      <span className="text-muted"> / month</span>
                    </div>
                    <ul className="list-unstyled mb-5">
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Unlimited Private Sessions</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Personal Care Manager</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> 24/7 Crisis Support</li>
                      <li className="mb-3 d-flex align-items-center"><Check2Circle className="text-primary me-2" /> Family Account (Up to 3)</li>
                    </ul>
                    <button className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold">Nâng cấp lên gói kim cương</button>
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


