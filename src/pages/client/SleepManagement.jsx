import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CheckInCard from "../../components/features/sleep/CheckInCard";
import SleepQuiz from "../../components/features/sleep/SleepQuiz";
import SleepResult from "../../components/features/sleep/SleepResult";
import SleepDashboard from "../../components/features/sleep/SleepDashboard";
import sleepService from "../../services/sleepService";

export default function SleepManagement() {
  const location = useLocation();
  const [step, setStep] = useState(location.state?.step || "checkin");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState(null);

  // Question ID to question code mapping
  const QUESTION_CODE_MAP = {
    1: "Q1_DURATION",
    2: "Q2_LATENCY",
    3: "Q3_WAKE_FREQ",
    4: "Q4_QUALITY",
    5: "Q5_DAYTIME",
    6: "Q6_MEDS",
    7: "Q7_ENV",
    8: "Q8_THOUGHTS",
    9: "Q9_MORNING"
  };

  // Tự động cuộn lên đầu khi chuyển bước
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleAnswer = (qId, point) => {
    setAnswers(prev => ({ ...prev, [qId]: point }));
  };

  const calculateScore = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      // Map answers to backend format
      const answersList = Object.entries(answers)
        .filter(([qId]) => QUESTION_CODE_MAP[qId]) // Chỉ gửi những câu có mapping
        .map(([qId, point]) => ({
          questionCode: QUESTION_CODE_MAP[qId],
          answerValue: String(point)
        }));

      // Submit to backend
      const result = await sleepService.submitSleepQuiz({
        recordDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        answers: answersList
      });

      // Update state with backend response
      setSessionData(result);
      setScore(result?.finalScore100 || 0);
      setStep("result");
    } catch (e) {
      console.error("Error submitting sleep quiz:", e);
      const errorMessage = e?.data?.message || e?.message || "Không thể lưu kết quả. Vui lòng thử lại.";
      setError(errorMessage);

      // Still show result with local calculation if backend fails
      const total = Object.values(answers).reduce((a, b) => a + b, 0);
      const calculatedScore = Math.round((total / (Object.keys(QUESTION_CODE_MAP).length * 10)) * 100);
      setScore(Math.min(100, calculatedScore));
      setStep("result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Trang trí nền để tạo cảm giác Calmistry */}
      <div style={circleLeft}></div>
      <div style={circleRight}></div>

      <div className="container-fluid" style={{ maxWidth: 1200, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            {step === "checkin" && (
              <div className="d-flex justify-content-center">
                <div style={{ maxWidth: 480, width: '100%' }}>
                  <CheckInCard onStart={() => setStep("quiz")} />
                </div>
              </div>
            )}

            {step === "quiz" && (
              <div className="d-flex justify-content-center">
                <div style={{ maxWidth: 600, width: '100%' }}>
                  <SleepQuiz
                    answers={answers}
                    onAnswer={handleAnswer}
                    onSubmit={calculateScore}
                    onBack={() => setStep("checkin")}
                    loading={loading}
                  />
                </div>
              </div>
            )}

            {step === "result" && (
              <div className="d-flex justify-content-center">
                <div style={{ maxWidth: 480, width: '100%' }}>
                  {error && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '12px',
                      color: '#856404',
                      fontSize: '14px',
                      marginBottom: '16px',
                      fontWeight: '500'
                    }}>
                      ⚠️ {error}
                    </div>
                  )}
                  <SleepResult
                    score={score}
                    sessionData={sessionData}
                    onDashboard={() => setStep("dashboard")}
                  />
                </div>
              </div>
            )}

            {step === "dashboard" && <SleepDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Styles cho Main Container (Nâng cấp giao diện rộng & Aesthetic)
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f8faf9',
  padding: '120px 20px 80px', // Tránh Header
  position: 'relative',
  overflow: 'hidden',
  fontFamily: "'Be Vietnam Pro', sans-serif"
};

const circleLeft = {
  position: 'absolute', top: '5%', left: '-100px', width: '400px', height: '400px',
  borderRadius: '50%', background: 'radial-gradient(circle, rgba(142, 195, 57, 0.15) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0
};

const circleRight = {
  position: 'absolute', bottom: '10%', right: '-100px', width: '500px', height: '500px',
  borderRadius: '50%', background: 'radial-gradient(circle, rgba(58, 90, 64, 0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(80px)', zIndex: 0
};
