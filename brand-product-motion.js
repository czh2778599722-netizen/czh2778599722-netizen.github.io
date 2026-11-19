import { createHouseAssembly } from './brand-house-motion.js';

export function createBrandProductFrame(React) {
  const { createElement: h, useState } = React;
  const HouseAssembly = createHouseAssembly(React);

  function productArtwork(product) {
    const [x, y, width, height] = product.box;
    return product.parts.map(({ file, part, box: [partX, partY, partWidth, partHeight] = product.box }) => h('img', {
      key: file,
      className: 'brand-product__art',
      'data-part': part,
      src: `/brand/${file}`,
      alt: '',
      width: partWidth,
      height: partHeight,
      style: {
        left: `${(partX - x) / width * 100}%`,
        top: `${(partY - y) / height * 100}%`,
        width: `${partWidth / width * 100}%`,
        height: `${partHeight / height * 100}%`,
      },
      loading: 'lazy',
      decoding: 'async',
      draggable: false,
    }));
  }

  function Product({ product, style, children }) {
    const [activation, setActivation] = useState(null);
    const { label, effect } = product;
    const playing = activation !== null;

    return h('div', {
      className: 'brand-product',
      'data-effect': effect,
      'data-playing': playing,
      'data-activation': activation,
      style,
      onAnimationEnd: () => setActivation(null),
    },
    children,
    h('button', {
      type: 'button',
      className: 'brand-product__trigger',
      'aria-label': `播放${label}动效`,
      'aria-pressed': playing,
      onPointerEnter: (event) => {
        if (event.pointerType === 'mouse' &&
            window.matchMedia('(any-hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
          setActivation((current) => current || 'hover');
        }
      },
      onPointerLeave: (event) => {
        if (event.pointerType === 'mouse') {
          setActivation((current) => current === 'hover' ? null : current);
        }
      },
      onClick: () => setActivation((current) => current === 'button' ? null : 'button'),
    }));
  }

  return function BrandProductFrame({ artwork, width, height, products, showHint }) {
    return h('div', { className: 'brand-product-frame' },
      artwork,
      showHint && h('span', { className: 'brand-product-frame__hint', 'aria-hidden': true },
        h('span', { className: 'brand-product-frame__hint-mouse' }, '悬停单品查看动效'),
        h('span', { className: 'brand-product-frame__hint-touch' }, '点按单品查看动效'),
      ),
      products.map((product) => {
        const [x, y, productWidth, productHeight] = product.box;
        return h(product.effect === 'house' ? HouseAssembly : Product, {
          key: product.id,
          product,
          style: {
            left: `${x / width * 100}%`,
            top: `${y / height * 100}%`,
            width: `${productWidth / width * 100}%`,
            height: `${productHeight / height * 100}%`,
          },
        }, productArtwork(product));
      }),
    );
  };
}
