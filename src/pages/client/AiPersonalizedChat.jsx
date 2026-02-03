import React, { useState, useRef, useEffect } from 'react';
import aiChatService from '../../services/aiChatService';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, RefreshCw, ChevronLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AiPersonalizedChat = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Chào bạn, mình là trợ lý Calmistry. Hôm nay lòng bạn có điều gì muốn sẻ chia cùng mình không? ❤️' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const brandGreen = '#324d3e';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await aiChatService.sendMessage(input);
            if (response && response.code === 1000) {
                setMessages(prev => [...prev, { role: 'bot', content: response.result }]);
            } else {
                toast.error("Hệ thống AI đang bận, thử lại sau nhé!");
            }
        } catch (error) {
            toast.error("Phiên làm việc hết hạn hoặc lỗi kết nối.");
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: '#f8fafc', marginTop: '60px' }}>
            {/* Header */}
            <div className="bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between sticky-top shadow-sm">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-circle shadow-sm" style={{ backgroundColor: brandGreen }}>
                            <Bot size={24} color="#fff" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold" style={{ color: brandGreen }}>Trợ Lý Calmistry</h5>
                            <div className="d-flex align-items-center gap-1">
                                <span className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></span>
                                <small className="text-muted">Đang lắng nghe...</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Sparkles size={20} className="text-warning" />
                    <span className="fw-medium small text-muted">AI Personalized</span>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-4"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                            <div className={`d-flex gap-3 max-w-75 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm`}
                                    style={{
                                        width: 40, height: 40, flexShrink: 0,
                                        backgroundColor: msg.role === 'user' ? '#e2e8f0' : brandGreen,
                                        color: msg.role === 'user' ? '#475569' : '#fff'
                                    }}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div
                                    className={`p-3 rounded-4 shadow-sm ${msg.role === 'user'
                                            ? 'bg-success text-white'
                                            : 'bg-white text-dark border'
                                        }`}
                                    style={msg.role === 'user' ? { backgroundColor: brandGreen } : {}}
                                >
                                    <p className="mb-0 lh-base">{msg.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-start">
                            <div className="d-flex gap-3">
                                <div className="bg-dark bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                    <Bot size={20} className="text-muted" />
                                </div>
                                <div className="bg-white border p-3 rounded-4 shadow-sm d-flex gap-1 align-items-center">
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="bg-muted rounded-circle" style={{ width: 6, height: 6, backgroundColor: '#cbd5e1' }}></motion.span>
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="bg-muted rounded-circle" style={{ width: 6, height: 6, backgroundColor: '#cbd5e1' }}></motion.span>
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="bg-muted rounded-circle" style={{ width: 6, height: 6, backgroundColor: '#cbd5e1' }}></motion.span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-top shadow-lg">
                <div className="container max-w-container">
                    <div className="input-group-custom d-flex gap-2">
                        <input
                            type="text"
                            className="form-control rounded-pill border-0 bg-light px-4 py-3"
                            placeholder="Gửi tin nhắn cho trợ lý..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isTyping}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-success rounded-circle shadow-sm p-3 d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: brandGreen, width: 50, height: 50 }}
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            <Send size={20} />
                        </motion.button>
                    </div>
                    <div className="text-center mt-2">
                        <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                            <Heart size={12} className="text-danger" /> Trò chuyện an toàn và riêng tư
                        </small>
                    </div>
                </div>
            </div>

            <style>{`
        .max-w-75 { max-width: 75%; }
        .max-w-container { max-width: 900px; margin: 0 auto; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
        </div>
    );
};

export default AiPersonalizedChat;
