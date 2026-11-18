export function createBrandProductFrame({ createElement: h, useState }) {
  function Product({ product, frameWidth, frameHeight }) {
    const [activation, setActivation] = useState(null);
    const { label, effect, parts, box: [x, y, width, height] } = product;
    const playing = activation !== null;

    return h('div', {
      className: 'brand-product',
      'data-effect': effect,
      'data-playing': playing,
      'data-activation': activation,
      style: {
        left: `${x / frameWidth * 100}%`,
        top: `${y / frameHeight * 100}%`,
        width: `${width / frameWidth * 100}%`,
        height: `${height / frameHeight * 100}%`,
      },
      onAnimationEnd: () => setActivation(null),
    },
    ...parts.map(({ file, part, box: [partX, partY, partWidth, partHeight] = product.box }) => h('img', {
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
    })),
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
      products.map((product) => h(Product, {
        key: product.id,
        product,
        frameWidth: width,
        frameHeight: height,
      })),
    );
  };
}
