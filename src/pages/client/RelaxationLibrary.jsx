import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Trash2, Heart, Sparkles, AlertCircle, Play, Square, RefreshCw, Headphones, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BackgroundBlobs = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1, opacity: 0.6, background: '#f8fafc' }}>
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute',
                top: '-5%',
                left: '-10%',
                width: '50vw',
                height: '50vw',
                background: 'radial-gradient(circle, rgba(142, 195, 57, 0.15) 0%, rgba(142, 195, 57, 0) 70%)',
                borderRadius: '50%',
            }}
        />
        <motion.div
            animate={{
                scale: [1, 1.3, 1],
                x: [0, -40, 0],
                y: [0, -60, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(50, 77, 62, 0.1) 0%, rgba(50, 77, 62, 0) 70%)',
                borderRadius: '50%',
            }}
        />
    </div>
);

// --- Breathing Oasis Component ---
const BreathingOasis = () => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('Nhấn Bắt đầu'); // Inhale, Hold, Exhale, Wait
    const [timer, setTimer] = useState(0);
    const intervalRef = useRef(null);

    // 4-7-8 Breathing Technique
    // Inhale: 4s, Hold: 7s, Exhale: 8s

    // Animation Variants depending on phase
    const circleVariants = {
        idle: { scale: 1, backgroundColor: 'rgba(142, 195, 57, 0.2)' },
        inhale: { scale: 1.8, backgroundColor: 'rgba(142, 195, 57, 0.6)', transition: { duration: 4, ease: "linear" } },
        hold: { scale: 1.8, backgroundColor: 'rgba(50, 77, 62, 0.7)', transition: { duration: 0.2 } },
        exhale: { scale: 1, backgroundColor: 'rgba(142, 195, 57, 0.2)', transition: { duration: 8, ease: "linear" } }
    };

    const toggleBreathing = () => {
        if (isActive) {
            setIsActive(false);
            setPhase('Đã dừng');
            setTimer(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
            setIsActive(true);
            startBreathingCycle();
        }
    };

    const startBreathingCycle = () => {
        let currentSecond = 0;

        const runCycle = () => {
            currentSecond = 0;
            // Phase 1: Inhale (4s)
            setPhase('Hít vào sâu...');

            const cycleInterval = setInterval(() => {
                currentSecond++;

                if (currentSecond === 4) {
                    // Phase 2: Hold (7s)
                    setPhase('Giữ hơi thở...');
                } else if (currentSecond === 11) {
                    // Phase 3: Exhale (8s)
                    setPhase('Từ từ thở ra...');
                } else if (currentSecond === 19) {
                    // Start over
                    clearInterval(cycleInterval);
                    if (isActive) runCycle();
                }
            }, 1000);

            intervalRef.current = cycleInterval;
        };

        runCycle();
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Determine current animation state
    let animationState = 'idle';
    if (isActive) {
        if (phase.includes('Hít')) animationState = 'inhale';
        else if (phase.includes('Giữ')) animationState = 'hold';
        else if (phase.includes('thở ra')) animationState = 'exhale';
    }

    return (
        <div className="card border-0 shadow-sm rounded-5 overflow-hidden h-100" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
            <div className="card-body p-5 d-flex flex-column align-items-center justify-content-center position-relative min-vh-50">
                <div className="position-absolute top-0 start-0 p-4">
                    <h4 className="fw-bold d-flex align-items-center gap-2 mb-1" style={{ color: '#324d3e' }}>
                        <Wind className="text-success" /> Trạm Hơi Thở
                    </h4>
                    <span className="text-muted small">Khóa 4-7-8 giúp giảm căng thẳng</span>
                </div>

                <div className="my-5 position-relative d-flex justify-content-center align-items-center" style={{ width: '250px', height: '250px' }}>
                    {/* Background guiding circle */}
                    <div className="position-absolute rounded-circle border border-2 border-success border-opacity-25" style={{ width: '100%', height: '100%' }}></div>

                    {/* Animated breathing circle */}
                    <motion.div
                        variants={circleVariants}
                        initial="idle"
                        animate={animationState}
                        className="rounded-circle shadow-lg d-flex align-items-center justify-content-center text-center text-white"
                        style={{ width: '130px', height: '130px', zIndex: 2 }}
                    />

                    {/* Inner Text */}
                    <div className="position-absolute d-flex flex-column align-items-center justify-content-center" style={{ zIndex: 3 }}>
                        <h4 className="fw-bold mb-0 text-dark text-shadow-sm">{phase}</h4>
                    </div>
                </div>

                <button
                    className="btn rounded-pill px-5 py-3 fw-bold mt-auto shadow-sm d-flex align-items-center gap-2 transition-all"
                    onClick={toggleBreathing}
                    style={{
                        backgroundColor: isActive ? '#f8d7da' : '#324d3e',
                        color: isActive ? '#dc3545' : '#fff'
                    }}
                >
                    {isActive ? <Square size={18} /> : <Play size={18} />}
                    {isActive ? 'Dừng tập' : 'Bắt đầu thở'}
                </button>
            </div>
        </div>
    );
};

// --- Worry Shredder Component ---
const WorryShredder = () => {
    const [worry, setWorry] = useState('');
    const [isShredding, setIsShredding] = useState(false);
    const [shreddedLines, setShreddedLines] = useState([]);

    const handleShred = () => {
        if (!worry.trim() || isShredding) return;

        setIsShredding(true);

        // Split text into lines for animation
        const lineCount = 18; // More pieces
        const newLines = Array.from({ length: lineCount }).map((_, i) => ({
            id: Date.now() + i,
            xOffset: (Math.random() - 0.5) * 120, // Wider spread
            rotation: (Math.random() - 0.5) * 180, // More random rotation
            delay: Math.random() * 0.8, // Random delay for more natural continuous shredding
            width: 3 + Math.random() * 6, // Random widths
            height: 15 + Math.random() * 30 // Random heights
        }));

        setShreddedLines(newLines);

        setTimeout(() => {
            toast.success("Mọi lo âu đã tan biến. Hãy hít một hơi thật sâu! 🍃", {
                icon: '✨',
                style: { borderRadius: '15px', background: '#324d3e', color: '#fff' }
            });
            setWorry('');
            setIsShredding(false);
            setShreddedLines([]);
        }, 2500); // Wait for animation to finish
    };

    return (
        <div className="card border-0 shadow-sm rounded-5 h-100" style={{ background: 'linear-gradient(145deg, #ffffff, #f4f7f5)' }}>
            <div className="card-body p-4 p-md-5 d-flex flex-column">
                <div className="mb-4">
                    <h4 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: '#324d3e' }}>
                        <Trash2 className="text-danger" /> Máy Hủy Âu Lo
                    </h4>
                    <p className="text-muted small">Viết ra những suy nghĩ tiêu cực và phá hủy chúng để giải phóng tâm trí.</p>
                </div>

                <div className="position-relative flex-grow-1 d-flex flex-column justify-content-center align-items-center w-100">

                    {/* Input Paper Box */}
                    <AnimatePresence>
                        {!isShredding && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ y: 150, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }}
                                className="w-100 mb-4"
                                style={{ zIndex: 10 }}
                            >
                                <textarea
                                    className="form-control rounded-4 p-4 shadow-sm border-0"
                                    placeholder="Tôi đang cảm thấy áp lực vì..."
                                    rows="4"
                                    value={worry}
                                    onChange={(e) => setWorry(e.target.value)}
                                    style={{
                                        backgroundColor: '#fff9e6',
                                        color: '#555',
                                        fontSize: '16px',
                                        resize: 'none',
                                        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #eec 31px, #eec 32px)',
                                        lineHeight: '32px',
                                        paddingTop: '32px'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* The Shredder Machine Visual */}
                    <div className="w-100 position-relative" style={{ zIndex: 2 }}>
                        {/* Machine Body */}
                        <motion.div
                            className="bg-dark rounded-pill shadow-lg d-flex justify-content-center align-items-center overflow-hidden mx-auto"
                            style={{ height: '40px', width: '90%' }}
                            animate={isShredding ? {
                                x: [-2, 2, -2, 2, 0],
                                y: [-1, 1, -1, 1, 0]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 0.1 }}
                        >
                            {/* Inner slot */}
                            <div className="w-75 bg-black rounded-pill opacity-75 shadow-inner" style={{ height: '12px' }}></div>

                            {/* Processing lights */}
                            <motion.div
                                className="position-absolute rounded-circle"
                                animate={{ backgroundColor: isShredding ? ['#ff0000', '#00ff00'] : '#333' }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                style={{ width: '8px', height: '8px', right: '15px' }}
                            />
                        </motion.div>
                    </div>

                    {/* Falling shredded paper animation */}
                    <div className="position-relative w-100 d-flex justify-content-center" style={{ height: '180px', overflow: 'hidden', marginTop: '-10px' }}>
                        <div style={{ width: '80%', position: 'relative', height: '100%' }}>
                            <AnimatePresence>
                                {isShredding && shreddedLines.map((line, idx) => (
                                    <motion.div
                                        key={line.id}
                                        initial={{ y: -20, opacity: 1, rotate: 0, x: 0, backgroundColor: '#ffcccc' }} // Starts slightly red (worry)
                                        animate={{
                                            y: 200,
                                            opacity: [1, 1, 0],
                                            rotate: line.rotation,
                                            x: line.xOffset,
                                            backgroundColor: '#e2e8f0' // Turns gray/white (peace)
                                        }}
                                        transition={{
                                            duration: 1.8 + Math.random(),
                                            delay: line.delay,
                                            ease: "easeIn"
                                        }}
                                        className="position-absolute shadow-sm"
                                        style={{
                                            width: `${line.width}px`,
                                            height: `${line.height}px`,
                                            left: `${10 + (idx * (80 / 18))}%`, // Spread across the slot
                                            top: 0,
                                            borderRadius: '2px',
                                            clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' // Slightly irregular shape
                                        }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <button
                        className="btn btn-danger rounded-pill px-5 py-3 fw-bold mt-3 shadow-lg d-flex align-items-center gap-2 transition-all w-100 justify-content-center"
                        onClick={handleShred}
                        disabled={!worry.trim() || isShredding}
                    >
                        {isShredding ? <RefreshCw className="animate-spin" /> : <Trash2 />}
                        {isShredding ? 'Đang hủy diệt...' : 'Hủy diệt âu lo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Healing Frequencies Component ---
const HealingFrequencies = () => {
    const [activeFreq, setActiveFreq] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio context refs
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const lfoRef = useRef(null);
    const noiseNodeRef = useRef(null);

    const frequencies = [
        { hz: 174, name: 'Giảm đau & thư giãn sâu', desc: 'Sử dụng khi thiền body scan hoặc trước ngủ. Giúp giảm đau tự nhiên.', color: '#3b82f6', hex: 'rgba(59, 130, 246, 1)' },
        { hz: 285, name: 'Hồi phục năng lượng', desc: 'Tái tạo mô và tế bào. Phù hợp nghe khi nghỉ trưa hoặc sau stress.', color: '#10b981', hex: 'rgba(16, 185, 129, 1)' },
        { hz: 396, name: 'Giải phóng sợ hãi & tội lỗi', desc: 'Cân bằng cảm xúc tiêu cực, khuyên dùng khi overthinking.', color: '#f59e0b', hex: 'rgba(245, 158, 11, 1)' },
        { hz: 417, name: 'Tái khởi động & thay đổi', desc: 'Mang vibe "reset". Dùng khi cần động lực đổi môi trường, mindset.', color: '#ec4899', hex: 'rgba(236, 72, 153, 1)' },
        { hz: 528, name: 'Tần số tình yêu', desc: 'Chữa lành DNA, đem lại sự bình yên sâu sắc (rất nổi tiếng).', color: '#8b5cf6', hex: 'rgba(139, 92, 246, 1)' },
    ];

    const stopAudio = () => {
        if (oscRef.current) {
            try { oscRef.current.stop(); } catch (e) { }
            oscRef.current = null;
        }
        if (lfoRef.current) {
            try { lfoRef.current.stop(); } catch (e) { }
            lfoRef.current = null;
        }
        if (noiseNodeRef.current) {
            try { noiseNodeRef.current.stop(); } catch (e) { }
            noiseNodeRef.current = null;
        }
    };

    const playAudio = (hz) => {
        stopAudio();

        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.5; // Overall volume
        masterGain.connect(ctx.destination);

        // 1. Oscillator for the frequency (Sine wave)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(hz, ctx.currentTime);
        oscRef.current = osc;

        // 2. LFO to pulse the volume (Binaural beats effect)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, ctx.currentTime); // 0.5 Hz pulse
        lfoRef.current = lfo;

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.15; // 15% modulation (creates the beat)
        lfo.connect(lfoGain);

        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.3; // Base sine wave volume
        lfoGain.connect(oscGain.gain);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        lfo.start();

        // 3. Gentle Ocean/Brown Noise Background
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;
        noiseNodeRef.current = noiseNode;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 250; // Deep muffled ocean sound

        const noiseGainNode = ctx.createGain();
        noiseGainNode.gain.value = 0.12; // Low background volume

        noiseNode.connect(filter);
        filter.connect(noiseGainNode);
        noiseGainNode.connect(masterGain);

        noiseNode.start();
    };

    const togglePlay = (freq) => {
        if (activeFreq?.hz === freq.hz) {
            if (isPlaying) {
                stopAudio();
                setIsPlaying(false);
            } else {
                playAudio(freq.hz);
                setIsPlaying(true);
            }
        } else {
            setActiveFreq(freq);
            playAudio(freq.hz);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        return () => {
            stopAudio();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close();
            }
        };
    }, []);

    // Generate visualization bars
    const bars = Array.from({ length: 40 });

    return (
        <div className="card border-0 shadow-sm rounded-5 overflow-hidden h-100" style={{ background: '#fcfdfd' }}>
            <div className="card-body p-4 p-md-5 d-flex flex-column">
                <div className="mb-4">
                    <h4 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: '#324d3e' }}>
                        <Headphones className="text-info" /> Trạm Tần Số Chữa Lành
                    </h4>
                    <p className="text-muted small">Lắng nghe các tần số Solfeggio kết hợp cùng tiếng sóng êm dịu, giúp cân bằng thân - tâm - trí.</p>
                </div>

                {/* Visualizer Area */}
                <div
                    className="w-100 rounded-4 mb-4 d-flex align-items-center justify-content-center overflow-hidden position-relative shadow-sm transition-all"
                    style={{
                        height: '140px',
                        backgroundColor: activeFreq ? '#fff' : '#f1f5f9',
                        border: `2px solid ${activeFreq ? activeFreq.color : 'transparent'}`
                    }}
                >
                    {!activeFreq && (
                        <div className="text-muted small d-flex flex-column align-items-center gap-2">
                            <Music size={24} className="opacity-50" />
                            <span>Chọn một tần số bên dưới để bắt đầu</span>
                        </div>
                    )}

                    {activeFreq && (
                        <div className="d-flex align-items-center justify-content-center h-100 w-100 px-3">
                            <AnimatePresence>
                                <div className="d-flex align-items-end justify-content-center gap-1 w-100" style={{ height: '80px' }}>
                                    {bars.map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={isPlaying ? {
                                                height: [
                                                    `${10 + Math.random() * 20}%`,
                                                    `${30 + Math.random() * 70}%`,
                                                    `${10 + Math.random() * 20}%`
                                                ]
                                            } : {
                                                height: '10%'
                                            }}
                                            transition={{
                                                duration: 0.8 + Math.random() * 0.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                delay: i * 0.05
                                            }}
                                            style={{
                                                width: '10px',
                                                backgroundColor: activeFreq.color,
                                                borderRadius: '10px 10px 0 0',
                                                opacity: 0.7 + (Math.sin(i) * 0.3)
                                            }}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>

                            {/* Overlay Hz Text */}
                            <div className="position-absolute fs-1 fw-bold opacity-25" style={{ color: activeFreq.color, pointerEvents: 'none' }}>
                                {activeFreq.hz} Hz
                            </div>
                        </div>
                    )}
                </div>

                {/* Frequency List */}
                <div className="d-flex flex-column gap-3 overflow-auto pe-2 flex-grow-1" style={{ maxHeight: '350px' }}>
                    {frequencies.map((freq) => {
                        const isActive = activeFreq?.hz === freq.hz;
                        return (
                            <div
                                key={freq.hz}
                                className={`p-3 rounded-4 border transition-all d-flex align-items-center justify-content-between ${isActive ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: isActive ? `${freq.hex.replace('1)', '0.05)')}` : '#fff',
                                    borderColor: isActive ? freq.color : '#e2e8f0',
                                    cursor: 'pointer'
                                }}
                                onClick={() => togglePlay(freq)}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            backgroundColor: freq.color,
                                            flexShrink: 0
                                        }}
                                    >
                                        <span className="fw-bold fs-6">{freq.hz}</span>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1 text-dark">{freq.name}</h6>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.4' }}>{freq.desc}</p>
                                    </div>
                                </div>
                                <button
                                    className="btn rounded-circle text-white shadow-sm d-flex align-items-center justify-content-center p-0 m-0"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: isActive ? freq.color : '#cbd5e1',
                                        flexShrink: 0
                                    }}
                                >
                                    {(isActive && isPlaying) ? <Square size={16} fill="white" /> : <Play size={18} fill="white" className="ms-1" />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="alert alert-light border mt-4 mb-0 small text-center text-muted rounded-4">
                    <i className="bi bi-info-circle me-1"></i> Âm thanh được tạo trực tiếp. Vui lòng đeo tai nghe và chỉnh âm lượng vừa phải.
                </div>
            </div>
        </div>
    );
};

const RelaxationLibrary = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', position: 'relative' }}>
            <BackgroundBlobs />

            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-5"
                >
                    <div className="d-inline-flex p-3 rounded-circle shadow-sm bg-white mb-3 text-success">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="fw-bold display-5" style={{ color: '#324d3e' }}>Hòn Đảo Thư Giãn</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Dành vài phút mỗi ngày cho bản thân. Những bài tập nhỏ này sẽ giúp bạn tìm lại sự cân bằng.
                    </p>
                </motion.div>

                <div className="row g-4 align-items-stretch">
                    <div className="col-lg-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="h-100"
                        >
                            <BreathingOasis />
                        </motion.div>
                    </div>

                    <div className="col-lg-6">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-100"
                        >
                            <WorryShredder />
                        </motion.div>
                    </div>

                    {/* Healing Frequencies Soundscape */}
                    <div className="col-12 mt-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <HealingFrequencies />
                        </motion.div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-shadow-sm {
                    text-shadow: 0 1px 2px rgba(255,255,255,0.8);
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .z-index-2 {
                    z-index: 2;
                }
                .shadow-inner {
                    box-shadow: inset 0px 4px 6px rgba(0, 0, 0, 0.5);
                }
            `}</style>
        </div>
    );
};

export default RelaxationLibrary;
