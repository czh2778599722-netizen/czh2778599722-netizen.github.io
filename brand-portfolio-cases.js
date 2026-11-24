const boards = {
  operations: [
    ['4-0', '运营设计', 429],
    ['4-1', '营销落地页｜咨询销售部', 2341],
    ['4-2', '公众号营销长图｜校招组', 2341],
    ['4-3', '海报设计｜生图模版，供员工在平台自助出图', 2341],
    ['4-4', 'AIGC流程复盘｜参考图收集、书写关键词、AIGC制作和后期调试', 1924],
    ['4-5', '会议主视觉｜领世1对1管理者交流培训会「别暑迎秋，蓄势前行」与会议物料', 5195],
  ],
  other: [
    ['5-0', '其他设计', 429],
    ['5-1', '有为青年｜棒球服设计与上身展示', 2830],
    ['5-2', '产品手册｜《领世培优·智绘未来》高中全路径成长手册', 2362],
  ],
};

export function createPortfolioBoards(React) {
  const h = React.createElement;
  return function PortfolioBoards({ kind }) {
    const pages = boards[kind];
    return h('section', { className: 'brand-case', 'aria-label': pages[0][1] },
      ...pages.map(([id, alt, height], index) => h('img', {
        key: id,
        className: 'brand-case-artwork',
        src: '/brand/portfolio-2026/' + id + '.webp',
        alt,
        width: 1920,
        height,
        decoding: 'async',
        loading: index === 0 ? 'eager' : 'lazy',
      })),
    );
  };
}
