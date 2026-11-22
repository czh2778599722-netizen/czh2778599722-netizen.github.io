import { studySkins } from './brand-skins-study.js';
import { natureSkins } from './brand-skins-nature.js';
import { readingSkins } from './brand-skins-reading.js';
import { lawSkin } from './brand-skins-law.js';

const artDirectory = '/brand/mascot/skins/';
const cardWidth = 404;
const cardHeight = 474;
const cardColumns = [116, 544, 972, 1400];
const galleryWidth = 1920;
const galleryHeight = 1344;
const motions = { ...studySkins, ...natureSkins, ...readingSkins, 8: lawSkin };
const cards = [
  ['探险麦', '看指南针', 1800],
  ['化学麦', '摇出气泡', 1600],
  ['历史麦', '展开卷轴', 2000],
  ['自然麦', '让蝴蝶落在叶子上', 2400],
  ['数学麦', '用三角尺画直角', 1800],
  ['灵感麦', '点亮灯泡', 1600],
  ['国学麦', '翻一页《论语》', 1800],
  ['法治麦', '举起宪法宣读', 2000],
];

export const skinNames = cards.map(([name]) => name);

function readImage(file) {
  const image = new Image();
  image.src = artDirectory + file;
  return image.decode().then(() => image);
}

async function prepareCard(number, canvas) {
  const design = motions[number];
  const prefix = String(number).padStart(2, '0');
  const [original, base] = await Promise.all([readImage(prefix + '.webp'), readImage(prefix + '-base.webp')]);
  const sprites = new Map(await Promise.all(design.layers.map(async layer => {
    if (layer.file) return [layer.name, { ...layer, image: await readImage(layer.file) }];
    const image = document.createElement('canvas');
    image.width = cardWidth;
    image.height = cardHeight;
    const mask = image.getContext('2d');
    mask.clip(new Path2D(layer.path), 'evenodd');
    mask.drawImage(original, 0, 0);
    return [layer.name, { image }];
  })));
  const ctx = canvas.getContext('2d');
  const painter = {
    ctx,
    image(name) { return sprites.get(name).image; },
    layer(name, { x = 0, y = 0, ox = 0, oy = 0, rotate = 0, sx = 1, sy = 1, alpha = 1 } = {}) {
      const sprite = sprites.get(name);
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(x + ox, y + oy);
      ctx.rotate(rotate * Math.PI / 180);
      ctx.scale(sx, sy);
      ctx.translate(-ox, -oy);
      ctx.drawImage(sprite.image, sprite.x || 0, sprite.y || 0);
      ctx.restore();
    },
  };
  return progress => {
    ctx.clearRect(0, 0, cardWidth, cardHeight);
    ctx.drawImage(base, 0, 0);
    ctx.save();
    design.draw(painter, progress);
    ctx.restore();
    // Blend from and back into the exact original pixels at either end.
    const edge = Math.min(1, progress / 0.065, (1 - progress) / 0.065);
    if (edge < 1) {
      ctx.globalAlpha = 1 - edge * edge * (3 - 2 * edge);
      ctx.drawImage(original, 0, 0);
      ctx.globalAlpha = 1;
    }
  };
}

export function createSkinGallery(React) {
  const h = React.createElement;

  function SkinCard({ index, activeCard, onPlayStateChange }) {
    const button = React.useRef(null);
    const canvas = React.useRef(null);
    const prepared = React.useRef(null);
    const playing = React.useRef(null);
    const frame = React.useRef(0);
    const pointer = React.useRef('');
    const [name, action, duration] = cards[index];
    const prepare = React.useCallback(() => {
      if (!prepared.current) {
        prepared.current = prepareCard(index + 1, canvas.current).catch(error => {
          prepared.current = null;
          throw error;
        });
      }
      return prepared.current;
    }, [index]);

    React.useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          prepare().catch(() => {}); // A later interaction retries failed downloads.
        }
      }, { rootMargin: '240px' });
      observer.observe(button.current);
      return () => {
        observer.disconnect();
        playing.current?.();
      };
    }, [prepare]);

    async function play() {
      if (playing.current) return;
      const stop = () => {
        cancelAnimationFrame(frame.current);
        if (button.current) delete button.current.dataset.playing;
        playing.current = null;
        if (activeCard.current === stop) {
          activeCard.current = null;
          onPlayStateChange(false);
        }
      };
      activeCard.current?.();
      activeCard.current = stop;
      playing.current = stop;
      onPlayStateChange(true);
      try {
        const draw = await prepare();
        if (!button.current || playing.current !== stop) return;
        draw(0);
        button.current.dataset.playing = 'true';
        const start = performance.now();
        function tick(now) {
          const progress = Math.min(1, Math.max(0, (now - start) / duration));
          draw(progress);
          if (progress < 1) {
            frame.current = requestAnimationFrame(tick);
          } else {
            stop();
          }
        }
        frame.current = requestAnimationFrame(tick);
      } catch {
        if (playing.current === stop) stop();
      }
    }

    return h('button', {
      ref: button, type: 'button', className: 'brand-skin-card',
      'aria-label': name + '，' + action,
      style: {
        left: (cardColumns[index % 4] / galleryWidth * 100) + '%',
        top: ((index < 4 ? 262 : 758) / galleryHeight * 100) + '%',
        width: (cardWidth / galleryWidth * 100) + '%',
        height: (cardHeight / galleryHeight * 100) + '%',
      },
      onPointerEnter: event => { if (event.pointerType === 'mouse') play(); },
      onPointerDown: event => { pointer.current = event.pointerType; },
      onClick: event => { if (!event.detail || pointer.current !== 'mouse') play(); },
    }, h('canvas', { ref: canvas, width: cardWidth, height: cardHeight, 'aria-hidden': true }));
  }

  return function SkinGallery({ onPlayStateChange }) {
    const activeCard = React.useRef(null);
    return h('section', { className: 'brand-skin-gallery', 'aria-label': '麦皮肤，八款领小麦互动卡片' },
      h('img', { className: 'brand-case-artwork', src: '/brand/mascot/skins.webp', alt: '', width: galleryWidth, height: galleryHeight, loading: 'lazy' }),
      ...cards.map(([name], index) => h(SkinCard, { key: name, index, activeCard, onPlayStateChange })),
    );
  };
}
