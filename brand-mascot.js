import { createSkinHero } from './brand-skin-hero.js';
import { createSkinGallery, skinNames } from './brand-skin-gallery.js';

const directory = '/brand/mascot/';

export function createMascotCase(React) {
  const h = React.createElement;
  const SkinGallery = createSkinGallery(React);
  const SkinHero = createSkinHero(React, skinNames);

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

  return function MascotCase() {
    const [detailPlaying, setDetailPlaying] = React.useState(false);
    return h('article', { className: 'brand-case brand-mascot-case', 'aria-labelledby': 'mascot-case-title' },
      h('h1', { id: 'mascot-case-title', className: 'brand-case-title' }, 'IP一致性延展'),
      artwork('header.webp', 'IP一致性延展', 429, true),
      artwork('intro.webp', '领小麦系列角色合影', 1066, true),
      h(SkinHero, { detailPlaying }),
      h(SkinGallery, { onPlayStateChange: setDetailPlaying }),
      artwork('scenes.webp', '场景海报，领小麦在实验室、课堂、广场和森林的四种演绎', 3207),
    );
  };
}
