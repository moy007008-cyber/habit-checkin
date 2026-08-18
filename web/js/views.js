'use strict';

const ICON_CHOICES = [
  'Sunrise', 'Sun', 'Moon', 'BedDouble', 'AlarmClock', 'Brush', 'Droplets', 'ShowerHead',
  'Dumbbell', 'Bike', 'Footprints', 'Utensils', 'Apple', 'GlassWater', 'Cookie', 'IceCream',
  'Sandwich', 'Salad', 'Coffee', 'Milk', 'BookOpen', 'BookMarked', 'Pencil', 'GraduationCap',
  'NotebookPen', 'Play', 'Gamepad2', 'Palette', 'Paintbrush', 'Music', 'Mic', 'Drama',
  'Volleyball', 'Sprout', 'Flower2', 'Tent', 'Campfire', 'Swimming', 'CloudSun', 'Wind',
  'Umbrella', 'Sparkles', 'Heart', 'Smile', 'Star', 'Rocket', 'Crown', 'Gift',
  'PartyPopper', 'Medal', 'Trophy', 'Flame', 'Target', 'Timer', 'Watch', 'CalendarCheck'
];

const VIEW_TABS = [
  { id: 'today', label: '今天', icon: 'Sun' },
  { id: 'week', label: '本周', icon: 'CalendarDays' },
  { id: 'calendar', label: '日历', icon: 'LayoutGrid' },
  { id: 'stats', label: '统计', icon: 'BarChart3' },
  { id: 'settings', label: '设置', icon: 'Settings' }
];

const Views = (() => {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name) {
    return '<i data-lucide="' + esc(name || 'Circle') + '"></i>';
  }

  function ringColor(pct) {
    if (pct >= 100) return '#2fa36b';
    if (pct >= 70) return '#43a047';
    if (pct >= 40) return '#f59e0b';
    return '#ef6461';
  }

  function ringWrap(pct, size, stroke) {
    const color = ringColor(pct);
    return (
      '<div class="ring-wrap" style="width:' + size + 'px;height:' + size + 'px">' +
        '<div class="ring-label"><b>' + pct + '%</b></div>' +
        Charts.ring(pct, size, stroke, color) +
      '</div>'
    );
  }

  function renderPageDecor() {
    return (
      '<div class="page-doodles" aria-hidden="true">' +
        '<span class="doodle doodle-cloud"><i></i><i></i><i></i></span>' +
        '<span class="doodle doodle-star">★</span>' +
        '<span class="doodle doodle-heart">♥</span>' +
        '<span class="doodle doodle-pencil">✎</span>' +
        '<span class="doodle doodle-planet"><i></i></span>' +
      '</div>'
    );
  }

  function renderHeroMascot(complete) {
    const label = complete ? '好棒！全部完成' : '一起出发打卡';
    return (
      '<div class="hero-art" aria-hidden="true">' +
        '<svg viewBox="0 0 230 190" role="img" focusable="false">' +
          '<path class="art-cloud" d="M36 128c-16 0-29-11-29-25 0-12 10-23 24-25 5-17 22-30 42-30 16 0 31 8 39 20 6-3 12-5 20-5 22 0 40 16 40 36 0 16-12 29-28 34H36z"/>' +
          '<path class="art-shadow" d="M75 163c36 14 93 10 110-8 10-10-8-22-43-23-40-2-84 16-67 31z"/>' +
          '<g class="art-rocket">' +
            '<path d="M159 23c-27 9-48 31-57 58l47 47c27-9 49-30 58-57 5-15 4-31-4-39-8-9-24-13-44-9z" fill="#ffffff" stroke="#283044" stroke-width="5" stroke-linejoin="round"/>' +
            '<path d="M175 48c7-1 13 1 17 5-1 11-7 25-16 37l-33-33c10-6 21-8 32-9z" fill="#ffd166" stroke="#283044" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="149" cy="77" r="13" fill="#8bd3ff" stroke="#283044" stroke-width="5"/>' +
            '<path d="M99 88l-28 7 21 21 7-28zM143 132l-7 28-21-21 28-7z" fill="#ff8fab" stroke="#283044" stroke-width="5" stroke-linejoin="round"/>' +
            '<path d="M92 118c-14 7-24 18-30 34 16-6 28-16 35-29" fill="#ffb703" stroke="#283044" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</g>' +
          '<g class="art-bunny">' +
            '<path d="M66 92c-13-23-16-43-7-50 8-7 23 5 33 30" fill="#fff4f0" stroke="#283044" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M101 78c0-26 8-44 19-44s16 19 7 45" fill="#fff4f0" stroke="#283044" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M58 112c0-27 21-48 48-48s48 21 48 48-20 50-48 50-48-23-48-50z" fill="#fff4f0" stroke="#283044" stroke-width="5"/>' +
            '<circle cx="88" cy="109" r="5" fill="#283044"/><circle cx="124" cy="109" r="5" fill="#283044"/>' +
            '<path d="M103 119c4 4 8 4 12 0" fill="none" stroke="#283044" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M74 127c-9-3-16-2-22 3M137 126c9-4 17-3 24 2" fill="none" stroke="#283044" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M74 142c20 15 48 15 68-1" fill="none" stroke="#ff8fab" stroke-width="5" stroke-linecap="round"/>' +
          '</g>' +
          '<path class="art-spark spark-a" d="M36 39l5 11 11 5-11 5-5 11-5-11-11-5 11-5 5-11z"/>' +
          '<path class="art-spark spark-b" d="M198 115l4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9z"/>' +
        '</svg>' +
        '<span class="hero-art-label">' + label + '</span>' +
      '</div>'
    );
  }

  function render() {
    const app = document.getElementById('app');
    app.innerHTML =
      renderPageDecor() +
      renderHeader() +
      renderDateNav() +
      renderMain();
    renderModal();
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function renderHeader() {
    const date = App.state.date;
    const today = todayStr();
    const subtitle = date === today ? '今天 · ' + weekdayName(date) : dateLabel(date) + ' · ' + weekdayName(date);
    return (
      '<header class="topbar">' +
        '<div class="brand">' +
          '<span class="brand-mark">' + icon('Sun') + '</span>' +
          '<div class="brand-text"><h1>每日打卡</h1><p>' + esc(subtitle) + '</p></div>' +
        '</div>' +
        '<div class="top-actions">' +
          '<span class="stars-pill">' + icon('Star') + '<b>' + Data.totalStarsAll() + '</b></span>' +
          '<button class="btn-icon" data-action="nav" data-view="settings" aria-label="设置">' + icon('Settings') + '</button>' +
        '</div>' +
      '</header>' +
      '<nav class="main-tabs" aria-label="主导航">' +
        VIEW_TABS.map((t) =>
          '<button class="tab-btn' + (App.state.view === t.id ? ' is-active' : '') + '" data-action="nav" data-view="' + t.id + '">' +
            icon(t.icon) + '<span>' + t.label + '</span>' +
          '</button>'
        ).join('') +
      '</nav>'
    );
  }

  function renderDateNav() {
    if (App.state.view !== 'today') return '';
    const date = App.state.date;
    const today = todayStr();
    return (
      '<div class="date-nav">' +
        '<button class="btn-icon" data-action="prev-day" aria-label="前一天">' + icon('ChevronLeft') + '</button>' +
        '<span class="date-nav-label">' + esc(dateLabel(date)) + ' ' + esc(weekdayName(date)) + '</span>' +
        '<button class="btn-icon" data-action="next-day" aria-label="后一天">' + icon('ChevronRight') + '</button>' +
        (date === today ? '' : '<button class="btn btn-ghost btn-sm" data-action="go-today">' + icon('Sun') + '<span>今天</span></button>') +
      '</div>'
    );
  }

  function renderMain() {
    switch (App.state.view) {
      case 'week': return renderWeek();
      case 'calendar': return renderCalendar();
      case 'stats': return renderStats();
      case 'settings': return renderSettings();
      default: return renderToday();
    }
  }

  function renderToday() {
    const date = App.state.date;
    const day = Data.getDay(date);
    return (
      '<section class="view today-view">' +
        renderHero(date) +
        (day ? renderDayList(day) : renderDayEmpty(date)) +
      '</section>'
    );
  }

  function renderHero(date) {
    const p = Data.dayProgress(date);
    const tpl = Data.templateForDate(date);
    const today = todayStr();
    const heroClass = p.complete ? 'hero is-complete' : 'hero';
    return (
      '<section class="' + heroClass + '">' +
        '<div class="hero-copy">' +
          '<div class="hero-eyebrow">' + esc(dateLabel(date)) + ' · ' + esc(weekdayName(date)) + '</div>' +
          '<h2>' + (date === today ? (p.complete ? '全部完成啦' : '今天也要元气满满') : '作息清单') + '</h2>' +
          '<div class="hero-meta">' +
            '<span class="chip">' + (tpl.kind === 'weekday' ? '工作日模板' : '周末模板') + '</span>' +
            '<span class="chip">' + p.done + '/' + p.total + ' 完成</span>' +
            (p.bonus ? '<span class="chip chip-bonus">' + icon('Sparkles') + '目标达成 +3 星</span>' : '') +
          '</div>' +
          '<div class="stars-line">' + icon('Star') + ' <b>' + p.stars + '</b> 颗星</div>' +
        '</div>' +
        '<div class="hero-side">' +
          '<div class="hero-ring">' + ringWrap(p.pct, 132, 14) + '</div>' +
          renderHeroMascot(p.complete) +
        '</div>' +
      '</section>'
    );
  }

  function renderDayEmpty(date) {
    return (
      '<section class="empty-card">' +
        '<span class="empty-icon">' + icon('Sunrise') + '</span>' +
        '<h3>' + esc(dateLabel(date)) + '的清单还没生成</h3>' +
        '<button class="btn btn-primary" data-action="create-day">' + icon('Sparkles') + '<span>生成清单</span></button>' +
      '</section>'
    );
  }

  function renderDayList(day) {
    const edit = App.state.edit;
    const cards = day.items.map((item, idx) => renderCheckCard(item, idx, day.items.length, edit)).join('');
    return (
      '<section class="list-section">' +
        '<div class="section-head"><h3>今日清单</h3><span class="section-count">' + day.items.length + ' 项</span></div>' +
        '<div class="check-list" data-list="day">' + cards + '</div>' +
        '<div class="list-toolbar">' +
          '<button class="btn btn-ghost" data-action="edit-toggle">' + icon(edit ? 'Check' : 'Pencil') + '<span>' + (edit ? '完成编辑' : '编辑清单') + '</span></button>' +
          '<button class="btn btn-primary" data-action="add-item">' + icon('Plus') + '<span>添加模块</span></button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderCheckCard(item, idx, len, edit) {
    const cat = catInfo(item.category);
    const done = item.done;
    return (
      '<div class="check-card' + (done ? ' is-done' : '') + (edit ? ' is-edit' : '') + '" data-id="' + esc(item.id) + '" draggable="' + (edit ? 'true' : 'false') + '">' +
        (edit ? '<div class="item-drag">' + icon('GripVertical') + '</div>' : '') +
        '<div class="item-time">' + esc(item.time) + '</div>' +
        '<div class="item-icon" style="--cat:' + cat.color + '">' + icon(item.icon) + '</div>' +
        '<div class="item-info">' +
          '<span class="item-name">' + esc(item.name) + '</span>' +
          '<span class="cat-chip" style="color:' + cat.color + ';background:' + cat.color + '1f">' + cat.label + '</span>' +
        '</div>' +
        '<button class="check-btn" data-action="toggle-item" data-id="' + esc(item.id) + '" aria-label="完成">' +
          icon(done ? 'CheckCircle2' : 'Circle') +
        '</button>' +
        (edit
          ? '<div class="item-edit-actions">' +
              '<button class="icon-btn" data-action="move-item" data-id="' + esc(item.id) + '" data-dir="up" aria-label="上移" ' + (idx === 0 ? 'disabled' : '') + '>' + icon('ChevronUp') + '</button>' +
              '<button class="icon-btn" data-action="move-item" data-id="' + esc(item.id) + '" data-dir="down" aria-label="下移" ' + (idx === len - 1 ? 'disabled' : '') + '>' + icon('ChevronDown') + '</button>' +
              '<button class="icon-btn" data-action="replace-item" data-id="' + esc(item.id) + '" aria-label="替换">' + icon('RotateCcw') + '</button>' +
              '<button class="icon-btn danger" data-action="remove-item" data-id="' + esc(item.id) + '" aria-label="删除">' + icon('Trash2') + '</button>' +
            '</div>'
          : '') +
      '</div>'
    );
  }

  function renderWeek() {
    const dates = getWeekDates(App.state.date);
    const stats = Data.weekStats(App.state.date);
    const avg = Data.rateForDates(dates);
    const doneTotal = stats.reduce((s, d) => s + d.progress.done, 0);
    const fullDays = stats.filter((d) => d.progress.complete).length;
    const today = todayStr();
    const first = fromDateStr(dates[0]);
    const last = fromDateStr(dates[6]);
    const rangeLabel = (first.getMonth() + 1) + '月' + first.getDate() + '日 - ' + (last.getMonth() + 1) + '月' + last.getDate() + '日';
    const cards = stats.map((d, i) => {
      const p = d.progress;
      const isToday = d.date === today;
      return (
        '<button class="day-card" data-action="open-day" data-date="' + d.date + '">' +
          '<span class="day-name">' + WEEKDAY_NAMES[i] + (isToday ? ' <em>今天</em>' : '') + '</span>' +
          '<span class="day-date">' + fromDateStr(d.date).getDate() + '日</span>' +
          '<div class="day-ring">' + ringWrap(p.pct, 64, 8) + '</div>' +
          '<span class="day-count">' + p.done + '/' + p.total + '</span>' +
        '</button>'
      );
    }).join('');
    return (
      '<section class="view week-view">' +
        '<div class="view-head">' +
          '<div><h2>本周</h2><p>' + esc(rangeLabel) + '</p></div>' +
          '<div class="view-head-actions">' +
            '<button class="btn-icon" data-action="prev-week" aria-label="上一周">' + icon('ChevronLeft') + '</button>' +
            '<button class="btn-icon" data-action="next-week" aria-label="下一周">' + icon('ChevronRight') + '</button>' +
            '<button class="btn btn-ghost btn-sm" data-action="go-this-week">' + icon('CalendarCheck') + '<span>本周</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="week-summary">' +
          '<div class="summary-item"><span class="summary-icon" style="background:#e8f6ee;color:#2fa36b">' + icon('TrendingUp') + '</span><div><b>' + avg + '%</b><span>平均完成</span></div></div>' +
          '<div class="summary-item"><span class="summary-icon" style="background:#fff4e0;color:#f59e0b">' + icon('Star') + '</span><div><b>' + doneTotal + '</b><span>完成次数</span></div></div>' +
          '<div class="summary-item"><span class="summary-icon" style="background:#e8f1ff;color:#3e92cc">' + icon('CalendarCheck') + '</span><div><b>' + fullDays + '</b><span>全勤天数</span></div></div>' +
        '</div>' +
        '<div class="week-grid">' + cards + '</div>' +
      '</section>'
    );
  }

  function renderCalendar() {
    const base = fromDateStr(App.state.date);
    const target = new Date(base.getFullYear(), base.getMonth() + App.state.monthOffset, 1);
    const cells = getMonthGrid(target.getFullYear(), target.getMonth() + 1);
    const today = todayStr();
    const headLabel = target.getFullYear() + '年' + (target.getMonth() + 1) + '月';
    const cellHtml = cells.map((cell) => {
      const p = Data.dayProgress(cell.date);
      const hasRecord = Data.getDay(cell.date) !== null;
      const bg = Charts.heatColor(p.pct, hasRecord);
      return (
        '<button class="cal-cell' + (cell.inMonth ? '' : ' is-out') + (cell.date === today ? ' is-today' : '') + '" ' +
          'data-action="open-day" data-date="' + cell.date + '" style="background:' + bg + '">' +
          '<span class="cal-day">' + fromDateStr(cell.date).getDate() + '</span>' +
          '<span class="cal-pct">' + (hasRecord ? p.pct + '%' : '') + '</span>' +
        '</button>'
      );
    }).join('');
    const head = WEEKDAY_SHORT.map((d) => '<span class="cal-head">' + d + '</span>').join('');
    return (
      '<section class="view calendar-view">' +
        '<div class="view-head">' +
          '<div><h2>打卡日历</h2><p>' + esc(headLabel) + '</p></div>' +
          '<div class="view-head-actions">' +
            '<button class="btn-icon" data-action="prev-month" aria-label="上个月">' + icon('ChevronLeft') + '</button>' +
            '<button class="btn-icon" data-action="next-month" aria-label="下个月">' + icon('ChevronRight') + '</button>' +
            '<button class="btn btn-ghost btn-sm" data-action="go-this-month">' + icon('CalendarCheck') + '<span>本月</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="cal-grid">' + head + cellHtml + '</div>' +
        '<div class="cal-legend">' +
          '<span><i style="background:#e9edf5"></i>未开始</span>' +
          '<span><i style="background:#ffe9a8"></i>开始</span>' +
          '<span><i style="background:#ffd166"></i>进行中</span>' +
          '<span><i style="background:#62cf8b"></i>快完成</span>' +
          '<span><i style="background:#2fa36b"></i>全完成</span>' +
        '</div>' +
      '</section>'
    );
  }

  function renderStats() {
    const streak = Data.currentStreak();
    const best = Data.bestStreak();
    const stars = Data.totalStarsAll();
    const weekRate = Data.rateForDates(getWeekDates(todayStr()));
    const trend = Data.weekTrend(8);
    const cats = Data.categoryStats(Data.lastNDays(30).map((d) => d.date));
    const badges = Data.badgeStatus();
    const unlockedCount = badges.filter((b) => b.unlocked).length;
    return (
      '<section class="view stats-view">' +
        '<div class="view-head"><div><h2>成长统计</h2><p>一步一步变成更好的自己</p></div></div>' +
        '<div class="stat-grid">' +
          '<div class="stat-card"><span class="stat-icon" style="background:#ffe9d6;color:#f59e0b">' + icon('Flame') + '</span><b>' + streak + '</b><span>连续天数</span></div>' +
          '<div class="stat-card"><span class="stat-icon" style="background:#e4f2ff;color:#3e92cc">' + icon('CalendarDays') + '</span><b>' + weekRate + '%</b><span>本周完成</span></div>' +
          '<div class="stat-card"><span class="stat-icon" style="background:#fff6d8;color:#f7b32b">' + icon('Star') + '</span><b>' + stars + '</b><span>累计星星</span></div>' +
          '<div class="stat-card"><span class="stat-icon" style="background:#f1e8ff;color:#8b5cf6">' + icon('Trophy') + '</span><b>' + best + '</b><span>最佳连续</span></div>' +
        '</div>' +
        '<div class="panel"><div class="panel-head"><h3>近 8 周完成率</h3></div>' + Charts.bars(trend, { color: '#3e92cc', suffix: '%' }) + '</div>' +
        '<div class="panel"><div class="panel-head"><h3>最近 30 天分类完成率</h3></div>' + Charts.bars(cats, { color: '#43a047', suffix: '%' }) + '</div>' +
        '<div class="panel">' +
          '<div class="panel-head"><h3>我的徽章</h3><span class="section-count">' + unlockedCount + '/' + badges.length + '</span></div>' +
          '<div class="badge-grid">' +
            badges.map((b) =>
              '<div class="badge-card' + (b.unlocked ? ' is-unlocked' : '') + '">' +
                '<span class="badge-icon">' + icon(b.icon) + '</span>' +
                '<b>' + esc(b.name) + '</b>' +
                '<span class="badge-progress">' + Math.min(b.current, b.value) + '/' + b.value + (b.type === 'totalDone' ? ' 次' : b.type === 'totalStars' ? ' 星' : ' 天') + '</span>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function renderSettings() {
    return (
      '<section class="view settings-view">' +
        '<div class="view-head"><div><h2>设置</h2><p>模板、模块与数据管理</p></div></div>' +
        renderTemplatePanel() +
        renderLibraryPanel() +
        renderRewardPanel() +
        renderDataPanel() +
      '</section>'
    );
  }

  function renderTemplatePanel() {
    const kind = App.state.templateKind || 'weekday';
    const tpl = Data.getState().settings.templates[kind];
    const options = Data.getLibrary().map((m) =>
      '<option value="' + esc(m.id) + '">' + esc(m.name) + '</option>'
    ).join('');
    const rows = tpl.map((item, idx) => {
      const mod = Data.getModule(item.moduleId);
      const selected = mod ? mod.id : '';
      return (
        '<div class="tpl-row" data-id="' + esc(item.id) + '" draggable="true">' +
          '<div class="tpl-drag">' + icon('GripVertical') + '</div>' +
          '<input class="tpl-time" type="time" value="' + esc(item.time) + '" data-field="template-time" data-id="' + esc(item.id) + '" aria-label="时间">' +
          '<select class="tpl-module" data-field="template-module" data-id="' + esc(item.id) + '" aria-label="模块">' +
            (mod ? '' : '<option value="">未找到模块</option>') +
            Data.getLibrary().map((m) =>
              '<option value="' + esc(m.id) + '"' + (m.id === selected ? ' selected' : '') + '>' + esc(m.name) + '</option>'
            ).join('') +
          '</select>' +
          '<label class="switch-label" title="启用">' +
            '<input type="checkbox" data-field="template-enabled" data-id="' + esc(item.id) + '"' + (item.enabled ? ' checked' : '') + '>' +
            '<span class="switch"></span>' +
          '</label>' +
          '<div class="tpl-move">' +
            '<button class="icon-btn" data-action="template-move" data-id="' + esc(item.id) + '" data-dir="up" aria-label="上移" ' + (idx === 0 ? 'disabled' : '') + '>' + icon('ChevronUp') + '</button>' +
            '<button class="icon-btn" data-action="template-move" data-id="' + esc(item.id) + '" data-dir="down" aria-label="下移" ' + (idx === tpl.length - 1 ? 'disabled' : '') + '>' + icon('ChevronDown') + '</button>' +
          '</div>' +
          '<button class="icon-btn danger" data-action="template-remove" data-id="' + esc(item.id) + '" aria-label="删除">' + icon('Trash2') + '</button>' +
        '</div>'
      );
    }).join('');
    return (
      '<section class="panel">' +
        '<div class="panel-head"><h3>作息模板</h3></div>' +
        '<div class="seg">' +
          '<button class="seg-btn' + (kind === 'weekday' ? ' is-active' : '') + '" data-action="template-kind" data-kind="weekday">工作日</button>' +
          '<button class="seg-btn' + (kind === 'weekend' ? ' is-active' : '') + '" data-action="template-kind" data-kind="weekend">周末</button>' +
        '</div>' +
        '<div class="tpl-list" data-list="' + kind + '">' + rows + '</div>' +
        '<div class="tpl-add-row">' +
          '<select class="tpl-module" data-field="template-add" aria-label="添加模块">' +
            '<option value="">添加一个模块…</option>' + options +
          '</select>' +
          '<button class="btn btn-ghost" data-action="template-reset">' + icon('RotateCcw') + '<span>恢复默认</span></button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderLibraryPanel() {
    const rows = Data.getLibrary().map((m) => {
      const cat = catInfo(m.category);
      return (
        '<div class="lib-row">' +
          '<span class="lib-icon" style="--cat:' + cat.color + '">' + icon(m.icon) + '</span>' +
          '<span class="lib-name">' + esc(m.name) + '</span>' +
          '<span class="cat-chip" style="color:' + cat.color + ';background:' + cat.color + '1f">' + cat.label + '</span>' +
          '<span class="lib-time">' + esc(m.defaultTime) + '</span>' +
          '<div class="lib-actions">' +
            '<button class="icon-btn" data-action="library-edit" data-id="' + esc(m.id) + '" aria-label="编辑">' + icon('Pencil') + '</button>' +
            '<button class="icon-btn danger" data-action="library-delete" data-id="' + esc(m.id) + '" aria-label="删除">' + icon('Trash2') + '</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    return (
      '<section class="panel">' +
        '<div class="panel-head"><h3>模块库</h3><button class="btn btn-primary btn-sm" data-action="library-new">' + icon('Plus') + '<span>新建模块</span></button></div>' +
        '<div class="lib-list">' + rows + '</div>' +
      '</section>'
    );
  }

  function renderRewardPanel() {
    const target = Data.getDailyTarget();
    const badges = Data.getState().settings.rewards.badgeRules;
    const rows = badges.map((b) =>
      '<div class="badge-row">' +
        '<input type="text" value="' + esc(b.name) + '" data-field="badge-name" data-id="' + esc(b.id) + '" aria-label="徽章名">' +
        '<select data-field="badge-type" data-id="' + esc(b.id) + '" aria-label="类型">' +
          '<option value="streak"' + (b.type === 'streak' ? ' selected' : '') + '>连续天数</option>' +
          '<option value="totalDone"' + (b.type === 'totalDone' ? ' selected' : '') + '>累计打卡</option>' +
          '<option value="totalStars"' + (b.type === 'totalStars' ? ' selected' : '') + '>累计星星</option>' +
        '</select>' +
        '<input type="number" min="1" value="' + b.value + '" data-field="badge-value" data-id="' + esc(b.id) + '" aria-label="目标">' +
        '<button class="icon-btn danger" data-action="badge-remove" data-id="' + esc(b.id) + '" aria-label="删除">' + icon('Trash2') + '</button>' +
      '</div>'
    ).join('');
    return (
      '<section class="panel">' +
        '<div class="panel-head"><h3>奖励规则</h3></div>' +
        '<div class="reward-target">' +
          '<label for="reward-target">每日目标</label>' +
          '<input id="reward-target" type="number" min="1" value="' + target + '" data-field="reward-target">' +
          '<span>项完成</span>' +
        '</div>' +
        '<div class="badge-list">' + rows + '</div>' +
        '<button class="btn btn-ghost" data-action="badge-add">' + icon('Plus') + '<span>添加徽章</span></button>' +
      '</section>'
    );
  }

  function renderDataPanel() {
    return (
      '<section class="panel">' +
        '<div class="panel-head"><h3>数据备份</h3></div>' +
        '<div class="data-actions">' +
          '<button class="btn btn-ghost" data-action="export-data">' + icon('FileDown') + '<span>导出备份</span></button>' +
          '<button class="btn btn-ghost" data-action="import-data">' + icon('FileUp') + '<span>导入备份</span></button>' +
          '<button class="btn btn-danger" data-action="clear-data">' + icon('Trash2') + '<span>清空数据</span></button>' +
          '<input type="file" id="import-file" accept="application/json" hidden data-field="import-file">' +
        '</div>' +
      '</section>'
    );
  }

  function renderModal() {
    const root = document.getElementById('modal-root');
    const s = App.state;
    if (s.picker) {
      root.innerHTML = renderPickerModal(s.picker);
    } else if (s.moduleForm) {
      root.innerHTML = renderModuleFormModal(s.moduleForm);
    } else if (s.confirm) {
      root.innerHTML = renderConfirmModal(s.confirm);
    } else {
      root.innerHTML = '';
    }
    refreshIcons();
  }

  function renderPickerModal(picker) {
    const catFilter = App.state.pickerFilter || 'all';
    const chips = '<button class="chip-btn' + (catFilter === 'all' ? ' is-active' : '') + '" data-action="picker-filter" data-cat="all">全部</button>' +
      CATEGORIES.map((c) =>
        '<button class="chip-btn' + (catFilter === c.id ? ' is-active' : '') + '" data-action="picker-filter" data-cat="' + c.id + '" style="--chip:' + c.color + '">' + c.label + '</button>'
      ).join('');
    const modules = Data.getLibrary().filter((m) => catFilter === 'all' || m.category === catFilter);
    const grid = modules.map((m) => {
      const cat = catInfo(m.category);
      return (
        '<button class="pick-card" data-action="pick-module" data-module-id="' + esc(m.id) + '"' + (picker.itemId ? ' data-item-id="' + esc(picker.itemId) + '"' : '') + '>' +
          '<span class="pick-icon" style="--cat:' + cat.color + '">' + icon(m.icon) + '</span>' +
          '<span class="pick-name">' + esc(m.name) + '</span>' +
          '<span class="pick-time">' + esc(m.defaultTime) + '</span>' +
        '</button>'
      );
    }).join('');
    return (
      '<div class="modal-backdrop">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<div class="modal-head">' +
            '<h3>' + (picker.mode === 'replace' ? '替换模块' : '添加模块') + '</h3>' +
            '<button class="icon-btn" data-action="modal-close" aria-label="关闭">' + icon('X') + '</button>' +
          '</div>' +
          '<div class="picker-filters">' + chips + '</div>' +
          '<div class="picker-grid">' + (grid || '<p class="picker-empty">这个分类还没有模块</p>') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderModuleFormModal(form) {
    const catOptions = CATEGORIES.map((c) =>
      '<option value="' + c.id + '"' + (form.category === c.id ? ' selected' : '') + '>' + c.label + '</option>'
    ).join('');
    const iconGrid = ICON_CHOICES.map((n) =>
      '<button type="button" class="icon-pick' + (form.icon === n ? ' is-active' : '') + '" data-action="module-icon" data-icon="' + n + '" aria-label="' + n + '">' + icon(n) + '</button>'
    ).join('');
    return (
      '<div class="modal-backdrop">' +
        '<div class="modal modal-wide" role="dialog" aria-modal="true">' +
          '<div class="modal-head">' +
            '<h3>' + (form.id ? '编辑模块' : '新建模块') + '</h3>' +
            '<button class="icon-btn" data-action="modal-close" aria-label="关闭">' + icon('X') + '</button>' +
          '</div>' +
          '<div class="module-form">' +
            '<label class="form-field"><span>名称</span><input type="text" id="module-name" value="' + esc(form.name) + '" maxlength="12" placeholder="例如：读绘本"></label>' +
            '<div class="form-row">' +
              '<label class="form-field"><span>类别</span><select id="module-category">' + catOptions + '</select></label>' +
              '<label class="form-field"><span>默认时间</span><input type="time" id="module-time" value="' + esc(form.defaultTime) + '"></label>' +
            '</div>' +
            '<div class="form-field"><span>图标</span><div class="icon-grid">' + iconGrid + '</div></div>' +
            '<div class="modal-actions">' +
              '<button class="btn btn-ghost" data-action="modal-close">取消</button>' +
              '<button class="btn btn-primary" data-action="module-save">保存</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderConfirmModal(confirm) {
    return (
      '<div class="modal-backdrop">' +
        '<div class="modal modal-sm" role="dialog" aria-modal="true">' +
          '<div class="modal-head"><h3>' + esc(confirm.title) + '</h3></div>' +
          '<p class="confirm-text">' + esc(confirm.message) + '</p>' +
          '<div class="modal-actions">' +
            '<button class="btn btn-ghost" data-action="confirm-no">取消</button>' +
            '<button class="btn btn-danger" data-action="confirm-yes">' + esc(confirm.confirmLabel || '确定') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function toast(msg, iconName) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(iconName || 'CheckCircle2') + '<span>' + esc(msg) + '</span>';
    root.appendChild(el);
    refreshIcons();
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 250);
    }, 2200);
  }

  return {
    render,
    toast,
    refreshIcons
  };
})();
