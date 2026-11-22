// The lower edge of this head region overlaps the fixed collar.
// Its neckline stays registered while the crown and glasses gently tip.
const portrait = 'M164 31H247V110L239 115Q293 126 316 179L323 202V236H89V207Q101 145 169 117L164 111Z';
const coatArm = 'M318 231 Q326 235 339 251 L334 258 339 269 Q349 269 349 277 L347 282 Q356 299 355 316 Q355 334 341 339 Q326 343 317 327 L312 321 312 280 Q310 254 318 231Z';
const scarfKnot = 'M310 213 Q308 192 332 185 L336 199 332 205 Q343 207 349 220 L346 228 309 229Z';
const compassDial = 'M102 282 A15.3 15.3 0 1 1 71.4 282 A15.3 15.3 0 1 1 102 282Z';

const flaskHand = 'M57 222 Q66 218 88 220 Q99 219 94 226 L91 228 92 239 Q104 245 98 257 L98 263 Q106 283 111 297 Q115 308 99 309 Q72 314 49 308 Q43 306 46 297 L51 285 C36 279 30 264 37 251 Q42 241 60 239 L60 229 Q56 228 57 222Z';
const suspendedBubbles = 'M70 207 Q75 202 81 207 L81 217 70 217Z M73 195 L83 194 84 205 72 205Z M74 185 L82 183 83 193 74 193Z';

const scrollHand = 'M40 216 Q42 212 48 211 Q46 205 59 202 L67 202 70 204 Q79 198 81 207 L81 212 121 298 Q132 299 129 309 L121 314 Q122 320 110 322 L104 321 Q96 328 89 322 L73 287 C56 287 45 273 47 258 Q47 252 53 246 L46 227 Q39 228 40 216Z';

function smooth(start, end, time) {
  const p = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return p * p * (3 - 2 * p);
}

function withWrist(ctx, x, y, rotation, moveX, moveY, paint) {
  ctx.save();
  ctx.translate(x + moveX, y + moveY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-x, -y);
  paint();
  ctx.restore();
}

function inclineHead(p, amount, lean) {
  if (amount < 0.001) {
    p.layer('head');
    return;
  }
  const image = p.image('head');
  const ctx = p.ctx;
  // A tapered shear through the face keeps the chin and clothing in place.
  // The destination rows meet along horizontal edges, including on touch screens.
  const point = y => {
    const freedom = 1 - smooth(166, 216, y);
    return {
      x: amount * (y - 216) * lean * freedom,
      y: y + amount * (4 + (216 - y) * 0.024) * freedom,
    };
  };
  const left = 87, width = 239;
  let previous = point(29);
  for (let y = 29; y < 216; y += 4) {
    const height = Math.min(4, 216 - y);
    const next = point(y + height);
    ctx.save();
    ctx.transform(1, 0, (next.x - previous.x) / height, (next.y - previous.y) / height,
      left + previous.x, previous.y);
    ctx.drawImage(image, left, y, width, height + 0.65, 0, 0, width, height + 0.65);
    ctx.restore();
    previous = next;
  }
  ctx.drawImage(image, left, 216, width, 22, left, 216, width, 22);
}

function bendExplorerArm(p, lift) {
  if (lift <= 0.001) return;
  const ctx = p.ctx;
  const texture = p.image('coat-arm');
  ctx.save();
  ctx.globalAlpha *= smooth(0, 0.35, lift);
  // The bent upper arm stays attached beneath the scarf. The sleeve and glove
  // both borrow their original studio lighting from the opposite arm.
  ctx.save();
  const elbowX = 84 - 6 * lift, elbowY = 270 - 6 * lift;
  const wristX = 73 + 37 * lift, wristY = 279 - 54 * lift;
  ctx.translate(elbowX, elbowY);
  const shoulderAngle = Math.atan2(245 - elbowY, 108 - elbowX);
  ctx.rotate(shoulderAngle);
  const sleeveLength = Math.hypot(108 - elbowX, 245 - elbowY);
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.quadraticCurveTo(-11, -1, -4, 8);
  ctx.bezierCurveTo(3, 13, 9, 11, 16, 10);
  ctx.lineTo(16, -10);
  ctx.quadraticCurveTo(5, -12, -4, -8);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(texture, 317, 265, 12, 8, -12, -14, 31, 29);
  ctx.restore();
  ctx.save();
  ctx.translate(elbowX, elbowY);
  ctx.rotate(shoulderAngle);
  ctx.beginPath();
  ctx.moveTo(6, -11);
  ctx.quadraticCurveTo(4, 0, 8, 12);
  ctx.bezierCurveTo(sleeveLength-7, 11, sleeveLength+1, 9, sleeveLength+4, 5);
  ctx.quadraticCurveTo(sleeveLength+4, -6, sleeveLength-3, -10);
  ctx.quadraticCurveTo(21, -14, 6, -11);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(texture, 315, 242, 10, 14, 3, -15, sleeveLength+4, 30);
  ctx.restore();
  const dx = wristX - elbowX, dy = wristY - elbowY;
  const length = Math.hypot(dx, dy);
  ctx.translate(elbowX, elbowY);
  ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.bezierCurveTo(-9.5, -11, 9.5, -11, 9, 0);
  ctx.quadraticCurveTo(10, length * 0.5, 7.4, length + 5);
  ctx.lineTo(-7.4, length + 5);
  ctx.quadraticCurveTo(-9.2, length * 0.55, -9, 0);
  ctx.clip();
  ctx.drawImage(texture, 326, 290, 16, 20, -11, -10, 22, length + 17);
  const light = ctx.createLinearGradient(-10, 0, 10, 0);
  light.addColorStop(0, 'rgba(137,57,22,.35)');
  light.addColorStop(0.52, 'rgba(255,192,117,.25)');
  light.addColorStop(1, 'rgba(173,65,16,.22)');
  ctx.fillStyle = light;
  ctx.fillRect(-11, -10, 22, length + 17);
  ctx.restore();
}

function inspectCompass(p, t) {
  const lift = smooth(0.01, 0.34, t) * (1 - smooth(0.72, 0.99, t));
  const nod = smooth(0.15, 0.43, t) * (1 - smooth(0.70, 0.96, t));
  inclineHead(p, nod, 0.065);
  p.layer('ribbon');
  bendExplorerArm(p, lift);
  const swing = Math.max(0, Math.min(1, (t - 0.30) / 0.44));
  const needle = Math.sin(swing * Math.PI * 4) * (1 - swing) * 40;
  withWrist(p.ctx, 92, 267, -7 * lift, 37 * lift, -54 * lift, () => {
    p.layer('hand');
    // The original compass rose turns inside its fixed, textured brass rim.
    p.layer('dial', { ox: 86.7, oy: 282, rotate: needle });
  });
}

function drawBubble(ctx, x, y, radius, opacity) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  const glow = ctx.createRadialGradient(x-radius*0.32, y-radius*0.38, radius*0.05, x, y, radius);
  glow.addColorStop(0, 'rgba(250,255,253,.95)');
  glow.addColorStop(0.48, 'rgba(187,243,242,.55)');
  glow.addColorStop(0.83, 'rgba(76,192,205,.68)');
  glow.addColorStop(1, 'rgba(43,146,178,.83)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function shakeFlask(p, t) {
  const phase = Math.max(0, Math.min(1, (t - 0.04) / 0.74));
  const angleAt = u => Math.sin(4 * Math.PI * u) * Math.sin(Math.PI * u) * (13 - 3 * u);
  const angle = angleAt(phase);
  const liquidLag = angleAt(Math.max(0, phase - 0.085)) - angle;
  withWrist(p.ctx, 68, 261, angle, 0, 0, () => {
    p.layer('hand');
    // Extend the original photographed liquid behind a gently lagging meniscus.
    const ctx = p.ctx;
    const tilt = liquidLag * 0.17;
    if (Math.abs(tilt) > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(61, 278);
      ctx.quadraticCurveTo(66, 273 + tilt, 70, 272.5 + tilt);
      ctx.quadraticCurveTo(82, 275, 96, 271.5 - tilt);
      ctx.lineTo(99, 281);
      ctx.quadraticCurveTo(81, 284, 61, 278);
      const liquid = ctx.createLinearGradient(62, 0, 99, 0);
      liquid.addColorStop(0, 'rgba(132,226,241,.92)');
      liquid.addColorStop(0.38, 'rgba(35,193,222,.85)');
      liquid.addColorStop(1, 'rgba(21,166,204,.9)');
      ctx.fillStyle = liquid;
      ctx.fill();
      ctx.restore();
    }
  });
  p.layer('bubbles', { alpha: 1 - smooth(0, 0.13, t) + smooth(0.90, 1, t) });
  const rad = angle * Math.PI / 180;
  const mouthX = 68 + 8 * Math.cos(rad) + 38 * Math.sin(rad);
  const mouthY = 261 + 8 * Math.sin(rad) - 38 * Math.cos(rad);
  for (const [start, radius, drift] of [[0.19, 3.2, -4], [0.38, 5.1, 4], [0.57, 4.2, -1]]) {
    const u = (t - start) / 0.31;
    if (u <= 0 || u >= 1) continue;
    // Detach at the moving lip, then let each bubble rise independently.
    const releasePhase = Math.max(0, Math.min(1, (start - 0.04) / 0.74));
    const releaseAngle = angleAt(releasePhase) * Math.PI / 180;
    const originX = 68 + 8 * Math.cos(releaseAngle) + 38 * Math.sin(releaseAngle);
    const originY = 261 + 8 * Math.sin(releaseAngle) - 38 * Math.cos(releaseAngle);
    const detach = smooth(0, 0.25, u);
    const x = mouthX + (originX - mouthX) * detach + drift * Math.sin(Math.PI * u);
    const y = mouthY + (originY - mouthY) * detach - 3 - 32 * u;
    drawBubble(p.ctx, x, y, radius * (0.4 + 0.6 * detach), smooth(0, 0.16, u) * (1 - smooth(0.64, 1, u)));
  }
}

function readScroll(p, t) {
  const open = smooth(0.03, 0.42, t) * (1 - smooth(0.64, 0.99, t));
  const lean = smooth(0.14, 0.50, t) * (1 - smooth(0.70, 0.99, t));
  inclineHead(p, lean, 0.077);
  const ctx = p.ctx;
  if (open > 0.002) {
    ctx.save();
    // Local vertical axis follows the slant of the parchment spindle.
    ctx.translate(70, 218);
    ctx.rotate(-24 * Math.PI / 180);
    const width = 25 * open;
    const paper = ctx.createLinearGradient(-7 * open, 0, width, 0);
    paper.addColorStop(0, '#a87949');
    paper.addColorStop(0.2, '#e5c895');
    paper.addColorStop(0.6, '#fff0ce');
    paper.addColorStop(1, '#e6cfab');
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.moveTo(-8 * open, 0);
    ctx.bezierCurveTo(4 * open, 1, 15 * open, -3, width, -2);
    ctx.quadraticCurveTo(width - 1, 43, width + 0.7, 86);
    ctx.bezierCurveTo(18 * open, 86, 5 * open, 90, -8 * open, 91);
    ctx.closePath();
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(139,96,56,.54)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(width - 21, 4, 17, 78);
    ctx.fillStyle = 'rgba(113,79,51,.72)';
    ctx.font = '6px serif';
    for (const [i, mark] of Array.from('山川志').entries()) ctx.fillText(mark, width - 12, 18 + i * 8);
    ctx.restore();
  }
  p.layer('scroll', { ox: 78, oy: 263, x: -6.5 * open, y: 0.6 * open, rotate: -2 * open });
}

export const studySkins = {
  1: {
    layers: [{ name: 'head', path: portrait }, { name: 'hand', file: '01-hand.webp' }, { name: 'dial', path: compassDial }, { name: 'coat-arm', path: coatArm }, { name: 'ribbon', path: scarfKnot }],
    draw: inspectCompass,
  },
  2: {
    layers: [{ name: 'hand', path: flaskHand }, { name: 'bubbles', path: suspendedBubbles }],
    draw: shakeFlask,
  },
  3: {
    layers: [{ name: 'head', path: portrait }, { name: 'scroll', path: scrollHand }],
    draw: readScroll,
  },
};
