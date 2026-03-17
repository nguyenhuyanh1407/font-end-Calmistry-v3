import api from './api';

const GAMIFICATION_CHANNEL = 'calmistry-gamification';

const getAuthKey = () => {
  const token = api.getToken();
  return token ? token.slice(-16) : 'anon';
};

const broadcastToday = (todayPayload) => {
  if (!todayPayload) return;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(GAMIFICATION_CHANNEL);
      ch.postMessage({ type: 'today', payload: todayPayload, ts: Date.now() });
      ch.close();
    }
  } catch { }

  // Fallback for browsers without BroadcastChannel (cross-tab only)
  try {
    localStorage.setItem(
      'gamification:update',
      JSON.stringify({ type: 'today', payload: todayPayload, ts: Date.now() })
    );
  } catch { }

  // Same-tab fallback (guaranteed)
  try {
    window.dispatchEvent(
      new CustomEvent('calmistry:gamification', {
        detail: { type: 'today', payload: todayPayload, ts: Date.now() },
      })
    );
  } catch { }
};

const gamificationService = {
  optimisticAward: (eventType) => {
    if (!eventType) return;
    const authKey = getAuthKey();
    const spinKey = `spinBalance:${authKey}`;
    const eventsKey = `completedEvents:${authKey}`;

    let balance = 0;
    let events = [];

    try {
      const cachedBalance = localStorage.getItem(spinKey);
      balance = cachedBalance ? parseInt(cachedBalance, 10) : 0;
    } catch { }

    try {
      const cachedEvents = localStorage.getItem(eventsKey);
      events = cachedEvents ? JSON.parse(cachedEvents) : [];
      if (!Array.isArray(events)) events = [];
    } catch {
      events = [];
    }

    if (!events.includes(eventType)) {
      events = [...events, eventType];
      balance = balance + 1;

      try {
        localStorage.setItem(spinKey, String(balance));
        localStorage.setItem(eventsKey, JSON.stringify(events));
      } catch { }

      broadcastToday({ spinBalance: balance, completedEvents: events });
    }
  },
  getSpinBalance: async () => {
    const response = await api.get('/gamification/spins');
    return response.result;
  },
  getToday: async () => {
    const response = await api.get('/gamification/today');
    return response.result;
  },
  spin: async () => {
    const response = await api.post('/gamification/spin', {});
    return response;
  },
  refreshTodayAndBroadcast: async () => {
    const today = await gamificationService.getToday();
    broadcastToday(today);
    return today;
  },
  broadcastToday,
};

export default gamificationService;
