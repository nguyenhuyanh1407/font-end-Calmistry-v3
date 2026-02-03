import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SleepResult({ score, sessionData, onDashboard }) {
  const [displayScore, setDisplayScore] = useState(0);

  // Hiệu ứng đếm số chạy từ 0 đến score
  useEffect(() => {
    let start = 0;
    const end = parseInt(score);
    if (start === end) return;

    let timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start === end) clearInterval(timer);
    }, 15);

    return () => clearInterval(timer);
  }, [score]);

  // Phân loại trạng thái & màu sắc dựa trên điểm
  const getStatus = (s) => {
    if (s >= 85) return { color: "#3a5a40", subColor: "#8ec339", icon: "bi-check-circle-fill" };
    if (s >= 70) return { color: "#3a5a40", subColor: "#8ec339", icon: "bi-emoji-smile-fill" };
    if (s >= 50) return { color: "#92400e", subColor: "#f59e0b", icon: "bi-exclamation-circle-fill" };
    return { color: "#991b1b", subColor: "#ef4444", icon: "bi-shield-exclamation" };
  };

  const status = getStatus(score);
  const resultTitle = sessionData?.categoryTitle || (score >= 70 ? "Giấc ngủ khá" : "Cần lưu ý");
  const resultDesc = sessionData?.description || (score >= 70 ? "Bạn ngủ khá tốt, hãy tiếp tục duy trì." : "Bạn đang có dấu hiệu mệt mỏi.");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={containerStyle}
    >
      <header style={{ marginBottom: "20px" }}>
        <span style={labelStyle}>KẾT QUẢ PHÂN TÍCH</span>
      </header>

      {/* Vòng tròn điểm số chính */}
      <div style={scoreCircleWrapper}>
        <svg width="140" height="140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="#f0f3f0" strokeWidth="10" />
          <motion.circle
            cx="70" cy="70" r="60" fill="none"
            stroke={status.subColor}
            strokeWidth="10"
            strokeDasharray="377"
            initial={{ strokeDashoffset: 377 }}
            animate={{ strokeDashoffset: 377 - (377 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div style={scoreTextWrapper}>
          <span style={scoreNumber}>{displayScore}</span>
          <span style={scoreTotal}>/100</span>
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <div style={{ ...statusBadge, backgroundColor: `${status.subColor}20`, color: status.color }}>
          <i className={`bi ${status.icon} me-2`}></i>
          {resultTitle}
        </div>
      </div>

      <div style={insightBox}>
        <p style={insightText}>"{resultDesc}"</p>
      </div>

      {sessionData?.advice && (
        <div style={adviceBox}>
          <div style={adviceHeader}><i className="bi bi-lightbulb-fill me-2"></i>GỢI Ý CHO BẠN</div>
          <p style={adviceText}>{sessionData.advice}</p>
        </div>
      )}

      {/* Chỉ số phụ */}
      <div style={rowStats}>
        <div style={statItem}>
          <span style={statLabel}>Hiệu suất</span>
          <span style={statValue}>{sessionData?.sleepEfficiencyPercent || 85}%</span>
        </div>
        <div style={{ ...statItem, borderLeft: "1px solid #eee", borderRight: "1px solid #eee" }}>
          <span style={statLabel}>Trạng thái</span>
          <span style={statValue}>{sessionData?.status === "EXCELLENT" ? "Tốt" : sessionData?.status === "GOOD" ? "Khá" : "Kém"}</span>
        </div>
        <div style={statItem}>
          <span style={statLabel}>Chỉ số PSQI</span>
          <span style={statValue}>{sessionData?.psqiScore || "-"}</span>
        </div>
      </div>

      <button onClick={onDashboard} style={primaryBtn}>
        Xem Lịch sử chi tiết <i className="bi bi-arrow-right ms-2"></i>
      </button>

      <p style={footerNote}>Kết quả được tính toán theo thuật toán PSQI cải tiến</p>
    </motion.div>
  );
}

const adviceBox = {
  backgroundColor: "#f0fdf4",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "30px",
  textAlign: "left",
  borderLeft: "5px solid #8ec339",
  boxShadow: "0 10px 25px rgba(142, 195, 57, 0.1)"
};

const adviceHeader = {
  fontSize: "13px",
  fontWeight: "800",
  color: "#3a5a40",
  marginBottom: "10px",
  display: "flex",
  alignItems: "center",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const adviceText = {
  fontSize: "14.5px",
  color: "#166534",
  margin: 0,
  lineHeight: "1.6",
  fontWeight: "500",
  fontStyle: "italic"
};

// --- STYLES ---
const containerStyle = {
  background: "#fff",
  borderRadius: "35px",
  padding: "40px 30px",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.05)",
  border: "1px solid #f0f3f0"
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#a0aec0",
  letterSpacing: "2px"
};

const scoreCircleWrapper = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "10px 0"
};

const scoreTextWrapper = {
  position: "absolute",
  display: "flex",
  flexDirection: "column"
};

const scoreNumber = {
  fontSize: "48px",
  fontWeight: "800",
  color: "#3a5a40",
  lineHeight: "1"
};

const scoreTotal = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#cbd5e0"
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 20px",
  borderRadius: "100px",
  fontWeight: "700",
  fontSize: "15px"
};

const insightBox = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "25px"
};

const insightText = {
  fontSize: "14px",
  color: "#4a5568",
  margin: 0,
  lineHeight: "1.6",
  fontStyle: "italic"
};

const rowStats = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "35px",
  padding: "10px 0"
};

const statItem = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "5px"
};

const statLabel = { fontSize: "11px", color: "#a0aec0", fontWeight: "600", textTransform: "uppercase" };
const statValue = { fontSize: "14px", color: "#3a5a40", fontWeight: "700" };

const primaryBtn = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#3a5a40",
  color: "#fff",
  border: "none",
  borderRadius: "18px",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(58, 90, 64, 0.15)",
  transition: "all 0.3s ease"
};

const footerNote = {
  fontSize: "11px",
  color: "#cbd5e0",
  marginTop: "20px",
  fontWeight: "500"
};
