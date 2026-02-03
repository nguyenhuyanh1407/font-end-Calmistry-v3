import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CheckInCard from "../../components/features/sleep/CheckInCard";
import SleepQuiz from "../../components/features/sleep/SleepQuiz";
import SleepResult from "../../components/features/sleep/SleepResult";
import SleepDashboard from "../../components/features/sleep/SleepDashboard";
import sleepService from "../../services/sleepService";

export default function SleepManagement() {
  const [step, setStep] = useState("checkin");
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

  const handleAnswer = (qId, point) => {
    setAnswers({ ...answers, [qId]: point });
  };

  const calculateScore = async () => {
    setLoading(true);
    setError("");

    try {
      // Map answers to backend format
      const answersList = Object.entries(answers).map(([qId, point]) => ({
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
      setScore(result.finalScore100);
      setStep("result");
    } catch (e) {
      console.error("Error submitting sleep quiz:", e);
      const errorMessage = e?.data?.message || e?.message || "Không thể lưu kết quả. Vui lòng thử lại.";
      setError(errorMessage);

      // Still show result with local calculation if backend fails
      const total = Object.values(answers).reduce((a, b) => a + b, 0);
      setScore(Math.min(100, total));
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

      <div className="container" style={{ maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {step === "checkin" && (
              <CheckInCard onStart={() => setStep("quiz")} />
            )}

            {step === "quiz" && (
              <SleepQuiz
                answers={answers}
                onAnswer={handleAnswer}
                onSubmit={calculateScore}
                onBack={() => setStep("checkin")}
                loading={loading}
              />
            )}

            {step === "result" && (
              <>
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
              </>
            )}

            {step === "dashboard" && <SleepDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Styles cho Main Container
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f4f7f5',
  padding: '140px 20px 80px', // Tránh Header
  position: 'relative',
  overflow: 'hidden',
  fontFamily: "'Be Vietnam Pro', sans-serif"
};

const circleLeft = {
  position: 'absolute', top: '10%', left: '-50px', width: '200px', height: '200px',
  borderRadius: '50%', background: 'rgba(142, 195, 57, 0.1)', filter: 'blur(50px)'
};

const circleRight = {
  position: 'absolute', bottom: '10%', right: '-50px', width: '250px', height: '250px',
  borderRadius: '50%', background: 'rgba(58, 90, 64, 0.08)', filter: 'blur(60px)'
};
