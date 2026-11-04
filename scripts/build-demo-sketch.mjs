import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function loadZip() {
  try {
    return await import('@zip.js/zip.js');
  } catch {
    const candidates = [
      path.resolve(root, '../geek-design/node_modules/@zip.js/zip.js/index.js'),
      path.resolve(process.cwd(), 'node_modules/@zip.js/zip.js/index.js'),
    ];
    for (const candidate of candidates) {
      try {
        await access(candidate);
        return await import(pathToFileURL(candidate).href);
      } catch {
        /* try next */
      }
    }
    throw new Error('找不到 @zip.js/zip.js，请在主仓旁运行或先安装依赖');
  }
}
const { TextReader, Uint8ArrayWriter, ZipWriter } = await loadZip();

const pageId = 'page-mono';
const boardOverviewId = 'board-task-overview';
const boardProjectId = 'board-project-detail';

const purple = { red: 0.42, green: 0.345, blue: 0.757 }; // #6B58C1
const purpleSoft = { red: 0.933, green: 0.914, blue: 0.98 }; // #EEE9FA
const ink = { red: 0.18, green: 0.165, blue: 0.235 };
const muted = { red: 0.45, green: 0.43, blue: 0.5 };
const white = { red: 1, green: 1, blue: 1 };
const blueSoft = { red: 0.88, green: 0.93, blue: 1 };
const greenSoft = { red: 0.88, green: 0.96, blue: 0.91 };
const pageBg = { red: 0.965, green: 0.965, blue: 0.973 };

const rect = (id, name, frame, color, radius = 0, extra = {}) => ({
  _class: 'rectangle',
  do_objectID: id,
  name,
  frame: { _class: 'rect', constrainProportions: false, ...frame },
  isVisible: true,
  isLocked: false,
  fixedRadius: radius,
  points: [
    { _class: 'curvePoint', cornerRadius: radius, curveMode: 1, point: '{0, 0}' },
    { _class: 'curvePoint', cornerRadius: radius, curveMode: 1, point: '{1, 0}' },
    { _class: 'curvePoint', cornerRadius: radius, curveMode: 1, point: '{1, 1}' },
    { _class: 'curvePoint', cornerRadius: radius, curveMode: 1, point: '{0, 1}' },
  ],
  style: {
    _class: 'style',
    fills: [
      {
        _class: 'fill',
        isEnabled: true,
        fillType: 0,
        color: { _class: 'color', alpha: color.alpha ?? 1, ...color },
      },
    ],
    borders: [],
  },
  layers: [],
  ...extra,
});

const text = (id, name, frame, string, size, color = ink, weight = 'regular') => ({
  _class: 'text',
  do_objectID: id,
  name,
  frame: { _class: 'rect', constrainProportions: false, ...frame },
  isVisible: true,
  isLocked: false,
  attributedString: {
    _class: 'attributedString',
    string,
    attributes: [
      {
        location: 0,
        length: string.length,
        attributes: {
          MSAttributedStringFontAttribute: {
            _class: 'fontDescriptor',
            attributes: {
              name: weight === 'bold' ? 'Helvetica-Bold' : 'Helvetica',
              size,
            },
          },
          MSAttributedStringColorAttribute: { _class: 'color', alpha: 1, ...color },
        },
      },
    ],
  },
  style: { _class: 'style', fills: [], borders: [] },
  layers: [],
});

const group = (id, name, frame, layers) => ({
  _class: 'group',
  do_objectID: id,
  name,
  frame: { _class: 'rect', constrainProportions: false, ...frame },
  isVisible: true,
  layers,
});

const artboard = (id, name, frame, layers) => ({
  _class: 'artboard',
  do_objectID: id,
  name,
  frame: { _class: 'rect', constrainProportions: false, ...frame },
  isVisible: true,
  hasBackgroundColor: true,
  backgroundColor: { _class: 'color', alpha: 1, ...white },
  layers,
});

const page = (id, name, layers) => ({
  _class: 'page',
  do_objectID: id,
  name,
  frame: { _class: 'rect', constrainProportions: false, x: 0, y: 0, width: 0, height: 0 },
  isVisible: true,
  layers,
});

const taskRow = (id, y, label, iconColor) =>
  group(id, label, { x: 24, y, width: 312, height: 52 }, [
    rect(`${id}-icon`, '图标', { x: 0, y: 8, width: 36, height: 36 }, iconColor, 10),
    text(`${id}-label`, '标题', { x: 48, y: 16, width: 220, height: 22 }, label, 15, ink),
    rect(`${id}-chevron`, '箭头', { x: 296, y: 22, width: 8, height: 8 }, muted, 2),
  ]);

const tabItem = (id, x, label, active = false) =>
  group(id, label, { x, y: 10, width: 70, height: 44 }, [
    rect(
      `${id}-icon`,
      '图标',
      { x: 23, y: 2, width: 24, height: 24 },
      active ? purple : { red: 0.78, green: 0.76, blue: 0.82 },
      6,
    ),
    text(
      `${id}-label`,
      '标签',
      { x: 0, y: 28, width: 70, height: 16 },
      label,
      10,
      active ? purple : muted,
    ),
  ]);

const overviewBoard = artboard(boardOverviewId, '任务概览', { x: 0, y: 0, width: 360, height: 780 }, [
  rect('overview-bg', '背景', { x: 0, y: 0, width: 360, height: 780 }, pageBg),
  text('brand-mono', '品牌', { x: 24, y: 28, width: 120, height: 22 }, 'MONO', 13, muted, 'bold'),
  text('date-line', '日期', { x: 24, y: 58, width: 200, height: 20 }, '11月04日·星期三', 13, muted),
  text(
    'hero-title',
    '主标题',
    { x: 24, y: 92, width: 312, height: 36 },
    '每一天，都有新进展',
    26,
    ink,
    'bold',
  ),
  group('progress-card', '进度卡片', { x: 24, y: 148, width: 312, height: 120 }, [
    rect('progress-card-bg', '背景', { x: 0, y: 0, width: 312, height: 120 }, purpleSoft, 16),
    text('progress-label', '本周进度', { x: 20, y: 18, width: 100, height: 18 }, '本周进度', 13, purple),
    text('progress-ratio', '计数', { x: 20, y: 44, width: 160, height: 34 }, '12 / 16', 28, ink, 'bold'),
    text('progress-pct', '完成度', { x: 220, y: 52, width: 72, height: 20 }, '完成 75%', 13, purple),
    rect(
      'progress-track',
      '进度条底',
      { x: 20, y: 92, width: 272, height: 8 },
      { red: 0.86, green: 0.82, blue: 0.94 },
      4,
    ),
    rect('progress-fill', '进度条', { x: 20, y: 92, width: 204, height: 8 }, purple, 4),
  ]),
  text('tasks-heading', '今日任务', { x: 24, y: 292, width: 120, height: 22 }, '今日任务', 16, ink, 'bold'),
  taskRow('task-1', 326, '梳理设计规范', purpleSoft),
  taskRow('task-2', 386, '完成页面开发', blueSoft),
  taskRow('task-3', 446, '检查交付资源', greenSoft),
  group('tab-bar', '底部导航', { x: 0, y: 700, width: 360, height: 80 }, [
    rect('tab-bar-bg', '背景', { x: 0, y: 0, width: 360, height: 80 }, white),
    tabItem('tab-home', 12, '首页', true),
    tabItem('tab-project', 100, '项目'),
    tabItem('tab-message', 188, '消息'),
    tabItem('tab-me', 276, '我的'),
  ]),
]);

const projectBoard = artboard(boardProjectId, '项目详情', { x: 420, y: 0, width: 360, height: 780 }, [
  rect('project-bg', '背景', { x: 0, y: 0, width: 360, height: 780 }, pageBg),
  rect('project-banner', '横幅', { x: 24, y: 28, width: 312, height: 120 }, purple, 20),
  text(
    'banner-title',
    '横幅标题',
    { x: 48, y: 72, width: 264, height: 32 },
    '让协作更简单',
    24,
    white,
    'bold',
  ),
  group('plan-card', '改版计划', { x: 24, y: 172, width: 312, height: 110 }, [
    rect('plan-card-bg', '背景', { x: 0, y: 0, width: 312, height: 110 }, white, 16),
    text(
      'plan-title',
      '标题',
      { x: 20, y: 20, width: 200, height: 24 },
      '界面改版计划',
      17,
      ink,
      'bold',
    ),
    text('plan-status', '状态', { x: 20, y: 52, width: 80, height: 18 }, '进行中', 13, purple),
    text('plan-date', '日期', { x: 20, y: 76, width: 200, height: 18 }, '目标 11月20日', 13, muted),
  ]),
  group('milestone-card', '里程碑', { x: 24, y: 302, width: 312, height: 260 }, [
    rect('milestone-bg', '背景', { x: 0, y: 0, width: 312, height: 260 }, white, 16),
    text('milestone-title', '标题', { x: 20, y: 18, width: 160, height: 22 }, '项目节点', 16, ink, 'bold'),
    rect('timeline-line', '时间线', { x: 31, y: 58, width: 2, height: 160 }, purpleSoft),
    rect('dot-1', '节点', { x: 26, y: 56, width: 12, height: 12 }, purple, 6),
    text('ms-1', '需求与原型确认', { x: 52, y: 52, width: 220, height: 20 }, '需求与原型确认', 14, ink),
    text('ms-1-state', '已完成', { x: 52, y: 74, width: 80, height: 16 }, '已完成', 12, muted),
    rect('dot-2', '节点', { x: 26, y: 112, width: 12, height: 12 }, purple, 6),
    text('ms-2', '视觉设计与交付', { x: 52, y: 108, width: 220, height: 20 }, '视觉设计与交付', 14, ink),
    text('ms-2-state', '已完成', { x: 52, y: 130, width: 80, height: 16 }, '已完成', 12, muted),
    rect('dot-3', '节点', { x: 26, y: 168, width: 12, height: 12 }, purple, 6),
    text(
      'ms-3',
      '开发与体验验收',
      { x: 52, y: 164, width: 220, height: 20 },
      '开发与体验验收',
      14,
      ink,
    ),
    text('ms-3-state', '进行中', { x: 52, y: 186, width: 80, height: 16 }, '进行中', 12, purple),
  ]),
  group('cta', '查看项目文件', { x: 24, y: 592, width: 312, height: 52 }, [
    rect('cta-bg', '按钮', { x: 0, y: 0, width: 312, height: 52 }, purple, 14),
    text(
      'cta-label',
      '文案',
      { x: 0, y: 15, width: 312, height: 24 },
      '查看项目文件',
      16,
      white,
      'bold',
    ),
  ]),
]);

const files = {
  'meta.json': {
    commit: 'geekdesign-demo',
    appVersion: '99.0',
    build: 1,
    app: 'com.geekdesign.demo',
    pagesAndArtboards: {
      [pageId]: {
        name: 'MONO',
        artboards: {
          [boardOverviewId]: { name: '任务概览' },
          [boardProjectId]: { name: '项目详情' },
        },
      },
    },
    fonts: ['Helvetica', 'Helvetica-Bold'],
    version: 136,
    compatibilityVersion: 99,
  },
  'document.json': {
    _class: 'document',
    do_objectID: 'demo-document',
    assets: { _class: 'assetCollection', colorAssets: [], gradientAssets: [], images: [] },
    currentPageIndex: 0,
    foreignSymbols: [],
    layerStyles: { _class: 'sharedStyleContainer', objects: [] },
    layerTextStyles: { _class: 'sharedTextStyleContainer', objects: [] },
    layerSymbols: { _class: 'symbolContainer', objects: [] },
    pages: [
      { _class: 'MSJSONFileReference', _ref_class: 'MSImmutablePage', _ref: `pages/${pageId}` },
    ],
  },
  'user.json': {
    [pageId]: { scrollOrigin: '{0, 0}', zoomValue: 1 },
  },
  [`pages/${pageId}.json`]: page(pageId, 'MONO', [overviewBoard, projectBoard]),
};

const outDir = path.join(root, 'examples');
await mkdir(outDir, { recursive: true });
const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false });
for (const [file, data] of Object.entries(files))
  await writer.add(file, new TextReader(JSON.stringify(data)));
const bytes = await writer.close();
const target = path.join(outDir, 'geekdesign-demo.sketch');
await writeFile(target, Buffer.from(bytes));
console.log(`Wrote ${path.relative(process.cwd(), target)} (${bytes.length} bytes)`);
