import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import gamificationService from '../../services/gamificationService';
import userService from '../../services/userService';
import api from '../../services/api';
import luckySlotMachine from '../../assets/luckyslotCalmistry.png';
import backgroundMusicSrc from '../../assets/background.mp3';
import spinSfxSrc from '../../assets/spin.mp3';
import '../../styles/LuckySlot.css';

const iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"];

const COMFORT_MESSAGES = [
  "Đừng buồn nè, nụ cười của bạn quý giá hơn cả Jackpot đấy! 😊",
  "Chỉ là một lượt quay thôi mà, relax and enjoy! 🍃",
  "Hãy tích cực hơn nữa, quà xịn đang đợi phía trước! ✨",
  "Được một câu an ủi dễ thương, một ngày mới lại bình yên! 🌸",
  "Một nhúm bình yên, một ngày mới lại tràn đầy sức sống! 🦋"
];

const mapBackendSymbolToReelSymbol = (symbolKey) => {
  if (symbolKey === 'calmistry_white_logo') return 'bar';
  return symbolKey;
};

const numIcons = 9;
const timePerIcon = 100;

const roll = (reelEl, offset, targetIndex, iconHeight) => {
  // Codepen-style: CSS transition on background-position with easing + hidden normalize reset.
  // Deterministic outcome: add whole-strip rounds so the final symbol is `targetIndex`.
  const baseRounds = (offset + 2) * numIcons;
  const extraRounds = Math.floor(Math.random() * 2) * numIcons; // 0 or 1 extra full strip

  return new Promise((resolve) => {
    const style = getComputedStyle(reelEl);
    const backgroundPositionY = parseFloat(style["background-position-y"]) || 0;

    const totalHeight = numIcons * iconHeight;
    const normCurrent = totalHeight ? ((backgroundPositionY % totalHeight) + totalHeight) % totalHeight : 0;
    const currentIndex = iconHeight ? Math.round(normCurrent / iconHeight) % numIcons : 0;

    const diff = (targetIndex - currentIndex + numIcons) % numIcons;
    const delta = baseRounds + extraRounds + diff;

    const targetBackgroundPositionY = backgroundPositionY + delta * iconHeight;
    const duration = (8 + 1 * delta) * timePerIcon;

    const cleanup = () => {
      reelEl.removeEventListener('transitionend', onEnd);
    };

    const onEnd = (e) => {
      if (e?.propertyName && e.propertyName !== 'background-position-y' && e.propertyName !== 'background-position') return;
      cleanup();
      requestAnimationFrame(() => {
        reelEl.style.transition = `none`;
        const aligned = iconHeight ? Math.round(targetBackgroundPositionY / iconHeight) * iconHeight : targetBackgroundPositionY;
        const normAligned = (numIcons * iconHeight) ? (((aligned % (numIcons * iconHeight)) + (numIcons * iconHeight)) % (numIcons * iconHeight)) : aligned;
        reelEl.style.backgroundPositionY = `${normAligned}px`;
        resolve();
      });
    };

    reelEl.addEventListener('transitionend', onEnd);

    // Start transition in the next frame to avoid layout thrash/flicker.
    requestAnimationFrame(() => {
      reelEl.style.transition = `background-position-y ${duration}ms cubic-bezier(.41,-0.01,.63,1.09)`;
      reelEl.style.backgroundPositionY = `${targetBackgroundPositionY}px`;
    });

    // Fallback in case transitionend doesn't fire (e.g. tab switches).
    setTimeout(() => {
      cleanup();
      reelEl.style.transition = `none`;
      const aligned = iconHeight ? Math.round(targetBackgroundPositionY / iconHeight) * iconHeight : targetBackgroundPositionY;
      const normAligned = (numIcons * iconHeight) ? (((aligned % (numIcons * iconHeight)) + (numIcons * iconHeight)) % (numIcons * iconHeight)) : aligned;
      reelEl.style.backgroundPositionY = `${normAligned}px`;
      resolve();
    }, duration + 50);
  });
};

export default function LuckySlot() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bgAudioRef = useRef(null);
  const spinAudioRef = useRef(null);
  const [audioOn, setAudioOn] = useState(() => {
    try {
      return localStorage.getItem('luckySlot:audioOn') !== '0';
    } catch {
      return true;
    }
  });
  const [audioVolume, setAudioVolume] = useState(() => {
    try {
      const raw = localStorage.getItem('luckySlot:volume');
      const n = raw === null ? 0.85 : Number(raw);
      if (!Number.isFinite(n)) return 0.85;
      return Math.max(0, Math.min(1, n));
    } catch {
      return 0.85;
    }
  });
  const [volumeUiOpen, setVolumeUiOpen] = useState(false);
  const volumeUiRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  const token = api.getToken();
  const authKey = token ? token.slice(-16) : 'anon';
  const spinBalanceStorageKey = `spinBalance:${authKey}`;
  const completedEventsStorageKey = `completedEvents:${authKey}`;

  // Synchronous first paint from cache (avoid waiting for useEffect/refetch)
  const [spinBalance, setSpinBalance] = useState(() => {
    if (!token) return 0;
    const cached = localStorage.getItem(spinBalanceStorageKey);
    return cached ? parseInt(cached, 10) : 0;
  });
  const [completedEvents, setCompletedEvents] = useState(() => {
    if (!token) return [];
    const cached = localStorage.getItem(completedEventsStorageKey);
    if (!cached) return [];
    try {
      return JSON.parse(cached);
    } catch {
      return [];
    }
  });
  const [spinning, setSpinning] = useState(false);
  const [winClass, setWinClass] = useState('');
  const [finalSymbols, setFinalSymbols] = useState([null, null, null]);
  const [leverPulled, setLeverPulled] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [modalData, setModalData] = useState({ show: false, title: '', message: '', type: '' });
  const [debugText, setDebugText] = useState('');
  const reelsRef = useRef([]);
  const indexesRef = useRef([0, 0, 0]); // indexes into iconMap (0 = banana)
  const wsClientRef = useRef(null);
  const reelSpinRafRef = useRef(null);

  const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/calmistry/ws';

  const canSpin = useMemo(() => !spinning && spinBalance > 0, [spinning, spinBalance]);

  const safePlay = async (audioEl) => {
    if (!audioEl) return false;
    try {
      const p = audioEl.play();
      if (p && typeof p.then === 'function') await p;
      return true;
    } catch {
      return false;
    }
  };

  const startBackgroundMusic = async () => {
    const audioEl = bgAudioRef.current;
    if (!audioOn || !audioEl) return;
    audioEl.loop = true;
    audioEl.volume = Math.max(0, Math.min(1, 0.22 * audioVolume));
    if (audioEl.paused) await safePlay(audioEl);
  };

  const stopBackgroundMusic = () => {
    const audioEl = bgAudioRef.current;
    if (!audioEl) return;
    audioEl.pause();
    audioEl.currentTime = 0;
  };

  const startSpinSfx = async () => {
    const audioEl = spinAudioRef.current;
    if (!audioOn || !audioEl) return;
    audioEl.loop = true;
    audioEl.volume = Math.max(0, Math.min(1, 0.85 * audioVolume));
    audioEl.currentTime = 0;
    await safePlay(audioEl);
  };

  const stopSpinSfx = () => {
    const audioEl = spinAudioRef.current;
    if (!audioEl) return;
    audioEl.pause();
    audioEl.currentTime = 0;
  };

  useEffect(() => {
    // Preload + best-effort autoplay; browsers may block until first user gesture.
    const bg = bgAudioRef.current;
    const sfx = spinAudioRef.current;

    if (bg) {
      bg.preload = 'auto';
      bg.loop = true;
      bg.volume = Math.max(0, Math.min(1, 0.22 * audioVolume));
    }
    if (sfx) {
      sfx.preload = 'auto';
      sfx.loop = true;
      sfx.volume = Math.max(0, Math.min(1, 0.85 * audioVolume));
    }

    setAudioReady(true);
    startBackgroundMusic();

    return () => {
      stopSpinSfx();
      stopBackgroundMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('luckySlot:audioOn', audioOn ? '1' : '0');
    } catch { }

    if (!audioReady) return;
    if (audioOn) startBackgroundMusic();
    else {
      stopSpinSfx();
      stopBackgroundMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioOn, audioReady]);

  useEffect(() => {
    try {
      localStorage.setItem('luckySlot:volume', String(audioVolume));
    } catch { }

    const bg = bgAudioRef.current;
    const sfx = spinAudioRef.current;
    if (bg) bg.volume = Math.max(0, Math.min(1, 0.22 * audioVolume));
    if (sfx) sfx.volume = Math.max(0, Math.min(1, 0.85 * audioVolume));
  }, [audioVolume]);

  useEffect(() => {
    if (!volumeUiOpen) return;

    const onDown = (e) => {
      if (!volumeUiRef.current) return;
      if (volumeUiRef.current.contains(e.target)) return;
      setVolumeUiOpen(false);
    };

    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [volumeUiOpen]);

  const toggleMute = async () => {
    const next = !audioOn;
    setAudioOn(next);
    if (!next) {
      stopSpinSfx();
      stopBackgroundMusic();
    } else {
      await startBackgroundMusic();
    }
  };

  const handleVolumeChange = async (e) => {
    const v = Math.max(0, Math.min(1, Number(e.target.value) / 100));
    setAudioVolume(v);
    if (v <= 0) {
      if (audioOn) {
        setAudioOn(false);
        stopSpinSfx();
        stopBackgroundMusic();
      }
      return;
    }
    if (!audioOn) setAudioOn(true);
    await startBackgroundMusic();
  };

  const openTaskInNewTab = (path) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  // Current user (for realtime topic subscription)
  const { data: currentUser } = useQuery({
    queryKey: ['me', authKey],
    queryFn: userService.getMyInfo,
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
    retry: false,
  });

  const userId = currentUser?.id;

  // Hydrate per-user cached UI state (prevents showing previous user's data when switching accounts)
  useEffect(() => {
    if (!token) {
      setSpinBalance(0);
      setCompletedEvents([]);
      setWinClass('');
      setFinalSymbols([null, null, null]);
      setDebugText('');
      return;
    }

    const cachedBalance = localStorage.getItem(spinBalanceStorageKey);
    const cachedEvents = localStorage.getItem(completedEventsStorageKey);

    setSpinBalance(cachedBalance ? parseInt(cachedBalance, 10) : 0);
    if (cachedEvents) {
      try {
        setCompletedEvents(JSON.parse(cachedEvents));
      } catch {
        setCompletedEvents([]);
      }
    } else {
      setCompletedEvents([]);
    }

    setWinClass('');
    setFinalSymbols([null, null, null]);
    setDebugText('');
  }, [authKey, token, spinBalanceStorageKey, completedEventsStorageKey]);

    // 1. Fetch Spin Balance
  const { data: balanceData } = useQuery({
    queryKey: ['spinBalance', authKey],
    queryFn: gamificationService.getSpinBalance,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: () => (document.visibilityState === 'visible' ? 3000 : false),
    enabled: !!token,
    retry: false
  });

  // 2. Fetch Completed Events
  const { data: todayData } = useQuery({
    queryKey: ['todayMissions', authKey],
    queryFn: gamificationService.getToday,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: () => (document.visibilityState === 'visible' ? 3000 : false),
    enabled: !!token,
    retry: false
  });

  // Fallback "realtime": when user completes tasks in another tab/window, refetch on focus.
  useEffect(() => {
    if (!token) return;

    const refetchNow = () => {
      queryClient.refetchQueries({ queryKey: ['todayMissions', authKey] });
      queryClient.refetchQueries({ queryKey: ['spinBalance', authKey] });
    };

    const onFocus = () => refetchNow();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refetchNow();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [token, authKey, queryClient]);

  // Đồng bộ sang state & localStorage
  useEffect(() => {
    if (!token || balanceData === undefined) return;
    const val = balanceData?.spinBalance ?? 0;
    setSpinBalance(val);
    localStorage.setItem(spinBalanceStorageKey, String(val));
  }, [balanceData, token, spinBalanceStorageKey]);

  useEffect(() => {
    if (!token || todayData === undefined) return;
    const list = todayData?.completedEvents ?? [];
    setCompletedEvents(list);
    localStorage.setItem(completedEventsStorageKey, JSON.stringify(list));
  }, [todayData, token, completedEventsStorageKey]);

  // Realtime updates: subscribe to /topic/gamification.{userId}
  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId) return;

    if (wsClientRef.current) {
      try {
        wsClientRef.current.deactivate();
      } catch { }
      wsClientRef.current = null;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => { },
    });

    client.onConnect = () => {
      client.subscribe(`/topic/gamification.${userId}`, (message) => {
        try {
          const payload = JSON.parse(message.body || '{}');
          const nextBalance = payload?.spinBalance ?? 0;
          const nextEvents = payload?.completedEvents ?? [];

          setSpinBalance(nextBalance);
          setCompletedEvents(nextEvents);
          localStorage.setItem(spinBalanceStorageKey, String(nextBalance));
          localStorage.setItem(completedEventsStorageKey, JSON.stringify(nextEvents));

          queryClient.setQueryData(['spinBalance', authKey], { spinBalance: nextBalance });
          queryClient.setQueryData(['todayMissions', authKey], payload);
        } catch (e) {
          console.error('Gamification WS parse error', e);
        }
      });
    };

    client.onStompError = () => { };
    client.onWebSocketError = () => { };

    client.activate();
    wsClientRef.current = client;

    return () => {
      try {
        client.deactivate();
      } catch { }
      wsClientRef.current = null;
    };
  }, [currentUser?.id, queryClient, WS_URL, authKey, spinBalanceStorageKey, completedEventsStorageKey]);

  // Cross-tab realtime (fallback): BroadcastChannel / localStorage update
  useEffect(() => {
    if (!token) return;

    const applyToday = (payload) => {
      const nextBalance = payload?.spinBalance ?? 0;
      const nextEvents = payload?.completedEvents ?? [];
      setSpinBalance(nextBalance);
      setCompletedEvents(nextEvents);
      try {
        localStorage.setItem(spinBalanceStorageKey, String(nextBalance));
        localStorage.setItem(completedEventsStorageKey, JSON.stringify(nextEvents));
      } catch { }
      queryClient.setQueryData(['spinBalance', authKey], { spinBalance: nextBalance });
      queryClient.setQueryData(['todayMissions', authKey], payload);
    };

    let channel;
    const onBroadcast = (e) => {
      const msg = e?.data;
      if (msg?.type === 'today' && msg?.payload) applyToday(msg.payload);
    };

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('calmistry-gamification');
        channel.addEventListener('message', onBroadcast);
      }
    } catch { }

    const onStorage = (e) => {
      if (e.key !== 'gamification:update' || !e.newValue) return;
      try {
        const msg = JSON.parse(e.newValue);
        if (msg?.type === 'today' && msg?.payload) applyToday(msg.payload);
      } catch { }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      try {
        channel?.removeEventListener('message', onBroadcast);
        channel?.close();
      } catch { }
    };
  }, [
    token,
    authKey,
    queryClient,
    spinBalanceStorageKey,
    completedEventsStorageKey,
  ]);

  useEffect(() => {
    // Set a pleasant initial position so reels don't look "stuck" on first paint.
    reelsRef.current?.forEach((reel, i) => {
      if (!reel) return;
      const iconHeight = reel.clientHeight ? (reel.clientHeight / 3) : 79;
      const idx = Math.floor(Math.random() * numIcons);
      indexesRef.current[i] = idx;
      reel.style.transition = 'none';
      reel.style.backgroundPositionY = `${idx * iconHeight}px`;
    });
  }, []);

  const startReelSpinVisual = () => {
    reelsRef.current?.forEach((reel) => {
      if (!reel) return;
      reel.classList.add('reel-spinning');
    });

    if (reelSpinRafRef.current) return;

    let lastTs = performance.now();
    const tick = (ts) => {
      const dt = ts - lastTs;
      lastTs = ts;

      const dy = dt * 1.2; // px/ms

      reelsRef.current?.forEach((reel) => {
        if (!reel) return;
        const cur = parseFloat(reel.style.backgroundPositionY) || parseFloat(getComputedStyle(reel)["background-position-y"]) || 0;
        reel.style.backgroundPositionY = `${cur + dy}px`;
      });

      reelSpinRafRef.current = requestAnimationFrame(tick);
    };

    reelSpinRafRef.current = requestAnimationFrame(tick);
  };

  const stopReelSpinVisual = () => {
    if (reelSpinRafRef.current) {
      cancelAnimationFrame(reelSpinRafRef.current);
      reelSpinRafRef.current = null;
    }

    reelsRef.current?.forEach((reel) => {
      if (!reel) return;
      reel.classList.remove('reel-spinning');
      const iconHeight = reel.clientHeight ? (reel.clientHeight / 3) : 79;
      const cur = parseFloat(reel.style.backgroundPositionY) || parseFloat(getComputedStyle(reel)["background-position-y"]) || 0;
      const totalHeight = numIcons * iconHeight;
      const norm = totalHeight ? ((cur % totalHeight) + totalHeight) % totalHeight : cur;
      const aligned = iconHeight ? Math.round(norm / iconHeight) * iconHeight : norm;
      reel.style.transition = 'none';
      reel.style.backgroundPositionY = `${aligned}px`;
    });
  };

  useEffect(() => {
    return () => {
      if (reelSpinRafRef.current) {
        cancelAnimationFrame(reelSpinRafRef.current);
        reelSpinRafRef.current = null;
      }
    };
  }, []);

  const handleLeverPull = () => {
    if (spinning) return;
    setLeverPulled(true);
    if (spinBalance > 0) {
      // Unlock audio (if autoplay was blocked) on the first user interaction.
      startBackgroundMusic();
      // Start immediately; the lever animation continues while we wait for the server result.
      doSpin();
    } else {
      toast.info('Het luot quay hom nay. Hoan thanh nhiem vu ben phai de nhan them luot quay.');
    }
    setTimeout(() => {
      setLeverPulled(false);
      if (false) {
        toast.info('Bạn đã hết lượt quay hôm nay. Hoàn thành nhiệm vụ bên phải để nhận thêm lượt quay.');
        return;
      }
    }, 400); 
  };

  const doSpin = async () => {
    if (!canSpin) return;
    setWinClass('');
    setSpinning(true);
    setFinalSymbols([null, null, null]);
    setDebugText('rolling...');
    startReelSpinVisual();
    await startSpinSfx();

    try {
      const response = await gamificationService.spin();
      console.log('🎰 Spin API Response:', response);
      if (response?.code && response.code !== 1000) {
        throw new Error(response.message || 'Lỗi khi quay thưởng.');
      }
      const result = response?.result ?? response;
      if (!result) {
        throw new Error('KhÃ´ng nháº­n Ä‘Æ°á»£c káº¿t quáº£ quay.');
      }
      stopReelSpinVisual();
      stopSpinSfx();
      const isJackpot = result.jackpot;
      const symbols = (result?.symbols || []).map(mapBackendSymbolToReelSymbol);

      if (symbols.length !== 3) {
        throw new Error('Kết quả quay không hợp lệ.');
      }

      const targets = symbols.map((s) => {
        const idx = iconMap.indexOf(s);
        return idx >= 0 ? idx : 0;
      });

      const reels = reelsRef.current;
      if (!reels?.[0] || !reels?.[1] || !reels?.[2]) {
        throw new Error('Không tìm thấy reels để quay.');
      }

      await Promise.all(
        reels.map((reelEl, i) => {
          const iconHeight = reelEl?.clientHeight ? (reelEl.clientHeight / 3) : 79;
          return roll(reelEl, i, targets[i], iconHeight);
        })
      );

      // Stop spin SFX right when results land (after reels settle).
      stopSpinSfx();

      indexesRef.current = [...targets];
      setDebugText(targets.map((i) => iconMap[i]).join(' - '));


      const isWinPair = targets[0] === targets[1] || targets[1] === targets[2] || targets[0] === targets[2];
      let modalContent = { show: true, title: 'Rất tiếc! 😢', message: 'Hôm nay may mắn tạm vắng, lần sau sẽ quay lại nhen!', type: 'lose' };

      if (isJackpot) {
        setWinClass('win2');
        const isLogo = (result?.symbols || []).every((s) => s === 'calmistry_white_logo');
        const code = result?.voucherCode || (isLogo ? "CALM20-" + Math.random().toString(36).substring(2, 7).toUpperCase() : "CALM10-" + Math.random().toString(36).substring(2, 7).toUpperCase());
        if (isLogo) {
          modalContent = { show: true, title: 'Nổ Hũ LOGO Độc Đắc! 🏆', message: 'Bạn nhận được Voucher giảm giá 20% cho Calmistry!', type: 'jackpot_logo', voucherCode: code };
        } else {
          modalContent = { show: true, title: 'Nổ Hũ Độc Đắc! 🎉', message: 'Bạn nhận được Voucher giảm giá 10% cho Calmistry!', type: 'jackpot', voucherCode: code };
        }
      } else if (isWinPair) {
        setWinClass('win1');
        const randomWish = COMFORT_MESSAGES[Math.floor(Math.random() * COMFORT_MESSAGES.length)];
        modalContent = { show: true, title: 'Chúc mừng! 🎊', message: randomWish, type: 'pair' };
      }

      setModalData(modalContent);

      setFinalSymbols(result?.symbols || [null, null, null]);
      queryClient.invalidateQueries({ queryKey: ['spinBalance', authKey] });
      queryClient.invalidateQueries({ queryKey: ['todayMissions', authKey] });
      setSpinBalance(result?.remainingSpins ?? Math.max(0, spinBalance - 1));
      gamificationService.getToday()
        .then((today) => {
          setCompletedEvents(today?.completedEvents ?? []);
          setSpinBalance(today?.spinBalance ?? result?.remainingSpins ?? 0);
        })
        .catch(() => { });
      setSpinning(false);
    } catch (e) {
      stopReelSpinVisual();
      stopSpinSfx();
      console.error('🎰 Spin Error:', e);
      // Hiển thị lỗi từ backend nếu có (VD: "Bạn đã hết lượt quay!")
      const errorMessage = e.response?.data?.message || e.message || 'Quay thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
      setDebugText('');
      setSpinning(false);
    }
  };

  const missions = [
    { key: 'LOGIN_DAILY', title: 'Đăng nhập hôm nay', desc: 'Nhận 1 lượt quay mỗi ngày khi đăng nhập.', action: () => openTaskInNewTab('/login') },
    { key: 'SLEEP_QUALITY_REVIEW', title: 'Đánh giá chất lượng giấc ngủ', desc: 'Hoàn thành đánh giá giấc ngủ để nhận 1 lượt quay.', action: () => openTaskInNewTab('/sleepManagement') },
    { key: 'FUIEDS_SCORE', title: 'Tính FUIEDS Score', desc: 'Làm FUIEDS trong ngày để nhận 1 lượt quay.', action: () => openTaskInNewTab('/fuieds-quiz') },
    { key: 'JOURNAL_ENTRY', title: 'Viết nhật ký', desc: 'Viết một mục nhật ký để nhận 1 lượt quay.', action: () => openTaskInNewTab('/journal') },
    { key: 'STORY_SHARE', title: 'Chia sẻ câu chuyện', desc: 'Đăng 1 câu chuyện để nhận 1 lượt quay.', action: () => openTaskInNewTab('/shareStories') },
  ];

  return (
    <div className="container py-4 lucky-slot-page">
      {/* Audio (background + spin SFX). Autoplay may be blocked until first user click. */}
      <audio ref={bgAudioRef} src={backgroundMusicSrc} loop playsInline />
      <audio ref={spinAudioRef} src={spinSfxSrc} loop playsInline />
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <button className="btn btn-dark rounded-pill" onClick={() => navigate('/userDashboard')}>
          Quay lại Dashboard
        </button>
        <div className="slot-audio" ref={volumeUiRef}>
          <button
            type="button"
            className="slot-audio-btn"
            onClick={() => setVolumeUiOpen((v) => !v)}
            aria-label="Âm thanh"
            title="Âm thanh"
          >
            {!audioOn || audioVolume <= 0 ? <FiVolumeX /> : <FiVolume2 />}
          </button>

          {volumeUiOpen && (
            <div className="slot-audio-pop" role="dialog" aria-label="Điều chỉnh âm lượng">
              <div className="slot-audio-pop-row">
                <div className="slot-audio-pop-title">Âm lượng</div>
                <button type="button" className="slot-audio-mute" onClick={toggleMute}>
                  {audioOn ? 'Tắt' : 'Bật'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(audioVolume * 100)}
                onChange={handleVolumeChange}
                className="slot-audio-range"
                aria-label="Thanh âm lượng"
              />
              <div className="slot-audio-pop-hint">{Math.round(audioVolume * 100)}%</div>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4 align-items-center">
        <div className="col-12 col-lg-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`slot-machine ${winClass}`}
          >
            <img className="slot-machine-img" src={luckySlotMachine} alt="Lucky Calm slot machine" />
            <motion.div
              className="slot-lever"
              animate={{ rotate: leverPulled ? 35 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              onClick={handleLeverPull}
            />
            <div className="slot-machine-reels" aria-label="Lucky slot reels">
              {[0, 1, 2].map((i) => {
                return (
	                  <div
	                    key={i}
	                    className="reel"
	                    ref={(el) => {
	                      reelsRef.current[i] = el;
	                    }}
	                  >
                    {winClass && <div className={`reel-flash ${winClass}`} />}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="d-flex justify-content-center mt-2">
            <button
              type="button"
              className="btn btn-dark rounded-pill btn-rewards"
              onClick={() => setRewardsOpen(true)}
            >
              Danh sách phần quà
            </button>
          </div>




        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ fontFamily: "'Lora', serif", color: "#284b3c" }}>Nhiệm vụ</h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge text-bg-light">
                    {missions.filter(m => completedEvents.includes(m.key)).length}/{missions.length}
                  </span>
                  <span className="badge bg-success shadow-sm" style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "50px",
                    padding: "6px 14px",
                    fontSize: "0.82rem"
                  }}>
                    Lượt quay: {spinBalance}
                  </span>
                </div>
              </div>


              <div className="d-flex flex-column gap-2">
                {missions.map((m) => {
                  const done = completedEvents.includes(m.key);
                  return (
                    <div key={m.key} className={`mission-item ${done ? 'done' : ''}`}>
                      <div className="d-flex gap-2 align-items-start">
                        <div className={`mission-check ${done ? 'done' : ''}`} aria-hidden="true" />
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{m.title}</div>

                        </div>
                        <button className="btn btn-sm btn-outline-dark rounded-pill" onClick={m.action}>
                          {done ? 'Xem' : 'Làm'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


        </div>
      </div>


      {modalData.show && (
        <div className="custom-popup-overlay">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`custom-popup-content ${modalData.type}`}
          >
            <div className="popup-icon">
              {modalData.type.startsWith('jackpot') ? '🏆' : modalData.type === 'pair' ? '🎉' : '😢'}
            </div>
            <h3 className="popup-title">{modalData.title}</h3>
            <p className="popup-message mb-3">{modalData.message}</p>

            {modalData.voucherCode && (
              <div className="d-flex align-items-center justify-content-center gap-2 bg-light rounded-pill p-2 mb-3 border mx-auto" style={{ maxWidth: '280px' }}>
                <span className="fw-bold font-monospace text-success px-2" style={{ fontSize: '0.90rem' }}>{modalData.voucherCode}</span>
                <button 
                  className="btn btn-sm btn-success rounded-pill px-3 fw-bold" 
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(modalData.voucherCode);
                    toast.success("📋 Đã sao chép mã Voucher!");
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            <button className="btn btn-dark rounded-pill px-4" onClick={() => setModalData({ ...modalData, show: false })}>
              Đóng
            </button>
          </motion.div>
        </div>
      )}

      {rewardsOpen && (
        <div className="rewards-overlay" onClick={() => setRewardsOpen(false)}>
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="rewards-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rewards-title">Danh sách phần quà</div>
            <div className="rewards-subtitle">Phần thưởng có thể thay đổi theo từng thời điểm.</div>

            <ul className="rewards-list">
              <li><span className="fw-semibold">Jackpot</span>: 3 biểu tượng Calmistry → Voucher 20% (nếu có).</li>
              <li><span className="fw-semibold">Nổ hũ thường</span>: 3 biểu tượng giống nhau → Voucher 10% (nếu có).</li>
              <li><span className="fw-semibold">Trúng cặp</span>: 2 biểu tượng giống nhau → lời chúc/động viên.</li>
              <li><span className="fw-semibold">Không trúng</span>: thử lại khi có lượt quay mới.</li>
            </ul>

            <div className="d-flex justify-content-center mt-3">
              <button type="button" className="btn btn-dark rounded-pill btn-rewards" onClick={() => setRewardsOpen(false)}>
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
