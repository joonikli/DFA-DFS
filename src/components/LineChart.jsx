// Line / bar chart drawn as SVG at the container's real width (redrawn on resize).
// Hover snaps to the nearest point and shows value + change vs the previous point.
// Works inside zoomed containers (pointer maths converts screen px → local px).
import { useEffect, useRef } from 'react';
import { reducedMotion } from '../lib/store.js';

let chartSeq = 0;
const niceMax = (vals) => { const m = Math.max(...vals); return m <= 100 && m > 50 ? 100 : Math.ceil(m / 100) * 100; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function LineChart({ labels, values, max, unit = 'hours', type = 'line', animate = true, className = 'chart', id }) {
  const ref = useRef(null);
  const animatedOnce = useRef(false);

  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const draw = (anim) => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W) return;
      const padL = 44, padR = 16, padT = 10, padB = 30;
      const maxV = max || niceMax(values);
      const n = labels.length;
      const iw = W - padL - padR, ih = H - padT - padB;
      const x = (i) => padL + (n === 1 ? iw / 2 : (type === 'bar' ? (i + 0.5) * iw / n : i * iw / (n - 1)));
      const y = (v) => padT + (1 - v / maxV) * ih;
      const ticks = [0, 1, 2, 3].map((k) => Math.round((maxV * k) / 3));
      const gid = `g${++chartSeq}`;
      const pts = values.map((v, i) => [x(i), y(v)]);
      const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
      const area = `${line}L${pts[n - 1][0]},${y(0)}L${pts[0][0]},${y(0)}Z`;
      const bw = Math.min(56, (iw / n) * 0.6);
      el.innerHTML = `
        <svg width="${W}" height="${H}" role="img" aria-label="${esc(unit)} by period">
          <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6078f1" stop-opacity=".32"/><stop offset="1" stop-color="#6078f1" stop-opacity=".02"/></linearGradient></defs>
          ${ticks.map((t) => `<line class="gridline" x1="${padL + 10}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${padL - 14}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
          ${labels.map((l, i) => `<text class="axis x" x="${x(i)}" y="${H - 6}" text-anchor="${type === 'bar' || (i && i < n - 1) ? 'middle' : i ? 'end' : 'start'}">${esc(l)}</text>`).join('')}
          ${type === 'bar'
            ? values.map((v, i) => `<rect x="${x(i) - bw / 2}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" rx="2" fill="#6078f1" style="transform-origin:${x(i)}px ${y(0)}px;${anim ? `animation:barGrow 500ms var(--ease-out) ${i * 30}ms both` : ''}"/>`).join('')
            : `<path class="area ${anim ? 'draw' : ''}" d="${area}" fill="url(#${gid})"/><path class="line ${anim ? 'draw' : ''}" d="${line}"/>`}
          <line class="guide" x1="0" x2="0" y1="${padT}" y2="${y(0)}"/>
          ${type === 'bar' ? '' : pts.map((p, i) => `<circle class="dot" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="4.5"/>`).join('')}
        </svg>
        <div class="chart-tip"></div>`;
      const svg = el.querySelector('svg');
      const ln = el.querySelector('.line.draw');
      if (ln) ln.style.setProperty('--len', ln.getTotalLength());
      const tip = el.querySelector('.chart-tip');
      const guide = el.querySelector('.guide');
      let cur = -1;
      svg.addEventListener('pointermove', (e) => {
        const sb = svg.getBoundingClientRect();
        const rx = (e.clientX - sb.left) * (W / sb.width);
        let best = 0;
        pts.forEach((p, i) => { if (Math.abs(p[0] - rx) < Math.abs(pts[best][0] - rx)) best = i; });
        if (best === cur) return;
        cur = best;
        el.querySelectorAll('.dot').forEach((d) => d.classList.toggle('on', +d.dataset.i === best));
        guide.setAttribute('x1', pts[best][0]); guide.setAttribute('x2', pts[best][0]);
        guide.classList.add('on');
        const prev = values[best - 1];
        const delta = prev ? Math.round(((values[best] - prev) / prev) * 100) : null;
        tip.innerHTML = `<div class="m">${esc(labels[best])}</div><b>${values[best]}</b>${esc(unit)}${delta !== null ? `<div class="trend ${delta < 0 ? 'down' : ''}" style="font-size:11px">${delta >= 0 ? '+' : ''}${delta}% vs ${esc(labels[best - 1])}</div>` : ''}`;
        tip.style.left = `${pts[best][0]}px`;
        tip.style.top = `${pts[best][1]}px`;
        tip.classList.add('on');
      });
      svg.addEventListener('pointerleave', () => {
        cur = -1; tip.classList.remove('on'); guide.classList.remove('on');
        el.querySelectorAll('.dot.on').forEach((d) => d.classList.remove('on'));
      });
    };
    draw(animate && !animatedOnce.current && !reducedMotion());
    animatedOnce.current = true;
    let lastW = el.clientWidth;
    const ro = new ResizeObserver(() => { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(false); } });
    ro.observe(el);
    return () => ro.disconnect();
  }, [labels.join('|'), values.join('|'), max, unit, type]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className={className} ref={ref} id={id} />;
}
