'use strict';

/* ---------- 常量 ---------- */
const STORE_PREFIX = 'codexchat:';
const API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.1-codex';
const MODEL_SUGGESTIONS = [
  'gpt-5.1-codex',
  'gpt-5.2-codex',
  'gpt-5.6-terra',
  'codex-mini-latest',
];

const $ = (id) => document.getElementById(id);

/* ---------- 状态 ---------- */
let settings = { apiKey: '', model: DEFAULT_MODEL, systemPrompt: '' };
let messages = [];
let generating = false;
let abortCtrl = null;
let streamEl = null;
let streamText = '';
let rafPending = false;
let toastTimer = null;

/* ---------- 本地存储 ---------- */
function loadState() {
  try {
    const s = localStorage.getItem(STORE_PREFIX + 'settings');
    if (s) settings = Object.assign(settings, JSON.parse(s));
    const m = localStorage.getItem(STORE_PREFIX + 'messages');
    if (m) messages = JSON.parse(m);
  } catch (e) {
    /* ignore corrupted storage */
  }
}

function saveState() {
  try {
    localStorage.setItem(STORE_PREFIX + 'settings', JSON.stringify(settings));
    localStorage.setItem(STORE_PREFIX + 'messages', JSON.stringify(messages));
  } catch (e) {
    /* storage full or unavailable */
  }
}

/* ---------- 轻量 Markdown 渲染（先转义再格式化，防 XSS） ---------- */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineFormat(s) {
  const spans = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => {
    spans.push(escapeHtml(c));
    return '\u0000C' + (spans.length - 1) + '\u0000';
  });
  let out = escapeHtml(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>');
  out = out.replace(/\u0000C(\d+)\u0000/g, (m, i) => '<code>' + spans[+i] + '</code>');
  return out;
}

function splitBlocks(text) {
  const blocks = [];
  let buf = [];
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (buf.length) { blocks.push({ type: 'para', lines: buf }); buf = []; }
      const lang = line.trim().slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', lang, code: code.join('\n').replace(/\n$/, '') });
    } else if (line.trim() === '') {
      if (buf.length) { blocks.push({ type: 'para', lines: buf }); buf = []; }
      i++;
    } else {
      buf.push(line);
      i++;
    }
  }
  if (buf.length) blocks.push({ type: 'para', lines: buf });
  return blocks;
}

function renderBlock(block) {
  if (block.type === 'code') {
    const lang = block.lang ? ' data-lang="' + escapeHtml(block.lang) + '"' : '';
    return '<pre' + lang + '><code>' + escapeHtml(block.code) + '</code></pre>';
  }
  const text = block.lines.join('\n');
  const trimmed = block.lines.map((l) => l.trim());
  if (trimmed.every((l) => !l || /^[-*+]\s+/.test(l))) {
    const items = block.lines
      .filter((l) => /^[-*+]\s+/.test(l.trim()))
      .map((l) => '<li>' + inlineFormat(l.trim().replace(/^[-*+]\s+/, '')) + '</li>')
      .join('');
    return '<ul>' + items + '</ul>';
  }
  if (trimmed.every((l) => !l || /^\d+[.)]\s+/.test(l))) {
    const items = block.lines
      .filter((l) => /^\d+[.)]\s+/.test(l.trim()))
      .map((l) => '<li>' + inlineFormat(l.trim().replace(/^\d+[.)]\s+/, '')) + '</li>')
      .join('');
    return '<ol>' + items + '</ol>';
  }
  return '<p>' + inlineFormat(text).replace(/\n/g, '<br>') + '</p>';
}

function renderMarkdown(text) {
  const t = String(text || '').trim();
  if (!t) return '<span class="typing"><i></i><i></i><i></i></span>';
  return splitBlocks(t).map(renderBlock).join('');
}

/* ---------- DOM 构建 ---------- */
function buildMessageEl(m, streaming) {
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (m.role === 'user' ? 'user' : 'assistant');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const md = document.createElement('div');
  md.className = 'md';
  md.innerHTML = streaming ? renderMarkdown('') : renderMarkdown(m.content);
  bubble.appendChild(md);
  wrap.appendChild(bubble);

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  if (m.role === 'assistant') {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    const copy = document.createElement('button');
    copy.className = 'icon-btn small';
    copy.dataset.lucide = 'copy';
    copy.title = '复制';
    copy.setAttribute('aria-label', '复制消息');
    copy.addEventListener('click', () => copyText(m.content || streamText));
    actions.appendChild(copy);
    meta.appendChild(actions);
  }
  wrap.appendChild(meta);
  return wrap;
}

function appendMessageEl(m, streaming) {
  const el = buildMessageEl(m, streaming);
  $('messages').appendChild(el);
  refreshIcons();
  autoScroll(true);
  return el;
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function autoScroll(force) {
  const c = $('chat');
  const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 140;
  if (force || nearBottom) c.scrollTop = c.scrollHeight;
}

function updateEmptyState() {
  const cta = $('emptyCta');
  $('emptyState').style.display = messages.length ? 'none' : 'flex';
  if (messages.length) return;
  if (!settings.apiKey) {
    cta.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.textContent = '填写 API Key';
    btn.addEventListener('click', openSettings);
    cta.appendChild(btn);
  } else {
    cta.innerHTML = '';
  }
}

function updateBadge() {
  const badge = $('modelBadge');
  if (settings.apiKey) {
    badge.textContent = settings.model || DEFAULT_MODEL;
    badge.classList.add('on');
  } else {
    badge.textContent = '未配置';
    badge.classList.remove('on');
  }
}

/* ---------- 流式请求 ---------- */
function buildConversation() {
  return messages
    .filter((m) => m.content)
    .map((m) => ({
      role: m.role,
      content: [
        {
          type: m.role === 'user' ? 'input_text' : 'output_text',
          text: m.content,
        },
      ],
    }));
}

async function readError(res) {
  let message = 'HTTP ' + res.status;
  try {
    const data = await res.json();
    message = data.error && data.error.message ? data.error.message : message;
  } catch (e) { /* ignore */ }
  return new Error(message);
}

async function streamResponse(conversation, onDelta) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + settings.apiKey,
    },
    body: JSON.stringify({
      model: settings.model || DEFAULT_MODEL,
      instructions: settings.systemPrompt || undefined,
      input: conversation,
      stream: true,
    }),
    signal: abortCtrl.signal,
  });
  if (!res.ok) throw await readError(res);
  if (!res.body) throw new Error('当前环境不支持流式读取');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let evt;
        try { evt = JSON.parse(payload); } catch (e) { continue; }
        if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
          onDelta(evt.delta);
        } else if (evt.type === 'response.failed') {
          const msg = (evt.error && evt.error.message) ||
            (evt.response && evt.response.error && evt.response.error.message) ||
            '请求失败';
          throw new Error(msg);
        } else if (evt.type === 'error') {
          const msg = (evt.error && evt.error.message) || '请求出错';
          throw new Error(msg);
        }
      }
    }
  }
}

function onDelta(delta) {
  streamText += delta;
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    if (streamEl) {
      const md = streamEl.querySelector('.md');
      if (md) md.innerHTML = renderMarkdown(streamText);
    }
    autoScroll(false);
  });
}

function setGenerating(on) {
  generating = on;
  $('sendBtn').classList.toggle('hidden', on);
  $('stopBtn').classList.toggle('hidden', !on);
  $('input').disabled = on;
}

async function send() {
  if (generating) return;
  const text = $('input').value.trim();
  if (!text) return;
  if (!settings.apiKey) {
    openSettings();
    toast('请先填写 API Key');
    return;
  }

  messages.push({ role: 'user', content: text });
  $('input').value = '';
  autoResize();
  updateEmptyState();
  appendMessageEl(messages[messages.length - 1]);

  const idx = messages.length;
  messages.push({ role: 'assistant', content: '' });
  streamEl = appendMessageEl(messages[idx], true);
  streamText = '';
  abortCtrl = new AbortController();
  setGenerating(true);

  const conversation = buildConversation();
  try {
    await streamResponse(conversation, onDelta);
    messages[idx].content = streamText || '(空回复)';
  } catch (err) {
    if (err.name === 'AbortError') {
      messages[idx].content = streamText || '(已停止)';
    } else {
      messages[idx].content = '⚠️ ' + (err.message || '请求失败');
    }
  } finally {
    streamEl = null;
    setGenerating(false);
    if (messages[idx]) {
      const el = $('messages').lastElementChild;
      if (el) {
        const md = el.querySelector('.md');
        if (md) md.innerHTML = renderMarkdown(messages[idx].content);
      }
    }
    saveState();
    updateEmptyState();
    autoScroll(true);
    toast(messages[idx].content.startsWith('⚠️') ? '请求出错' : '回复完成');
  }
}

function stop() {
  if (abortCtrl) abortCtrl.abort();
}

/* ---------- 输入框 ---------- */
function autoResize() {
  const ta = $('input');
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
}

/* ---------- 设置 ---------- */
function renderModelChips() {
  const wrap = $('modelChips');
  wrap.innerHTML = '';
  MODEL_SUGGESTIONS.forEach((m) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (m === settings.model ? ' active' : '');
    chip.textContent = m;
    chip.addEventListener('click', () => {
      $('model').value = m;
      syncChips(m);
    });
    wrap.appendChild(chip);
  });

  const dl = $('modelOptions');
  dl.innerHTML = '';
  MODEL_SUGGESTIONS.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m;
    dl.appendChild(opt);
  });
}

function syncChips(active) {
  const chips = $('modelChips').querySelectorAll('.chip');
  chips.forEach((c) => c.classList.toggle('active', c.textContent === active));
}

function openSettings() {
  $('apiKey').value = settings.apiKey;
  $('model').value = settings.model;
  $('systemPrompt').value = settings.systemPrompt;
  syncChips(settings.model);
  $('testResult').classList.add('hidden');
  $('settings').classList.remove('hidden');
  refreshIcons();
  setTimeout(() => $('apiKey').focus(), 120);
}

function closeSettings() {
  $('settings').classList.add('hidden');
}

function saveSettings() {
  settings.apiKey = $('apiKey').value.trim();
  settings.model = ($('model').value.trim() || DEFAULT_MODEL);
  settings.systemPrompt = $('systemPrompt').value.trim();
  saveState();
  updateBadge();
  closeSettings();
  toast('已保存');
}

async function testConnection() {
  const btn = $('testBtn');
  const result = $('testResult');
  const apiKey = $('apiKey').value.trim();
  const model = $('model').value.trim() || DEFAULT_MODEL;
  if (!apiKey) {
    showTest('err', '请先填写 API Key');
    return;
  }
  btn.disabled = true;
  showTest('ok', '正在连接…');
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        input: 'ping',
        max_output_tokens: 8,
        stream: false,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data && data.error && data.error.message) || 'HTTP ' + res.status;
      showTest('err', '连接失败：' + msg);
    } else {
      const reply = (data && data.output_text) || '';
      showTest('ok', '连接成功，模型可正常响应' + (reply ? '：「' + reply.trim() + '」' : ''));
    }
  } catch (err) {
    showTest('err', '连接失败：' + (err.message || err));
  } finally {
    btn.disabled = false;
  }
}

function showTest(kind, text) {
  const result = $('testResult');
  result.textContent = text;
  result.className = 'test-result ' + kind;
}

/* ---------- 其它 ---------- */
function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(() => toast('已复制')).catch(() => fallbackCopy(t));
  } else {
    fallbackCopy(t);
  }
}

function fallbackCopy(t) {
  const ta = document.createElement('textarea');
  ta.value = t;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast('已复制');
  } catch (e) {
    toast('复制失败');
  }
  ta.remove();
}

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function clearChat() {
  if (!messages.length) return;
  messages = [];
  $('messages').innerHTML = '';
  saveState();
  updateEmptyState();
  toast('对话已清空');
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  $('sendBtn').addEventListener('click', send);
  $('stopBtn').addEventListener('click', stop);
  $('settingsBtn').addEventListener('click', openSettings);
  $('closeSettings').addEventListener('click', closeSettings);
  $('modalBackdrop').addEventListener('click', closeSettings);
  $('saveBtn').addEventListener('click', saveSettings);
  $('testBtn').addEventListener('click', testConnection);
  $('clearBtn').addEventListener('click', clearChat);

  $('toggleKey').addEventListener('click', () => {
    const input = $('apiKey');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    $('toggleKey').dataset.lucide = show ? 'eye-off' : 'eye';
    refreshIcons();
  });

  const input = $('input');
  input.addEventListener('input', autoResize);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  $('model').addEventListener('input', () => syncChips($('model').value));
}

/* ---------- 初始化 ---------- */
function init() {
  loadState();
  renderModelChips();
  bindEvents();
  updateBadge();
  updateEmptyState();
  refreshIcons();
  autoResize();
  if (messages.length) {
    $('messages').innerHTML = '';
    messages.forEach((m) => appendMessageEl(m));
  }
  // 防止安卓返回键直接退出
  if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
    document.addEventListener('backbutton', (e) => {
      e.preventDefault();
      if (!$('settings').classList.contains('hidden')) {
        closeSettings();
      } else {
        Capacitor.Plugins.App.minimizeApp();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
