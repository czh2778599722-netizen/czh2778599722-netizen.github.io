function ease(start, end, t) {
  const f = Math.max(0, Math.min(1, (t - start) / (end - start)));
  return f * f * (3 - 2 * f);
}

export const lawSkin = {
  layers: [
    { name: 'sleeve', file: '08-sleeve.webp', x: 61, y: 202 },
    { name: 'head', file: '08-head.webp', x: 100, y: 28 },
    { name: 'mouth', path: 'M199.3 202.1 Q200.2 198.9 206.2 199.8 L217.2 199.7 Q222.9 199.8 222.7 203.5 Q221.9 216.7 212.3 216.4 Q201.1 217 199.3 205.3 Z' },
    { name: 'book and hand', path: 'M33.4 199.9 Q32.8 197.1 36 197.3 L38.8 198.3 Q46 195.9 52 191.1 Q64.5 197.7 69.8 203.8 Q75 209 76.6 216.8 Q89 211 99 211.2 Q112 210.4 123.8 212.2 Q126.2 215 126.2 220 Q130.4 219.4 131.6 222 L149.9 275.6 Q151.1 280.2 147.4 281.2 Q124 283 98.3 282 Q96.9 285.9 88.6 286.3 Q84 286.4 82.1 284.3 Q66.7 285.4 60 278.7 Q47.7 270.4 49.2 257 Q49 250.6 52.4 246.7Z' },
  ],
  draw(p, t) {
    const glance = ease(0.01, 0.17, t) - ease(0.22, 0.45, t);
    const raise = ease(0.16, 0.46, t) - ease(0.79, 0.99, t);
    const faceAudience = ease(0.32, 0.48, t) - ease(0.79, 0.98, t);
    const closed = ease(0.40, 0.49, t) - ease(0.49, 0.55, t)
      + ease(0.56, 0.62, t) - ease(0.63, 0.69, t)
      + ease(0.71, 0.77, t) - ease(0.82, 0.96, t);
    const ctx = p.ctx;
    p.layer('sleeve', { x: 6 * raise, ox: 106, oy: 218, rotate: -13 * raise, sy: 0.9 - 0.38 * raise, sx: 0.96 });
    ctx.save();
    ctx.translate(210 - 2 * glance, 238 + 2 * glance);
    ctx.rotate(-glance * 4.5 * Math.PI / 180);
    ctx.scale(1, 1 - 0.027 * glance + 0.008 * faceAudience);
    ctx.translate(-210, -238);
    p.layer('head');
    p.layer('mouth', { ox: 211, oy: 201.5, sy: 1 - 0.78 * closed });
    ctx.restore();
    p.layer('book and hand', { x: 25 * raise, y: -19 * raise, ox: 101, oy: 274, rotate: 7 * raise });
  },
};
