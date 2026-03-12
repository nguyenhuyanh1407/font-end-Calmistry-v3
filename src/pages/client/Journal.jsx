import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Search, Smile, Meh, Frown, Plus, Edit2, Trash2, X, Save, Sparkles, BarChart3, Loader, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import journalService from '../../services/journalService';
import GuestOnboarding from '../../components/common/GuestOnboarding';
import '../../styles/Journal.css';

const Journal = () => {
  const brandGreen = '#324d3e';
  const lightGreen = '#8ec339';
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingPrompt, setFetchingPrompt] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [currentEntry, setCurrentEntry] = useState({
    id: null, title: '', content: '', mood: 'neutral', createdAt: new Date().toISOString(), aiResponse: ''
  });

  const saveLock = useRef(false);

  // --- ONBOARDING TOUR ---
  const [tourStage, setTourStage] = useState(null); // 'main', 'form', 'stats', or null
  
  useEffect(() => {
    const hasSeenJournalTour = localStorage.getItem('HAS_SEEN_JOURNAL_TOUR');
    if (!hasSeenJournalTour) {
      setTourStage('main');
    }
  }, []);

  const mainTourSteps = [
    {
      target: '.tour-search',
      title: 'Tìm kiếm nhanh chóng',
      content: 'Bạn có thể dễ dàng tìm lại những dòng nhật ký cũ bằng cách nhập từ khóa tại đây.',
      placement: 'bottom'
    },
    {
      target: '.tour-filter',
      title: 'Lọc theo cảm xúc',
      content: 'Chọn icon cảm xúc để xem lại những ngày bạn thấy vui, buồn hay bình yên.',
      placement: 'bottom'
    },
    {
      target: '.tour-add-journal',
      title: 'Viết nhật ký mới',
      content: 'Hãy nhấn vào nút dấu cộng này để bắt đầu ghi lại cảm xúc của bạn ngay bây giờ!',
      placement: 'top'
    }
  ];

  const formTourSteps = [
    {
      target: '.tour-title',
      title: 'Tiêu đề bài viết',
      content: 'Bắt đầu bằng một tiêu đề ngắn gọn cho nhật ký ngày hôm nay của bạn.',
      placement: 'bottom'
    },
    {
      target: '.tour-suggest-btn',
      title: 'Cần một gợi ý?',
      content: 'Nếu bạn chưa biết viết gì, hãy nhấn vào đây. AI sẽ gợi ý cho bạn những chủ đề tâm sự thật ý nghĩa!',
      placement: 'bottom'
    },
    {
      target: '.tour-mood-select',
      title: 'Ghi lại cảm xúc',
      content: 'Chọn trạng thái cảm xúc hiện tại của bạn để chúng mình có thể theo dõi sự thay đổi tâm trạng của bạn theo thời gian nhé.',
      placement: 'bottom'
    },
    {
      target: '.tour-content',
      title: 'Không gian riêng tư của bạn',
      content: 'Hãy trút bỏ mọi muộn phiền hoặc ghi lại những niềm vui nhỏ bé vào đây. Không ai có thể xem ngoài bạn!',
      placement: 'right'
    },
    {
      target: '.tour-save',
      title: 'Hoàn tất bài viết',
      content: 'Đừng quên nhấn "Lưu" để bài viết được lưu trữ và AI có thể đưa ra những lời khuyên hữu ích cho bạn.',
      placement: 'top'
    }
  ];

  const statsTourSteps = [
    {
      target: '.tour-stats-btn',
      title: 'Thống kê tâm hồn',
      content: 'Sau khi lưu, bạn có thể nhấn vào đây để xem biểu đồ tâm trạng và nhận lời khuyên tổng quát từ AI!',
      placement: 'bottom'
    }
  ];

  // --- LOGIC DỮ LIỆU ---
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await journalService.getJournals();
      setEntries(data);
    } catch (e) {
      console.error('Error fetching journals:', e);
      // If 401 unauthorized, redirect to login
      if (e?.status === 401) {
        setError('Vui lòng đăng nhập để xem nhật ký của bạn.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Không thể tải nhật ký. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) return;
    
    // Synchronous Lock Check
    if (saveLock.current) return;
    saveLock.current = true;

    try {
      setIsSaving(true);
      setError('');
      if (currentEntry.id) {
        // Update existing entry
        const updated = await journalService.updateJournal(currentEntry.id, {
          title: currentEntry.title,
          content: currentEntry.content,
          mood: currentEntry.mood
        });
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        // Create new entry
        const created = await journalService.createJournal({
          title: currentEntry.title,
          content: currentEntry.content,
          mood: currentEntry.mood
        });
        setEntries(prev => [created, ...prev]);
        
        // Trigger stats tour if it's the first time
        const hasSeenStats = localStorage.getItem('HAS_SEEN_JOURNAL_STATS_TOUR');
        if (!hasSeenStats) {
          setTourStage('stats');
        }
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error('Error saving journal:', e);
      setError(e?.data?.message || 'Không thể lưu nhật ký. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
      saveLock.current = false;
    }
  };

  const handleSuggestPrompt = async () => {
    setFetchingPrompt(true);
    try {
      const prompt = await journalService.getAiPrompt();
      setCurrentEntry({ ...currentEntry, title: prompt });
    } catch (e) {
      console.error('Error fetching AI prompt:', e);
    } finally {
      setFetchingPrompt(false);
    }
  };

  const handleOpenStats = async () => {
    setIsStatsModalOpen(true);
    setLoadingStats(true);
    try {
      const data = await journalService.getStats();
      setStatsData(data);
    } catch (e) {
      console.error('Error fetching stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Filter entries locally (can also be done via API)
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Xóa nhật ký này?')) return;

    try {
      await journalService.deleteJournal(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (e) {
      console.error('Error deleting journal:', e);
      setError('Không thể xóa nhật ký. Vui lòng thử lại.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* paddingTop: '30px' để sát Header hơn theo ý bạn */}
      <div style={{ minHeight: '100vh', backgroundColor: '#f8faf8', paddingTop: '70px', paddingBottom: '100px' }}>

        {/* --- HEADER --- */}
        <div style={headerSection}>
          <div style={containerMaxWidth}>
            <div style={{ marginBottom: '15px' }}>
              <h1 style={pageTitle}>Nhật ký của tôi</h1>
            </div>

            <div style={searchFilterRow}>
              <div style={searchContainer} className="tour-search">
                <Search size={18} style={searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhật ký..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={searchInput}
                />
              </div>

              <div style={moodButtonGroup} className="tour-filter">
                {['all', 'happy', 'neutral', 'sad'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMoodFilter(m)}
                    className="mood-filter-btn"
                    style={{
                      ...filterBtn,
                      backgroundColor: moodFilter === m ? lightGreen : '#fff',
                      color: moodFilter === m ? '#fff' : '#666',
                      borderColor: moodFilter === m ? lightGreen : '#e0e0e0'
                    }}
                  >
                    {m === 'all' ? 'Tất cả' : m === 'happy' ? <Smile size={18} /> : m === 'neutral' ? <Meh size={18} /> : <Frown size={18} />}
                  </button>
                ))}

                <button
                  onClick={handleOpenStats}
                  style={{
                    ...filterBtn,
                    backgroundColor: '#fff',
                    color: brandGreen,
                    borderColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  className="stats-btn tour-stats-btn"
                >
                  <BarChart3 size={18} /> Thống kê
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- LOADING & ERROR STATES --- */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '14px', color: '#718096' }}>Đang tải nhật ký...</div>
          </div>
        )}

        {error && !loading && (
          <div style={{
            padding: '20px',
            margin: '20px auto',
            maxWidth: '600px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '12px',
            color: '#856404',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* --- LIST CONTENT --- */}
        {!loading && (
          <div style={{ padding: '30px 24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={entryGrid}>
              <AnimatePresence>
                {filteredEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    onClick={() => { setCurrentEntry(entry); setIsModalOpen(true); }}
                    style={{ ...entryCard, cursor: 'pointer' }}
                  >
                    <div style={cardHeader}>
                      <div style={cardMood}>
                        {entry.mood === 'happy' ? <Smile color={lightGreen} /> : entry.mood === 'sad' ? <Frown color="#3b82f6" /> : <Meh color="#6b7280" />}
                        <span style={cardDate}>{new Date(entry.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div style={cardActions}>
                        <button onClick={(e) => { e.stopPropagation(); setCurrentEntry(entry); setIsModalOpen(true); }} style={iconBtn}><Edit2 size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} style={{ ...iconBtn, color: '#ef4444' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <h3 style={cardTitle}>{entry.title}</h3>
                    <p style={cardExcerpt}>{entry.content}</p>
                    {entry.aiResponse && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: lightGreen, fontSize: '12px', fontWeight: '600' }}>
                        <Sparkles size={14} /> <span>Đã có AI phản hồi</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* --- NÚT THÊM NHẬT KÝ (FAB) VỚI HIỆU ỨNG XOAY --- */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }} // HIỆU ỨNG XOAY 90 ĐỘ
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setCurrentEntry({ id: null, title: '', content: '', mood: 'neutral', createdAt: new Date().toISOString() });
            setIsModalOpen(true);
            
            // Trigger form tour if it's the first time
            const hasSeenForm = localStorage.getItem('HAS_SEEN_JOURNAL_FORM_TOUR');
            if (!hasSeenForm) {
              setTourStage('form');
            }
          }}
          style={fabButton}
          className="tour-add-journal"
        >
          <Plus size={32} />
        </motion.button>
      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={modalOverlay}>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              style={modalContent}
            >
              <div style={modalHeader} className="tour-modal-header">
                <h3 style={{ margin: 0, color: brandGreen }}>{currentEntry.id ? 'Xem chi tiết & Chỉnh sửa' : 'Viết bài mới'}</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {currentEntry.id && currentEntry.content && (
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate('/ai-chat', {
                          state: {
                            initialMessage: `Đây là nhật ký của tôi ngày hôm nay tiêu đề: "${currentEntry.title}". Nội dung: "${currentEntry.content}". Hãy tâm sự, phân tích và cho tôi lời khuyên nhé!`
                          }
                        });
                      }}
                      style={{
                        border: `1px solid ${lightGreen}`, color: brandGreen, backgroundColor: `${lightGreen}15`,
                        padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${lightGreen}30`}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = `${lightGreen}15`}
                    >
                      <Bot size={15} /> Tâm sự cùng AI
                    </button>
                  )}
                  <X onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer', color: '#999' }} />
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <textarea
                  style={modalInput}
                  placeholder="Tiêu đề hôm nay..."
                  className="tour-title"
                  value={currentEntry.title}
                  onChange={e => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                />
                <button
                  onClick={handleSuggestPrompt}
                  disabled={fetchingPrompt}
                  className="tour-suggest-btn"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: lightGreen,
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} /> {fetchingPrompt ? 'Đang suy nghĩ...' : 'Gợi ý chủ đề cho tôi'}
                </button>
                <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }} className="tour-mood-select">
                  {['happy', 'neutral', 'sad'].map(m => (
                    <button
                      key={m}
                      onClick={() => setCurrentEntry({ ...currentEntry, mood: m })}
                      style={{
                        ...moodSelectBtn,
                        backgroundColor: currentEntry.mood === m ? lightGreen : '#fff',
                        color: currentEntry.mood === m ? '#fff' : '#666',
                        borderColor: currentEntry.mood === m ? lightGreen : '#eee',
                      }}
                    >
                      {m === 'happy' ? 'Vui vẻ' : m === 'neutral' ? 'Ổn' : 'Buồn'}
                    </button>
                  ))}
                </div>
                <textarea
                  style={modalTextarea}
                  placeholder="Hãy chia sẻ cảm xúc của bạn..."
                  className="tour-content"
                  value={currentEntry.content}
                  onChange={e => setCurrentEntry({ ...currentEntry, content: e.target.value })}
                />

                {currentEntry.aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      marginTop: '20px',
                      padding: '16px',
                      backgroundColor: `${lightGreen}15`,
                      borderRadius: '14px',
                      borderLeft: `4px solid ${lightGreen}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: lightGreen, fontWeight: '700', fontSize: '14px' }}>
                      <Sparkles size={16} /> Lời khuyên từ Calmistry AI
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: brandGreen, fontStyle: 'italic', lineHeight: '1.6' }}>
                      "{currentEntry.aiResponse}"
                    </p>
                  </motion.div>
                )}
                <button
                  onClick={handleSaveEntry}
                  disabled={isSaving}
                  className="tour-save"
                  style={{ ...saveBtn, backgroundColor: brandGreen, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                  {isSaving ? <Loader size={18} className="animate-spin" style={{ marginRight: '8px' }} /> : <Save size={18} style={{ marginRight: '8px' }} />}
                  {isSaving ? 'Đang lưu...' : 'Lưu vào nhật ký'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- STATISTICS MODAL --- */}
      <AnimatePresence>
        {isStatsModalOpen && (
          <div style={modalOverlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ ...modalContent, maxWidth: '600px' }}
            >
              <div style={modalHeader}>
                <h3 style={{ margin: 0, color: brandGreen, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={24} /> Thống kê tâm trạng
                </h3>
                <X onClick={() => setIsStatsModalOpen(false)} style={{ cursor: 'pointer', color: '#999' }} />
              </div>

              <div style={{ padding: '30px' }}>
                {loadingStats ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner-border text-success" role="status"></div>
                    <p style={{ marginTop: '15px', color: '#666' }}>Đang phân tích tâm hồn bạn...</p>
                  </div>
                ) : statsData ? (
                  <>
                    {/* Visual Chart */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
                      {[
                        { label: 'Vui vẻ', count: statsData.happyCount, color: lightGreen, icon: <Smile /> },
                        { label: 'Ổn', count: statsData.neutralCount, color: '#6b7280', icon: <Meh /> },
                        { label: 'Buồn', count: statsData.sadCount, color: '#3b82f6', icon: <Frown /> }
                      ].map((item, idx) => {
                        const maxCount = Math.max(statsData.happyCount, statsData.neutralCount, statsData.sadCount, 1);
                        const heightPercent = (item.count / maxCount) * 100;

                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '10px' }}>
                            <div style={{ fontWeight: '800', fontSize: '18px', color: item.color }}>{item.count}</div>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              style={{
                                width: '40px',
                                backgroundColor: item.color,
                                borderRadius: '8px 8px 2px 2px',
                                minHeight: item.count > 0 ? '5px' : '0'
                              }}
                            />
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '700' }}>{item.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#888' }}>Tổng số bài nhật ký: </span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: brandGreen }}>{statsData.totalEntries}</span>
                    </div>

                    {/* AI Analysis */}
                    <div style={{ backgroundColor: `${lightGreen}10`, padding: '20px', borderRadius: '20px', border: `1px dashed ${lightGreen}40` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: lightGreen, fontWeight: '800' }}>
                        <Sparkles size={18} /> Nhận xét từ Calmistry AI
                      </div>
                      <p style={{ margin: 0, fontSize: '15px', color: brandGreen, fontStyle: 'italic', lineHeight: '1.7' }}>
                        "{statsData.aiAnalysis}"
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#ff4444' }}>Không thể tải dữ liệu thống kê.</div>
                )}

                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  style={{ ...saveBtn, backgroundColor: brandGreen, marginTop: '30px' }}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ONBOARDING TOURS BY STAGES --- */}
      {tourStage === 'main' && (
        <GuestOnboarding 
          steps={mainTourSteps} 
          onComplete={() => {
            // Only clear if we didn't already transition to form
            setTourStage(prev => prev === 'main' ? null : prev);
          }} 
        />
      )}

      {tourStage === 'form' && isModalOpen && (
        <GuestOnboarding 
          steps={formTourSteps} 
          onComplete={() => {
            setTourStage(null);
            localStorage.setItem('HAS_SEEN_JOURNAL_FORM_TOUR', 'true');
          }} 
        />
      )}

      {tourStage === 'stats' && (
        <GuestOnboarding 
          steps={statsTourSteps} 
          onComplete={() => {
            setTourStage(null);
            localStorage.setItem('HAS_SEEN_JOURNAL_STATS_TOUR', 'true');
            // This also completes the overall journal tour
            localStorage.setItem('HAS_SEEN_JOURNAL_TOUR', 'true');
          }} 
        />
      )}

    </motion.div>
  );
};

// --- STYLES TỐI ƯU ---
const headerSection = { backgroundColor: '#fff', borderBottom: '1px solid #f0f3f0', padding: '15px 24px' };
const containerMaxWidth = { maxWidth: '1200px', margin: '0 auto' };
const pageTitle = { fontSize: '24px', fontWeight: '800', color: '#324d3e', margin: 0 };
const searchFilterRow = { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' };
const searchContainer = { position: 'relative', flex: 1, minWidth: '250px' };
const searchInput = { width: '100%', padding: '12px 15px 12px 40px', borderRadius: '14px', border: '1px solid #eee', outline: 'none', backgroundColor: '#f9faf9', color: '#324d3e' };
const searchIcon = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' };
const moodButtonGroup = { display: 'flex', gap: '8px' };
const filterBtn = { padding: '10px 16px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };

const entryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const entryCard = { backgroundColor: '#fff', borderRadius: '22px', padding: '24px', border: '1px solid #f0f4f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
const cardMood = { display: 'flex', alignItems: 'center', gap: '10px' };
const cardDate = { fontSize: '12px', color: '#aaa', fontWeight: '500' };
const cardTitle = { fontSize: '18px', fontWeight: '700', color: '#324d3e', marginBottom: '10px' };
const cardExcerpt = { fontSize: '14px', color: '#666', lineHeight: '1.6', height: '65px', overflow: 'hidden' };

const fabButton = {
  position: 'fixed', bottom: '40px', right: '40px',
  width: '65px', height: '65px', borderRadius: '50%',
  backgroundColor: '#8ec339', color: '#fff', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '0 10px 25px rgba(142, 195, 57, 0.4)',
  zIndex: 999
};

const modalOverlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 20000, padding: '20px'
};

const modalContent = { backgroundColor: '#fff', width: '100%', maxWidth: '550px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.15)' };
const modalHeader = { padding: '20px 24px', backgroundColor: '#fbfcfb', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalInput = { width: '100%', minHeight: '60px', padding: '16px', borderRadius: '14px', border: '1px solid #eee', outline: 'none', fontSize: '16px', backgroundColor: '#f9f9f9', color: '#324d3e', resize: 'none', lineHeight: '1.4' };
const moodSelectBtn = { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', fontSize: '14px', fontWeight: '700' };
const modalTextarea = { width: '100%', height: '220px', padding: '16px', borderRadius: '14px', border: '1px solid #eee', outline: 'none', resize: 'none', fontSize: '15px', backgroundColor: '#f9f9f9', color: '#324d3e', lineHeight: '1.6' };
const saveBtn = { width: '100%', padding: '16px', color: '#fff', border: 'none', borderRadius: '16px', marginTop: '15px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const iconBtn = { background: 'none', border: 'none', padding: '6px', cursor: 'pointer' };
const cardActions = { display: 'flex', gap: '4px' };

export default Journal;
