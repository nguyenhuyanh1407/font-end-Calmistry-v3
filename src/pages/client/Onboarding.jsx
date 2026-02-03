import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, Calendar, Heart, Zap, Star, ChevronRight,
    ChevronLeft, Smile, Sparkles, Target, Coffee,
    Moon, Sun, Music, Camera, Book
} from 'lucide-react';
import userService from '../../services/userService';
import { toast } from 'react-toastify';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gender: '',
        dateOfBirth: '',
        hobbies: [],
        mainGoal: '',
        preferredTone: 'Friendly'
    });

    const brandGreen = '#324d3e';
    const lightGreen = '#8ec339';

    const hobbyOptions = [
        { id: 'meditation', label: 'Thiền định', icon: Sun },
        { id: 'podcast', label: 'Podcast', icon: Music },
        { id: 'art', label: 'Nghệ thuật', icon: Camera },
        { id: 'reading', label: 'Đọc sách', icon: Book },
        { id: 'workout', label: 'Workout', icon: Zap },
        { id: 'sleep', label: 'Giấc ngủ', icon: Moon },
        { id: 'coffee', label: 'Coffee chill', icon: Coffee },
        { id: 'nature', label: 'Thiên nhiên', icon: Star }
    ];

    const goalOptions = [
        { id: 'reduce_stress', label: 'Giảm căng thẳng', desc: 'Chill hơn mỗi ngày' },
        { id: 'better_sleep', label: 'Ngủ ngon hơn', desc: 'Tạm biệt cú đêm' },
        { id: 'social_connect', label: 'Kết nối bạn bè', desc: 'Tìm người đồng điệu' },
        { id: 'self_discover', label: 'Hiểu bản thân', desc: 'Hành trình bên trong' }
    ];

    const toneOptions = [
        { id: 'Friendly', label: 'Thân thiện', vibe: 'Như bạn thân' },
        { id: 'Professional', label: 'Chuyên gia', vibe: 'Rất uy tín' },
        { id: 'GenZ', label: 'Hài hước/Gen Z', vibe: 'Cực mặn mà' }
    ];

    const handleHobbyToggle = (hobby) => {
        setFormData(prev => ({
            ...prev,
            hobbies: prev.hobbies.includes(hobby)
                ? prev.hobbies.filter(h => h !== hobby)
                : [...prev.hobbies, hobby]
        }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await userService.completeOnboarding(formData);
            toast.success("Bắt đầu hành trình cùng Calmistry thôi! ✨");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra, thử lại sau nhé!");
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <div className="onboarding-container min-vh-100 d-flex align-items-center justify-content-center" style={{
            background: `linear-gradient(135deg, ${brandGreen} 0%, #1a2a22 100%)`,
            padding: '20px'
        }}>
            {/* Background Blobs */}
            <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none' }}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    style={{
                        position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%',
                        background: 'radial-gradient(circle, rgba(142,195,57,0.2) 0%, transparent 70%)', borderRadius: '50%'
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], x: [0, -30, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    style={{
                        position: 'absolute', bottom: '-10%', right: '-5%', width: '50%', height: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%'
                    }}
                />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card rounded-5 shadow-lg p-5 position-relative"
                style={{
                    maxWidth: '800px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white'
                }}
            >
                {/* Progress Bar */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between mb-2 small opacity-75">
                        <span>Bước {step} / 4</span>
                        <span>{Math.round((step / 4) * 100)}% Hoàn thành</span>
                    </div>
                    <div className="progress rounded-pill bg-white bg-opacity-10" style={{ height: '8px' }}>
                        <motion.div
                            className="progress-bar rounded-pill"
                            animate={{ width: `${(step / 4) * 100}%` }}
                            style={{ backgroundColor: lightGreen, transition: 'width 0.5s ease' }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                            <div className="display-4 mb-4"><Sparkles className="text-warning" size={48} /></div>
                            <h2 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                                Chào bạn mới! <Smile className="text-warning" />
                            </h2>
                            <p className="lead opacity-75 mb-5">Cho Calmistry biết một chút về bạn nhé.</p>

                            <div className="row g-4 text-start">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold opacity-75">Giới tính</label>
                                    <div className="d-flex gap-2">
                                        {['Nam', 'Nữ', 'Khác'].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={`btn rounded-pill border-0 flex-grow-1 p-3 transition-all ${formData.gender === g ? 'bg-success text-white shadow' : 'bg-white bg-opacity-10 text-white'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold opacity-75">Ngày sinh</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-lg bg-white bg-opacity-10 border-0 text-white rounded-pill p-3"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="fw-bold mb-3 text-center">Vibe của bạn là gì?</h2>
                            <p className="opacity-75 mb-5 text-center">Chọn những điều khiến bạn thấy thoải mái nhất.</p>

                            <div className="row g-3">
                                {hobbyOptions.map(hobby => {
                                    const Icon = hobby.icon;
                                    const isActive = formData.hobbies.includes(hobby.label);
                                    return (
                                        <div key={hobby.id} className="col-6 col-md-3">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleHobbyToggle(hobby.label)}
                                                className={`btn w-100 h-100 rounded-4 p-4 d-flex flex-column align-items-center gap-2 transition-all ${isActive ? 'bg-success shadow' : 'bg-white bg-opacity-10 text-white'}`}
                                                style={{ border: 'none' }}
                                            >
                                                <Icon size={24} className={isActive ? 'text-white' : 'text-success'} />
                                                <span className="small fw-bold">{hobby.label}</span>
                                            </motion.button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="fw-bold mb-3 text-center">Kế hoạch của bạn tại Calmistry?</h2>
                            <p className="opacity-75 mb-5 text-center">Chúng mình sẽ cá nhân hóa lộ trình dựa trên mục tiêu này.</p>

                            <div className="row g-4">
                                {goalOptions.map(goal => (
                                    <div key={goal.id} className="col-md-6">
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            onClick={() => setFormData({ ...formData, mainGoal: goal.label })}
                                            className={`rounded-4 p-4 cursor-pointer border-2 transition-all ${formData.mainGoal === goal.label ? 'border-success bg-success bg-opacity-20' : 'border-white border-opacity-10 bg-white bg-opacity-5'}`}
                                            style={{ cursor: 'pointer', border: '2px solid' }}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`p-2 rounded-3 ${formData.mainGoal === goal.label ? 'bg-success' : 'bg-white bg-opacity-10'}`}>
                                                    <Target size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{goal.label}</div>
                                                    <div className="small opacity-50">{goal.desc}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="fw-bold mb-3 text-center">Tùy chỉnh tri kỷ AI</h2>
                            <p className="opacity-75 mb-5 text-center">Bạn muốn Calmistry AI trò chuyện với mình theo phong cách nào?</p>

                            <div className="d-flex flex-column gap-3">
                                {toneOptions.map(tone => (
                                    <motion.div
                                        key={tone.id}
                                        whileHover={{ x: 10 }}
                                        onClick={() => setFormData({ ...formData, preferredTone: tone.id })}
                                        className={`rounded-pill p-4 d-flex align-items-center justify-content-between cursor-pointer border-2 transition-all ${formData.preferredTone === tone.id ? 'border-warning bg-warning bg-opacity-20' : 'border-white border-opacity-10 bg-white bg-opacity-5'}`}
                                        style={{ cursor: 'pointer', border: '2px solid' }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <Sparkles size={20} className={formData.preferredTone === tone.id ? 'text-warning' : 'opacity-50'} />
                                            <div>
                                                <span className="fw-bold">{tone.label}</span>
                                                <span className="mx-2 opacity-25">|</span>
                                                <span className="small opacity-50">{tone.vibe}</span>
                                            </div>
                                        </div>
                                        <div className={`rounded-circle p-1 ${formData.preferredTone === tone.id ? 'bg-warning' : 'bg-white bg-opacity-20'}`} style={{ width: 12, height: 12 }} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Buttons */}
                <div className="mt-5 pt-4 d-flex justify-content-between border-top border-white border-opacity-10">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 ${step === 1 ? 'opacity-0' : 'bg-white bg-opacity-10 text-white'}`}
                    >
                        <ChevronLeft size={18} /> Quay lại
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            disabled={
                                (step === 1 && (!formData.gender || !formData.dateOfBirth)) ||
                                (step === 2 && formData.hobbies.length < 1) ||
                                (step === 3 && !formData.mainGoal)
                            }
                            className="btn btn-success rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow-lg"
                        >
                            Tiếp theo <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn btn-warning rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow-lg text-dark"
                        >
                            {loading ? 'Đang lưu...' : 'Hoàn tất'} <Sparkles size={18} />
                        </button>
                    )}
                </div>
            </motion.div>

            <style>{`
                .glass-card { transition: all 0.3s ease; }
                .cursor-pointer { cursor: pointer; }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                .btn-success { background-color: ${lightGreen} !important; border: none !important; }
                .text-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default Onboarding;
