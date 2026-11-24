const assets = '/brand/portfolio-2026/marketing-gallery/';
const revision = new URL(import.meta.url).search;
const originalTitle = '师资成果类-师资形象海报';

const posterTitles = {
  'teacher-li': '师资形象海报 · 李永平',
  physics: '高考前物理 · 高效冲刺快速提分',
  honors: '业绩喜报 · 最强个人业绩 Top 1',
  'teacher-sun': '师资形象海报 · 孙世姣',
  training: '全能听说读写训练营',
  materials: '名校期末必测卷 · 限量领取',
  math: '数学物理提升营 · 带你快速提分',
  english: '高考前英语 · 高效冲刺快速提分',
};

// Visible rectangles on the 1920 × 2341 board. The middle column repeats one Figma poster.
const cards = [
  ['teacher-li', [936, 741, 276, 330]], ['teacher-sun', [1257, 741, 277, 242]], ['materials', [1585, 741, 276, 430]],
  ['physics', [934, 1097, 279, 491]], ['training', [1257, 1005, 276, 535]], ['math', [1585, 1193, 276, 491]],
  ['honors', [936, 1609, 276, 391]], ['teacher-sun', [1260, 1563, 276, 436]], ['english', [1585, 1713, 276, 286]],
];

function bounds([x, y, width, height]) {
  return { left: x / 1920 * 100 + '%', top: y / 2341 * 100 + '%', width: width / 1920 * 100 + '%', height: height / 2341 * 100 + '%' };
}

const decoded = new Map();
function loadArtwork(file) {
  if (!decoded.has(file)) {
    const img = new Image();
    img.src = assets + file + revision;
    decoded.set(file, img.decode().catch(error => {
      decoded.delete(file);
      throw error;
    }));
  }
  return decoded.get(file);
}

export function createMarketingGallery(React) {
  const h = React.createElement;
  return function MarketingGallery({ src, alt }) {
    const [selected, setSelected] = React.useState(null);
    const [failed, setFailed] = React.useState(false);
    const selection = React.useRef(0);
    const previewId = React.useId();
    const id = selected === null ? null : cards[selected][0];
    const title = posterTitles[id];
    React.useEffect(() => () => { selection.current++; }, []);

    async function show(index) {
      const request = ++selection.current;
      const [id] = cards[index];
      setFailed(false);
      try {
        await Promise.all([loadArtwork(id + '.webp'), loadArtwork('foreground.webp')]);
        if (selection.current === request) setSelected(index);
      } catch {
        if (selection.current === request) setFailed(true);
      }
    }

    return h('section', { className: 'marketing-gallery', 'aria-label': '海报设计模板展示' },
      h('img', { className: 'brand-case-artwork', src, alt, width: 1920, height: 2341, loading: 'lazy', decoding: 'async' }),
      h('div', { id: previewId, 'data-current': selected, className: 'marketing-preview', 'aria-live': 'polite', 'aria-atomic': true },
        title ? h(React.Fragment, null,
          h('div', { className: 'marketing-screen', style: bounds([257, 1079, 438, 890]) },
            h('img', { src: assets + id + '.webp' + revision, alt: '', draggable: false })),
          h('img', { className: 'marketing-foreground', style: bounds([257, 1079, 438, 890]), src: assets + 'foreground.webp' + revision, alt: '', draggable: false }),
          h('div', { className: 'marketing-caption', style: bounds([51, 938, 860, 96]) }, title),
        ) : h('span', { className: 'brand-case-title' }, originalTitle),
      ),
      failed && h('div', { className: 'marketing-load-status', role: 'status', style: bounds([50, 1020, 850, 38]) }, '海报未能载入，请再点一次'),
      ...cards.map(([key, box], index) => h('button', {
        key: index, type: 'button', className: 'marketing-card', style: bounds(box),
        'aria-label': '查看' + posterTitles[key], 'aria-controls': previewId, 'aria-pressed': index === selected,
        onClick: () => show(index),
      })),
    );
  };
}
