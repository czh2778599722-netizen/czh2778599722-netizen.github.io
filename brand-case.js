import { createBrandDanmaku } from './brand-danmaku.js';

const caseCover = ['01-cover.webp', '在一起过中秋｜领世限定礼盒', 1920, 1080];
const caseStudy = [
  ['03-overview.webp', '项目简介｜兼顾节日仪式与日常使用的礼盒', 1920, 1080],
  ['04-strategy.webp', '设计目标与对策｜从一次性礼赠到可持续的品牌记忆', 1920, 1080],
  ['05-palette.webp', '视觉系统｜温暖明快的视觉语言', 1920, 1080],
  ['06-logo.webp', '在一起过中秋的品牌标志与字形', 1920, 737],
  ['07-house.webp', '礼盒组合｜一份礼盒，三重心意', 1920, 1080],
  ['08-graphics.webp', '细节展示｜榫卯环保收纳拼插盒与荃盛品牌精选定制月饼', 1920, 2160],
  ['09-flavors-pillow.webp', '六款月饼与「有靠山」记忆棉腰靠', 1920, 2414],
  ['10-hammer-closing.webp', '养生经络按摩锤与项目结语', 1920, 2763],
];

const comments = [
  [
    '今年的中秋礼盒也太可爱了吧！小房子包装真的很有创意！',
    '本来以为只有月饼，没想到还有腰靠和按摩捶，太实用了！',
    '最喜欢这次的配色！橙色小屋搭配彩色月饼，拍照特别出片。',
  ],
  [
    '第一次收到可以自己拼装的小屋礼盒，仪式感直接拉满！',
    '谁懂啊！这个有靠山腰靠真的戳中打工人的心了！',
    '月饼包装好有意思，每个口味都有自己的小设计，好想收藏！',
  ],
];

export function createBrandCase(React) {
  const h = React.createElement;
  const BrandDanmaku = createBrandDanmaku(React);

  function artwork([file, alt, width, height], eager = false) {
    return h('img', {
      key: file,
      className: 'brand-case-artwork',
      src: `/brand/${file}`,
      alt,
      width,
      height,
      loading: eager ? 'eager' : 'lazy',
      decoding: 'async',
    });
  }

  return function BrandCase() {
    return h('article', { className: 'brand-case' },
      h('h1', { className: 'brand-case-title' }, '在一起过中秋'),
      artwork(caseCover, true),
      h('div', { className: 'brand-case-hero' },
        artwork(['02-hero.webp', '小屋中秋礼盒、月饼、腰靠与按摩捶的产品合照', 1920, 1080], true),
        h(BrandDanmaku, { rows: comments }),
      ),
      ...caseStudy.map((frame) => artwork(frame)),
    );
  };
}
