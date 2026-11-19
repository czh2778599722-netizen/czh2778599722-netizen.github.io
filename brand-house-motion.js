import { playHouseSnap, stopHouseSound, unlockHouseSound } from './brand-house-sound.js';

const frameWidth = 939;
// The atlas includes space above the resting house for the far roof's rotation.
const frameHeight = 690;
const framesPerSecond = 24;
const firstContact = 18;
const secondContact = 31;
const sheetFiles = ['house-assembly-1.webp', 'house-assembly-2.webp'];
const release = new URL(import.meta.url).search;

export function createHouseAssembly({ createElement: h, useEffect, useRef, useState }) {
  return function HouseAssembly({ product, style, children }) {
    const element = useRef(null);
    const canvas = useRef(null);
    const sheets = useRef(null);
    const active = useRef(null);
    const [phase, setPhase] = useState('idle');

    function loadSheets() {
      if (!sheets.current) {
        sheets.current = Promise.all(sheetFiles.map(async (file) => {
          const image = new Image();
          image.src = `/brand/${file}${release}`;
          await image.decode();
          return image;
        })).catch((error) => {
          sheets.current = null;
          throw error;
        });
      }
      return sheets.current;
    }

    function cancel() {
      if (!active.current) return;
      cancelAnimationFrame(active.current.request);
      active.current = null;
      stopHouseSound();
      setPhase('idle');
    }

    useEffect(() => {
      function onVisibilityChange() {
        if (document.hidden) cancel();
      }
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadSheets().catch(() => {});
        } else {
          cancel();
        }
      }, { rootMargin: '160px' });
      observer.observe(element.current);
      document.addEventListener('visibilitychange', onVisibilityChange);
      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        if (active.current) cancelAnimationFrame(active.current.request);
        active.current = null;
        stopHouseSound();
      };
    }, []);

    async function play(mode) {
      const run = { mode, request: 0, finished: false };
      active.current = run;
      setPhase('loading');
      try {
        const images = await loadSheets();
        if (active.current !== run || document.hidden) return;
        const context = canvas.current.getContext('2d');
        if (!context) {
          cancel();
          return;
        }

        function draw(frame) {
          const column = frame % 4;
          const row = Math.floor(frame / 4) % 4;
          context.clearRect(0, 0, frameWidth, frameHeight);
          context.drawImage(images[Math.floor(frame / 16)], column * frameWidth, row * frameHeight,
            frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        }

        draw(0);
        setPhase('playing');
        let previous = 0;
        let started = performance.now();
        function advance(now) {
          if (active.current !== run) return;
          let frame = Math.min(secondContact, Math.floor((now - started) * framesPerSecond / 1000));
          // Even on a slow display, present each roof's contact frame with its own sound.
          if (previous < firstContact && frame > firstContact) {
            frame = firstContact;
            started = now - frame * 1000 / framesPerSecond;
          }
          if (frame > previous) {
            draw(frame);
            if (frame === firstContact) playHouseSnap('left');
            if (frame === secondContact) playHouseSnap('top');
            previous = frame;
          }
          if (frame === secondContact) {
            run.finished = true;
            setPhase('closed');
          } else {
            run.request = requestAnimationFrame(advance);
          }
        }
        run.request = requestAnimationFrame(advance);
      } catch {
        if (active.current === run) cancel();
      }
    }

    const showAnimation = phase === 'playing' || phase === 'closed';
    return h('div', { ref: element, className: 'brand-product brand-house', style, 'data-effect': 'house',
      'data-playing': phase === 'playing', 'data-phase': phase },
      h('div', { className: 'brand-house__still', hidden: showAnimation, 'aria-hidden': true }, children),
      h('canvas', { ref: canvas, width: frameWidth, height: frameHeight, hidden: !showAnimation,
        className: 'brand-house__animation', 'aria-hidden': true }),
      h('button', {
        type: 'button', className: 'brand-product__trigger',
        style: phase === 'playing' ? { top: 'auto', height: 'auto', aspectRatio: `${frameWidth} / ${frameHeight}` } : undefined,
        'aria-label': `播放${product.label}动效`,
        'aria-pressed': phase === 'playing' || phase === 'loading',
        onPointerEnter: (event) => {
          if (!active.current && event.pointerType === 'mouse' &&
              window.matchMedia('(any-hover: hover) and (prefers-reduced-motion: no-preference)').matches) play('hover');
        },
        onPointerLeave: (event) => {
          if (event.pointerType === 'mouse' && active.current?.mode === 'hover') cancel();
        },
        onClick: () => {
          unlockHouseSound();
          const run = active.current;
          if (!run || run.finished) play('button');
          else if (run.mode === 'hover') run.mode = 'button';
          else cancel();
        },
      }),
    );
  };
}
