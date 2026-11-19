import { createBrandDanmaku } from './brand-danmaku.js';
import { createBrandProductFrame } from './brand-product-motion.js';

const release = new URL(import.meta.url).search;
const caseCover = ['01-cover.webp', '在一起过中秋｜领世限定礼盒', 1920, 1080];
const caseStudy = [
  ['03-overview.webp', '项目简介｜兼顾节日仪式与日常使用的礼盒', 1920, 1080],
  ['04-strategy.webp', '设计目标与对策｜从一次性礼赠到可持续的品牌记忆', 1920, 1080],
  ['05-palette.webp', '视觉系统｜温暖明快的视觉语言', 1920, 1080],
  ['06-logo.webp', '在一起过中秋的品牌标志与字形', 1920, 737],
  ['07-house.webp', '礼盒组合｜一份礼盒，三重心意', 1920, 1080],
];

function product(id, label, effect, box, parts = [{ file: `${id}.webp` }]) {
  return { id, label, effect, box, parts };
}

const details = [
  {
    frame: ['case-08-base.webp', '细节展示｜榫卯环保收纳拼插盒与荃盛品牌精选定制月饼', 1920, 2160],
    products: [
      product('house', '榫卯拼插礼盒', 'house', [519, 339, 939, 594], [
        { file: 'house-body.webp', part: 'body', box: [590, 407, 868, 492] },
        { file: 'house-wall.webp', part: 'wall', box: [582, 726, 316, 207] },
        { file: 'house-roof-left.webp', part: 'roof-left', box: [519, 416, 537, 226] },
        { file: 'house-roof-top.webp', part: 'roof-top', box: [884, 339, 498, 68] },
      ]),
      product('mooncake-packages', '定制月饼包装', 'packages', [389, 1424, 1141, 635], [
        { file: 'packages-left.webp', part: 'left', box: [389, 1424, 502, 635] },
        { file: 'packages-right.webp', part: 'right', box: [817, 1432, 713, 575] },
      ]),
    ],
    showHint: true,
  },
  {
    frame: ['case-09-split-base.webp', '六款月饼与「有靠山」记忆棉腰靠', 1920, 2414],
    products: [
      product('cake-1', '第 1 款月饼', 'cake', [228, 144, 183, 252]),
      product('cake-2', '第 2 款月饼', 'cake', [478, 141, 185, 259]),
      product('cake-3', '第 3 款月饼', 'cake', [737, 144, 194, 267]),
      product('cake-4', '第 4 款月饼', 'cake', [989, 145, 199, 260]),
      product('cake-5', '第 5 款月饼', 'cake', [1238, 140, 188, 267]),
      product('cake-6', '第 6 款月饼', 'cake', [1497, 141, 195, 270]),
      product('pillow-blue', '蓝边「有靠山」腰靠', 'pillow-blue', [812, 1089, 505, 507]),
      product('pillow-yellow', '黄边「有靠山」腰靠', 'pillow-yellow', [603, 1529, 579, 629]),
    ],
  },
  {
    frame: ['case-10-split-base.webp', '养生经络按摩锤与项目结语', 1920, 2763],
    products: [
      product('hammer-cyan', '薄荷蓝按摩锤', 'hammer-cyan', [857, 377, 237, 563]),
      product('hammer-green', '绿款按摩锤', 'hammer-green', [1116, 447, 280, 655]),
    ],
  },
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
  const BrandProductFrame = createBrandProductFrame(React);

  function artwork([file, alt, width, height], eager = false) {
    return h('img', {
      key: file,
      className: 'brand-case-artwork',
      src: `/brand/${file}${release}`,
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
      h('div', { className: 'brand-case-artboards' },
        artwork(caseCover, true),
        h('div', { className: 'brand-case-hero' },
          artwork(['02-hero.webp', '小屋中秋礼盒、月饼、腰靠与按摩捶的产品合照', 1920, 1080], true),
          h(BrandDanmaku, { rows: comments }),
        ),
        ...caseStudy.map((frame) => artwork(frame)),
        ...details.map(({ frame, products, showHint }) => h(BrandProductFrame, {
          key: frame[0],
          artwork: artwork(frame),
          width: frame[2],
          height: frame[3],
          products,
          showHint,
        })),
      ),
      h('section', { className: 'brand-case-film', 'aria-labelledby': 'brand-film-title' },
        h('h2', { id: 'brand-film-title' }, '中秋礼盒开箱'),
        h('video', {
          controls: true,
          playsInline: true,
          preload: 'none',
          'aria-labelledby': 'brand-film-title',
          poster: '/brand/gift-box-film-poster.webp',
          src: '/brand/gift-box-film.mp4',
        }),
      ),
    );
  };
}
