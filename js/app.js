'use strict';

const App = {
  state: {
    date: todayStr(),
    view: 'today',
    edit: false,
    templateKind: 'weekday',
    picker: null,
    pickerFilter: 'all',
    moduleForm: null,
    confirm: null,
    monthOffset: 0
  },

  init() {
    Data.load();
    if (!Data.getDay(this.state.date)) {
      Data.createDayFromTemplate(this.state.date);
    }
    this.bind();
    this.render();
  },

  render() {
    Views.render();
  },

  setDate(dateStr) {
    this.state.date = dateStr;
    this.state.edit = false;
    this.state.monthOffset = 0;
    this.render();
  },

  setView(view) {
    this.state.view = view;
    this.state.edit = false;
    this.render();
  },

  closeModals() {
    this.state.picker = null;
    this.state.moduleForm = null;
    this.state.confirm = null;
  },

  askConfirm(title, message, action, confirmLabel, payload) {
    this.state.confirm = { title, message, action, confirmLabel, payload };
    Views.render();
  },

  toggleItem(id) {
    const day = Data.getDay(this.state.date);
    if (!day) return;
    const item = day.items.find((i) => i.id === id);
    if (!item) return;
    item.done = !item.done;
    item.doneAt = item.done ? new Date().toISOString() : '';
    Data.save();
    if (item.done) {
      if (Data.dayProgress(this.state.date).complete) {
        Views.toast('今天全部完成啦', 'PartyPopper');
      } else {
        Views.toast('完成 ' + item.name, 'CheckCircle2');
      }
    }
    this.render();
  },

  addItem(moduleId) {
    const day = Data.getDay(this.state.date);
    if (!day) return;
    const mod = Data.getModule(moduleId);
    if (!mod) return;
    day.items.push(Data.normalizeItem({
      id: Data.uid(),
      moduleId: mod.id,
      name: mod.name,
      icon: mod.icon,
      category: mod.category,
      time: mod.defaultTime
    }));
    Data.save();
    Views.toast('已添加 ' + mod.name, 'Plus');
    this.state.picker = null;
    this.render();
  },

  replaceItem(itemId, moduleId) {
    const day = Data.getDay(this.state.date);
    if (!day) return;
    const item = day.items.find((i) => i.id === itemId);
    const mod = Data.getModule(moduleId);
    if (!item || !mod) return;
    item.moduleId = mod.id;
    item.name = mod.name;
    item.icon = mod.icon;
    item.category = mod.category;
    Data.save();
    Views.toast('已替换为 ' + mod.name, 'RotateCcw');
    this.state.picker = null;
    this.render();
  },

  removeItem(id) {
    const day = Data.getDay(this.state.date);
    if (!day) return;
    day.items = day.items.filter((i) => i.id !== id);
    Data.save();
    this.render();
  },

  moveItem(id, dir) {
    const day = Data.getDay(this.state.date);
    if (!day) return;
    const idx = day.items.findIndex((i) => i.id === id);
    const to = idx + (dir === 'up' ? -1 : 1);
    if (idx < 0 || to < 0 || to >= day.items.length) return;
    this.moveInArray(day.items, idx, to);
    Data.save();
    this.render();
  },

  moveInArray(arr, from, to) {
    const item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
  },

  createDay() {
    Data.createDayFromTemplate(this.state.date);
    Views.toast('清单已生成', 'Sparkles');
    this.render();
  },

  templateUpdate(id, field, value) {
    const kind = this.state.templateKind;
    const tpl = Data.getState().settings.templates[kind];
    const item = tpl.find((t) => t.id === id);
    if (!item) return;
    if (field === 'template-time') item.time = value;
    if (field === 'template-module') {
      item.moduleId = value;
      const mod = Data.getModule(value);
      if (mod) item.time = mod.defaultTime;
    }
    if (field === 'template-enabled') item.enabled = value;
    Data.save();
    this.render();
  },

  templateAdd(moduleId) {
    const mod = Data.getModule(moduleId);
    if (!mod) return;
    const kind = this.state.templateKind;
    Data.getState().settings.templates[kind].push({
      id: Data.uid(),
      moduleId: mod.id,
      time: mod.defaultTime,
      enabled: true
    });
    Data.save();
    Views.toast('已加入 ' + mod.name, 'Plus');
    this.render();
  },

  templateRemove(id) {
    const kind = this.state.templateKind;
    const tpl = Data.getState().settings.templates[kind];
    Data.getState().settings.templates[kind] = tpl.filter((t) => t.id !== id);
    Data.save();
    this.render();
  },

  templateMove(id, dir) {
    const kind = this.state.templateKind;
    const tpl = Data.getState().settings.templates[kind];
    const idx = tpl.findIndex((t) => t.id === id);
    const to = idx + (dir === 'up' ? -1 : 1);
    if (idx < 0 || to < 0 || to >= tpl.length) return;
    this.moveInArray(tpl, idx, to);
    Data.save();
    this.render();
  },

  templateReset() {
    const kind = this.state.templateKind;
    Data.getState().settings.templates[kind] = defaultTemplate(kind === 'weekday').map((t) => ({
      ...t,
      id: Data.uid()
    }));
    Data.save();
    Views.toast('模板已恢复默认', 'RotateCcw');
    this.render();
  },

  openModuleForm(form) {
    this.state.moduleForm = form || { id: '', name: '', icon: 'Sun', category: 'activity', defaultTime: '08:00' };
    Views.render();
  },

  saveModule() {
    const form = this.state.moduleForm;
    if (!form) return;
    const name = (document.getElementById('module-name').value || '').trim();
    const category = document.getElementById('module-category').value;
    const defaultTime = document.getElementById('module-time').value || '08:00';
    if (!name) {
      Views.toast('先填一个名称', 'CircleAlert');
      return;
    }
    const lib = Data.getState().settings.library;
    if (form.id) {
      const mod = lib.find((m) => m.id === form.id);
      if (mod) {
        mod.name = name;
        mod.icon = form.icon;
        mod.category = category;
        mod.defaultTime = defaultTime;
      }
      Views.toast('模块已更新', 'CheckCircle2');
    } else {
      lib.push({
        id: Data.uid(),
        name,
        icon: form.icon,
        category,
        defaultTime
      });
      Views.toast('模块已创建', 'CheckCircle2');
    }
    Data.save();
    this.state.moduleForm = null;
    this.render();
  },

  deleteModule(id) {
    const state = Data.getState();
    state.settings.library = state.settings.library.filter((m) => m.id !== id);
    ['weekday', 'weekend'].forEach((kind) => {
      state.settings.templates[kind] = state.settings.templates[kind].filter((t) => t.moduleId !== id);
    });
    Data.save();
    Views.toast('模块已删除', 'Trash2');
    this.render();
  },

  badgeAdd() {
    Data.getState().settings.rewards.badgeRules.push({
      id: Data.uid(),
      name: '新徽章',
      icon: 'Star',
      type: 'streak',
      value: 1
    });
    Data.save();
    this.render();
  },

  badgeRemove(id) {
    const rules = Data.getState().settings.rewards.badgeRules;
    Data.getState().settings.rewards.badgeRules = rules.filter((b) => b.id !== id);
    Data.save();
    this.render();
  },

  badgeUpdate(id, field, value) {
    const badge = Data.getState().settings.rewards.badgeRules.find((b) => b.id === id);
    if (!badge) return;
    if (field === 'badge-name') badge.name = value;
    if (field === 'badge-type') badge.type = value;
    if (field === 'badge-value') badge.value = Math.max(1, Number(value) || 1);
    Data.save();
  },

  exportData() {
    const blob = new Blob([JSON.stringify(Data.getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '每日打卡备份-' + todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Views.toast('备份已导出', 'FileDown');
  },

  importData(text) {
    let raw;
    try {
      raw = JSON.parse(text);
    } catch (err) {
      Views.toast('备份文件无法读取', 'CircleAlert');
      return;
    }
    const state = normalize(raw);
    localStorage.setItem(Data.KEY, JSON.stringify(state));
    Data.load();
    this.state.date = todayStr();
    this.state.edit = false;
    this.state.monthOffset = 0;
    Views.toast('备份已导入', 'FileUp');
    this.render();
  },

  runConfirm() {
    const c = this.state.confirm;
    if (!c) return;
    this.state.confirm = null;
    if (c.action === 'clear') {
      Data.reset();
      this.state.date = todayStr();
      this.state.edit = false;
      if (!Data.getDay(this.state.date)) Data.createDayFromTemplate(this.state.date);
      Views.toast('数据已清空', 'Trash2');
    } else if (c.action === 'template-reset') {
      this.templateReset();
      return;
    } else if (c.action === 'delete-module') {
      this.deleteModule(c.payload);
      return;
    }
    this.render();
  },

  bind() {
    document.addEventListener('click', (e) => this.onClick(e));
    document.addEventListener('change', (e) => this.onChange(e));
    document.addEventListener('dragstart', (e) => this.onDragStart(e));
    document.addEventListener('dragover', (e) => this.onDragOver(e));
    document.addEventListener('drop', (e) => this.onDrop(e));
    document.addEventListener('dragend', () => {
      document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && (this.state.picker || this.state.moduleForm || this.state.confirm)) {
        this.closeModals();
        Views.render();
      }
    });
  },

  onClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === 'modal-close') {
      const isBackdrop = e.target.classList.contains('modal-backdrop');
      const isCloseBtn = Boolean(e.target.closest('button[data-action="modal-close"]'));
      if (!isBackdrop && !isCloseBtn) return;
      this.closeModals();
      Views.render();
      return;
    }

    switch (action) {
      case 'nav':
        this.setView(target.dataset.view);
        break;
      case 'prev-day':
        this.setDate(addDays(this.state.date, -1));
        break;
      case 'next-day':
        this.setDate(addDays(this.state.date, 1));
        break;
      case 'go-today':
      case 'go-this-week':
      case 'go-this-month':
        this.setDate(todayStr());
        break;
      case 'prev-week':
        this.setDate(addDays(this.state.date, -7));
        break;
      case 'next-week':
        this.setDate(addDays(this.state.date, 7));
        break;
      case 'prev-month':
        this.state.monthOffset -= 1;
        this.render();
        break;
      case 'next-month':
        this.state.monthOffset += 1;
        this.render();
        break;
      case 'open-day':
        this.setDate(target.dataset.date);
        this.setView('today');
        break;
      case 'create-day':
        this.createDay();
        break;
      case 'toggle-item':
        this.toggleItem(id);
        break;
      case 'add-item':
        this.state.picker = { mode: 'add' };
        this.state.pickerFilter = 'all';
        Views.render();
        break;
      case 'replace-item':
        this.state.picker = { mode: 'replace', itemId: id };
        this.state.pickerFilter = 'all';
        Views.render();
        break;
      case 'pick-module':
        if (this.state.picker.mode === 'replace') {
          this.replaceItem(target.dataset.itemId, target.dataset.moduleId);
        } else {
          this.addItem(target.dataset.moduleId);
        }
        break;
      case 'picker-filter':
        this.state.pickerFilter = target.dataset.cat;
        Views.render();
        break;
      case 'edit-toggle':
        this.state.edit = !this.state.edit;
        this.render();
        break;
      case 'move-item':
        this.moveItem(id, target.dataset.dir);
        break;
      case 'remove-item':
        this.removeItem(id);
        break;
      case 'template-kind':
        this.state.templateKind = target.dataset.kind;
        this.render();
        break;
      case 'template-move':
        this.templateMove(id, target.dataset.dir);
        break;
      case 'template-remove':
        this.templateRemove(id);
        break;
      case 'template-reset':
        this.askConfirm(
          '恢复默认模板',
          this.state.templateKind === 'weekday' ? '工作日模板会恢复为默认内容。' : '周末模板会恢复为默认内容。',
          'template-reset',
          '恢复'
        );
        break;
      case 'library-new':
        this.openModuleForm();
        break;
      case 'library-edit':
        {
          const mod = Data.getModule(id);
          if (mod) this.openModuleForm({ ...mod });
        }
        break;
      case 'library-delete':
        this.askConfirm(
          '删除模块',
          '删除后，模板中的这一项也会移除；已打卡的日期不受影响。',
          'delete-module',
          '删除',
          id
        );
        break;
      case 'module-icon':
        this.state.moduleForm.name = document.getElementById('module-name').value;
        this.state.moduleForm.category = document.getElementById('module-category').value;
        this.state.moduleForm.defaultTime = document.getElementById('module-time').value || '08:00';
        this.state.moduleForm.icon = target.dataset.icon;
        Views.render();
        break;
      case 'module-save':
        this.saveModule();
        break;
      case 'badge-add':
        this.badgeAdd();
        break;
      case 'badge-remove':
        this.badgeRemove(id);
        break;
      case 'export-data':
        this.exportData();
        break;
      case 'import-data':
        document.getElementById('import-file').click();
        break;
      case 'clear-data':
        this.askConfirm(
          '清空所有数据',
          '模板、打卡记录和徽章都会重置为初始状态，且无法恢复。',
          'clear',
          '清空'
        );
        break;
      case 'confirm-yes':
        this.runConfirm();
        break;
      case 'confirm-no':
        this.state.confirm = null;
        Views.render();
        break;
    }
  },

  onChange(e) {
    const field = e.target.dataset.field;
    if (!field) return;
    const id = e.target.dataset.id;
    if (field === 'template-time' || field === 'template-module' || field === 'template-enabled') {
      this.templateUpdate(id, field, field === 'template-enabled' ? e.target.checked : e.target.value);
    } else if (field === 'template-add') {
      if (e.target.value) {
        this.templateAdd(e.target.value);
      }
    } else if (field === 'reward-target') {
      Data.setDailyTarget(e.target.value);
      Views.toast('每日目标已更新', 'Target');
      this.render();
    } else if (field === 'badge-name' || field === 'badge-type' || field === 'badge-value') {
      this.badgeUpdate(id, field, e.target.value);
    } else if (field === 'import-file') {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => this.importData(String(reader.result));
        reader.readAsText(file);
      }
      e.target.value = '';
    }
  },

  onDragStart(e) {
    const el = e.target.closest('[draggable="true"]');
    if (!el) return;
    e.dataTransfer.setData('text/plain', el.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
  },

  onDragOver(e) {
    const el = e.target.closest('.check-card, .tpl-row');
    if (!el) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  },

  onDrop(e) {
    e.preventDefault();
    const el = e.target.closest('.check-card, .tpl-row');
    if (!el) return;
    const fromId = e.dataTransfer.getData('text/plain');
    if (!fromId || fromId === el.dataset.id) return;
    const list = el.parentElement.dataset.list;
    const fromIdx = Array.from(el.parentElement.children).findIndex((c) => c.dataset.id === fromId);
    const toIdx = Array.from(el.parentElement.children).indexOf(el);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
    if (list === 'day') {
      const day = Data.getDay(this.state.date);
      this.moveInArray(day.items, fromIdx, toIdx);
      Data.save();
    } else if (list === 'weekday' || list === 'weekend') {
      const tpl = Data.getState().settings.templates[list];
      this.moveInArray(tpl, fromIdx, toIdx);
      Data.save();
    }
    this.render();
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
