import React, { useState, useEffect, useRef } from "react";
import chatService from "../../services/chatService";
import userService from "../../services/userService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, Users, MessageCircle, Sparkles,
    Ghost, Cloud, Moon, Star, Sun, Info, Heart,
    LogOut, ChevronRight, Hash, Compass, Flower2
} from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';

const SanctuaryRoom = ({ room, active, onClick, icon }) => (
    <motion.div
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`p-3 rounded-4 mb-2 cursor-pointer transition-all ${active
            ? 'bg-white shadow-sm border-start border-4 border-success'
            : 'hover-bg-light'
            }`}
        style={{ cursor: 'pointer' }}
    >
        <div className="d-flex align-items-center gap-3">
            <div className={`fs-3 rounded-circle d-flex align-items-center justify-content-center p-2 ${active ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                {icon}
            </div>
            <div className="flex-grow-1 overflow-hidden">
                <h6 className={`mb-0 fw-bold ${active ? 'text-success' : 'text-dark'}`}>{room.name}</h6>
                <small className="text-muted text-truncate d-block">{room.description}</small>
            </div>
            {active && <ChevronRight size={16} className="text-success" />}
        </div>
    </motion.div>
);

const GroupChat = () => {
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [particles, setParticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const subscriptionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const brandGreen = '#324d3e';
    const softGreen = '#f0fdf4';

    const roomSpecs = {
        "Trạm Dừng Chân": { icon: "🌿", prompt: "Hôm nay điều gì làm bạn nhẹ lòng?" },
        "Góc Tâm Tình": { icon: "☕", prompt: "Có điều gì đang đè nặng tâm trí bạn không?" },
        "Khu Vườn Biết Ơn": { icon: "🌸", prompt: "Ghi lại một điều bạn thấy trân trọng hôm nay..." }
    };

    const getRoomIcon = (name) => roomSpecs[name]?.icon || "💬";
    const getRoomPrompt = (name) => roomSpecs[name]?.prompt || "Chia sẻ tâm tư của bạn...";

    const anonIcons = ["☁️", "🌙", "⭐", "🍃", "🍄", "🌊"];

    useEffect(() => {
        const init = async () => {
            try {
                const [user, roomsRes] = await Promise.all([
                    userService.getMyInfo(),
                    chatService.getRooms()
                ]);

                setCurrentUser(user);

                if (roomsRes && roomsRes.code === 1000) {
                    const fetchedRooms = roomsRes.result;
                    setRooms(fetchedRooms);
                    if (fetchedRooms.length > 0) {
                        setSelectedRoom(fetchedRooms[0]);
                    }
                }

                chatService.connect(
                    () => {
                        setIsConnected(true);
                        setIsLoading(false);
                    },
                    () => {
                        setIsConnected(false);
                        setIsLoading(false);
                    }
                );
            } catch (error) {
                console.error("Layout init error:", error);
                toast.error("Không thể kết nối vào Sanctuary.");
                setIsLoading(false);
            }
        };
        init();
        return () => chatService.disconnect();
    }, []);

    useEffect(() => {
        if (isConnected && selectedRoom) {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            setMessages([]);
            subscriptionRef.current = chatService.subscribeToRoom(selectedRoom.id, (payload) => {
                const message = JSON.parse(payload.body);
                if (message.messageType === 'SYSTEM' && message.messageText === 'HEALING_VIBES') {
                    triggerParticles();
                } else {
                    setMessages(prev => [...prev, message]);
                    scrollToBottom();
                }
            });
        }
    }, [isConnected, selectedRoom]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedRoom) return;

        const messagePayload = {
            sender: {
                id: currentUser.id,
                username: isAnonymous ? `Bạn ${anonIcons[currentUser.id % anonIcons.length]}` : (currentUser.fullName || currentUser.username)
            },
            messageText: newMessage,
            messageType: 'TEXT',
            isAnonymous: isAnonymous,
            room: { id: selectedRoom.id }
        };

        chatService.sendMessage(messagePayload);
        setNewMessage("");
    };

    const sendHealingVibes = () => {
        const messagePayload = {
            sender: { id: currentUser.id, username: currentUser.username },
            messageText: 'HEALING_VIBES',
            messageType: 'SYSTEM',
            room: { id: selectedRoom.id }
        };
        chatService.sendMessage(messagePayload);
        toast.info("✨ Đang lan tỏa năng lượng tích cực...");
    };

    const triggerParticles = () => {
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100,
            y: 100,
            size: Math.random() * 20 + 10,
            color: ['#74c655', '#3498db', '#f1c40f', '#e91e63'][Math.floor(Math.random() * 4)]
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 3000);
    };

    return (
        <div className="min-vh-100 py-4 py-md-5" style={{
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            marginTop: '60px'
        }}>
            <div className="container-xl pt-3">
                <div className="row g-4" style={{ height: 'calc(100vh - 160px)' }}>

                    {/* Left Sidebar: Rooms */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <div className="card border-0 shadow-sm rounded-5 h-100 p-4 bg-white bg-opacity-80 backdrop-blur">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h5 className="fw-900 mb-0 d-flex align-items-center gap-2" style={{ color: brandGreen }}>
                                    <Compass size={22} />
                                    VÙNG YÊN
                                </h5>
                                <div className={`badge rounded-pill ${isConnected ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${isConnected ? 'success' : 'danger'} small`}>
                                    {isConnected ? 'Trực tuyến' : 'Mất kết nối'}
                                </div>
                            </div>

                            <div className="flex-grow-1 overflow-auto pe-2">
                                {rooms.map(room => (
                                    <SanctuaryRoom
                                        key={room.id}
                                        room={room}
                                        icon={getRoomIcon(room.name)}
                                        active={selectedRoom?.id === room.id}
                                        onClick={() => setSelectedRoom(room)}
                                    />
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-top">
                                <div className="p-3 rounded-4 bg-light border border-white">
                                    <h6 className="fw-bold mb-2 small d-flex align-items-center gap-2">
                                        <Info size={14} className="text-success" />
                                        Lời nhắc từ Sanctuary
                                    </h6>
                                    <p className="small text-muted mb-0 italic">
                                        "{getRoomPrompt(selectedRoom?.name)}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="col-lg-9 h-100">
                        <div className="card border-0 shadow-lg rounded-5 h-100 overflow-hidden bg-white d-flex flex-column relative">

                            {/* Particles Overlay */}
                            <div className="position-absolute w-100 h-100 pointer-events-none" style={{ zIndex: 10, overflow: 'hidden', pointerEvents: 'none' }}>
                                {particles.map(p => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ y: '110vh', x: `${p.x}vw`, opacity: 1, scale: 0 }}
                                        animate={{ y: '-10vh', opacity: 0, scale: 1.5 }}
                                        transition={{ duration: 3, ease: "easeOut" }}
                                        className="position-absolute"
                                        style={{ fontSize: p.size, color: p.color }}
                                    >
                                        ✨
                                    </motion.div>
                                ))}
                            </div>

                            {/* Chat Header */}
                            <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-white bg-opacity-90 backdrop-blur sticky-top">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-lg-none btn btn-light rounded-circle p-2" onClick={() => { }}>
                                        <Compass size={20} />
                                    </div>
                                    <div className="fs-1">{getRoomIcon(selectedRoom?.name)}</div>
                                    <div>
                                        <h4 className="fw-900 mb-0" style={{ color: brandGreen }}>#{selectedRoom?.name}</h4>
                                        <p className="text-muted mb-0 small">{selectedRoom?.description || "Cuộc trò chuyện cùng cộng đồng"}</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={sendHealingVibes}
                                        className="btn btn-warning btn-sm rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-2 text-dark"
                                    >
                                        <Sparkles size={16} />
                                        <span className="d-none d-md-inline">Gửi năng lượng</span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-grow-1 overflow-auto p-4 bg-light bg-opacity-30">
                                {isLoading ? (
                                    <div className="d-flex justify-content-center align-items-center h-100 flex-column gap-3 text-muted">
                                        <div className="spinner-grow text-success" />
                                        <span>Đang kết nối vào Sanctuary...</span>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        <div className="text-center py-5">
                                            <div className="bg-white bg-opacity-50 rounded-4 p-4 d-inline-block shadow-sm">
                                                <Flower2 size={40} className="text-success mb-3 opacity-50" />
                                                <h5 className="fw-bold">Chào mừng bạn đến với {selectedRoom?.name}</h5>
                                                <p className="text-muted small mb-0">Nơi mọi tâm tư đều được lắng nghe và trân trọng.</p>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {messages.map((msg, index) => {
                                                const isMe = msg.sender?.id === currentUser?.id;
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                                                    >
                                                        <div style={{ maxWidth: '80%' }}>
                                                            {!isMe && (
                                                                <small className="text-muted fw-bold ms-2 mb-1 d-block opacity-75">
                                                                    {msg.sender?.username}
                                                                </small>
                                                            )}
                                                            <div className={`p-3 rounded-4 shadow-sm ${isMe
                                                                ? 'bg-success text-white'
                                                                : 'bg-white text-dark border border-white'
                                                                }`}
                                                                style={{
                                                                    borderBottomRightRadius: isMe ? '4px' : '20px',
                                                                    borderBottomLeftRadius: isMe ? '20px' : '4px',
                                                                    backdropFilter: isMe ? 'none' : 'blur(10px)',
                                                                    backgroundColor: isMe ? '#324d3e' : 'rgba(255,255,255,0.8)'
                                                                }}>
                                                                <p className="mb-0 lh-base">{msg.messageText}</p>
                                                            </div>
                                                            <small className={`text-muted d-block mt-1 ${isMe ? 'text-end' : 'text-start'}`} style={{ fontSize: '0.65rem' }}>
                                                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </small>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white bg-opacity-90 backdrop-blur border-top">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2">
                                        <input
                                            className="form-check-input cursor-pointer"
                                            type="checkbox"
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <label className={`form-check-label small fw-bold ${isAnonymous ? 'text-primary' : 'text-muted'}`}>
                                            {isAnonymous ? 'Đang ẩn danh' : 'Hiện danh tính'}
                                        </label>
                                    </div>
                                    <small className="text-muted d-none d-md-block opacity-50 italic">Nhấn Enter để gửi</small>
                                </div>
                                <form onSubmit={handleSendMessage} className="d-flex gap-3 align-items-center">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg border-0 bg-light rounded-pill px-4 fs-6 py-3"
                                        placeholder={`Gửi tâm tư vào #${selectedRoom?.name}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={!isConnected || !selectedRoom}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="btn btn-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        disabled={!isConnected || !newMessage.trim() || !selectedRoom}
                                        style={{ width: '56px', height: '56px', backgroundColor: brandGreen }}
                                    >
                                        <Send size={22} className="ms-1" />
                                    </motion.button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .backdrop-blur { backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); }
                .fw-900 { font-weight: 900; }
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.03); }
                .cursor-pointer { cursor: pointer; }
                .card { transition: all 0.3s ease; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
                .form-check-input:checked { background-color: #3498db; border-color: #3498db; }
            `}</style>
        </div>
    );
};

export default GroupChat;
