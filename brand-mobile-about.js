const jobs = [
  {
    company: '有道领世',
    logo: 'about-youdao.webp',
    note: '网易有道旗下',
    period: '2025.05 转正至今',
    role: '视觉设计师 · 咨询销售部与校招业务线',
    projects: [
      ['营销活动', '服务咨询销售、校园招聘和节点营销，完成公众号长图、活动海报、社媒物料等，从主视觉到多尺寸素材全链路交付。'],
      ['品牌落地', '负责节日礼盒、棒球服、中高考地推等 5 类品牌周边与线下物料，推进方案、打样及落地协同，保持品牌视觉一致。参与官网开发与上线，完成界面设计。'],
      ['AI 工作流', '协同产品、技术团队，梳理设计需求，建立可复用的 AI 设计资产库、输出规范与素材，打通 AI 生图交付链路，提升团队素材产出效率，平台累计产出模版 150+，模版采用率达 84%。'],
    ],
  },
  {
    company: '高途教育科技集团有限公司',
    logo: 'about-gaotu.webp',
    period: '2024.06–2024.09',
    role: '视觉设计实习生 · CA 成人业务线与考研方向',
    projects: [
      ['CA 业务线的设计需求及项目制作', '主视觉活动、营销设计、落地页设计、书籍讲义制作。'],
      ['多项业务设计经验', '负责过家庭教育、考公、语言、考研学部需求，对需求有更深入了解。'],
    ],
  },
];

export function createMobileAbout(React) {
  const h = React.createElement;
  return function MobileAbout({ art, email }) {
    return h('div', { className: 'book-mobile-about' },
      h('h2', { className: 'book-mobile-hello' }, 'Hi，I am 曹子慧！'),
      h('p', { className: 'book-mobile-intro' },
        h('strong', null, '北京理工大学'), '视觉传达设计本科，具备 ',
        h('strong', null, '2 年'), '互联网视觉设计经验，覆盖 ',
        h('strong', null, 'App/H5、营销活动、文创设计、品牌物料'), '。熟练使用 ',
        h('strong', null, 'Codex 等 Agent 工具'), '，能从需求梳理、视觉方案到多尺寸落地独立推进，累计交付 ',
        h('strong', null, '170+'), ' 页面与活动物料，并参与搭建 ',
        h('strong', null, '150+'), ' 模板的 AI 设计资产库。',
      ),
      h('img', { className: 'book-mobile-portrait', src: art + 'about-portrait.webp', width: 509, height: 509, alt: '曹子慧的个人照片', loading: 'lazy', decoding: 'async' }),
      h('img', { className: 'book-mobile-tools', src: art + 'about-tools.webp', width: 539, height: 53, alt: '常用设计工具，包括 Figma、Photoshop、Illustrator、InDesign、After Effects、Blender 和 ChatGPT', loading: 'lazy', decoding: 'async' }),
      h('div', { className: 'book-mobile-contacts' },
        h('a', { href: 'tel:+8615369051667', 'aria-label': '致电 153-6905-1667' }, h('span', { 'aria-hidden': true }, '☎'), '153-6905-1667'),
        h('a', { href: 'mailto:' + email, 'aria-label': '发送邮件至 ' + email }, h('span', { 'aria-hidden': true }, '✉'), email),
      ),
      h('section', { className: 'book-mobile-experience', 'aria-labelledby': 'book-mobile-work' },
        h('h3', { id: 'book-mobile-work' }, '工作经历'),
        jobs.map(({ company, logo, note, period, role, projects }) => h('article', { key: company, className: 'book-mobile-job' },
          h('h4', null, h('img', { src: art + logo, alt: '', loading: 'lazy' }), company, note && h('small', null, '（' + note + '）')),
          h('p', { className: 'book-mobile-dates' }, period),
          h('p', { className: 'book-mobile-role' }, role),
          h('ul', null, projects.map(([label, detail]) => h('li', { key: label }, h('strong', null, label + '：'), detail))),
        )),
      ),
      h('a', { className: 'book-mobile-original', href: art + 'about.webp', target: '_blank', rel: 'noopener' }, '查看简介原图', h('span', { 'aria-hidden': true }, '↗')),
    );
  };
}
