const stages = (progress, start, end) => Math.min(1, Math.max(0, (progress - start) / (end - start)));

function smooth(value) {
  return value * value * (3 - 2 * value);
}

const transition = (progress, start, end) => smooth(stages(progress, start, end));

function drawNaturalist({ layer }, progress) {
  const lift = transition(progress, 0, .19) * (1 - transition(progress, .77, 1));
  const landing = stages(progress, .46, .61);
  const tremble = -1.7 * Math.sin(landing * 4 * Math.PI) * (1 - landing);
  const outward = stages(progress, .17, .46);
  const homeward = stages(progress, .66, .93);
  const perched = smooth(outward) * (1 - smooth(homeward));
  const arc = Math.sin(Math.PI * outward) + Math.sin(Math.PI * homeward);
  const wingbeat = Math.sin(outward * Math.PI * 2) ** 2 + Math.sin(homeward * Math.PI * 2) ** 2;

  layer('leaf', { x: 0, y: -5 * lift, ox: 101, oy: 273, rotate: 5 * lift + tremble });
  layer('butterfly', {
    x: (-41 + 2 * tremble) * perched,
    y: 1.5 * perched - 31 * arc,
    ox: 146, oy: 148,
    rotate: -8 * perched,
    sx: 1 - .47 * wingbeat,
  });
}

function drawMath({ ctx, layer }, progress) {
  const tilt = transition(progress, 0, .22) * (1 - transition(progress, .83, 1));
  layer('ruler', { x: 3 * tilt, y: -2 * tilt, ox: 329, oy: 305, rotate: 20 * tilt });

  const alongEdge = stages(progress, .22, .41);
  if (alongEdge === 0 || progress >= .86) return;

  const outward = stages(progress, .41, .61);
  const marker = transition(progress, .61, .69);
  const fade = 1 - transition(progress, .73, .86);
  const edgeX = 345;
  const cornerY = 268;

  ctx.save();
  // Draw in the tilted ruler's coordinates, starting on its long outer edge.
  ctx.translate(332, 303);
  ctx.rotate(20 * Math.PI / 180);
  ctx.translate(-329, -305);
  ctx.globalAlpha *= fade;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff2b5';
  ctx.shadowColor = '#b87533';
  ctx.shadowBlur = 2.5;
  ctx.beginPath();
  ctx.moveTo(edgeX, cornerY + 34);
  ctx.lineTo(edgeX, cornerY + 34 * (1 - alongEdge));
  if (outward > 0) ctx.lineTo(edgeX + 33 * outward, cornerY);
  ctx.stroke();

  if (marker > 0) {
    ctx.globalAlpha *= marker;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(edgeX, cornerY + 10);
    ctx.lineTo(edgeX + 10, cornerY + 10);
    ctx.lineTo(edgeX + 10, cornerY);
    ctx.stroke();
  }
  ctx.restore();
}

export const natureSkins = {
  4: {
    layers: [
      { name: 'leaf', file: '04-leaf.webp', x: 35, y: 151 },
      { name: 'butterfly', file: '04-butterfly.webp', x: 133, y: 108 },
    ],
    draw: drawNaturalist,
  },
  5: {
    layers: [{ name: 'ruler', file: '05-ruler.webp', x: 308, y: 259 }],
    draw: drawMath,
  },
};
