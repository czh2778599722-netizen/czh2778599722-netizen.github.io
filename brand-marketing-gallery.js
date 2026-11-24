const assets = '/brand/portfolio-2026/marketing-gallery/';
const revision = new URL(import.meta.url).search;
const originalTitle = '师资成果类-师资形象海报';
const screenBox = [257, 1079, 438, 890];

const posters = {
  'teacher-li': { title: '师资形象海报 · 李永平', width: 1080, height: 2738 },
  physics: { title: '高考前物理 · 高效冲刺快速提分', width: 941, height: 1672 },
  honors: { title: '业绩喜报 · 最强个人业绩 Top 1', width: 2100, height: 2970 },
  'teacher-sun': { title: '师资形象海报 · 孙世姣', width: 1080, height: 2193 },
  training: { title: '全能听说读写训练营', width: 750, height: 1451 },
  materials: { title: '名校期末必测卷 · 限量领取', width: 1080, height: 1920 },
  math: { title: '数学物理提升营 · 带你快速提分', width: 941, height: 1672 },
  english: { title: '高考前英语 · 高效冲刺快速提分', width: 944, height: 1680 },
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
    const reader = React.useRef(null);
    const focusReader = React.useRef(false);
    const previewId = React.useId();
    const id = selected === null ? null : cards[selected][0];
    const poster = posters[id];
    const tall = poster && poster.height * screenBox[2] > poster.width * screenBox[3];
    React.useEffect(() => () => { selection.current++; }, []);
    React.useLayoutEffect(() => {
      if (focusReader.current && tall) reader.current.focus({ preventScroll: true });
      focusReader.current = false;
    }, [selected, tall]);

    async function show(index, keyboard) {
      const request = ++selection.current;
      const [id] = cards[index];
      setFailed(false);
      try {
        await Promise.all([loadArtwork(id + '.webp'), loadArtwork('foreground.webp')]);
        if (selection.current === request) {
          if (selected === index && tall && keyboard) reader.current.focus({ preventScroll: true });
          focusReader.current = keyboard;
          setSelected(index);
        }
      } catch {
        if (selection.current === request) setFailed(true);
      }
    }

    return h('section', { className: 'marketing-gallery', 'aria-label': '海报设计模板展示' },
      h('img', { className: 'brand-case-artwork', src, alt, width: 1920, height: 2341, loading: 'lazy', decoding: 'async' }),
      h('div', { id: previewId, 'data-current': selected, className: 'marketing-preview', 'aria-live': 'polite', 'aria-atomic': true },
        poster ? h(React.Fragment, null,
          h('div', {
            key: selected, ref: reader, className: 'marketing-screen', style: bounds(screenBox),
            'data-scrollable': tall || undefined, tabIndex: tall ? 0 : undefined, role: tall ? 'region' : undefined,
            'aria-label': tall ? poster.title + '，上下滚动阅读完整海报' : undefined,
          }, h('div', { className: 'marketing-sheet' },
            h('img', { src: assets + id + '.webp' + revision, width: poster.width, height: poster.height, alt: '', draggable: false }))),
          h('img', { className: 'marketing-foreground', style: bounds(screenBox), src: assets + 'foreground.webp' + revision, alt: '', draggable: false }),
          h('div', { className: 'marketing-caption', style: bounds([51, 938, 860, 96]) }, poster.title),
        ) : h('span', { className: 'brand-case-title' }, originalTitle),
      ),
      failed && h('div', { className: 'marketing-load-status', role: 'status', style: bounds([50, 1020, 850, 38]) }, '海报未能载入，请再点一次'),
      ...cards.map(([key, box], index) => h('button', {
        key: index, type: 'button', className: 'marketing-card', style: bounds(box),
        'aria-label': '查看' + posters[key].title, 'aria-controls': previewId, 'aria-pressed': index === selected,
        onClick: event => show(index, event.detail === 0),
      })),
    );
  };
}
