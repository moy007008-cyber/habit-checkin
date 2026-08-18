'use strict';

const Charts = (() => {
  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function ring(pct, size, stroke, color) {
    const s = size || 120;
    const st = stroke || 12;
    const r = (s - st) / 2;
    const c = 2 * Math.PI * r;
    const value = clamp(pct, 0, 100);
    const offset = c * (1 - value / 100);
    return (
      '<svg class="ring" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" aria-hidden="true">' +
        '<circle class="ring-track" cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + r + '" stroke-width="' + st + '"></circle>' +
        '<circle class="ring-progress" cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + r + '" stroke="' + (color || '#43a047') + '" stroke-width="' + st + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" transform="rotate(-90 ' + (s / 2) + ' ' + (s / 2) + ')"></circle>' +
      '</svg>'
    );
  }

  function bars(data, opts) {
    const o = opts || {};
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
      '<div class="bar-chart">' +
        data.map((d) => (
          '<div class="bar-row">' +
            '<span class="bar-label">' + d.label + '</span>' +
            '<span class="bar-track"><span class="bar-fill" style="width:' + Math.round((d.value / max) * 100) + '%;background:' + (d.color || o.color || '#43a047') + '"></span></span>' +
            '<span class="bar-value">' + d.value + (o.suffix || '') + '</span>' +
          '</div>'
        )).join('') +
      '</div>'
    );
  }

  function heatColor(pct, hasRecord) {
    if (!hasRecord) return '#e9edf5';
    if (pct === 0) return '#ffe9a8';
    if (pct < 40) return '#ffd166';
    if (pct < 70) return '#a7e29a';
    if (pct < 100) return '#62cf8b';
    return '#2fa36b';
  }

  function heatText(pct, hasRecord) {
    if (!hasRecord) return '未开始';
    return pct + '%';
  }

  return { ring, bars, heatColor, heatText };
})();
