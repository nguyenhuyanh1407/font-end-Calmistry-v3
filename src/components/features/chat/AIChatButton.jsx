import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useLocation } from "react-router-dom";
import aiChatService from "../../../services/aiChatService";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const controls = useAnimation();
  const location = useLocation();
  const chatBodyRef = useRef(null);

  // --- CẤU HÌNH KHOẢNG CÁCH ---
  const isMobile = window.innerWidth <= 768;
  const paddingX = isMobile ? 20 : 57;
  const paddingTop = 60;
  const paddingBottom = isMobile ? 25 : 42;
  const iconSize = isMobile ? 50 : 60;
  const journalFabSize = isMobile ? 55 : 65;
  const gapBetweenButtons = isMobile ? 25 : 20;
  const brandLightGreen = "#8ec339";
  const brandDarkGreen = "#75a32d";

  // --- STATES ---
  const [dimensions, setDimensions] = useState({
    width: isMobile ? Math.min(350, window.innerWidth - 30) : 340,
    height: isMobile ? Math.min(550, window.innerHeight - 150) : 500
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // --- LOGIC VỊ TRÍ ---
  const calculateY = (isRightSide, path) => {
    const isJournal = path.includes('/journal');
    if (isRightSide && isJournal) {
      return window.innerHeight - paddingBottom - journalFabSize - gapBetweenButtons - iconSize;
    }
    return window.innerHeight - iconSize - paddingBottom;
  };

  const [position, setPosition] = useState(() => {
    const initX = window.innerWidth - iconSize - paddingX;
    return { x: initX, y: calculateY(true, window.location.pathname) };
  });

  // Load chat history when opening
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, isTyping]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const data = await aiChatService.getChatHistory(0, 50);

      // Convert to chat format
      const messages = data.messages.map(msg => ({
        role: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      // Add welcome message if no history
      if (messages.length === 0) {
        messages.push({ role: "ai", text: "Xin chào! Tôi là Calmistry AI. Tôi có thể giúp gì cho bạn hôm nay?" });
      }

      setChatHistory(messages);
    } catch (e) {
      console.error('Error loading chat history:', e);
      setChatHistory([{ role: "ai", text: "Xin chào! Tôi là Calmistry AI. Tôi có thể giúp gì cho bạn hôm nay?" }]);
    } finally {
      setLoading(false);
    }
  };

  // Update position when path changes
  useEffect(() => {
    const isRightSide = position.x > window.innerWidth / 2;
    const isBottomSide = position.y > window.innerHeight / 2;

    if (isBottomSide) {
      const newY = calculateY(isRightSide, location.pathname);
      setPosition(prev => ({ ...prev, y: newY }));
      controls.start({
        y: newY,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      });
    }
  }, [location.pathname, controls]);

  const handleDragEnd = (event, info) => {
    const { x, y } = info.point;
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    const isRightSide = x >= midX;
    const targetX = isRightSide ? window.innerWidth - iconSize - paddingX : paddingX;
    let targetY = y < midY ? paddingTop : calculateY(isRightSide, location.pathname);

    setPosition({ x: targetX, y: targetY });
    controls.start({
      x: targetX, y: targetY,
      transition: { type: "spring", stiffness: 250, damping: 25 }
    });
  };

  // --- RESIZE HANDLERS ---
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: dimensions.width,
      h: dimensions.height
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;

      const isRightSide = position.x > window.innerWidth / 2;
      const isBottomSide = position.y > window.innerHeight / 2;

      let newWidth = resizeStartPos.current.w;
      let newHeight = resizeStartPos.current.h;

      if (isRightSide) {
        newWidth = resizeStartPos.current.w - deltaX;
      } else {
        newWidth = resizeStartPos.current.w + deltaX;
      }

      if (isBottomSide) {
        newHeight = resizeStartPos.current.h - deltaY;
      } else {
        newHeight = resizeStartPos.current.h + deltaY;
      }

      setDimensions({
        width: Math.max(300, Math.min(newWidth, 600)),
        height: Math.max(350, Math.min(newHeight, 800))
      });
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, position]);

  const handleSend = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage = message;
    setMessage("");

    setChatHistory(prev => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);
    setError("");

    try {
      const response = await aiChatService.sendMessage(userMessage);
      setChatHistory(prev => [...prev, { role: "ai", text: response.aiResponse }]);
    } catch (e) {
      console.error('Error sending message:', e);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setChatHistory(prev => [...prev, { role: "ai", text: "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={fixedContainer}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              ...chatWindow,
              width: isMobile ? 'calc(100vw - 30px)' : `${dimensions.width}px`,
              height: isMobile ? 'calc(80vh - 100px)' : `${dimensions.height}px`,
              left: isMobile ? '15px' : (position.x > window.innerWidth / 2 ? position.x - (dimensions.width - 50) : position.x),
              top: isMobile ? '80px' : (position.y > window.innerHeight / 2 ? position.y - (dimensions.height + 20) : position.y + 75),
            }}
          >
            {/* Custom scrollbar styles */}
            <style>{`
              #chat-body-scroll::-webkit-scrollbar { width: 5px; }
              #chat-body-scroll::-webkit-scrollbar-track { background: transparent; }
              #chat-body-scroll::-webkit-scrollbar-thumb { background: rgba(142, 195, 57, 0.2); border-radius: 10px; }
              #chat-body-scroll::-webkit-scrollbar-thumb:hover { background: rgba(142, 195, 57, 0.4); }
              .typing-dots { display: inline-flex; gap: 3px; }
              .typing-dots span {
                width: 5px; height: 5px; background: #8ec339; border-radius: 50%;
                animation: typing 1.4s infinite ease-in-out;
              }
              .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
              .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
              @keyframes typing {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                40% { transform: scale(1.2); opacity: 1; }
              }
            `}</style>

            {!isMobile && (
              <div
                onMouseDown={handleResizeStart}
                style={{
                  position: 'absolute',
                  top: position.y > window.innerHeight / 2 ? 0 : 'auto',
                  bottom: position.y > window.innerHeight / 2 ? 'auto' : 0,
                  left: position.x > window.innerWidth / 2 ? 0 : 'auto',
                  right: position.x > window.innerWidth / 2 ? 'auto' : 0,
                  width: '15px',
                  height: '15px',
                  cursor: 'nwse-resize',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ccc',
                  opacity: 0.5
                }}
              >
                <i className="bi bi-arrows-angle-expand" style={{ fontSize: '10px', transform: 'rotate(90deg)' }}></i>
              </div>
            )}

            {/* Header */}
            <div style={{ ...chatHeader, background: `linear-gradient(135deg, ${brandLightGreen}, ${brandDarkGreen})` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={avatarCircle}>
                  <motion.i 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="bi bi-robot"
                  ></motion.i>
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "15px", letterSpacing: "0.3px" }}>Calmistry AI</div>
                  <div style={{ fontSize: "11px", opacity: 0.9, display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "6px", height: "6px", backgroundColor: "#fff", borderRadius: "50%", boxShadow: "0 0 5px #fff" }}></span>
                    Đang trực tuyến
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)} 
                style={closeBtn}
              >
                <i className="bi bi-x-lg"></i>
              </motion.button>
            </div>

            {/* Body */}
            <div id="chat-body-scroll" ref={chatBodyRef} style={chatBody}>
              {loading && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', fontStyle: 'italic', fontSize: '13px' }}>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Đang tải lịch sử trò chuyện...
                  </motion.div>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {!loading && chatHistory.map((msg, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "12px" }}
                  >
                    <div style={{
                      ...messageBubble,
                      background: msg.role === "user" 
                        ? `linear-gradient(135deg, ${brandLightGreen}, ${brandDarkGreen})` 
                        : "#ffffff",
                      color: msg.role === "user" ? "#ffffff" : "#324d3e",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      boxShadow: msg.role === "user" 
                        ? "0 4px 12px rgba(142, 195, 57, 0.2)" 
                        : "0 4px 12px rgba(0,0,0,0.03)",
                      border: msg.role === "user" ? "none" : "1px solid #f0f3f0"
                    }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "left", marginBottom: "15px" }}
                >
                  <div style={{
                    ...messageBubble,
                    backgroundColor: "#ffffff",
                    borderRadius: "4px 18px 18px 18px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    border: "1px solid #f0f3f0",
                    padding: "12px 18px"
                  }}>
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #ffdada', borderRadius: '12px', fontSize: '12px', color: '#e53e3e', marginBottom: '10px', textAlign: 'center' }}
                >
                  <i className="bi bi-exclamation-circle-fill" style={{ marginRight: '6px' }}></i>
                  {error}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div style={chatFooter}>
              <div style={inputWrapper}>
                <input
                  style={chatInput}
                  placeholder="Hỏi Calmistry bất cứ điều gì..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                  disabled={isTyping}
                />
                <motion.button
                  whileHover={!isTyping && message.trim() ? { scale: 1.1 } : {}}
                  whileTap={!isTyping && message.trim() ? { scale: 0.9 } : {}}
                  onClick={handleSend}
                  disabled={isTyping || !message.trim()}
                  style={{
                    ...sendBtn,
                    background: (isTyping || !message.trim()) 
                      ? '#f0f3f0' 
                      : `linear-gradient(135deg, ${brandLightGreen}, ${brandDarkGreen})`,
                    color: (isTyping || !message.trim()) ? '#999' : '#fff',
                    cursor: (isTyping || !message.trim()) ? 'not-allowed' : 'pointer',
                    boxShadow: (isTyping || !message.trim()) ? 'none' : '0 4px 10px rgba(142, 195, 57, 0.3)'
                  }}
                >
                  <i className="bi bi-send-fill" style={{ fontSize: '16px' }}></i>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. NÚT FAB VÀ HIỆU ỨNG PULSE */}
      <motion.div
        drag
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: position.x, y: position.y }}
        style={fabWrapper}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
      >
        {!isOpen && (
          <motion.div
            style={{ ...pulse, background: `linear-gradient(135deg, ${brandLightGreen}, ${brandDarkGreen})` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(142, 195, 57, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          className="ai-chat-fab"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            ...fabButtonStyle,
            background: isOpen ? "#ffffff" : `linear-gradient(135deg, ${brandLightGreen}, ${brandDarkGreen})`,
            color: isOpen ? brandLightGreen : "#ffffff",
            border: isOpen ? `2px solid ${brandLightGreen}` : "none",
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.i 
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="bi bi-chevron-down" 
                style={{ fontSize: "24px" }}
              ></motion.i>
            ) : (
              <motion.i 
                key="open"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bi bi-chat-dots-fill" 
                style={{ fontSize: "26px" }}
              ></motion.i>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
}

// --- STYLES ĐẦY ĐỦ ---
const fixedContainer = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10000 };
const fabWrapper = { position: "absolute", width: "60px", height: "60px", pointerEvents: "auto" };
const fabButtonStyle = { width: "60px", height: "60px", borderRadius: "50%", boxShadow: "0 8px 30px rgba(142, 195, 57, 0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, transition: 'background 0.3s, color 0.3s' };
const pulse = { position: "absolute", width: "60px", height: "60px", borderRadius: "50%", zIndex: 1, top: 0, left: 0 };

const chatWindow = { 
  position: "absolute", 
  backgroundColor: "rgba(255, 255, 255, 0.95)", 
  backdropFilter: "blur(10px)",
  borderRadius: "28px", 
  boxShadow: "0 20px 50px rgba(0,0,0,0.12)", 
  display: "flex", 
  flexDirection: "column", 
  overflow: "hidden", 
  pointerEvents: "auto", 
  border: "1px solid rgba(255, 255, 255, 0.7)", 
  maxWidth: 'calc(100vw - 20px)', 
  maxHeight: 'calc(100vh - 120px)',
  fontFamily: "'Be Vietnam Pro', sans-serif"
};

const chatHeader = { 
  padding: "18px 22px", 
  color: "#fff", 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
};

const avatarCircle = { 
  width: "36px", 
  height: "36px", 
  borderRadius: "12px", 
  backgroundColor: "rgba(255,255,255,0.2)", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "20px" 
};

const closeBtn = { border: "none", background: "none", color: "#fff", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", padding: "5px" };
const chatBody = { flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "transparent", display: "flex", flexDirection: "column" };
const messageBubble = { padding: "12px 18px", fontSize: "14px", lineHeight: "1.6", display: "inline-block", fontWeight: "500", maxWidth: "85%", transition: 'all 0.2s ease', letterSpacing: "-0.01em", fontFamily: "'Be Vietnam Pro', sans-serif" };
const chatFooter = { padding: "15px 20px 20px", backgroundColor: "transparent" };
const inputWrapper = { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", padding: "6px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f3f0" };
const chatInput = { flex: 1, border: "none", padding: "10px 15px", fontSize: "14px", outline: "none", backgroundColor: "transparent", color: "#324d3e", fontFamily: "'Be Vietnam Pro', sans-serif" };
const sendBtn = { width: "40px", height: "40px", borderRadius: "50%", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: 'all 0.3s ease' };