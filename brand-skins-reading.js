const bookPath = 'M49 195 Q53 190 58 193 Q69 187 78 198 Q85 204 91 216 Q119 211 144 213 Q148 215 150 223 L160 282 Q157 287 150 287 L111 287 Q104 291 97 286 Q90 279 88 273 Q72 285 61 274 Q48 268 54 246 L54 219 Z';

function ease(t, start, end) {
  const progress = Math.max(0, Math.min(1, (t - start) / (end - start)));
  return progress * progress * (3 - 2 * progress);
}

function envelope(t, start, peak, release, end) {
  return ease(t, start, peak) * (1 - ease(t, release, end));
}

function alignLamp(ctx, { x, y, ox, oy, rotate }) {
  ctx.translate(x + ox, y + oy);
  ctx.rotate(rotate * Math.PI / 180);
  ctx.translate(-ox, -oy);
}

function lightBulb(ctx, lamp, glow) {
  if (glow === 0) return;

  ctx.save();
  alignLamp(ctx, lamp);
  const halo = ctx.createRadialGradient(77, 176, 5, 77, 176, 70);
  halo.addColorStop(0, `rgba(255, 225, 140, ${0.88 * glow})`);
  halo.addColorStop(0.4, `rgba(255, 224, 140, ${0.57 * glow})`);
  halo.addColorStop(0.78, `rgba(255, 226, 149, ${0.2 * glow})`);
  halo.addColorStop(1, 'rgba(255, 226, 149, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(7, 106, 140, 140);
  ctx.restore();
}

function lightFilament(ctx, lamp, filament, glow) {
  if (filament === 0) return;

  ctx.save();
  alignLamp(ctx, lamp);
  const glass = ctx.createRadialGradient(77, 178, 4, 77, 178, 29);
  glass.addColorStop(0, `rgba(255, 217, 96, ${0.56 * glow})`);
  glass.addColorStop(1, 'rgba(255, 229, 147, 0)');
  ctx.fillStyle = glass;
  ctx.fillRect(48, 149, 58, 58);

  const wires = new Path2D('M72 211 L71 197 Q69 186 65 176 Q65 172 69 174 L73 177 L77 170 L82 178 L87 174 Q91 171 91 175 Q85 189 83 211 M77 210 L77 182');
  ctx.strokeStyle = `rgba(255, 251, 213, ${0.97 * filament})`;
  ctx.shadowColor = '#ffae25';
  ctx.shadowBlur = 4 + 6 * glow;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.5;
  ctx.stroke(wires);
  ctx.restore();
}

function drawInspiration(p, t) {
  const lift = envelope(t, 0.02, 0.38, 0.69, 0.98);
  const filament = envelope(t, 0.24, 0.43, 0.73, 0.96);
  const glow = envelope(t, 0.39, 0.64, 0.66, 0.98);
  const answer = envelope(t, 0.48, 0.64, 0.69, 0.95);
  const lamp = { x: -1.5 * lift, y: -13 * lift, ox: 99, oy: 262, rotate: 8 * lift };

  p.layer('head', { y: -3 * answer, oy: 232, ox: 210, sy: 1 + 0.015 * answer, rotate: 2 * answer });
  lightBulb(p.ctx, lamp, glow);
  p.layer('bulb', lamp);
  lightFilament(p.ctx, lamp, filament, glow);
}

function turnPage(ctx, progress) {
  if (progress <= 0 || progress >= 1) return;

  const angle = Math.PI * progress;
  const rise = Math.sin(angle);
  const x = 99 + 47 * Math.cos(angle);
  const y = 213 - progress * 22 - 39 * rise;
  const curve = (0.5 - progress) * 10 + 9 * rise;
  const paper = ctx.createLinearGradient(91, 219, x + (x >= 92 ? 6 : -6), y);
  paper.addColorStop(0, '#d5c5a5');
  paper.addColorStop(0.26, '#eee2ca');
  paper.addColorStop(1, '#fff9ea');

  ctx.save();
  ctx.globalAlpha *= ease(progress, 0, 0.12) * (1 - ease(progress, 0.91, 1));
  ctx.fillStyle = paper;
  ctx.strokeStyle = 'rgba(116, 93, 49, 0.35)';
  ctx.lineWidth = 0.7;
  ctx.shadowColor = 'rgba(105, 85, 52, 0.32)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.moveTo(92, 217);
  ctx.quadraticCurveTo((x + 92) * 0.5 - curve, y + 3, x, y);
  ctx.quadraticCurveTo(x + 3 + 6 * rise, y + 8, x + 2, y + 17 - 3 * rise);
  ctx.quadraticCurveTo((x + 101) * 0.5 + curve, (y + 224) * 0.5 + 4, 101, 222);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawClassics(p, t) {
  const reading = envelope(t, 0.01, 0.27, 0.65, 0.98);
  const nod = envelope(t, 0.67, 0.81, 0.83, 0.97);
  p.layer('head', {
    y: 3.3 * reading + 4 * nod,
    ox: 209,
    oy: 234,
    sy: 1 - 0.012 * reading - 0.013 * nod,
    rotate: -1.6 * reading + nod,
  });
  p.layer('book');
  turnPage(p.ctx, ease(t, 0.23, 0.76));
}

export const readingSkins = {
  6: {
    layers: [
      { name: 'head', file: '06-head.webp' },
      { name: 'bulb', file: '06-bulb.webp' },
    ],
    draw: drawInspiration,
  },
  7: {
    layers: [
      { name: 'head', file: '07-head.webp' },
      { name: 'book', path: bookPath },
    ],
    draw: drawClassics,
  },
};
