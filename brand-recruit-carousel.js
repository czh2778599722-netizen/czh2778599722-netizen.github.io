const art = '/brand/portfolio-2026/recruit-carousel/';
const initial = 2;
const posters = [
  { src: '/longform/open-day-beijing.webp', title: 'Open Day 报名开启', subtitle: 'Recruitment Open Day', tags: [['开放日招募', 'Campus Open Day'], ['报名开启', 'Register Now']] },
  { src: '/longform/summer-trainee.webp', title: '暑期培训生招募', subtitle: 'Summer Trainee Program', tags: [['暑期培训生', 'Summer Trainee'], ['实习转正', 'Internship to Full-time']] },
  { src: art + 'base-session.webp', title: '专场空宣', subtitle: 'Virtual Information Session', tags: [['校园招聘', 'Campus Recruitment'], ['基地专场空宣', 'Virtual Information Session']] },
  { src: art + 'spring-session.webp', title: '春招空中宣讲会', subtitle: 'Spring Recruitment Talk', tags: [['春季校招', 'Spring Recruitment'], ['空中宣讲会', 'Online Career Talk']] },
  { src: '/longform/2027-summer-internship.webp', title: '2027届暑期实习招募', subtitle: 'Summer Internship', tags: [['暑期实习', 'Summer Internship'], ['2027届招募', 'Class of 2027']] },
];

// Positions in Figma's 1920px-wide artboard. The interactive panel starts below the blue introduction.
const stage = { top: 745, height: 1252, width: 1920 };
const screen = { x: 740, y: 958, width: 440, height: 956 };
const slots = [
  [-368, 1156, 333], [104.5, 1156, 333], [505.5, 1056, 333],
  [960, screen.y, screen.width],
  [1414.5, 1056, 333], [1815.5, 1156, 333], [2288, 1156, 333],
];
const wrap = value => ((value % posters.length) + posters.length) % posters.length;
const percent = (value, total) => (100 * value / total) + '%';
function rect(x, y, w, h) {
  return { left: percent(x, stage.width), top: percent(y - stage.top, stage.height), width: percent(w, stage.width), height: percent(h, stage.height) };
}

function previewStyle(offset) {
  const point = Math.max(0, Math.min(slots.length - 1, offset + 3));
  const i = Math.min(slots.length - 2, Math.floor(point));
  const fraction = point - i;
  const [cx, y, w] = slots[i].map((from, axis) => from + (slots[i + 1][axis] - from) * fraction);
  const box = rect(cx - w / 2, y, w, stage.top + stage.height - y + 80);
  return { ...box, height: 'auto', maxHeight: box.height, opacity: 1 - .3 * Math.min(1, Math.max(0, Math.abs(offset) - 1)) };
}

async function preload(src) {
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
  } catch {
    image.src = src + '?reload=1';
    await image.decode();
  }
  return [src, image.src];
}

function retryPoster(event) {
  const img = event.currentTarget;
  const url = new URL(img.src);
  if (!url.searchParams.has('reload')) {
    url.searchParams.set('reload', '1');
    img.src = url.href;
  }
}

export function createRecruitCarousel(React) {
  const h = React.createElement;
  return function RecruitCarousel({ src, alt }) {
    const panel = React.useRef(null);
    const live = React.useRef(initial);
    const goal = React.useRef(initial);
    const frame = React.useRef(0);
    const drag = React.useRef(null);
    const hint = React.useRef(null);
    const [showHint, setShowHint] = React.useState(false);
    const focusReader = React.useRef(false);
    const suppressClick = React.useRef(false);
    const prepare = React.useRef(null);
    const [sources, setSources] = React.useState(null);
    const ready = Boolean(sources);
    const [position, setPosition] = React.useState(initial);
    const settled = Number.isInteger(position);
    const current = wrap(Math.round(position));
    const poster = posters[current];
    const source = file => sources?.[file] || file;

    React.useLayoutEffect(() => {
      if (settled && focusReader.current && document.activeElement === panel.current) {
        panel.current.querySelector('.recruit-screen-slide[data-active]')?.focus({ preventScroll: true });
      }
      if (settled) focusReader.current = false;
    }, [settled, current]);

    React.useEffect(() => {
      let mounted = true;
      let loading = false;
      function load() {
        if (!mounted || loading) return;
        loading = true;
        // The fixed art and initial screen are sufficient to start. Neighbouring posters load independently.
        Promise.all([art + 'board.webp', art + 'foreground.webp', posters[initial].src].map(preload))
          .then(entries => { if (mounted) setSources(Object.fromEntries(entries)); observer.disconnect(); })
          .catch(() => { loading = false; }); // The exported board stays visible if an asset fails.
      }
      prepare.current = load;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) load();
      }, { rootMargin: '650px 0px' });
      observer.observe(panel.current);
      return () => { mounted = false; prepare.current = null; observer.disconnect(); cancelAnimationFrame(frame.current); };
    }, []);

    React.useEffect(() => {
      if (!ready) return;
      let timeout;
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        setShowHint(true);
        observer.disconnect();
        timeout = setTimeout(() => setShowHint(false), 7500);
      }, { threshold: 1, rootMargin: '0px 0px -5% 0px' });
      observer.observe(hint.current);
      return () => { observer.disconnect(); clearTimeout(timeout); };
    }, [ready]);

    const draw = React.useCallback(value => {
      live.current = value;
      setPosition(value);
    }, []);
    const settle = React.useCallback(target => {
      setShowHint(false);
      cancelAnimationFrame(frame.current);
      goal.current = target;
      const from = live.current;
      if (Math.abs(target - from) < .001 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        draw(target);
        return;
      }
      const start = performance.now();
      const duration = Math.min(470, 190 + Math.abs(target - from) * 165);
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        draw(target + (from - target) * (1 - t) ** 3);
        if (t < 1) frame.current = requestAnimationFrame(tick);
      }
      frame.current = requestAnimationFrame(tick);
    }, [draw]);

    React.useEffect(() => {
      const el = panel.current;
      if (!ready) return;
      let last = 0, total = 0, used = false;
      function wheel(event) {
        if (event.ctrlKey || (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))) return;
        const delta = event.deltaX || event.deltaY;
        if (!delta) return;
        event.preventDefault();
        const now = performance.now();
        if (now - last > 200 || Math.sign(total) !== Math.sign(delta)) { total = 0; used = false; }
        total += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1);
        last = now;
        if (!used && Math.abs(total) > 28) { used = true; settle(goal.current + Math.sign(total)); }
      }
      el.addEventListener('wheel', wheel, { passive: false });
      return () => el.removeEventListener('wheel', wheel);
    }, [ready, settle]);

    function down(event) {
      if (!ready) { prepare.current?.(); return; }
      if (!event.isPrimary || event.button !== 0) return;
      suppressClick.current = false;
      drag.current = {
        id: event.pointerId, x: event.clientX, y: event.clientY, started: performance.now(), axis: null,
        reader: event.pointerType === 'mouse' ? event.target.closest('.recruit-screen-slide[data-active]') : null,
      };
    }
    function move(event) {
      const g = drag.current;
      if (!g || event.pointerId !== g.id) return;
      const dx = event.clientX - g.x, dy = event.clientY - g.y;
      if (!g.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          // Touch and trackpad reading use the native scroll container.
          if (!g.reader) { drag.current = null; return; }
          g.axis = 'vertical';
          g.startTop = g.reader.scrollTop;
        } else {
          g.axis = 'horizontal';
          cancelAnimationFrame(frame.current);
          g.from = live.current;
          g.startIndex = Math.round(g.from);
        }
        panel.current.setPointerCapture(event.pointerId);
        panel.current.dataset.dragging = 'true';
      }
      if (g.axis === 'vertical') {
        g.reader.scrollTop = g.startTop - dy;
        return;
      }
      const spacing = panel.current.clientWidth * .238;
      draw(g.from - Math.max(-1, Math.min(1, dx / spacing)));
    }
    function finish(event, cancelled = false) {
      const g = drag.current;
      if (!g || g.id !== event.pointerId) return;
      drag.current = null;
      delete panel.current.dataset.dragging;
      if (!g.axis) return;
      suppressClick.current = true;
      if (g.axis === 'vertical') return;
      const dx = event.clientX - g.x;
      const distance = Math.abs(dx);
      const flick = distance > 12 && distance / Math.max(1, performance.now() - g.started) > .4;
      const advance = !cancelled && (flick || distance >= Math.min(72, panel.current.clientWidth * .075));
      settle(g.startIndex - (advance ? Math.sign(dx) : 0));
    }

    const center = Math.floor(position);
    const screens = settled ? [center] : [center, center + 1];
    const items = Array.from({ length: 7 }, (_, i) => center + i - 3);
    return h('div', { className: 'recruit-board' },
      h('img', { className: 'brand-case-artwork', src: ready ? source(art + 'board.webp') : src, alt, width: 1920, height: 2341, decoding: 'async', loading: 'lazy' }),
      h('section', {
        ref: panel, className: 'recruit-carousel', 'aria-label': '公众号招聘长图展示', 'aria-roledescription': '轮播',
        'data-current': current, 'data-ready': ready || undefined, tabIndex: ready ? 0 : undefined,
        'aria-describedby': ready ? 'recruit-gesture-hint' : undefined,
        style: { top: percent(stage.top, 2341), height: percent(stage.height, 2341) },
        onPointerDown: down, onPointerMove: move, onPointerUp: e => finish(e), onPointerCancel: e => finish(e, true),
        onLostPointerCapture: e => { if (e.target === e.currentTarget) finish(e, true); },
        onPointerLeave: () => { if (!drag.current?.axis) drag.current = null; },
        onClickCapture: e => { if (suppressClick.current && e.detail) { suppressClick.current = false; e.stopPropagation(); } },
        onKeyDown: e => {
          if (!ready || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
          e.preventDefault();
          if (e.target.closest('.recruit-screen-slide')) {
            focusReader.current = true;
            panel.current.focus({ preventScroll: true });
          }
          settle(goal.current + (e.key === 'ArrowLeft' ? -1 : 1));
        },
      }, ready && h(React.Fragment, null,
        h('div', { className: 'recruit-preview-window', 'aria-hidden': true },
          ...items.map(slot => h('div', { key: slot, className: 'recruit-preview', style: previewStyle(slot - position) },
            h('img', { src: source(posters[wrap(slot)].src), onError: retryPoster, alt: '', draggable: false }))),
        ),
        h('div', { className: 'recruit-screen', style: rect(screen.x, screen.y, screen.width, screen.height) },
          ...screens.map(slot => h('div', {
            key: slot, className: 'recruit-screen-slide', role: 'region',
            'data-active': settled || undefined, tabIndex: settled ? 0 : -1, 'aria-hidden': !settled || undefined,
            'aria-label': posters[wrap(slot)].title + '，上下滚动阅读完整长图',
            onScroll: showHint ? () => setShowHint(false) : undefined,
            style: { transform: `translateX(${(slot - position) * 100}%)` },
          },
            h('img', { src: source(posters[wrap(slot)].src), onError: retryPoster, alt: '', draggable: false }))),
        ),
        h('img', { className: 'recruit-foreground', style: rect(90, 930, 1120, 1067), src: source(art + 'foreground.webp'), alt: '', draggable: false }),
        h('div', { className: 'recruit-heading', style: rect(600, 826, 720, 62), 'aria-hidden': true }, h('strong', null, poster.title), h('small', null, poster.subtitle)),
        h('div', { id: 'recruit-gesture-hint', ref: hint, className: 'recruit-gesture-hint', 'data-visible': showHint || undefined },
          h('span', null, h('b', { 'aria-hidden': true }, '↔'), '左右滑动换图'),
          h('span', null, h('b', { 'aria-hidden': true }, '↕'), '屏内上下滑动看全图')),
        ...poster.tags.map(([cn, en], i) => h('div', { key: i, className: 'recruit-tag recruit-tag-' + (i + 1), 'aria-hidden': true },
          h('strong', null, cn), h('small', null, en))),
        ...[-2, -1, 1, 2].map(offset => {
          const [cx, y, width] = slots[3 + offset];
          const left = Math.max(0, cx - width / 2);
          const right = Math.min(stage.width, cx + width / 2);
          return h('button', { key: offset, type: 'button', className: 'recruit-card-hit', tabIndex: -1,
            'aria-label': '查看' + posters[wrap(current + offset)].title, style: rect(left, y, right - left, stage.top + stage.height - y),
            onClick: () => settle(Math.round(live.current) + offset) });
        }),
        ...[-1, 1].map(step => h('button', { key: step, type: 'button', className: 'recruit-arrow', 'data-step': step,
          'aria-label': step < 0 ? '上一张长图' : '下一张长图',
          onClick: () => { suppressClick.current = false; settle(goal.current + step); } },
        h('span', { 'aria-hidden': true }, step < 0 ? '‹' : '›'))),
        h('span', { className: 'brand-case-title', 'aria-live': 'polite', 'aria-atomic': true }, `${current + 1} / ${posters.length}，${poster.title}，${poster.tags.map(([cn]) => cn).join('，')}`),
      )),
    );
  };
}
