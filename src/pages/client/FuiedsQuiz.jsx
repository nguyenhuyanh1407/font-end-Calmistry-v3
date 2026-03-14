import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import fuiedsService from '../../services/fuiedsService';
import butterfly from "../../assets/butterflyhug.jpg";

import { toast } from 'react-toastify';
import {
    Heart, Brain, Users, Zap, Target, Shield, ArrowRight, ArrowLeft,
    X, Star, Moon, CheckCircle2, Wind, Eye, Volume2, Smile, Sparkles, MessageSquareHeart
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// 1. Timer Component
const BreathTimer = memo(({ initialSeconds, onComplete, brandGreen }) => {
    const [count, setCount] = useState(initialSeconds);
    const timerRef = useRef(null);

    useEffect(() => {
        setCount(initialSeconds);
        timerRef.current = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (onComplete) onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [initialSeconds, onComplete]);

    return (
        <div className="timer-display-wrapper">
            <span className="timer-number">{count}</span>
            <span className="timer-unit">s</span>
        </div>
    );
});

const FuiedsQuiz = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Màu sắc
    const brandGreen = '#324d3e';
    const lightGreen = '#74c655';
    const softBg = '#fcf7f0';

    // State Mood & Flow
    const [showMoodFlow, setShowMoodFlow] = useState(false);
    const [moodType, setMoodType] = useState(null);
    const [subStep, setSubStep] = useState(0);
    const [showSleepSuggestion, setShowSleepSuggestion] = useState(false);

    const [answers, setAnswers] = useState({
        feelingsAnswer: null,
        understandingAnswer: null,
        interactionAnswer: null,
        energyAnswer: null,
        driveAnswer: null,
        stabilityAnswer: null
    });

    const questions = [
        { key: 'feelingsAnswer', title: 'Feelings', question: 'Hôm nay bạn thế nào?', icon: Heart, color: '#e74c3c', options: [{ value: 0, label: 'Buồn', emoji: '😢' }, { value: 1, label: 'Hơi tệ', emoji: '😔' }, { value: 2, label: 'Bình thường', emoji: '😐' }, { value: 3, label: 'Tốt', emoji: '🙂' }, { value: 4, label: 'Vui', emoji: '😊' }] },
        { key: 'understandingAnswer', title: 'Understanding', question: 'Bạn có hiểu và kiểm soát cảm xúc không?', icon: Brain, color: '#9b59b6', options: [{ value: 0, label: 'Hoàn toàn không', emoji: '🤯' }, { value: 1, label: 'Ít', emoji: '😕' }, { value: 2, label: 'Trung bình', emoji: '🤔' }, { value: 3, label: 'Khá', emoji: '😌' }, { value: 4, label: 'Rất rõ', emoji: '🧘' }] },
        { key: 'interactionAnswer', title: 'Interaction', question: 'Bạn tương tác với mọi người thế nào?', icon: Users, color: '#3498db', options: [{ value: 0, label: 'Cô lập', emoji: '😶' }, { value: 1, label: 'Rất ít', emoji: '🙁' }, { value: 2, label: 'Bình thường', emoji: '😊' }, { value: 3, label: 'Tích cực', emoji: '😄' }, { value: 4, label: 'Rất tuyệt vời', emoji: '🤗' }] },
        { key: 'energyAnswer', title: 'Energy', question: 'Mức năng lượng tinh thần hiện tại?', icon: Zap, color: '#f39c12', options: [{ value: 0, label: 'Kiệt sức', emoji: '😴' }, { value: 1, label: 'Thấp', emoji: '😪' }, { value: 2, label: 'Trung bình', emoji: '😐' }, { value: 3, label: 'Tốt', emoji: '⚡' }, { value: 4, label: 'Tràn đầy', emoji: '🔥' }] },
        { key: 'driveAnswer', title: 'Drive', question: 'Động lực làm việc/học tập của bạn?', icon: Target, color: '#27ae60', options: [{ value: 0, label: 'Không có', emoji: '😞' }, { value: 1, label: 'Rất ít', emoji: '😕' }, { value: 2, label: 'Bình thường', emoji: '😐' }, { value: 3, label: 'Khá tốt', emoji: '💪' }, { value: 4, label: 'Rất cao', emoji: '🚀' }] },
        { key: 'stabilityAnswer', title: 'Stability', question: 'Cảm xúc của bạn có ổn định không?', icon: Shield, color: '#16a085', options: [{ value: 0, label: 'Rất thất thường', emoji: '🌪️' }, { value: 1, label: 'Thất thường', emoji: '😰' }, { value: 2, label: 'Trung bình', emoji: '😌' }, { value: 3, label: 'Khá ổn', emoji: '😊' }, { value: 4, label: 'Rất ổn định', emoji: '🧘‍♀️' }] }
    ];

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [currentQuestion.key]: value });
        if (currentQuestion.key === 'feelingsAnswer') {
            setMoodType(value <= 1 ? 'sad' : (value >= 3 ? 'happy' : null));
            if (value !== 2) {
                setSubStep(0);
                setTimeout(() => setShowMoodFlow(true), 600);
            }
        }
    };

    const handleNext = () => {
        if (answers[currentQuestion.key] === null) {
            toast.warning('Vui lòng chọn một câu trả lời');
            return;
        }
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowSleepSuggestion(true);
        }
    };

    const handleSubmitQuiz = async (redirectTo = '/userDashboard') => {
        setIsSubmitting(true);
        console.log("🚀 Submitting FUIEDS answers:", answers);
        try {
            const response = await fuiedsService.submitResponse(answers);
            console.log("✅ FUIEDS Response:", response);
            if (response && (response.code === 1000 || response.code === 200)) {
                const result = response.result || response;
                toast.success(`✨ Điểm FUIEDS: ${Math.round(result.smoothedScore)}! Streak: ${result.currentStreak} 🔥`);
                if (redirectTo) {
                    setTimeout(() => navigate(redirectTo), 1500);
                }
                return true;
            } else {
                toast.error(response.message || 'Lỗi từ phía máy chủ');
            }
        } catch (error) {
            console.error("❌ FUIEDS Submission Error:", error);
            toast.error(error.message || 'Có lỗi xảy ra!');
        } finally {
            setIsSubmitting(false);
            setShowSleepSuggestion(false);
        }
        return false;
    };

    // --- Mood Flow Component ---
    const MoodFlow = () => {
        if (!showMoodFlow) return null;
        const nextSubStep = () => setSubStep(subStep + 1);

        const renderSadContent = () => {
            switch (subStep) {
                case 0: {
                    // Tự chuyển tiếp sau 2s
                    setTimeout(() => setSubStep(1), 2000);
                    return (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <p className="fs-5 mb-0 italic" style={{ color: brandGreen }}>“Có vẻ hôm nay mọi thứ hơi quá tải nhỉ?”</p>
                            <div className="mt-4"><div className="spinner-grow text-secondary" style={{ width: '1rem', height: '1rem' }}></div></div>
                        </motion.div>
                    );
                }
                case 1: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <p className="fw-bold mb-4" style={{ fontSize: '1.1rem' }}>Cảm xúc này đang mạnh cỡ nào?</p>
                        <div className="d-flex justify-content-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map(v => (
                                <button key={v} className="btn btn-outline-secondary rounded-circle shadow-sm" style={{ width: 55, height: 55, fontWeight: 700 }} onClick={nextSubStep}>
                                    {v}
                                </button>
                            ))}
                        </div>
                        <p className="text-muted small">Mức độ từ 1 (Nhẹ) đến 5 (Rất mạnh)</p>
                    </motion.div>
                );
                case 2: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <p className="fw-bold mb-4" style={{ fontSize: '1.1rem' }}>Nó đến từ đâu nhỉ?</p>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {['Học tập', 'Công việc', 'Gia đình', 'Tình cảm', 'Bạn bè', 'Sức khoẻ', 'Không rõ'].map(tag => (
                                <button key={tag} className="btn btn-light border rounded-pill px-4 py-2 action-btn shadow-sm" onClick={nextSubStep}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
                case 3: return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                            <Wind className="text-success" size={24} />
                            <h4 className="mb-0 fw-bold">Step 0 - Breathe</h4>
                        </div>
                        <p className="mb-4">“Hít thở sâu trong 1 phút nhé.” Theo nhịp 4-6-4</p>
                        <div className="breathe-container my-4">
                            <div className="breathe-circle mb-4"></div>
                            <BreathTimer initialSeconds={60} brandGreen={brandGreen} />
                        </div>
                        <div className="d-flex gap-3 justify-content-center mt-4">
                            <button className="btn btn-light rounded-pill px-4 border" onClick={() => setShowMoodFlow(false)}>Để sau</button>
                            <button className="btn btn-success rounded-pill px-5 fw-bold" onClick={nextSubStep}>Hoàn thành</button>
                        </div>
                    </motion.div>
                );
                case 4: return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-3">
                        <Smile className="text-success mb-3" size={48} />
                        <p className="fs-5 mb-4">“Cảm ơn bạn. Mình tiếp tục được không?”</p>
                        <button className="btn btn-dark rounded-pill px-5 py-2 fw-bold" onClick={nextSubStep}>Tiếp tục</button>
                    </motion.div>
                );
                case 5: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                            <Eye className="text-primary" size={24} />
                            <h5 className="text-uppercase text-muted small fw-bold mb-0">Step 1 - Nhìn (5)</h5>
                        </div>
                        <p className="fs-5 my-4 fw-medium">“Giúp mình nhìn quanh và nói thầm trong đầu 5 thứ bạn thấy. Mỗi thứ 1–2 giây.”</p>
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold" onClick={nextSubStep}>Xong (5/5)</button>
                    </motion.div>
                );
                case 6: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <h5 className="text-uppercase text-muted small fw-bold mb-4">Step 2 - Tự trấn an</h5>
                        <p className="fs-5 italic mb-4">“Nói thầm 1 câu: ‘Mình đang cảm thấy…, và mình đang an toàn ở đây.’”</p>
                        <p className="text-muted mb-4">“Lặp lại 2 lần, chậm thôi nhé.”</p>
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold" onClick={nextSubStep}>Tiếp theo</button>
                    </motion.div>
                );
                case 7: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <h5 className="text-uppercase text-muted small fw-bold mb-3">Step 3 - Butterfly hug (4/4)</h5>
                        <div className="my-3 rounded-4 overflow-hidden border">
                            <img src={butterfly} alt="butterfly hug" className="img-fluid" style={{ width: '100%', maxHeight: 250, objectFit: 'cover' }} />
                        </div>
                        <p className="mb-4">“Gõ nhẹ luân phiên trái–phải 4 lần.”</p>
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold" onClick={nextSubStep}>Xong (4/4)</button>
                    </motion.div>
                );
                case 8: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                            <Volume2 className="text-info" size={24} />
                            <h5 className="text-uppercase text-muted small fw-bold mb-0">Step 4 - Nghe (3)</h5>
                        </div>
                        <p className="my-4">“Dừng lại 10 giây. Lắng tai nghe 3 âm thanh quanh bạn nhé.”</p>
                        <div className="my-4 d-flex justify-content-center">
                            <BreathTimer initialSeconds={10} brandGreen={brandGreen} />
                        </div>
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold mt-2" onClick={nextSubStep}>Xong</button>
                    </motion.div>
                );
                case 9: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <h5 className="text-uppercase text-muted small fw-bold mb-4">Step 5 - Ngửi (2)</h5>
                        <p className="fs-5 mb-5">“Hít nhẹ và cảm nhận 2 mùi hương đang có xung quanh bạn nhé.”</p>
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold" onClick={nextSubStep}>Xong</button>
                    </motion.div>
                );
                case 10: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <h5 className="text-uppercase text-muted small fw-bold mb-4">Step 6 - Nếm (1)</h5>
                        <p className="small mb-4 text-start bg-light p-3 rounded-3">“Nếu có nước/đồ ăn gần đó, hãy nhấp 1 ngụm hoặc ăn 1 miếng nhỏ nhé. Nếu không có cũng không sao, hãy nghĩ đến món ăn bạn đang muốn thử, tưởng tượng về hương vị của nó.”</p>
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold" onClick={nextSubStep}>Xong</button>
                    </motion.div>
                );
                case 11: return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-start py-2 overflow-auto" style={{ maxHeight: '70vh' }}>
                        <h5 className="fw-bold mb-3 text-center">Hành trình quay lại thực tại</h5>
                        <p className="small mb-3">Bạn vừa hoàn thành hành trình quay lại thực tại. Bạn vẫn còn cảm thấy thế giới quanh mình - và khi còn cảm nhận được, nghĩa là bạn vẫn còn một nơi để quay về: ngay trong khoảnh khắc này. Đó là món quà cha mẹ và cuộc đời đã gửi gắm.</p>
                        <p className="small mb-3">Thế giới đôi khi không như mong muốn. Nhưng bạn thấy không, bạn vẫn tồn tại, vẫn đủ đầy, vẫn chạm được vào những điều nhỏ bé, và sẽ làm được những điều lớn lao.</p>
                        <p className="small mb-4 italic fw-bold text-center" style={{ color: brandGreen }}>“Hôm nay đường khó đi thật. Mình cứ chậm lại một chút, rồi sẽ đến nơi thôi. Nhìn lại, bạn đã đi được rất xa rồi.”</p>
                        <button className="btn btn-dark rounded-pill w-100 py-3 fw-bold" onClick={nextSubStep}>Kết thúc</button>
                    </motion.div>
                );
                case 12: return (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                        <Star className="text-warning mb-3" size={64} fill="#ffc107" />
                        <h3 className="fw-bold mb-2">Tuyệt vời lắm!</h3>
                        <p className="fs-5 mb-4">Bạn giỏi lắm, mình có <span className="text-warning fw-bold">2 sao</span> thưởng bạn.</p>
                        <button className="btn btn-success rounded-pill w-100 py-3 fw-bold shadow-sm" onClick={() => { setShowMoodFlow(false); setSubStep(0); handleNext(); }}>Tiếp tục đánh giá</button>
                    </motion.div>
                );
                default: return null;
            }
        };

        const renderHappyContent = () => {
            switch (subStep) {
                case 0: return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                        <MessageSquareHeart className="text-danger mb-3" size={48} />
                        <p className="fs-5 mb-4 fw-bold">“Chia sẻ niềm vui cho mình với?”</p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button className="btn btn-light rounded-pill px-4 border" onClick={() => setShowMoodFlow(false)}>Bỏ qua</button>
                            <button className="btn btn-dark rounded-pill px-4" onClick={nextSubStep}>Tiếp tục</button>
                        </div>
                    </motion.div>
                );
                case 1: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <p className="fw-bold mb-4" style={{ fontSize: '1.2rem' }}>Niềm vui này đang mạnh cỡ nào?</p>
                        <div className="d-flex justify-content-center gap-3 mb-4">
                            {[1, 2, 3, 4, 5].map(v => (
                                <button key={v} className="btn btn-outline-success rounded-circle shadow-sm" style={{ width: 55, height: 55, fontWeight: 700 }} onClick={nextSubStep}>
                                    {v}
                                </button>
                            ))}
                        </div>
                        <p className="text-muted small">Từ 1 (Bình yên) đến 5 (Tuyệt vời)</p>
                    </motion.div>
                );
                case 2: return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                        <p className="fw-bold mb-4" style={{ fontSize: '1.2rem' }}>Điều gì làm bạn vui vậy?</p>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {['Thành tựu nhỏ', 'Người mình thương', 'Công việc - học tập', 'Tin vui', 'Tự hào bản thân', 'Nghỉ ngơi – thư giãn', 'Không rõ'].map(tag => (
                                <button key={tag} className="btn btn-light border rounded-pill px-4 py-2 action-btn shadow-sm" onClick={nextSubStep}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
                case 3: return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="p-4 rounded-4" style={{ backgroundColor: '#f0fdf4', border: '2px solid #74c655' }}>
                            <h5 className="text-success text-uppercase small fw-bold mb-3">Card 1 - Giữ lại khoảnh khắc</h5>
                            <p className="mb-3">“Dừng 10 giây nhé.”</p>
                            <div className="d-flex justify-content-center my-4"><BreathTimer initialSeconds={10} brandGreen={brandGreen} /></div>
                            <p className="small italic text-muted mt-3">“Nhìn quanh 3 thứ khiến bạn thấy dễ chịu. Hít sâu 1 hơi và nói thầm: ‘Mình đang có một khoảnh khắc tốt.’”</p>
                        </div>
                        <div className="d-flex gap-3 justify-content-center mt-4">
                            <button className="btn btn-light rounded-pill px-4 border" onClick={nextSubStep}>Để sau</button>
                            <button className="btn btn-success rounded-pill px-5 fw-bold" onClick={nextSubStep}>Hoàn thành</button>
                        </div>
                    </motion.div>
                );
                case 4: return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="p-4 rounded-4 border-2 border-dashed" style={{ border: '2px dashed #74c655', backgroundColor: '#fff' }}>
                            <h5 className="text-success text-uppercase small fw-bold mb-3">Card 2 - 1 câu biết ơn (10s)</h5>
                            <p className="fs-5 mb-4">Ghi lại 1 câu thầm kín: <br /><strong>“Hôm nay mình biết ơn…”</strong></p>
                            <div className="d-flex justify-content-center mb-0"><BreathTimer initialSeconds={10} brandGreen={brandGreen} /></div>
                        </div>
                        <button className="btn btn-success rounded-pill w-100 py-3 fw-bold mt-4" onClick={nextSubStep}>Xong</button>
                    </motion.div>
                );
                case 5: return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="p-4 rounded-4" style={{ backgroundColor: '#eff6ff', border: '2px solid #3498db' }}>
                            <h5 className="text-primary text-uppercase small fw-bold mb-3">Card 3 - Gửi một điều tốt (15s)</h5>
                            <p className="mb-4">“Nhắn cho người bạn nghĩ đến 1 câu: ‘Hôm nay mình vui vì…’ Hoặc gửi cho chính mình.”</p>
                            <div className="d-flex justify-content-center mb-0"><BreathTimer initialSeconds={15} brandGreen={brandGreen} /></div>
                        </div>
                        <div className="d-flex gap-3 justify-content-center mt-4">
                            <button className="btn btn-light rounded-pill flex-grow-1 border" onClick={nextSubStep}>Bỏ qua</button>
                            <button className="btn btn-primary rounded-pill flex-grow-1 fw-bold" onClick={nextSubStep}>Mở tin nhắn</button>
                        </div>
                    </motion.div>
                );
                case 6: return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <Sparkles className="text-warning mb-3" size={48} />
                        <p className="small mb-4 italic lh-base" style={{ color: brandGreen }}>“Vũ trụ sẽ luôn gửi đến bạn những điều đáng yêu, khi bạn giữ trong mình sự tích cực, lòng biết ơn, và yêu thương cuộc sống. Tận hưởng niềm vui này nhé.”</p>
                        <button className="btn btn-dark rounded-pill w-100 py-3 fw-bold shadow-sm" onClick={nextSubStep}>Kết thúc</button>
                    </motion.div>
                );
                case 7: return (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                        <div className="display-4 mb-3">⭐ ⭐</div>
                        <h4 className="fw-bold text-success mb-3">Chia vui nhé!</h4>
                        <p className="fs-5 mb-4">Mình có <span className="text-warning fw-bold">2 sao</span> thưởng bạn!</p>
                        <button className="btn btn-success rounded-pill w-100 py-3 fw-bold" onClick={() => { setShowMoodFlow(false); handleNext(); }}>Tiếp tục đánh giá</button>
                    </motion.div>
                );
                default: return null;
            }
        };

        return (
            <div className="mood-overlay">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={subStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mood-card shadow-lg p-4 p-md-5"
                    >
                        {moodType === 'sad' ? renderSadContent() : renderHappyContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    };

    // --- Sleep Suggestion Modal ---
    const SleepSuggestionModal = () => {
        if (!showSleepSuggestion) return null;
        return (
            <div className="mood-overlay">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mood-card p-4 p-md-5 text-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex p-4 mb-4">
                        <Moon size={40} className="text-primary" />
                    </div>
                    <h4 className="fw-bold mb-3">Chúc mừng bạn!</h4>
                    <p className="text-muted fs-5 mb-4">Bạn muốn mình check nhanh giấc ngủ đêm qua không? <br />(Chỉ mất 30 giây thôi)</p>
                    <div className="d-grid gap-3">
                        <button className="btn btn-primary rounded-pill py-3 fw-bold fs-5 shadow-sm"
                            disabled={isSubmitting}
                            onClick={() => handleSubmitQuiz('/sleepManagement')}
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Check nhanh ngay'}
                        </button>
                        <button className="btn btn-light border rounded-pill py-3 text-muted" onClick={() => handleSubmitQuiz()}>Để sau, nhận kết quả ngay</button>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="min-vh-100" style={{ backgroundColor: softBg, paddingTop: '100px', paddingBottom: '80px' }}>
            <MoodFlow />
            <SleepSuggestionModal />
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="text-center mb-5">
                            <span className="badge rounded-pill mb-3 px-3 py-2 fw-bold" style={{ backgroundColor: lightGreen + '20', color: brandGreen, letterSpacing: '1px' }}>FUIEDS ASSESSMENT</span>
                            <h2 className="fw-bold mb-2" style={{ color: brandGreen, fontSize: '2.2rem' }}>Thấu hiểu tâm trí bạn</h2>
                        </div>

                        <div className="px-2 mb-4">
                            <div className="d-flex justify-content-between align-items-end mb-2">
                                <span className="fw-bold small" style={{ color: brandGreen }}>BƯỚC {currentStep + 1} / {questions.length}</span>
                                <span className="small fw-bold" style={{ color: lightGreen }}>{Math.round(progress)}% hoàn thiện</span>
                            </div>
                            <div className="progress rounded-pill bg-white shadow-sm" style={{ height: '12px' }}>
                                <motion.div
                                    className="progress-bar"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    style={{ backgroundColor: brandGreen }}
                                />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="card border-0 shadow-sm rounded-5 overflow-hidden mb-5"
                            >
                                <div className="card-body p-4 p-md-5">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: currentQuestion.color + '15', color: currentQuestion.color }}>
                                            <currentQuestion.icon size={24} />
                                        </div>
                                        <h5 className="mb-0 fw-bold text-muted text-uppercase small tracking-widest">{currentQuestion.title}</h5>
                                    </div>
                                    <h3 className="mb-5 text-center px-lg-4 fw-bold" style={{ color: brandGreen }}>{currentQuestion.question}</h3>

                                    <div className="quiz-options d-grid gap-3">
                                        {currentQuestion.options.map((option) => (
                                            <motion.div
                                                key={option.value}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswer(option.value)}
                                                className={`option-item p-4 rounded-4 d-flex align-items-center justify-content-between cursor-pointer border-2 transition-all ${answers[currentQuestion.key] === option.value ? 'selected border-success bg-success bg-opacity-10' : 'bg-light border-light'}`}
                                            >
                                                <div className="d-flex align-items-center gap-4">
                                                    <span style={{ fontSize: '2rem' }}>{option.emoji}</span>
                                                    <span className="fw-bold fs-5" style={{ color: brandGreen }}>{option.label}</span>
                                                </div>
                                                <div className={`check-dot rounded-circle border-2 ${answers[currentQuestion.key] === option.value ? 'bg-success border-success' : 'bg-white border-secondary border-opacity-25'}`} style={{ width: '24px', height: '24px' }}>
                                                    {answers[currentQuestion.key] === option.value && <CheckCircle2 size={16} className="text-white mx-auto d-block mt-0.5" />}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="d-flex justify-content-between align-items-center">
                            <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0} className="btn rounded-pill px-4 btn-light border-0 shadow-sm fw-bold"><ArrowLeft size={18} className="me-2" /> Quay lại</button>
                            <button onClick={handleNext} disabled={isSubmitting} className="btn rounded-pill px-5 py-2 fw-bold text-white shadow" style={{ backgroundColor: brandGreen }}>
                                {currentStep === questions.length - 1 ? 'Xem kết quả' : 'Tiếp theo'} <ArrowRight size={18} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .option-item.selected { box-shadow: 0 10px 20px rgba(116, 198, 85, 0.15); }
                .cursor-pointer { cursor: pointer; }
                .mood-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(50, 77, 62, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .mood-card { background: white; width: 95%; max-width: 500px; border-radius: 40px; position: relative; max-height: 90vh; overflow-y: auto; }
                .timer-display-wrapper { font-family: 'Be Vietnam Pro', sans-serif; color: ${brandGreen}; }
                .timer-number { font-size: 3rem; font-weight: 900; }
                .breathe-circle { width: 100px; height: 100px; background: rgba(116, 198, 85, 0.2); border-radius: 50%; margin: 0 auto; animation: breathe 14s infinite ease-in-out; }
                @keyframes breathe { 
                    0% { transform: scale(1); background: rgba(116, 198, 85, 0.2); }
                    28% { transform: scale(1.8); background: rgba(116, 198, 85, 0.4); } 
                    71% { transform: scale(1.8); }
                    100% { transform: scale(1); }
                }
                .action-btn:hover { background-color: ${brandGreen} !important; color: white !important; }
            `}</style>
        </div>
    );
};

export default FuiedsQuiz;
