import React, { useState, useRef, useEffect } from 'react';
import aiChatService from '../../services/aiChatService';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, ChevronLeft, Heart, Smile, Zap, Coffee, Cloud, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BackgroundBlobs = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1, opacity: 0.6 }}>
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 100, 0],
                y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '40vw',
                height: '40vw',
                background: 'radial-gradient(circle, rgba(142, 195, 57, 0.2) 0%, rgba(142, 195, 57, 0) 70%)',
                borderRadius: '50%',
            }}
        />
        <motion.div
            animate={{
                scale: [1.2, 1, 1.2],
                x: [0, -100, 0],
                y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '45vw',
                height: '45vw',
                background: 'radial-gradient(circle, rgba(50, 77, 62, 0.1) 0%, rgba(50, 77, 62, 0) 70%)',
                borderRadius: '50%',
            }}
        />
        <motion.div
            animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 360],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute',
                top: '20%',
                right: '10%',
                width: '30vw',
                height: '30vw',
                background: 'radial-gradient(circle, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0) 70%)',
                borderRadius: '50%',
            }}
        />
    </div>
);

const AiPersonalizedChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const initialMessageRef = useRef(location.state?.initialMessage);
    const hasInitializedRef = useRef(false);

    // Design Tokens
    const brandGreen = '#324d3e';
    const accentGreen = '#8ec339';
    const bgLight = '#f8fafc';

    const suggestions = [
        "Làm sao để bớt lo âu? ✨",
        "Tips ngủ ngon hơn 🌙",
        "Mình cảm thấy mệt mỏi...",
        "Kế hoạch cho ngày mới ☀️"
    ];

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await aiChatService.getChatHistory(0, 50);
            const history = data.messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'ai',
                text: msg.text
            }));

            if (history.length === 0) {
                setMessages([{ role: 'ai', text: 'Chào bạn, mình là trợ lý Calmistry. Hôm nay lòng bạn có điều gì muốn sẻ chia cùng mình không? ❤️' }]);
            } else {
                setMessages(history);
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
            setMessages([{ role: 'ai', text: 'Chào bạn, mình là trợ lý Calmistry. Hôm nay lòng bạn có điều gì muốn sẻ chia cùng mình không? ❤️' }]);
        } finally {
            setLoading(false);

            // Check if we need to auto-send an initial message from Journal
            if (initialMessageRef.current && !hasInitializedRef.current) {
                hasInitializedRef.current = true;
                const msg = initialMessageRef.current;
                initialMessageRef.current = null;
                // We use a timeout to let the UI settle before sending
                setTimeout(() => {
                    handleSend(msg);
                }, 500);
            }
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (text = input) => {
        const messageToSend = typeof text === 'string' ? text : input;
        if (!messageToSend.trim() || isTyping) return;

        const userMsg = { role: 'user', text: messageToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await aiChatService.sendMessage(messageToSend);
            if (response && response.aiResponse) {
                setMessages(prev => [...prev, { role: 'ai', text: response.aiResponse }]);
            } else {
                toast.error("Hệ thống AI đang bận, thử lại sau nhé!");
            }
        } catch (error) {
            console.error("Error sending AI message:", error);
            toast.error("Phiên làm việc hết hạn hoặc lỗi kết nối.");
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="d-flex flex-column position-relative" style={{ background: bgLight, marginTop: '60px', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
            <BackgroundBlobs />

            {/* Header */}
            <div className="bg-white bg-opacity-80 border-bottom py-3 px-4 d-flex align-items-center justify-content-between shadow-sm" style={{ zIndex: 100, flexShrink: 0, backdropFilter: 'blur(10px)' }}>
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2 shadow-sm border">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: brandGreen, width: 42, height: 42 }}>
                            <Bot size={24} color="#fff" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold" style={{ color: brandGreen }}>Trợ Lý Calmistry</h5>
                            <div className="d-flex align-items-center gap-2">
                                <span className="bg-success rounded-circle" style={{ width: 8, height: 8, boxShadow: '0 0 5px rgba(25, 135, 84, 0.5)' }}></span>
                                <small className="text-muted fw-medium">Đang trực tuyến</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border shadow-sm">
                    <Sparkles size={18} className="text-warning" />
                    <span className="fw-bold small text-muted">AI Personalized</span>
                </div>
            </div>

            <div className="d-flex flex-grow-1 overflow-hidden container-fluid px-0">
                {/* Left Sidebar - PC Only */}
                <div className="d-none d-xl-flex flex-column gap-4 p-4" style={{ width: '300px', flexShrink: 0 }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-4 rounded-5"
                    >
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <Smile size={18} className="text-success" /> Tâm trạng hiện tại?
                        </h6>
                        <div className="d-grid grid-cols-2 gap-2">
                            {['😊', '☁️', '💤', '🔥', '🍃', '🌊'].map(emoji => (
                                <button key={emoji} className="btn btn-light border-0 rounded-4 p-2 fs-4 hover-lift shadow-sm bg-white">
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} delay={0.2}
                        className="glass-card p-4 rounded-5"
                    >
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <Zap size={18} className="text-warning" /> Năng lượng mỗi ngày
                        </h6>
                        <div className="progress rounded-pill bg-light" style={{ height: '10px' }}>
                            <div className="progress-bar rounded-pill" style={{ width: '70%', backgroundColor: accentGreen }}></div>
                        </div>
                        <small className="text-muted mt-2 d-block">Bạn đang làm rất tốt! ✨</small>
                    </motion.div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-grow-1 d-flex flex-column overflow-hidden position-relative">
                    <div
                        ref={scrollRef}
                        className="flex-grow-1 overflow-auto bg-transparent px-3 px-md-4 py-4"
                    >
                        <div className="max-w-chat mx-auto">
                            {/* Welcome Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-5"
                            >
                                <div className="p-5 rounded-5 glass-card border-0 d-inline-block position-relative shadow-sm">
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <div className="p-3 rounded-circle shadow-sm bg-white border" style={{ color: accentGreen }}>
                                            <Bot size={40} />
                                        </div>
                                    </div>
                                    <h2 className="fw-bold mb-3 mt-3 px-md-4" style={{ color: brandGreen }}>Chào bạn, mình là Trợ lý Calmistry</h2>
                                    <p className="text-muted mb-0 mx-auto lh-lg" style={{ maxWidth: '420px', fontSize: '15px' }}>
                                        Mình ở đây để lắng nghe, thấu hiểu và cùng bạn tìm thấy niềm vui, sự bình yên trong tâm hồn mỗi ngày. ❤️
                                    </p>
                                </div>
                            </motion.div>

                            {loading && messages.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3 text-muted">Đang kết nối lịch sử trò chuyện...</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    <div className="d-flex flex-column gap-4 pb-4">
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                                            >
                                                <div className={`d-flex gap-3 max-w-chat-bubble ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm mt-1"
                                                        style={{
                                                            width: 38, height: 38, flexShrink: 0,
                                                            backgroundColor: msg.role === 'user' ? '#e2e8f0' : accentGreen,
                                                            color: msg.role === 'user' ? '#475569' : '#fff'
                                                        }}>
                                                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                                    </div>
                                                    <div style={{ flexGrow: 1 }}>
                                                        <div
                                                            className={`p-3 px-4 shadow-sm border-0 ${msg.role === 'user'
                                                                ? 'text-white'
                                                                : 'bg-white text-dark'
                                                                }`}
                                                            style={msg.role === 'user'
                                                                ? { backgroundColor: brandGreen, borderRadius: '22px 22px 2px 22px' }
                                                                : { backgroundColor: '#fff', borderRadius: '22px 22px 22px 2px', border: '1px solid #f1f5f9' }}
                                                        >
                                                            <p className="mb-0 lh-lg" style={{ fontSize: '15px', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isTyping && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-start">
                                                <div className="d-flex gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                        style={{ width: 38, height: 38, backgroundColor: accentGreen, color: '#fff' }}>
                                                        <Bot size={18} />
                                                    </div>
                                                    <div className="bg-white border-0 p-3 px-4 rounded-4 shadow-sm d-flex gap-2 align-items-center"
                                                        style={{ borderRadius: '22px 22px 22px 2px', border: '1px solid #f1f5f9' }}>
                                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }} className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: accentGreen }}></motion.span>
                                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: accentGreen }}></motion.span>
                                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: accentGreen }}></motion.span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* Input Area Overlay */}
                    <div className="p-4 bg-transparent" style={{ zIndex: 100 }}>
                        <div className="max-w-chat mx-auto">
                            <div className="glass-card d-flex gap-3 align-items-center p-2 rounded-pill border shadow-lg bg-white bg-opacity-80" style={{ backdropFilter: 'blur(10px)' }}>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent px-4 py-2"
                                    placeholder="Chia sẻ cùng trợ lý tại đây..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isTyping}
                                    style={{ fontSize: '15px' }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-success rounded-circle shadow p-0 d-flex align-items-center justify-content-center"
                                    style={{ backgroundColor: brandGreen, width: 48, height: 48, flexShrink: 0 }}
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                >
                                    <Send size={20} />
                                </motion.button>
                            </div>
                            <div className="text-center mt-3">
                                <small className="text-muted d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '12px' }}>
                                    <div className="p-1 px-2 rounded bg-white bg-opacity-50 border fw-bold text-success shadow-xs" style={{ fontSize: '10px' }}>SAFE SPACE</div>
                                    Trò chuyện an toàn và bảo mật cùng Calmistry
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - PC Only */}
                <div className="d-none d-xl-flex flex-column gap-4 p-4" style={{ width: '300px', flexShrink: 0 }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-4 rounded-5"
                    >
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <Star size={18} className="text-warning" /> Gợi ý cho bạn
                        </h6>
                        <div className="d-flex flex-column gap-2">
                            {suggestions.map((text, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(text)}
                                    className="btn btn-light bg-white border shadow-sm rounded-4 p-3 text-start small hover-lift transition-all"
                                    style={{ fontSize: '13px' }}
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.2}
                        className="glass-card p-4 rounded-5 bg-gradient-brand text-white border-0 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${brandGreen}, #1a2a22)` }}
                    >
                        <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                            <Heart size={18} /> Love yourself
                        </h6>
                        <p className="small mb-0 opacity-80 italic">"Hành trình vạn dặm khởi đầu từ một bước chân. Bạn đã rất nỗ lực rồi!"</p>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .max-w-chat { max-width: 800px; margin: 0 auto; width: 100%; }
                .max-w-chat-bubble { max-width: 85%; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-track { background: transparent; }
                .glass-card { 
                    background: rgba(255, 255, 255, 0.7); 
                    backdrop-filter: blur(10px); 
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
                }
                .hover-lift:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    border-color: #8ec339 !important;
                }
                .transition-all { transition: all 0.3s ease; }
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
            `}</style>
        </div>
    );
};

export default AiPersonalizedChat;
