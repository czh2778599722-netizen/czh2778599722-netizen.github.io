import { createMobileAbout } from './brand-mobile-about.js';

const art = '/brand/portfolio-2026/';
const release = new URL(import.meta.url).search;
const email = 'caozihui2021@163.com';
const sections = [['home', '封面'], ['about', '简介'], ['collection', '作品目录'], ['contact', '封底']];
const phoneLayout = '(max-width: 767px), (orientation: landscape) and (pointer: coarse) and (max-width: 960px) and (max-height: 540px)';
const directoryCards = [
  { name: '品牌设计', rect: [0, 0, 812, 742] },
  { name: '运营设计', rect: [812, 0, 1108, 536] },
  { name: 'AIGC探索 · 领小麦 IP一致性延展', rect: [812, 536, 622, 544] },
  { name: '其他设计', rect: [1434, 536, 486, 544] },
];

// Coordinates are in the same 1920 × 1080 space as the Figma artboards.
function bounds([x, y, width, height]) {
  return { left: x / 1920 * 100 + '%', top: y / 1080 * 100 + '%', width: width / 1920 * 100 + '%', height: height / 1080 * 100 + '%' };
}

export function createPortfolioBook(React, projects, ProjectViewer, unlockHouseSound) {
  const h = React.createElement;
  const MobileAbout = createMobileAbout(React);

  function BookBoard({ file, alt, children }) {
    const [ready, setReady] = React.useState(false);
    const [useOriginal, setUseOriginal] = React.useState(false);
    const mobileFile = file + '-mobile.webp';
    return h('div', { className: 'portfolio-book-board', 'data-ready': ready || undefined },
      h('picture', null,
        !useOriginal && h('source', { media: phoneLayout, srcSet: art + mobileFile + release }),
        h('img', {
          className: 'portfolio-book-art', src: art + file + '.webp' + release,
          width: 1920, height: 1080, alt, decoding: 'async', fetchPriority: file === 'cover' ? 'high' : undefined,
          onLoad: () => setReady(true),
          onError: e => {
            setReady(false);
            if (e.currentTarget.currentSrc.includes(mobileFile)) setUseOriginal(true);
          },
        }),
      ),
      children(ready),
    );
  }

  function contactLink(rect, href, label) {
    return h('a', { className: 'portfolio-book-hotspot portfolio-book-contact', style: bounds(rect), href, 'aria-label': label });
  }

  return function PortfolioBook() {
    const [selected, select] = React.useState(null);
    const close = React.useCallback(() => select(null), []);

    React.useEffect(() => {
      // The browser can resolve an incoming fragment before React mounts its target.
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: 'instant' });
    }, []);

    return h(React.Fragment, null,
      h('div', { className: 'portfolio-book' },
        h('nav', { className: 'portfolio-book-nav', 'aria-label': '作品集导航' },
          sections.map(([id, label]) => h('a', { key: id, href: '#' + id }, label)),
          h('a', { className: 'portfolio-book-contact-nav', href: '#contact' }, '联系我'),
        ),
        h('main', { className: 'portfolio-book-pages' },
          h('section', { id: 'home', className: 'portfolio-book-page', 'aria-labelledby': 'book-title' },
            h(BookBoard, { file: 'cover', alt: '2026 设计作品集封面，霓虹灯照亮桌上的复古电脑和彩色公仔' },
              ready => h('h1', { id: 'book-title', className: ready ? 'brand-case-title' : 'book-cover-title' }, '曹子慧 · 2026 设计作品集')),
            h('a', { className: 'portfolio-book-browse', href: '#collection' }, '查看作品目录', h('span', { 'aria-hidden': true }, '↓')),
          ),
          h('section', { id: 'about', className: 'portfolio-book-page', 'aria-label': '个人简介与工作经历' },
            h(MobileAbout, { art, email }),
            h('a', { className: 'portfolio-book-enlarge', href: art + 'about.webp', target: '_blank', rel: 'noopener', 'aria-label': '查看原尺寸的个人简介与工作经历' },
              h('img', { className: 'portfolio-book-art', src: art + 'about.webp', width: 1920, height: 1080,
                alt: 'Hi，I am 曹子慧！个人简介、照片与工作经历', loading: 'lazy', decoding: 'async' })),
            h('p', { className: 'brand-case-title' }, '曹子慧，北京理工大学视觉传达设计本科，具备两年互联网视觉设计经验。在网易有道旗下的有道领世担任视觉设计师，负责咨询销售部与校招业务线。曾在高途教育科技集团担任视觉设计实习生。'),
            contactLink([1031, 165, 264, 64], 'tel:+8615369051667', '致电曹子慧，153-6905-1667'),
            contactLink([1320, 165, 382, 64], 'mailto:' + email, '发送邮件至 ' + email),
          ),
          h('section', { id: 'collection', className: 'portfolio-book-page', 'aria-label': '作品目录' },
            h(BookBoard, { file: 'contents', alt: '作品目录，品牌设计、运营设计、AIGC探索和其他设计' },
              ready => directoryCards.map(({ name, rect }, index) => h('button', {
                key: name, type: 'button', className: 'portfolio-book-hotspot portfolio-book-project', style: bounds(rect),
                title: name, 'aria-label': '查看' + name + '作品', 'aria-haspopup': 'dialog',
                onClick: () => { if (index === 0) unlockHouseSound(); select(index); },
              }, ready ? null : name))),
          ),
          h('footer', { id: 'contact', className: 'portfolio-book-page', 'aria-label': '封底与联系方式' },
            h('span', { id: 'back-cover' }),
            h(BookBoard, { file: 'closing', alt: '封底，Thanks！左侧附有微信联系二维码' },
              ready => h('div', { className: ready ? 'book-contact-hotspots' : 'book-contact-text' },
                !ready && h('strong', null, '联系我'),
                h('a', { className: ready ? 'portfolio-book-hotspot portfolio-book-contact' : undefined,
                  style: ready ? bounds([493, 69, 267, 36]) : undefined, href: 'mailto:' + email, 'aria-label': '发送邮件至 ' + email }, ready ? null : email),
                h('a', { className: ready ? 'portfolio-book-hotspot portfolio-book-qr' : undefined,
                  style: ready ? bounds([100, 549, 206, 206]) : undefined, href: art + 'wechat-qr.png', target: '_blank', rel: 'noopener',
                  'aria-label': '放大微信联系二维码' }, ready ? null : '查看微信二维码'),
              )),
          ),
        ),
      ),
      selected !== null && h(ProjectViewer, { project: projects[selected], onClose: close }),
    );
  };
}
