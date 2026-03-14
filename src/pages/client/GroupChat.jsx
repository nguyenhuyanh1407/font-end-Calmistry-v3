import React, { useState, useEffect, useRef } from "react";
import chatService from "../../services/chatService";
import userService from "../../services/userService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, Users, MessageCircle, Sparkles,
    Ghost, Cloud, Moon, Star, Sun, Info, Heart,
    LogOut, ChevronRight, Hash, Compass, Flower2,
    Image as ImageIcon, Link as LinkIcon, Plus, X, Camera
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
    const [page, setPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [particles, setParticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomData, setNewRoomData] = useState({ name: "", description: "", type: "GROUP" });
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef(null);

    const subscriptionRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const brandGreen = '#324d3e';
    const softGreen = '#f0fdf4';

    const roomSpecs = {
        "Trạm Dừng Chân": { icon: "🌿", prompt: "Hôm nay điều gì làm bạn nhẹ lòng?" },
        "Góc Tâm Tình": { icon: "☕", prompt: "Có điều gì đang đè nặng tâm trí bạn không?" },
        "Khu Vườn Biết Ơn": { icon: "🌸", prompt: "Ghi lại một điều bạn thấy trân trọng hôm nay..." }
    };

    const getRoomIcon = (name) => roomSpecs[name]?.icon || "💬";
    const getRoomPrompt = (name) => roomSpecs[name]?.prompt || "Chia sẻ tâm tư của bạn...";

    const anonIcons = ["☁️", "🌙", "⭐", "🍃", "🍄", "🌊", "🦊", "🐢", "🐳", "🦉", "🍀", "🌸"];
    const anonColors = ["#FFB6C1", "#FFDAB9", "#E6E6FA", "#FFF0F5", "#F0F8FF", "#F5FFFA", "#F0FFF0", "#FFFFE0", "#FFFACD", "#FFE4E1", "#F5F5DC", "#FAF0E6"];

    const getAnonymousProfile = (id) => {
        if (!id) return { icon: "🎭", color: "#f8f9fa" };
        const index = id % anonIcons.length;
        return { icon: anonIcons[index], color: anonColors[index] };
    };

    // --- Sound Effects ---
    const playSound = (type = "message") => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            const gainNode = context.createGain();

            osc.connect(gainNode);
            gainNode.connect(context.destination);

            if (type === "healing") {
                // Gentle chime
                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.50, context.currentTime + 0.5); // C6
                gainNode.gain.setValueAtTime(0, context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.5);
                osc.start(context.currentTime);
                osc.stop(context.currentTime + 1.5);
            } else {
                // Soft pop
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, context.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0, context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
                osc.start(context.currentTime);
                osc.stop(context.currentTime + 0.2);
            }
        } catch (e) {
            console.log("Audio not supported or blocked", e);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [user, roomsRes] = await Promise.all([
                    userService.getMyInfo(),
                    chatService.getRooms()
                ]);

                setCurrentUser(user);

                // Robust Admin check: handles string array (backend default) and case-insensitivity
                const userRoles = user.roles || [];
                const hasAdminPrivileges = userRoles.some(role => {
                    const roleName = (typeof role === 'string' ? role : role.name || '').toUpperCase();
                    return roleName.includes('ADMIN');
                });
                setIsAdmin(hasAdminPrivileges);

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
            const loadHistoryAndSubscribe = async () => {
                try {
                    if (subscriptionRef.current) {
                        subscriptionRef.current.unsubscribe();
                    }

                    // Fetch history first
                    setPage(0);
                    setHasMoreMessages(true);
                    const historyRes = await chatService.getRoomHistory(selectedRoom.id, 0, 50);
                    if (historyRes && historyRes.code === 1000) {
                        const initMessages = historyRes.result;
                        setMessages([...initMessages].reverse());
                        setHasMoreMessages(initMessages.length === 50);
                        scrollToBottom();
                    } else {
                        setMessages([]);
                        setHasMoreMessages(false);
                    }

                    // Then subscribe for new ones
                    subscriptionRef.current = chatService.subscribeToRoom(selectedRoom.id, (payload) => {
                        const message = JSON.parse(payload.body);
                        
                        if (message.messageType === 'SYSTEM' && message.messageText === 'HEALING_VIBES') {
                            triggerParticles();
                            playSound("healing");
                        } else {
                            setMessages(prev => {
                                // Check for existing optimistic message (by temp ID or same content/user/time)
                                const isDuplicate = prev.some(msg => 
                                    (msg.id === message.id) || 
                                    (msg.tempId && msg.messageText === message.messageText && msg.sender?.id === message.sender?.id)
                                );
                                
                                if (isDuplicate) {
                                    // Update temp message with real server data if needed
                                    return prev.map(msg => 
                                        (msg.tempId && msg.messageText === message.messageText && msg.sender?.id === message.sender?.id)
                                        ? message : msg
                                    );
                                }
                                
                                return [...prev, message];
                            });
                            scrollToBottom();
                            if (message.sender?.id !== currentUser?.id) {
                                playSound("message");
                            }
                        }
                    });
                } catch (error) {
                    console.error("Error loading history/subscribing:", error);
                    toast.error("Không thể tải lịch sử trò chuyện.");
                    setMessages([]);
                }
            };

            loadHistoryAndSubscribe();
        }
    }, [isConnected, selectedRoom]);

    const loadMoreMessages = async () => {
        if (!hasMoreMessages || isLoadingMore || !selectedRoom) return;

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await chatService.getRoomHistory(selectedRoom.id, nextPage, 50);

            if (res && res.code === 1000) {
                const olderMessages = res.result;
                if (olderMessages.length > 0) {
                    const container = messagesContainerRef.current;
                    const previousScrollHeight = container ? container.scrollHeight : 0;

                    setMessages(prev => [...[...olderMessages].reverse(), ...prev]);
                    setPage(nextPage);
                    setHasMoreMessages(olderMessages.length === 50);

                    setTimeout(() => {
                        if (container) {
                            const newScrollHeight = container.scrollHeight;
                            container.scrollTop = newScrollHeight - previousScrollHeight;
                        }
                    }, 0);
                } else {
                    setHasMoreMessages(false);
                }
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
            toast.error("Không tải thêm được tin nhắn.");
        } finally {
            setIsLoadingMore(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !currentUser || !selectedRoom) return;

        const isAnon = isAnonymous;
        const senderUsername = isAnon ? `Ẩn Danh` : (currentUser.fullName || currentUser.username);

        const messagePayload = {
            sender: {
                id: currentUser.id,
                username: senderUsername
            },
            messageText: newMessage,
            mediaUrl: selectedImage,
            messageType: selectedImage ? 'IMAGE' : 'TEXT',
            isAnonymous: isAnon,
            room: { id: selectedRoom.id },
            createdAt: new Date().toISOString(),
            tempId: Date.now() // For optimistic update tracking
        };

        // Optimistic update: show message immediately
        setMessages(prev => [...prev, messagePayload]);
        scrollToBottom();

        chatService.sendMessage(messagePayload);
        setNewMessage("");
        setSelectedImage(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, upload to S3/Cloudinary here.
        // For now, we simulate with a local preview or placeholder
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await chatService.createRoom(newRoomData);
            if (res.code === 1000) {
                toast.success("Tạo Sanctuary mới thành công!");
                setRooms(prev => [...prev, res.result]);
                setShowCreateRoom(false);
                setNewRoomData({ name: "", description: "", type: "GROUP" });
            }
        } catch (error) {
            toast.error("Không thể tạo phòng mới.");
        }
    };

    const loadUsers = async () => {
        try {
            const users = await userService.getAllUsers();
            setAllUsers(users);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            const res = await chatService.addMember(selectedRoom.id, userId);
            if (res.code === 1000) {
                toast.success("Đã thêm thành viên vào Vùng Yên!");
                setSelectedRoom(res.result);
                // Update rooms list as well
                setRooms(prev => prev.map(r => r.id === res.result.id ? res.result : r));
            }
        } catch (error) {
            toast.error("Không thể thêm thành viên.");
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            const res = await chatService.removeMember(selectedRoom.id, userId);
            if (res.code === 1000) {
                toast.warning("Đã xóa thành viên khỏi Vùng Yên.");
                setSelectedRoom(res.result);
                setRooms(prev => prev.map(r => r.id === res.result.id ? res.result : r));
            }
        } catch (error) {
            toast.error("Không thể xóa thành viên.");
        }
    };

    const filteredUsers = allUsers.filter(u =>
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderMessageText = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-info text-decoration-underline">{part}</a>;
            }
            return part;
        });
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
        <div style={{
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            paddingTop: '80px', // Standard padding for fixed navbar
            paddingBottom: '40px'
        }}>
            <div className="container-xl">
                <div className="row g-4" style={{ height: '750px', maxHeight: 'calc(100vh - 180px)' }}>

                    {/* Left Sidebar: Rooms */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <div className="card border-0 shadow-sm rounded-5 h-100 p-4 bg-white bg-opacity-80 backdrop-blur">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h5 className="fw-900 mb-0 d-flex align-items-center gap-2" style={{ color: brandGreen }}>
                                    <Compass size={22} />
                                    VÙNG YÊN
                                </h5>
                                {isAdmin && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowCreateRoom(true)}
                                        className="btn btn-success btn-sm rounded-circle p-1"
                                    >
                                        <Plus size={18} />
                                    </motion.button>
                                )}
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

                                    {isAdmin && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setShowMembersModal(true);
                                                loadUsers();
                                            }}
                                            className="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
                                        >
                                            <Users size={16} />
                                            <span className="d-none d-md-inline">Thành viên</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div
                                ref={messagesContainerRef}
                                className="flex-grow-1 overflow-auto p-4 bg-light bg-opacity-30"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {isLoading ? (
                                    <div className="d-flex justify-content-center align-items-center h-100 flex-column gap-3 text-muted">
                                        <div className="spinner-grow text-success" />
                                        <span>Đang kết nối vào Sanctuary...</span>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {hasMoreMessages && (
                                            <div className="text-center mb-2 mt-2">
                                                <button
                                                    onClick={loadMoreMessages}
                                                    disabled={isLoadingMore}
                                                    className="btn btn-sm btn-outline-success rounded-pill px-4 shadow-sm"
                                                    style={{ color: brandGreen, borderColor: brandGreen }}
                                                >
                                                    {isLoadingMore ? "Đang tải..." : "Tải thêm tin nhắn cũ"}
                                                </button>
                                            </div>
                                        )}
                                        <div className="text-center py-4 mb-3 position-sticky top-0" style={{ zIndex: 5 }}>
                                            <div className="bg-white bg-opacity-90 backdrop-blur rounded-4 p-3 d-inline-block shadow-sm border border-success border-opacity-25" style={{ maxWidth: '80%' }}>
                                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                                    <Sparkles size={16} className="text-warning" />
                                                    <span className="fw-bold text-success small text-uppercase tracking-wider">Châm ngôn hôm nay</span>
                                                    <Sparkles size={16} className="text-warning" />
                                                </div>
                                                <h6 className="fw-bold mb-1" style={{ color: brandGreen }}>"{getRoomPrompt(selectedRoom?.name)}"</h6>
                                                <p className="text-muted small mb-0 mt-2 italic">Hãy cùng chia sẻ những năng lượng chữa lành vào vùng yên này nhé.</p>
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
                                                                <small className="text-muted fw-bold ms-2 mb-1 d-block opacity-75 d-flex align-items-center gap-1">
                                                                    {msg.isAnonymous && <span className="fs-6">{getAnonymousProfile(msg.sender?.id).icon}</span>}
                                                                    {msg.sender?.username}
                                                                </small>
                                                            )}
                                                            <div className={`p-3 rounded-4 shadow-sm ${isMe
                                                                ? 'bg-success text-white'
                                                                : 'text-dark border'
                                                                }`}
                                                                style={{
                                                                    borderBottomRightRadius: isMe ? '4px' : '20px',
                                                                    borderBottomLeftRadius: isMe ? '20px' : '4px',
                                                                    backdropFilter: isMe ? 'none' : 'blur(10px)',
                                                                    backgroundColor: isMe ? brandGreen : (msg.isAnonymous ? getAnonymousProfile(msg.sender?.id).color : '#ffffff'),
                                                                    borderColor: isMe ? 'transparent' : 'rgba(0,0,0,0.05)'
                                                                }}>
                                                                {msg.mediaUrl && (
                                                                    <div className="mb-2">
                                                                        <img src={msg.mediaUrl} alt="uploaded" className="img-fluid rounded-3 shadow-sm" style={{ maxHeight: '300px' }} />
                                                                    </div>
                                                                )}
                                                                <p className="mb-0 lh-base">{renderMessageText(msg.messageText)}</p>
                                                            </div>
                                                            <small className={`text-muted d-block mt-1 ${isMe ? 'text-end' : 'text-start'}`} style={{ fontSize: '0.65rem' }}>
                                                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </small>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
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
                                    <div className="flex-grow-1 position-relative">
                                        {selectedImage && (
                                            <div className="position-absolute bottom-100 start-0 mb-3 p-2 bg-white rounded-4 shadow-lg border" style={{ width: '100px' }}>
                                                <img src={selectedImage} alt="preview" className="img-fluid rounded-3" />
                                                <button
                                                    onClick={() => setSelectedImage(null)}
                                                    className="position-absolute top-0 end-0 btn btn-danger btn-xs rounded-circle p-0"
                                                    style={{ width: '20px', height: '20px', marginTop: '-10px', marginRight: '-10px' }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            className="form-control form-control-lg border-0 bg-light rounded-pill px-4 fs-6 py-3"
                                            placeholder={selectedImage ? "Thêm ghi chú cho ảnh..." : `Gửi tâm tư vào #${selectedRoom?.name}...`}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            disabled={!isConnected || !selectedRoom}
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="d-none"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                        style={{ width: '56px', height: '56px' }}
                                    >
                                        <Camera size={22} className="text-muted" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="btn btn-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        disabled={!isConnected || (!newMessage.trim() && !selectedImage) || !selectedRoom}
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

            {/* Create Room Modal */}
            <AnimatePresence>
                {showCreateRoom && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 11000 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="position-absolute w-100 h-100 bg-black bg-opacity-50"
                            onClick={() => setShowCreateRoom(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="card border-0 shadow-lg rounded-5 p-4 bg-white position-relative"
                            style={{ width: '400px' }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-900 mb-0">Tạo Sanctuary Mới</h5>
                                <button className="btn btn-light rounded-circle p-1" onClick={() => setShowCreateRoom(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateRoom}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Tên Sanctuary</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-4 border-light bg-light"
                                        placeholder="Ví dụ: Góc Chữa Lành"
                                        value={newRoomData.name}
                                        onChange={e => setNewRoomData({ ...newRoomData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">Mô tả mục tiêu</label>
                                    <textarea
                                        className="form-control rounded-4 border-light bg-light"
                                        rows="3"
                                        placeholder="Mục tiêu của cộng đồng này là gì?"
                                        value={newRoomData.description}
                                        onChange={e => setNewRoomData({ ...newRoomData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-sm" style={{ backgroundColor: brandGreen }}>
                                    Xác nhận tạo Vùng Yên
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Members Management Modal */}
            <AnimatePresence>
                {showMembersModal && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 11000 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="position-absolute w-100 h-100 bg-black bg-opacity-50"
                            onClick={() => setShowMembersModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="card border-0 shadow-lg rounded-5 p-4 bg-white position-relative d-flex flex-column"
                            style={{ width: '500px', maxHeight: '80vh' }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-900 mb-0">Quản lý Thành viên #{selectedRoom?.name}</h5>
                                <button className="btn btn-light rounded-circle p-1" onClick={() => setShowMembersModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="input-group rounded-pill bg-light border-0 px-3 py-1">
                                    <span className="input-group-text bg-transparent border-0 text-muted"><Users size={18} /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 shadow-none"
                                        placeholder="Tìm kiếm người dùng..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-grow-1 overflow-auto pe-2">
                                <h6 className="fw-bold mb-3 small text-success">Kết quả tìm kiếm</h6>
                                {filteredUsers.length === 0 ? (
                                    <p className="text-center text-muted small py-4">Không tìm thấy người dùng phù hợp.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2 mb-4">
                                        {filteredUsers.map(user => {
                                            const isMember = selectedRoom?.members?.some(m => m.id === user.id);
                                            return (
                                                <div key={user.id} className="p-3 rounded-4 bg-light d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <div className="fw-bold small">{user.fullName || user.username}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>@{user.username}</div>
                                                    </div>
                                                    {isMember ? (
                                                        <button
                                                            onClick={() => handleRemoveMember(user.id)}
                                                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                        >
                                                            Xóa
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddMember(user.id)}
                                                            className="btn btn-success btn-sm rounded-pill px-3"
                                                            style={{ backgroundColor: brandGreen }}
                                                        >
                                                            Thêm
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
