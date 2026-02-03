import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  {
    id: 1,
    text: "Trong 7 ngày gần nhất, bạn thường ngủ được bao nhiêu giờ mỗi đêm?",
    icon: "bi-moon-stars",
    options: [
      { label: "≥ 8 giờ", point: 10 },
      { label: "7–8 giờ", point: 7 },
      { label: "6–7 giờ", point: 4 },
      { label: "< 6 giờ", point: 1 }
    ]
  },
  {
    id: 2,
    text: "Bạn mất bao lâu để đi vào giấc ngủ sau khi lên giường?",
    icon: "bi-clock-history",
    options: [
      { label: "< 15 phút", point: 10 },
      { label: "15 - 30 phút", point: 7 },
      { label: "30 - 60 phút", point: 4 },
      { label: "> 60 phút", point: 1 }
    ]
  },
  {
    id: 3,
    text: "Bạn có thức dậy giữa đêm hoặc dậy sớm hơn dự định không?",
    icon: "bi-bell",
    options: [
      { label: "Hiếm khi / không", point: 10 },
      { label: "1 - 2 lần/tuần", point: 7 },
      { label: "3 - 4 lần/tuần", point: 4 },
      { label: "Gần như mỗi đêm", point: 1 }
    ]
  },
  {
    id: 4,
    text: "Bạn tự đánh giá chất lượng giấc ngủ của mình là:",
    icon: "bi-star",
    options: [
      { label: "Rất tốt", point: 10 },
      { label: "Khá tốt", point: 7 },
      { label: "Khá tệ", point: 4 },
      { label: "Rất tệ", point: 1 }
    ]
  },
  {
    id: 5,
    text: "Ban ngày bạn có gặp khó khăn trong học tập, làm việc hoặc sinh hoạt do buồn ngủ không?",
    icon: "bi-brightness-high",
    options: [
      { label: "Không", point: 10 },
      { label: "Hơi ảnh hưởng", point: 7 },
      { label: "Ảnh hưởng rõ", point: 4 },
      { label: "Ảnh hưởng nghiêm trọng", point: 1 }
    ]
  },
  {
    id: 6,
    text: "Trong tháng vừa rồi, bạn có sử dụng thuốc để dễ ngủ hơn không?",
    icon: "bi-capsule",
    options: [
      { label: "Không", point: 10 },
      { label: "< 1 lần/tuần", point: 7 },
      { label: "1–2 lần/tuần", point: 4 },
      { label: "≥ 3 lần/tuần", point: 1 }
    ]
  },
  {
    id: 7,
    text: "Môi trường ngủ của bạn (ánh sáng - tiếng ồn - nhiệt độ):",
    icon: "bi-house-heart",
    options: [
      { label: "Rất phù hợp", point: 10 },
      { label: "Chấp nhận được", point: 7 },
      { label: "Thường xuyên gây khó ngủ", point: 4 },
      { label: "Rất khó chịu, hay làm tỉnh giấc", point: 1 }
    ]
  },
  {
    id: 8,
    text: "Khi nằm trên giường, đầu bạn thường đang...",
    icon: "bi-chat-dots",
    options: [
      { label: "Đầu óc nhẹ nhõm, chỉ chờ cơn buồn ngủ", point: 10 },
      { label: "Nghĩ vu vơ vài chuyện trong ngày", point: 7 },
      { label: "Nghĩ đi nghĩ lại chuyện đã qua/việc ngày mai", point: 4 },
      { label: "Overthinking, trằn trọc khó ngủ", point: 1 }
    ]
  },
  {
    id: 9,
    text: "Nếu đêm đó ngủ kém, sáng hôm sau bạn thường:",
    icon: "bi-sunrise",
    options: [
      { label: "Vẫn ổn, chỉ hơi buồn ngủ", point: 10 },
      { label: "Cần cafein mới tỉnh táo", point: 7 },
      { label: "Dễ cáu, khó tập trung", point: 4 },
      { label: "Mọi thứ đều nặng nề hơn bình thường", point: 1 }
    ]
  }
];

export default function SleepQuiz({ answers, onAnswer, onSubmit, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const brandGreen = "#3a5a40";
  const lightGreen = "#8ec339";

  const handleOptionClick = (qId, point) => {
    onAnswer(qId, point);
    // Tự động chuyển trang sau 300ms để người dùng thấy kịp phản hồi click
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div style={quizWrapper}>
      {/* Header & Progress */}
      <div style={quizHeader}>
        <button onClick={currentStep === 0 ? onBack : () => setCurrentStep(currentStep - 1)} style={backBtnStyle}>
          <i className={`bi ${currentStep === 0 ? "bi-x-lg" : "bi-chevron-left"}`}></i>
        </button>
        <div style={progressContainer}>
          <div style={{ ...progressFill, width: `${progress}%` }}></div>
        </div>
        <span style={stepIndicator}>{currentStep + 1}/{QUESTIONS.length}</span>
      </div>

      {/* Nội dung câu hỏi với hiệu ứng trượt */}
      <div style={{ position: "relative", minHeight: "380px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: "center", marginBottom: "35px" }}>
              <div style={iconCircle}>
                <i className={`bi ${QUESTIONS[currentStep].icon}`} style={{ fontSize: "28px", color: brandGreen }}></i>
              </div>
              <h4 style={questionTextStyle}>{QUESTIONS[currentStep].text}</h4>
            </div>

            <div style={optionsList}>
              {QUESTIONS[currentStep].options.map((opt) => {
                const isSelected = answers[QUESTIONS[currentStep].id] === opt.point;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleOptionClick(QUESTIONS[currentStep].id, opt.point)}
                    style={{
                      ...optionBtnStyle,
                      border: isSelected ? `2px solid ${lightGreen}` : "1.5px solid #f0f3f0",
                      backgroundColor: isSelected ? "#f9fcf9" : "#fff",
                      color: isSelected ? brandGreen : "#4a5568",
                    }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: isSelected ? "700" : "500" }}>{opt.label}</span>
                    {isSelected && <i className="bi bi-check-circle-fill" style={{ color: lightGreen }}></i>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nút Hoàn thành - Chỉ hiện ở câu cuối */}
      {currentStep === QUESTIONS.length - 1 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={submitBtnStyle}
          disabled={!answers[QUESTIONS[currentStep].id]}
          onClick={onSubmit}
        >
          Hoàn thành & Xem kết quả
        </motion.button>
      )}
    </div>
  );
}

// --- STYLES ---

const quizWrapper = {
  background: "#ffffff",
  borderRadius: "32px",
  padding: "30px",
  boxShadow: "0 15px 45px rgba(0,0,0,0.05)",
  border: "1px solid #f0f3f0"
};

const quizHeader = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  marginBottom: "40px"
};

const backBtnStyle = {
  border: "none",
  background: "#f4f7f5",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3a5a40",
  cursor: "pointer"
};

const progressContainer = {
  flex: 1,
  height: "6px",
  backgroundColor: "#edf2f7",
  borderRadius: "10px",
  overflow: "hidden"
};

const progressFill = {
  height: "100%",
  backgroundColor: "#8ec339",
  transition: "width 0.4s ease"
};

const stepIndicator = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#a0aec0",
  minWidth: "30px"
};

const iconCircle = {
  width: "60px",
  height: "60px",
  backgroundColor: "#f4f7f5",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px"
};

const questionTextStyle = {
  color: "#3a5a40",
  fontWeight: "800",
  fontSize: "20px",
  lineHeight: "1.4",
  margin: "0"
};

const optionsList = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const optionBtnStyle = {
  width: "100%",
  padding: "18px 20px",
  borderRadius: "18px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  textAlign: "left"
};

const submitBtnStyle = {
  marginTop: "30px",
  width: "100%",
  padding: "16px",
  backgroundColor: "#3a5a40",
  color: "#fff",
  border: "none",
  borderRadius: "18px",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(58, 90, 64, 0.2)"
};