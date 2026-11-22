const directory = '/brand/mascot/';
const turnDuration = 820;
const palettes = [
  ['#f5d658', '#51300f'], ['#efc38f', '#542c1c'],
  ['#80e8b0', '#214531'], ['#eab2d8', '#572941'],
  ['#ecb4b9', '#57233f'], ['#7ce8c8', '#244b38'],
  ['#cdc2ef', '#31294f'], ['#efca88', '#482f1c'],
];
const number = index => String(index + 1).padStart(2, '0');
const skinFile = index => directory + 'hero-skins/' + number(index) + '.webp';
const setFile = index => directory + (index === 0 ? 'stage.webp' : 'hero-sets/' + number(index) + '.webp');

// The original mascot crosses the same arc in landscape and on a phone.
const flight = Array.from({ length: 61 }, (_, step) => {
  const x = -0.22 + 1.46 * step / 60;
  const distance = x - 0.48;
  const y = 0.415 + distance ** 2 * (distance < 0 ? 3.13 : 2.89);
  return { transform: `translate(${x * 100}%, ${y * 100}%)` };
});

function preload(src) {
  const image = new Image();
  image.src = src;
  return image.decode();
}

export function createSkinHero(React, names) {
  const h = React.createElement;

  function SkinScene({ index, state }) {
    const [setColor, ink] = palettes[index];
    return h('div', {
      className: 'brand-hero-scene', 'data-state': state, 'aria-hidden': true,
      style: { '--set-color': setColor, '--ink': ink },
    },
      h('div', { className: 'brand-hero-set' },
        h('img', { className: 'brand-hero-scenery', src: setFile(index), alt: '' }),
        h('img', { className: 'brand-hero-title', src: directory + 'hero-title.webp', alt: '' }),
        h('div', { className: 'brand-hero-shadow' }),
        h('div', { className: 'brand-hero-model' },
          h('img', { className: 'brand-hero-figure', src: skinFile(index), alt: '', draggable: false }),
        ),
      ),
      h('div', { className: 'brand-hero-caption' },
        h('div', { className: 'brand-hero-count' }, number(index) + ' / ' + number(names.length - 1)),
        h('div', { className: 'brand-hero-name' }, ...Array.from(names[index], (letter, i) =>
          h('span', { key: i, style: { '--i': i } }, letter))),
      ),
    );
  }

  return function SkinHero({ detailPlaying }) {
    const stage = React.useRef(null);
    const traveler = React.useRef(null);
    const touch = React.useRef(null);
    const gesture = React.useRef({ last: 0, delta: 0, consumed: false });
    const [assets, setAssets] = React.useState(null);
    const [visible, setVisible] = React.useState(false);
    const [foreground, setForeground] = React.useState(!document.hidden);
    const [reduced, setReduced] = React.useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [paused, setPaused] = React.useState(false);
    const [flying, setFlying] = React.useState(false);
    const [scene, setScene] = React.useState({ index: -1, previous: null, direction: 1 });
    const { index, previous, direction } = scene;
    const inView = visible && foreground && !detailPlaying;

    React.useEffect(() => {
      let mounted = true;
      const preference = matchMedia('(prefers-reduced-motion: reduce)');
      const onPreference = () => setReduced(preference.matches);
      const onVisibility = () => setForeground(!document.hidden);
      preference.addEventListener('change', onPreference);
      document.addEventListener('visibilitychange', onVisibility);
      const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.32), { threshold: [0, 0.32] });
      observer.observe(stage.current);
      const opener = Promise.all(['stage.webp', 'hero-title.webp', 'character.webp'].map(file => preload(directory + file)));
      const skins = Promise.allSettled(names.map((_, i) => Promise.all([preload(skinFile(i)), preload(setFile(i))])));
      Promise.all([opener.then(() => true, () => false), skins]).then(([canFly, results]) => {
        const available = results.flatMap((result, i) => result.status === 'fulfilled' ? [i] : []);
        if (mounted && available.length) setAssets({ canFly, available });
      });
      return () => {
        mounted = false;
        observer.disconnect();
        preference.removeEventListener('change', onPreference);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }, []);

    React.useEffect(() => {
      if (!inView || !assets || index !== -1) return;
      const land = () => {
        setFlying(false);
        setScene({ index: assets.available[0], previous: null, direction: 1 });
      };
      if (reduced || !assets.canFly || !traveler.current?.animate) {
        land();
        return;
      }
      const animation = traveler.current.animate(flight, { duration: 1800, fill: 'both' });
      setFlying(true);
      animation.onfinish = land;
      return () => {
        animation.onfinish = null;
        animation.cancel();
        setFlying(false);
      };
    }, [assets, inView, index, reduced]);

    const move = React.useCallback((step, manual = true) => {
      if (!assets || assets.available.length < 2) return;
      if (manual) setPaused(true);
      setScene(current => {
        if (current.index < 0 || current.previous !== null) return current;
        const list = assets.available;
        const next = list[(list.indexOf(current.index) + step + list.length) % list.length];
        return { index: next, previous: reduced ? null : current.index, direction: step };
      });
    }, [assets, reduced]);

    React.useEffect(() => {
      if (previous === null) return;
      const settled = window.setTimeout(() => setScene(current => ({ ...current, previous: null })), reduced ? 0 : turnDuration);
      return () => clearTimeout(settled);
    }, [previous, reduced]);

    React.useEffect(() => {
      if (!inView || reduced || paused || index < 0 || previous !== null) return;
      const next = window.setTimeout(() => move(1, false), 2050);
      return () => clearTimeout(next);
    }, [inView, reduced, paused, index, previous, move]);

    React.useEffect(() => {
      const el = stage.current;
      if (!assets || index < 0) return;
      function onWheel(event) {
        if (event.ctrlKey || assets.available.length < 2) return;
        const box = el.getBoundingClientRect();
        const center = box.top + box.height / 2;
        if (center < innerHeight * 0.22 || center > innerHeight * 0.78) return;
        const pixels = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        const delta = pixels * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
        if (!delta) return;
        const burst = gesture.current;
        const now = performance.now();
        if (now - burst.last > 190 || Math.sign(delta) !== Math.sign(burst.delta)) {
          burst.delta = 0;
          burst.consumed = false;
        }
        burst.last = now;
        burst.delta += delta;
        const step = Math.sign(delta);
        const position = assets.available.indexOf(index);
        if (!burst.consumed && (position + step < 0 || position + step >= assets.available.length)) return;
        event.preventDefault();
        if (!burst.consumed && Math.abs(burst.delta) >= 34 && previous === null) {
          burst.consumed = true;
          move(step);
        }
      }
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, [assets, index, previous, move]);

    function endSwipe(event) {
      const start = touch.current;
      touch.current = null;
      if (!start || event.touches.length || !event.changedTouches.length) return;
      const finger = event.changedTouches[0];
      const dx = finger.clientX - start.x;
      const dy = finger.clientY - start.y;
      if (finger.identifier === start.id && Math.abs(dx) >= 32 && Math.abs(dx) > Math.abs(dy) * 1.35) move(dx < 0 ? 1 : -1);
    }

    const active = index >= 0;
    const canNavigate = active && assets.available.length > 1;
    return h('section', {
      ref: stage, className: 'brand-mascot-stage', 'aria-label': '领小麦大变身，八款皮肤', tabIndex: 0,
      'aria-roledescription': '轮播', 'data-skin': active ? index + 1 : undefined,
      'data-transitioning': previous !== null || undefined, 'data-direction': direction, 'data-visible': inView || undefined,
      style: { '--turn': turnDuration + 'ms' },
      onKeyDown: event => {
        if (!canNavigate || !['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
        event.preventDefault();
        if (!event.repeat) move(event.key === 'ArrowRight' ? 1 : -1);
      },
      onTouchStart: event => {
        const finger = event.touches[0];
        touch.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY, id: finger.identifier } : null;
      },
      onTouchEnd: endSwipe, onTouchCancel: () => { touch.current = null; },
    },
      !active && h('img', { className: 'brand-case-artwork', src: directory + 'hero.webp', width: 1920, height: 1097, alt: '领小麦大变身，黄色玩偶飞过金色游戏世界' }),
      !active && h('div', { className: 'brand-hero-opener', 'data-flying': flying || undefined, 'aria-hidden': true },
        h('div', { ref: traveler, className: 'brand-hero-traveler' }, h('img', { src: directory + 'character.webp', alt: '' })),
        h('img', { className: 'brand-hero-original-title', src: directory + 'hero-title.webp', alt: '' }),
      ),
      previous !== null && h(SkinScene, { key: previous, index: previous, state: 'leaving' }),
      active && h(SkinScene, { key: index, index, state: previous === null ? 'rest' : 'entering' }),
      active && h('span', { className: 'brand-case-title', 'aria-live': paused || reduced ? 'polite' : 'off', 'aria-atomic': true }, names[index] + '，' + (index + 1) + ' / ' + names.length),
      canNavigate && h('div', { className: 'brand-hero-controls' },
        !reduced && h('button', { type: 'button', 'aria-label': paused ? '继续自动切换' : '暂停自动切换', onClick: () => setPaused(value => !value) },
          h('span', { className: 'brand-hero-control-icon', 'data-icon': paused ? 'play' : 'pause', 'aria-hidden': true })),
        ...[-1, 1].map(step => h('button', { key: step, type: 'button', 'aria-label': step === 1 ? '下一款皮肤' : '上一款皮肤', onClick: () => move(step) },
          h('span', { className: 'brand-hero-control-icon', 'data-icon': step === 1 ? 'next' : 'prev', 'aria-hidden': true }))),
      ),
    );
  };
}
