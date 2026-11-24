import { createMobileAbout } from './brand-mobile-about.js';

const art = '/brand/portfolio-2026/';
const email = 'caozihui2021@163.com';
const sections = [['home', '封面'], ['about', '简介'], ['collection', '作品目录'], ['contact', '封底']];
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

  function image(file, alt, eager = false) {
    return h('img', {
      className: 'portfolio-book-art', src: art + file + '.webp', width: 1920, height: 1080,
      loading: eager ? 'eager' : 'lazy', decoding: 'async', fetchPriority: eager ? 'high' : undefined, alt,
    });
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
        ),
        h('main', { className: 'portfolio-book-pages' },
          h('section', { id: 'home', className: 'portfolio-book-page', 'aria-labelledby': 'book-title' },
            h('h1', { id: 'book-title', className: 'brand-case-title' }, '曹子慧 · 2026 设计作品集'),
            image('cover', '2026 设计作品集封面，霓虹灯照亮桌上的复古电脑和彩色公仔', true),
          ),
          h('section', { id: 'about', className: 'portfolio-book-page', 'aria-label': '个人简介与工作经历' },
            h(MobileAbout, { art, email }),
            h('a', { className: 'portfolio-book-enlarge', href: art + 'about.webp', target: '_blank', rel: 'noopener', 'aria-label': '查看原尺寸的个人简介与工作经历' },
              image('about', 'Hi，I am 曹子慧！个人简介、照片与工作经历')),
            h('p', { className: 'brand-case-title' }, '曹子慧，北京理工大学视觉传达设计本科，具备两年互联网视觉设计经验。在网易有道旗下的有道领世担任视觉设计师，负责咨询销售部与校招业务线。曾在高途教育科技集团担任视觉设计实习生。'),
            contactLink([1031, 165, 264, 64], 'tel:+8615369051667', '致电曹子慧，153-6905-1667'),
            contactLink([1320, 165, 382, 64], 'mailto:' + email, '发送邮件至 ' + email),
          ),
          h('section', { id: 'collection', className: 'portfolio-book-page', 'aria-label': '作品目录' },
            image('contents', '作品目录，品牌设计、运营设计、AIGC探索和其他设计'),
            ...directoryCards.map(({ name, rect }, index) => h('button', {
              key: index, type: 'button', className: 'portfolio-book-hotspot portfolio-book-project', style: bounds(rect),
              title: name, 'aria-label': '查看' + name + '作品', 'aria-haspopup': 'dialog',
              onClick: () => { if (index === 0) unlockHouseSound(); select(index); },
            })),
          ),
          h('footer', { id: 'contact', className: 'portfolio-book-page', 'aria-label': '封底与联系方式' },
            h('span', { id: 'back-cover' }),
            image('closing', '封底，Thanks！左侧附有联系二维码'),
            contactLink([495, 65, 230, 40], 'mailto:' + email, '发送邮件至 ' + email),
            h('a', { className: 'portfolio-book-hotspot', style: bounds([100, 548, 135, 136]), href: art + 'wechat-qr.png', target: '_blank', rel: 'noopener', 'aria-label': '放大微信联系二维码' }),
          ),
        ),
      ),
      selected !== null && h(ProjectViewer, { project: projects[selected], onClose: close }),
    );
  };
}
