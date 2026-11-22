import { createSkinGallery } from './brand-skin-gallery.js';

const directory = '/brand/mascot/';
const flightDuration = 2600;

// The path uses stage coordinates so the same arc fits every screen size.
const flight = Array.from({ length: 61 }, (_, index) => {
  const progress = index / 60;
  const x = -0.22 + 1.46 * progress;
  const distance = x - 0.48;
  const y = 0.415 + distance ** 2 * (distance < 0 ? 3.13 : 2.89);
  return { transform: `translate(${x * 100}%, ${y * 100}%)` };
});

export function createMascotCase(React) {
  const h = React.createElement;
  const SkinGallery = createSkinGallery(React);

  function artwork(file, alt, height, eager = false) {
    return h('img', {
      className: 'brand-case-artwork',
      src: directory + file,
      alt,
      width: 1920,
      height,
      loading: eager ? 'eager' : 'lazy',
      decoding: 'async',
    });
  }

  function FlightStage() {
    const stage = React.useRef(null);
    const traveler = React.useRef(null);
    const motion = React.useRef(null);
    const [ready, setReady] = React.useState(false);
    const [played, setPlayed] = React.useState(false);
    const play = React.useCallback(() => {
      motion.current?.cancel();
      motion.current = traveler.current.animate(flight, {
        duration: flightDuration,
        fill: 'forwards',
      });
      setPlayed(true);
    }, []);

    React.useEffect(() => {
      let mounted = true;
      const layers = stage.current.querySelectorAll('[data-flight-layer]');
      if (typeof traveler.current.animate === 'function') {
        Promise.all(Array.from(layers, image => image.decode()))
          .then(() => { if (mounted) setReady(true); })
          .catch(() => {}); // Keep the original poster if a layer fails to load.
      }
      return () => {
        mounted = false;
        motion.current?.cancel();
      };
    }, []);

    React.useEffect(() => {
      if (!ready || played || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.intersectionRatio >= 0.35)) {
          observer.disconnect();
          play();
        }
      }, { threshold: 0.35 });
      observer.observe(stage.current);
      return () => observer.disconnect();
    }, [ready, played, play]);

    return h('section', {
      ref: stage, className: 'brand-mascot-stage', 'aria-label': '领小麦大变身',
      'data-playing-artwork': played || undefined,
    },
      artwork('hero.webp', '领小麦大变身，黄色玩偶飞过金色游戏世界', 1097, true),
      h('div', { className: 'brand-mascot-layers', 'aria-hidden': true },
        h('img', { className: 'brand-mascot-backdrop', src: directory + 'stage.webp', alt: '', 'data-flight-layer': true }),
        h('div', { ref: traveler, className: 'brand-mascot-traveler' },
          h('img', { className: 'brand-mascot-character', src: directory + 'character.webp', alt: '', 'data-flight-layer': true }),
        ),
        h('img', { className: 'brand-mascot-lettering', src: directory + 'hero-title.webp', alt: '', 'data-flight-layer': true }),
      ),
      ready && h('button', {
        type: 'button', className: 'brand-mascot-play', onClick: play,
        'aria-label': played ? '重播领小麦飞行动画' : '播放领小麦飞行动画',
      }, played ? '↻ 重播' : '▷ 播放'),
    );
  }

  return function MascotCase() {
    return h('article', { className: 'brand-case brand-mascot-case', 'aria-labelledby': 'mascot-case-title' },
      h('h1', { id: 'mascot-case-title', className: 'brand-case-title' }, 'IP一致性延展'),
      artwork('header.webp', 'IP一致性延展', 429, true),
      artwork('intro.webp', '领小麦系列角色合影', 1066, true),
      h(FlightStage),
      h(SkinGallery),
      artwork('scenes.webp', '场景海报，领小麦在实验室、课堂、广场和森林的四种演绎', 3207),
    );
  };
}
