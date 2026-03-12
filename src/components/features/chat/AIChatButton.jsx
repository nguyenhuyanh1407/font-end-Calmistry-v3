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
  const controls = useAnimation();
  const location = useLocation();
  const chatBodyRef = useRef(null);

  // --- CẤU HÌNH KHOẢNG CÁCH ---
  const paddingX = 57;
  const paddingTop = 60;
  const paddingBottom = 42;
  const iconSize = 60;
  const journalFabSize = 65;
  const gapBetweenButtons = 15;
  const brandLightGreen = "#8ec339";

  // --- STATES ---
  const [chatHistory, setChatHistory] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 330, height: 480 });
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
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              ...chatWindow,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              left: position.x > window.innerWidth / 2 ? position.x - (dimensions.width - 50) : position.x,
              top: position.y > window.innerHeight / 2 ? position.y - (dimensions.height + 20) : position.y + 75,
            }}
          >
            {/* Resize Handle */}
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
                color: '#ccc'
              }}
            >
              <i className="bi bi-arrows-angle-expand" style={{ fontSize: '10px', transform: 'rotate(90deg)' }}></i>
            </div>

            {/* Header */}
            <div style={{ ...chatHeader, backgroundColor: brandLightGreen }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={avatarCircle}><i className="bi bi-robot"></i></div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "14px" }}>Calmistry AI</div>
                  <div style={{ fontSize: "10px", opacity: 0.8 }}>Đang trực tuyến</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={closeBtn}><i className="bi bi-x-lg"></i></button>
            </div>

            {/* Body */}
            <div ref={chatBodyRef} style={chatBody}>
              {loading && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  Đang tải lịch sử...
                </div>
              )}

              {!loading && chatHistory.map((msg, index) => (
                <div key={index} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "15px" }}>
                  <div style={{
                    ...messageBubble,
                    backgroundColor: msg.role === "user" ? brandLightGreen : "#f0f4f0",
                    color: msg.role === "user" ? "#fff" : "#333",
                    borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ textAlign: "left", marginBottom: "15px" }}>
                  <div style={{
                    ...messageBubble,
                    backgroundColor: "#f0f4f0",
                    color: "#333",
                    borderRadius: "18px 18px 18px 2px",
                  }}>
                    <span className="typing-dots">●●●</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '12px', color: '#856404', marginBottom: '10px' }}>
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={chatFooter}>
              <input
                style={chatInput}
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !message.trim()}
                style={{
                  ...sendBtn,
                  backgroundColor: (isTyping || !message.trim()) ? '#ccc' : brandLightGreen,
                  cursor: (isTyping || !message.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                <i className="bi bi-send-fill"></i>
              </button>
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
            style={{ ...pulse, backgroundColor: brandLightGreen }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <button
          className="ai-chat-fab"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            ...fabButton,
            backgroundColor: isOpen ? "#ffffff" : brandLightGreen,
            color: isOpen ? brandLightGreen : "#ffffff",
            border: isOpen ? `2px solid ${brandLightGreen}` : "none",
          }}
        >
          <i className={isOpen ? "bi bi-chevron-down" : "bi bi-chat-dots-fill"} style={{ fontSize: "24px" }}></i>
        </button>
      </motion.div>
    </div>
  );
}

// --- STYLES ĐẦY ĐỦ ---
const fixedContainer = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10000 };
const fabWrapper = { position: "absolute", width: "60px", height: "60px", pointerEvents: "auto" };
const fabButton = { width: "60px", height: "60px", borderRadius: "50%", boxShadow: "0 8px 25px rgba(142, 195, 57, 0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 };
const pulse = { position: "absolute", width: "60px", height: "60px", borderRadius: "50%", zIndex: 1, top: 0, left: 0 };
const chatWindow = { position: "absolute", backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 15px 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", pointerEvents: "auto", border: "1px solid #eef2ef" };
const chatHeader = { padding: "15px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" };
const avatarCircle = { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" };
const closeBtn = { border: "none", background: "none", color: "#fff", cursor: "pointer", fontSize: "18px" };
const chatBody = { flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f9fbf9" };
const messageBubble = { padding: "10px 15px", fontSize: "13px", lineHeight: "1.5", display: "inline-block", fontWeight: "500", maxWidth: "80%" };
const chatFooter = { padding: "15px", borderTop: "1px solid #f0f3f0", display: "flex", gap: "10px", backgroundColor: "#fff" };
const chatInput = { flex: 1, border: "1px solid #eef2ef", borderRadius: "12px", padding: "8px 15px", fontSize: "13px", outline: "none", backgroundColor: "#f4f7f5", color: "#333" };
const sendBtn = { width: "38px", height: "38px", borderRadius: "10px", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };