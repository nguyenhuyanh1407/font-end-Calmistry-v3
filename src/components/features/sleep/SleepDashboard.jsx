import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sleepService from "../../../services/sleepService";

export default function SleepDashboard({ isLoggedIn = true }) {
  const [mode, setMode] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyData, setHistoryData] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [showDetail, setShowDetail] = useState(false);

  // Màu sắc thương hiệu
  const brandGreen = "#3a5a40";
  const lightGreen = "#8ec339";
  const softYellow = "#f59e0b";

  useEffect(() => {
    fetchSleepHistory();
  }, []);

  const fetchSleepHistory = async () => {
    try {
      setLoading(true);
      const result = await sleepService.getSleepHistory(0, 30);
      setHistoryData(result);
    } catch (e) {
      console.error("Error fetching sleep history:", e);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayData = () => {
    if (!historyData || !historyData.sessions || historyData.sessions.length === 0) {
      return { data: [], labels: [] };
    }
    const sessions = historyData.sessions;
    if (mode === "day") {
      return { data: [sessions[0].finalScore100], labels: ["Hôm nay"] };
    } else if (mode === "week") {
      const weekSessions = sessions.slice(0, 7).reverse();
      return { data: weekSessions.map(s => s.finalScore100), labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].slice(0, weekSessions.length) };
    } else {
      const monthSessions = sessions.slice(0, 30).reverse();
      return { data: monthSessions.map(s => s.finalScore100), labels: monthSessions.map((_, i) => i + 1) };
    }
  };

  const getEvaluation = (score) => {
    if (score >= 85) return { text: "Tuyệt vời! Cơ thể bạn đang được phục hồi tối đa.", color: lightGreen, icon: "🔥" };
    if (score >= 65) return { text: "Khá ổn, nhưng hãy thử đi ngủ sớm hơn 15p xem sao.", color: softYellow, icon: "✨" };
    return { text: "Báo động! Bạn đang 'nợ' giấc ngủ quá nhiều rồi đấy.", color: "#ef4444", icon: "⚠️" };
  };

  const { data, labels } = getDisplayData();
  const currentLevel = historyData?.sessions?.[0]?.finalScore100 || 0;
  const evalInfo = getEvaluation(currentLevel);

  return (
    <div style={dashboardWrapper}>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" role="status"></div></div>
      ) : error ? (
        <div style={errorCard}>{error}</div>
      ) : !historyData || historyData.sessions.length === 0 ? (
        <div style={emptyState}>
          <i className="bi bi-moon-stars" style={{ fontSize: '48px', color: brandGreen }}></i>
          <h5 className="mt-3">Chưa có "vibe" giấc ngủ nào</h5>
          <p className="small opacity-50">Làm quiz ngay để bắt đầu hành trình!</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* 👈 CỘT TRÁI: SCORE GAUGE & BÁO CÁO CHI TIẾT */}
          <div className="col-lg-5">
            <div style={glassCard}>
              <div style={segmentedControl}>
                {["day", "week", "month"].map((v) => (
                  <button key={v} onClick={() => setMode(v)} style={{
                    ...tabBtn,
                    backgroundColor: mode === v ? "#ffffff" : "transparent",
                    color: mode === v ? brandGreen : "#718096",
                    boxShadow: mode === v ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                  }}>
                    {v === "day" ? "Ngày" : v === "week" ? "Tuần" : "Tháng"}
                  </button>
                ))}
              </div>

              <div className="d-flex flex-column align-items-center py-4">
                <div style={gaugeCircle}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#edf2f7" strokeWidth="6" />
                    <motion.circle
                      cx="50" cy="50" r="45" fill="none" stroke={evalInfo.color} strokeWidth="8"
                      strokeDasharray="283"
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 283 - (283 * currentLevel) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={gaugeText}>
                    <span style={{ fontSize: '36px', fontWeight: '900', color: brandGreen }}>{currentLevel}</span>
                    <span style={{ fontSize: '13px', opacity: 0.6, fontWeight: '700' }}>Sleep Vibe</span>
                  </div>
                </div>

                <div className="mt-4 w-100 text-center">
                  <h5 className="fw-bold mb-2">{currentLevel >= 80 ? 'Perfect Chill 🌿' : 'Need More Rest 😴'}</h5>
                  <p className="small opacity-75 px-3">{evalInfo.text}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetail(!showDetail)}
                style={detailToggleBtn}
              >
                {showDetail ? 'Thu gọn báo cáo' : 'Phân tích thông minh (AI Integration)'}
                <i className={`bi bi-chevron-${showDetail ? 'up' : 'down'} ms-2`}></i>
              </motion.button>

              <AnimatePresence>
                {showDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={reportCard}>
                      <div style={reportContent}>
                        <p style={{ fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                          AI Calmistry nhận thấy: Giấc ngủ của bạn có sự biến thiên <b>{Math.max(...data) - Math.min(...data)}%</b>.
                          {currentLevel > 80 ? " Thói quen đi ngủ đúng giờ đang giúp nhịp sinh học của bạn rất ổn định." : " Hãy hạn chế tối đa ánh sáng xanh 30p trước khi ngủ nhé."}
                        </p>
                      </div>
                      <div style={miniChartWrapper}>
                        {data.map((v, i) => (
                          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${v}%` }}
                              style={{ width: '10px', borderRadius: '4px', backgroundColor: v > 70 ? lightGreen : brandGreen, opacity: 0.8 }}
                            >
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 👉 CỘT PHẢI: STATS, TIPS & CHALLENGES */}
          <div className="col-lg-7">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div style={miniGlassCard}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="small fw-bold opacity-50">Chuỗi ngày (Streak)</span>
                    <div style={iconBadge}><i className="bi bi-lightning-charge-fill"></i></div>
                  </div>
                  <div className="d-flex align-items-end gap-2">
                    <span className="display-5 fw-bold text-success m-0">5</span>
                    <span className="small fw-bold opacity-50 pb-2">Ngày</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div style={miniGlassCard}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="small fw-bold opacity-50">Trung bình tuần</span>
                    <div style={{ ...iconBadge, backgroundColor: brandGreen + '15', color: brandGreen }}><i className="bi bi-bar-chart-fill"></i></div>
                  </div>
                  <div className="d-flex align-items-end gap-2">
                    <span className="display-5 fw-bold m-0" style={{ color: brandGreen }}>{Math.round(historyData.averageScore)}</span>
                    <span className="small fw-bold opacity-50 pb-2">Điểm</span>
                  </div>
                </div>
              </div>
            </div>

            <h6 style={sectionHeader}><i className="bi bi-stars text-warning me-2"></i>AI Personalized Tips</h6>
            <div className="row g-3 mb-4">
              {[
                { title: "Âm thanh", desc: "Lo-fi 432Hz tốt cho trí não.", icon: "bi-music-note-beamed", col: "#4a90e2" },
                { title: "Môi trường", desc: "Nhiệt độ 25°C là tối ưu.", icon: "bi-thermometer-half", col: "#8ec339" },
                { title: "Cơ thể", desc: "Uống một ngụm nước ấm.", icon: "bi-droplet", col: "#ef4444" }
              ].map((tip, idx) => (
                <div key={idx} className="col-md-4">
                  <motion.div whileHover={{ y: -5 }} style={{ ...tipGlassCard, borderTop: `4px solid ${tip.col}` }}>
                    <div style={{ ...tipIcon, backgroundColor: tip.col + '15', color: tip.col }}>
                      <i className={tip.icon}></i>
                    </div>
                    <div className="fw-bold small mb-1">{tip.title}</div>
                    <div className="opacity-60" style={{ fontSize: '11px', lineHeight: '1.4' }}>{tip.desc}</div>
                  </motion.div>
                </div>
              ))}
            </div>

            <h6 style={sectionHeader}><i className="bi bi-check2-circle text-primary me-2"></i>Thử thách phục hồi</h6>
            <div style={challengeGridWrapper}>
              {[
                { id: 'water', label: 'Uống nước', icon: 'bi-cup-straw', desc: 'Sáng tỉnh giấc' },
                { id: 'stretch', label: 'Giãn cơ', icon: 'bi-person-walking', desc: '3 phút mỗi tối' },
                { id: 'read', label: 'Đọc sách', icon: 'bi-book', desc: 'Không dùng đt' }
              ].map(c => {
                const isDone = completedChallenges.includes(c.id);
                return (
                  <motion.div
                    key={c.id}
                    onClick={() => setCompletedChallenges(prev => isDone ? prev.filter(i => i !== c.id) : [...prev, c.id])}
                    style={{ ...challengeGlassCard, border: isDone ? `2px solid ${lightGreen}` : '1.5px solid transparent' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ ...challengeIcon, backgroundColor: isDone ? lightGreen : '#f1f5f9', color: isDone ? '#fff' : '#64748b' }}>
                        <i className={c.icon}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className={`fw-bold small ${isDone ? 'text-success' : ''}`}>{c.label}</div>
                        <div className="opacity-50" style={{ fontSize: '10px' }}>{c.desc}</div>
                      </div>
                      {isDone && <i className="bi bi-patch-check-fill text-success" style={{ fontSize: '20px' }}></i>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {completedChallenges.length === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={successMessageCard}
                >
                  <div style={successHeader}>🎇 Thật tuyệt vời! 🎇</div>
                  <p style={successBody}>
                    Bạn đã hoàn thành tất cả thử thách trong ngày. Hãy tiếp tục giữ vững "vibe" này nhé!
                  </p>
                  <button onClick={() => window.location.href = '/userDashboard'} style={goToDashboardBtn}>
                    Trở về Dashboard <i className="bi bi-house-star ms-1"></i>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// 💄 PREMIUM DASHBOARD STYLES (Grid & Glassmorphism)
const dashboardWrapper = { paddingBottom: '40px' };

const glassCard = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '32px',
  padding: '28px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
};

const miniGlassCard = {
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '24px',
  padding: '20px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  height: '100%'
};

const tipGlassCard = {
  background: '#ffffff',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
  height: '100%',
  cursor: 'pointer',
  transition: 'transform 0.2s ease'
};

const challengeGlassCard = {
  background: '#ffffff',
  borderRadius: '20px',
  padding: '16px',
  marginBottom: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const iconBadge = {
  width: '36px', height: '36px', borderRadius: '12px',
  backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
};

const tipIcon = {
  width: '38px', height: '38px', borderRadius: '12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '18px', marginBottom: '12px'
};

const challengeIcon = {
  width: '44px', height: '44px', borderRadius: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '20px'
};

const segmentedControl = { display: "flex", backgroundColor: "rgba(226, 232, 240, 0.5)", padding: "4px", borderRadius: "16px", marginBottom: "20px" };
const tabBtn = { flex: 1, border: "none", padding: "10px", borderRadius: "14px", fontSize: "14px", fontWeight: "700", transition: "all 0.3s ease", cursor: "pointer" };
const gaugeCircle = { width: '180px', height: '180px', position: 'relative' };
const gaugeText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const detailToggleBtn = { width: '100%', padding: '16px', background: 'rgba(58, 90, 64, 0.05)', border: '1px dashed #3a5a40', borderRadius: '20px', color: '#3a5a40', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginTop: '20px' };
const reportCard = { marginTop: '20px', padding: '16px', backgroundColor: '#f9fcf9', borderRadius: '20px', border: '1px solid rgba(142,195,57,0.2)' };
const reportContent = { fontSize: '13px', color: '#3a5a40' };
const miniChartWrapper = { display: 'flex', gap: '6px', height: '50px', marginTop: '20px', alignItems: 'flex-end', padding: '0 5px' };
const sectionHeader = { fontSize: '17px', fontWeight: '800', color: '#3a5a40', margin: '15px 0 15px' };
const challengeGridWrapper = { display: 'flex', flexDirection: 'column' };
const successMessageCard = { marginTop: '25px', padding: '24px', background: 'linear-gradient(135deg, #3a5a40 0%, #588157 100%)', borderRadius: '28px', color: '#fff', textAlign: 'center', boxShadow: '0 20px 40px rgba(58, 90, 64, 0.3)' };
const successHeader = { fontSize: '20px', fontWeight: '900', marginBottom: '10px' };
const successBody = { fontSize: '14px', opacity: 0.9, marginBottom: '20px' };
const goToDashboardBtn = { padding: '12px 30px', backgroundColor: '#fff', color: '#3a5a40', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' };
const errorCard = { padding: '30px', backgroundColor: '#fff', borderRadius: '24px', color: '#ef4444', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const emptyState = { padding: '60px', backgroundColor: '#fff', borderRadius: '32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const chatBubble = { backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '13px', textAlign: 'left', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' };
