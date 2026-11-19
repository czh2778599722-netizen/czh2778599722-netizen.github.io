import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = join(root, 'site');
const brandRevision = '?v=6';
const webp = (names) => names.split(' ').map((name) => `${name}.webp`);
const rootFiles = await readdir(root);
const assets = {
  cover: ['interactive-world.png'],
  assets: rootFiles.filter((file) => /^(?:index-|brand-).+\.(?:css|js)$/.test(file)),
  fonts: ['alibaba-puhuiti-medium.woff2', 'alimama-shuhei-bold.woff2'],
  autumn: webp('banner barrier cover custom-graphics gift-bag hero-detail key-visual name-card notebook project-introduction sign-in social stamps sticker-one sticker-two table-card vertical wayfinding'),
  campaign: webp('archive-1-1 archive-1-2 archive-1-3 archive-1-4 archive-2-1 archive-2-2 archive-2-3 archive-2-4 final-review-original finals-original national-day-original nine-subjects-original poster-1 poster-2 poster-3 warm-practice-original winter-breakthrough-original winter-warm-original'),
  cultural: webp('notebook-series'),
  landing: webp('finals-practice may-holiday-sprint midterm-review new-semester second-round-review senior-sprint-package winter-warmup'),
  longform: webp('2027-summer-internship 2027-teacher-trainee class-teacher-recruitment may-day-teachers open-day-beijing open-day-shijiazhuang shijiazhuang-teacher-clean summer-trainee teacher-interview-warm teacher-interview-wei'),
  seasonal: webp('arbor-day chushu dahan gaokao-1-day gaokao-2-days gaokao-3-days gaokao-4-days gaokao-5-days gaokao lichun mid-autumn mothers-day yushui'),
  brand: [
    'directory-cover.jpg',
    'gift-box-film.mp4', 'gift-box-film-poster.webp',
    ...webp('01-cover 02-hero 03-overview 04-strategy 05-palette 06-logo 07-house 08-graphics 09-flavors-pillow 10-hammer-closing'),
    ...webp('case-08-base case-09-split-base case-10-split-base house-body house-wall house-roof-left house-roof-top packages-left packages-right cake-1 cake-2 cake-3 cake-4 cake-5 cake-6 pillow-blue pillow-yellow hammer-cyan hammer-green'),
  ],
};

await Promise.all(Object.entries(assets).map(async ([folder, files]) => {
  const destination = join(output, folder);
  const source = folder === 'brand' ? join(root, folder) : root;
  await mkdir(destination, { recursive: true });
  await Promise.all(files.map((file) => copyFile(join(source, file), join(destination, file))));
}));

function replaceOnce(source, original, replacement) {
  const index = source.indexOf(original);
  if (index === -1 || index !== source.lastIndexOf(original)) {
    throw new Error(`Expected one copy of ${original} in the published site bundle.`);
  }
  return source.slice(0, index) + replacement + source.slice(index + original.length);
}

// The repository contains the previously published bundle rather than its React source.
// Keep the upstream files intact and attach the editable project to the existing viewer.
const baseBundleName = 'index-DyPDV1vn.js';
const baseBundle = await readFile(join(root, baseBundleName), 'utf8');
const replacements = [
  ['name:`活动视觉项目`,x:.058', 'name:`品牌设计`,x:.058'],
  [
    'var we=[{id:`autumn-event`,number:1,title:`别暑迎秋`,en:`A New Season, A Shared Direction`,category:`活动视觉项目`,tag:`EVENT VISUAL / 2026`,subtitle:`会议视觉与伴手礼文创设计`,cover:`key-visual`,prototype:!1}',
    'const BrandCase=createBrandCase(l);\nvar we=[{id:`brand-design`,number:1,title:`品牌设计`,en:`Brand Design`,category:`品牌设计`,tag:`BRAND DESIGN / 2025`,subtitle:`在一起过中秋 · 中秋礼盒设计`,cover:`/brand/directory-cover.jpg`,prototype:!1}',
  ],
  [
    'function Ee({project:e,asset:t,alt:n=``,lazy:r=!0}){return ',
    'function Ee({project:e,asset:t,alt:n=``,lazy:r=!0}){return e.id===`brand-design`?(0,p.jsx)(`img`,{className:`brand-wall-cover`,src:e.cover,alt:`蓝天下的小屋中秋礼盒、月饼与礼品`,loading:r?`lazy`:`eager`}):',
  ],
  [
    'e.id===`project-03`?`CULTURAL DESIGN`:`EVENT VISUAL CASE`',
    'e.id===`project-03`?`CULTURAL DESIGN`:e.id===`brand-design`?`BRAND DESIGN`:`EVENT VISUAL CASE`',
  ],
  [
    'e.id===`project-03`?(0,p.jsx)(ge,{}):e.prototype?',
    'e.id===`brand-design`?(0,p.jsx)(BrandCase,{}):e.id===`project-03`?(0,p.jsx)(ge,{}):e.prototype?',
  ],
  ['${e.id===`autumn-event`?`活动视觉项目`:e.title}', '${e.title}'],
  ['e.id===`autumn-event`?(0,p.jsxs)(p.Fragment,{children:[`活动视觉`,(0,p.jsx)(`br`,{}),`项目`]}):e.title', 'e.title'],
];

const updatedBundle = `import { createBrandCase } from "./brand-case.js${brandRevision}";\n` +
  replacements.reduce((source, [original, replacement]) => replaceOnce(source, original, replacement), baseBundle);

const brandCase = await readFile(join(root, 'brand-case.js'), 'utf8');
const updatedBrandCase = replaceOnce(brandCase, "'./brand-product-motion.js'", `'./brand-product-motion.js${brandRevision}'`);
const html = await readFile(join(root, 'index.html'), 'utf8');
const updatedHtml = replaceOnce(html, `/assets/${baseBundleName}`, `/assets/index-brand.js${brandRevision}`);
const styledHtml = replaceOnce(
  updatedHtml,
  '  </head>',
  `    <link rel="stylesheet" href="/assets/brand-case.css${brandRevision}" />\n    <link rel="stylesheet" href="/assets/brand-danmaku.css" />\n    <link rel="stylesheet" href="/assets/brand-product-motion.css${brandRevision}" />\n  </head>`,
);

await Promise.all([
  writeFile(join(output, 'assets', 'index-brand.js'), updatedBundle),
  writeFile(join(output, 'assets', 'brand-case.js'), updatedBrandCase),
  writeFile(join(output, 'index.html'), styledHtml),
  writeFile(join(output, '.nojekyll'), ''),
]);
