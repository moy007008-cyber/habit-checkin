'use strict';

const CATEGORIES = [
  { id: 'wake', label: '起床', color: '#f59e0b', icon: 'Sunrise' },
  { id: 'wash', label: '洗漱', color: '#38bdf8', icon: 'Droplets' },
  { id: 'meal', label: '饮食', color: '#4ade80', icon: 'Utensils' },
  { id: 'exercise', label: '运动', color: '#fb7185', icon: 'Dumbbell' },
  { id: 'study', label: '学习', color: '#a78bfa', icon: 'BookOpen' },
  { id: 'rest', label: '休息', color: '#2dd4bf', icon: 'Moon' },
  { id: 'activity', label: '活动', color: '#f472b6', icon: 'Play' }
];

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[6];
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function fromDateStr(s) {
  const parts = s.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function addDays(dateStr, n) {
  const d = fromDateStr(dateStr);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function todayStr() {
  return toDateStr(new Date());
}

function weekdayIndex(dateStr) {
  const day = fromDateStr(dateStr).getDay();
  return (day + 6) % 7;
}

const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const WEEKDAY_SHORT = ['一', '二', '三', '四', '五', '六', '日'];

function weekdayName(dateStr) {
  return WEEKDAY_NAMES[weekdayIndex(dateStr)];
}

function monthLabel(dateStr) {
  const d = fromDateStr(dateStr);
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月';
}

function dateLabel(dateStr) {
  const d = fromDateStr(dateStr);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

function getWeekDates(dateStr) {
  const start = weekdayIndex(dateStr);
  return Array.from({ length: 7 }, (_, i) => addDays(dateStr, i - start));
}

function getMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < lead; i += 1) {
    const d = new Date(year, month - 1, 1 - (lead - i));
    cells.push({ date: toDateStr(d), inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i += 1) {
    cells.push({ date: toDateStr(new Date(year, month - 1, i)), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = fromDateStr(cells[cells.length - 1].date);
    last.setDate(last.getDate() + 1);
    cells.push({ date: toDateStr(last), inMonth: false });
  }
  return cells;
}

function defaultLibrary() {
  return [
    { id: 'wake', name: '起床', icon: 'Sunrise', category: 'wake', defaultTime: '07:00' },
    { id: 'wash', name: '刷牙洗脸', icon: 'Droplets', category: 'wash', defaultTime: '07:08' },
    { id: 'breakfast', name: '吃早餐', icon: 'Utensils', category: 'meal', defaultTime: '07:20' },
    { id: 'morning-exercise', name: '晨间运动', icon: 'Dumbbell', category: 'exercise', defaultTime: '07:40' },
    { id: 'lunch', name: '吃午餐', icon: 'Utensils', category: 'meal', defaultTime: '12:00' },
    { id: 'siesta', name: '午休', icon: 'Moon', category: 'rest', defaultTime: '13:00' },
    { id: 'homework', name: '做作业', icon: 'BookOpen', category: 'study', defaultTime: '16:30' },
    { id: 'reading', name: '课外阅读', icon: 'BookMarked', category: 'study', defaultTime: '17:30' },
    { id: 'dinner', name: '吃晚餐', icon: 'Utensils', category: 'meal', defaultTime: '18:00' },
    { id: 'bath', name: '睡前洗漱', icon: 'ShowerHead', category: 'wash', defaultTime: '20:30' },
    { id: 'sleep', name: '睡觉', icon: 'BedDouble', category: 'rest', defaultTime: '21:00' },
    { id: 'water', name: '喝水', icon: 'GlassWater', category: 'meal', defaultTime: '10:00' },
    { id: 'fruit', name: '吃水果', icon: 'Apple', category: 'meal', defaultTime: '15:00' },
    { id: 'english', name: '英语朗读', icon: 'Mic', category: 'study', defaultTime: '17:00' },
    { id: 'poem', name: '古诗诵读', icon: 'NotebookPen', category: 'study', defaultTime: '18:40' },
    { id: 'jump-rope', name: '跳绳', icon: 'Activity', category: 'exercise', defaultTime: '16:40' },
    { id: 'walk', name: '饭后散步', icon: 'Footprints', category: 'activity', defaultTime: '18:30' },
    { id: 'piano', name: '练琴', icon: 'Music', category: 'activity', defaultTime: '19:00' },
    { id: 'chore', name: '家务小帮手', icon: 'Heart', category: 'activity', defaultTime: '19:40' }
  ];
}

function defaultTemplate(weekday) {
  if (weekday) {
    return [
      { id: 't-wake', moduleId: 'wake', time: '07:00', enabled: true },
      { id: 't-wash', moduleId: 'wash', time: '07:08', enabled: true },
      { id: 't-breakfast', moduleId: 'breakfast', time: '07:20', enabled: true },
      { id: 't-morning-exercise', moduleId: 'morning-exercise', time: '07:40', enabled: true },
      { id: 't-lunch', moduleId: 'lunch', time: '12:00', enabled: true },
      { id: 't-siesta', moduleId: 'siesta', time: '13:00', enabled: true },
      { id: 't-homework', moduleId: 'homework', time: '16:30', enabled: true },
      { id: 't-reading', moduleId: 'reading', time: '17:30', enabled: true },
      { id: 't-dinner', moduleId: 'dinner', time: '18:00', enabled: true },
      { id: 't-bath', moduleId: 'bath', time: '20:30', enabled: true },
      { id: 't-sleep', moduleId: 'sleep', time: '21:00', enabled: true }
    ];
  }
  return [
    { id: 'w-wake', moduleId: 'wake', time: '07:30', enabled: true },
    { id: 'w-wash', moduleId: 'wash', time: '07:40', enabled: true },
    { id: 'w-breakfast', moduleId: 'breakfast', time: '08:00', enabled: true },
    { id: 'w-outdoor', moduleId: 'walk', time: '09:00', enabled: true },
    { id: 'w-lunch', moduleId: 'lunch', time: '12:00', enabled: true },
    { id: 'w-siesta', moduleId: 'siesta', time: '13:00', enabled: true },
    { id: 'w-homework', moduleId: 'homework', time: '15:00', enabled: true },
    { id: 'w-reading', moduleId: 'reading', time: '17:00', enabled: true },
    { id: 'w-dinner', moduleId: 'dinner', time: '18:00', enabled: true },
    { id: 'w-bath', moduleId: 'bath', time: '20:30', enabled: true },
    { id: 'w-sleep', moduleId: 'sleep', time: '21:00', enabled: true }
  ];
}

function defaultBadges() {
  return [
    { id: 'b-first', name: '第一次打卡', icon: 'Star', type: 'totalDone', value: 1 },
    { id: 'b-streak-3', name: '连续打卡 3 天', icon: 'Flame', type: 'streak', value: 3 },
    { id: 'b-streak-7', name: '连续打卡 7 天', icon: 'Flame', type: 'streak', value: 7 },
    { id: 'b-stars-50', name: '集满 50 颗星', icon: 'Medal', type: 'totalStars', value: 50 },
    { id: 'b-streak-21', name: '连续打卡 21 天', icon: 'Trophy', type: 'streak', value: 21 },
    { id: 'b-stars-200', name: '集满 200 颗星', icon: 'Crown', type: 'totalStars', value: 200 }
  ];
}

function defaults() {
  return {
    version: 1,
    settings: {
      templates: {
        weekday: defaultTemplate(true),
        weekend: defaultTemplate(false)
      },
      library: defaultLibrary(),
      rewards: {
        dailyTarget: 11,
        badgeRules: defaultBadges()
      }
    },
    days: {}
  };
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function normalizeItem(item) {
  return {
    id: String(item.id || uid()),
    moduleId: String(item.moduleId || ''),
    name: String(item.name || '未命名'),
    icon: String(item.icon || 'Circle'),
    category: String(item.category || 'activity'),
    time: String(item.time || '08:00'),
    done: Boolean(item.done),
    doneAt: item.doneAt ? String(item.doneAt) : '',
    note: item.note ? String(item.note) : ''
  };
}

function normalizeTemplateItem(item) {
  return {
    id: String(item.id || uid()),
    moduleId: String(item.moduleId || ''),
    time: String(item.time || '08:00'),
    enabled: item.enabled !== false
  };
}

function normalizeBadge(b) {
  return {
    id: String(b.id || uid()),
    name: String(b.name || '徽章'),
    icon: String(b.icon || 'Star'),
    type: ['streak', 'totalDone', 'totalStars'].includes(b.type) ? b.type : 'streak',
    value: Math.max(1, Number(b.value) || 1)
  };
}

function normalize(raw) {
  const base = defaults();
  const s = (raw && raw.settings) || {};
  const result = {
    version: 1,
    settings: {
      templates: {
        weekday: Array.isArray(s.templates && s.templates.weekday)
          ? s.templates.weekday.filter((i) => i && i.moduleId).map(normalizeTemplateItem)
          : base.settings.templates.weekday,
        weekend: Array.isArray(s.templates && s.templates.weekend)
          ? s.templates.weekend.filter((i) => i && i.moduleId).map(normalizeTemplateItem)
          : base.settings.templates.weekend
      },
      library: Array.isArray(s.library)
        ? s.library
          .filter((m) => m && m.name)
          .map((m) => ({
            id: String(m.id || uid()),
            name: String(m.name),
            icon: String(m.icon || 'Circle'),
            category: CATEGORIES.some((c) => c.id === m.category) ? m.category : 'activity',
            defaultTime: String(m.defaultTime || '08:00')
          }))
        : base.settings.library,
      rewards: {
        dailyTarget: Math.max(1, Number((s.rewards && s.rewards.dailyTarget) || 11)),
        badgeRules: Array.isArray(s.rewards && s.rewards.badgeRules)
          ? s.rewards.badgeRules.filter(Boolean).map(normalizeBadge)
          : base.settings.rewards.badgeRules
      }
    },
    days: {}
  };
  if (raw && raw.days && typeof raw.days === 'object') {
    Object.keys(raw.days).forEach((date) => {
      const d = raw.days[date];
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(date) && Array.isArray(d.items)) {
        result.days[date] = { items: d.items.filter(Boolean).map(normalizeItem) };
      }
    });
  }
  return result;
}

const Data = (() => {
  const KEY = 'elementary-routine-checkin-v1';
  let state = null;

  function load() {
    let raw = null;
    try {
      raw = JSON.parse(localStorage.getItem(KEY));
    } catch (err) {
      raw = null;
    }
    state = normalize(raw);
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.error('保存失败', err);
    }
  }

  function getState() {
    return state;
  }

  function reset() {
    state = defaults();
    save();
  }

  function getLibrary() {
    return state.settings.library;
  }

  function getModule(moduleId) {
    return state.settings.library.find((m) => m.id === moduleId) || null;
  }

  function templateForDate(dateStr) {
    const idx = weekdayIndex(dateStr);
    const kind = idx >= 5 ? 'weekend' : 'weekday';
    return { kind, items: state.settings.templates[kind] };
  }

  function getDay(dateStr) {
    return state.days[dateStr] || null;
  }

  function setDay(dateStr, items) {
    state.days[dateStr] = { items };
    save();
  }

  function createDayFromTemplate(dateStr) {
    const tpl = templateForDate(dateStr);
    const items = tpl.items
      .filter((t) => t.enabled)
      .map((t) => {
        const mod = getModule(t.moduleId);
        return normalizeItem({
          id: uid(),
          moduleId: t.moduleId,
          name: mod ? mod.name : '未命名',
          icon: mod ? mod.icon : 'Circle',
          category: mod ? mod.category : 'activity',
          time: t.time
        });
      });
    state.days[dateStr] = { items };
    save();
    return state.days[dateStr];
  }

  function dayProgress(dateStr) {
    const day = getDay(dateStr);
    if (!day) return { total: 0, done: 0, pct: 0, stars: 0, bonus: 0, complete: false };
    const total = day.items.length;
    const done = day.items.filter((i) => i.done).length;
    const bonus = total > 0 && done >= state.settings.rewards.dailyTarget ? 3 : 0;
    return {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
      stars: done + bonus,
      bonus,
      complete: total > 0 && done === total
    };
  }

  function dayListSorted() {
    return Object.keys(state.days).sort();
  }

  function isComplete(dateStr) {
    return dayProgress(dateStr).complete;
  }

  function currentStreak() {
    let cursor = todayStr();
    if (!isComplete(cursor)) {
      cursor = addDays(cursor, -1);
    }
    let count = 0;
    while (isComplete(cursor)) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }

  function bestStreak() {
    const dates = dayListSorted();
    let best = 0;
    let run = 0;
    let prev = null;
    dates.forEach((date) => {
      if (isComplete(date)) {
        run = prev && addDays(prev, 1) === date ? run + 1 : 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
      prev = date;
    });
    return best;
  }

  function totalStarsAll() {
    return dayListSorted().reduce((sum, date) => sum + dayProgress(date).stars, 0);
  }

  function totalDoneAll() {
    return dayListSorted().reduce((sum, date) => sum + dayProgress(date).done, 0);
  }

  function rateForDates(dates) {
    let total = 0;
    let done = 0;
    dates.forEach((date) => {
      const p = dayProgress(date);
      total += p.total;
      done += p.done;
    });
    return total ? Math.round((done / total) * 100) : 0;
  }

  function weekStats(dateStr) {
    const dates = getWeekDates(dateStr);
    return dates.map((date) => ({
      date,
      progress: dayProgress(date)
    }));
  }

  function monthStats(year, month) {
    const days = new Date(year, month, 0).getDate();
    const rows = [];
    for (let d = 1; d <= days; d += 1) {
      const date = toDateStr(new Date(year, month - 1, d));
      rows.push({ date, progress: dayProgress(date) });
    }
    return rows;
  }

  function lastNDays(n, endDate) {
    const end = endDate || todayStr();
    return Array.from({ length: n }, (_, i) => {
      const date = addDays(end, i - n + 1);
      return { date, progress: dayProgress(date) };
    });
  }

  function categoryStats(dates) {
    const totals = {};
    CATEGORIES.forEach((c) => {
      totals[c.id] = { total: 0, done: 0 };
    });
    dates.forEach((date) => {
      const day = getDay(date);
      if (!day) return;
      day.items.forEach((item) => {
        const bucket = totals[item.category] || totals.activity;
        bucket.total += 1;
        if (item.done) bucket.done += 1;
      });
    });
    return CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      color: c.color,
      total: totals[c.id].total,
      done: totals[c.id].done,
      pct: totals[c.id].total ? Math.round((totals[c.id].done / totals[c.id].total) * 100) : 0
    })).filter((c) => c.total > 0);
  }

  function weekTrend(n) {
    const today = todayStr();
    const start = addDays(today, -(weekdayIndex(today) + (n - 1) * 7));
    return Array.from({ length: n }, (_, i) => {
      const weekStart = addDays(start, i * 7);
      const dates = getWeekDates(weekStart);
      const label = (fromDateStr(dates[0]).getMonth() + 1) + '/' + fromDateStr(dates[0]).getDate();
      return { label, value: rateForDates(dates) };
    });
  }

  function badgeStatus() {
    const streak = currentStreak();
    const done = totalDoneAll();
    const stars = totalStarsAll();
    return state.settings.rewards.badgeRules.map((b) => {
      const current = b.type === 'streak' ? streak : b.type === 'totalDone' ? done : stars;
      return { ...b, current, unlocked: current >= b.value };
    });
  }

  function getDailyTarget() {
    return state.settings.rewards.dailyTarget;
  }

  function setDailyTarget(n) {
    state.settings.rewards.dailyTarget = Math.max(1, Number(n) || 1);
    save();
  }

  return {
    KEY,
    load,
    save,
    getState,
    reset,
    uid,
    normalizeItem,
    getLibrary,
    getModule,
    templateForDate,
    getDay,
    setDay,
    createDayFromTemplate,
    dayProgress,
    dayListSorted,
    isComplete,
    currentStreak,
    bestStreak,
    totalStarsAll,
    totalDoneAll,
    rateForDates,
    weekStats,
    monthStats,
    lastNDays,
    categoryStats,
    weekTrend,
    badgeStatus,
    getDailyTarget,
    setDailyTarget
  };
})();
