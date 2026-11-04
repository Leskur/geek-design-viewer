import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextReader, Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';

const pageId = 'demo-page-overview';
const pageInspectId = 'demo-page-inspect';
const boardHeroId = 'demo-board-hero';
const boardCardId = 'demo-board-card';
const boardInspectId = 'demo-board-inspect';

const rect = (id, name, frame, color, radius = 0) => ({
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
        color: {
          _class: 'color',
          alpha: color.alpha ?? 1,
          red: color.red,
          green: color.green,
          blue: color.blue,
        },
      },
    ],
    borders: [],
  },
  layers: [],
});

const text = (
  id,
  name,
  frame,
  string,
  size = 16,
  color = { red: 0.18, green: 0.17, blue: 0.24 },
) => ({
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
            attributes: { name: 'Helvetica', size },
          },
          MSAttributedStringColorAttribute: {
            _class: 'color',
            alpha: 1,
            red: color.red,
            green: color.green,
            blue: color.blue,
          },
        },
      },
    ],
  },
  style: { _class: 'style', fills: [], borders: [] },
  layers: [],
});

const artboard = (id, name, frame, layers) => ({
  _class: 'artboard',
  do_objectID: id,
  name,
  frame: { _class: 'rect', constrainProportions: false, ...frame },
  isVisible: true,
  hasBackgroundColor: true,
  backgroundColor: { _class: 'color', alpha: 1, red: 1, green: 1, blue: 1 },
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

const files = {
  'meta.json': {
    commit: 'geekdesign-demo',
    appVersion: '99.0',
    build: 1,
    app: 'com.geekdesign.demo',
    pagesAndArtboards: {
      [pageId]: {
        name: 'Overview',
        artboards: {
          [boardHeroId]: { name: 'Hero' },
          [boardCardId]: { name: 'Card' },
        },
      },
      [pageInspectId]: {
        name: 'Inspect',
        artboards: {
          [boardInspectId]: { name: 'Inspector Demo' },
        },
      },
    },
    fonts: ['Helvetica'],
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
      {
        _class: 'MSJSONFileReference',
        _ref_class: 'MSImmutablePage',
        _ref: `pages/${pageInspectId}`,
      },
    ],
  },
  'user.json': {
    [pageId]: { scrollOrigin: '{0, 0}', zoomValue: 1 },
    [pageInspectId]: { scrollOrigin: '{0, 0}', zoomValue: 1 },
  },
  [`pages/${pageId}.json`]: page(pageId, 'Overview', [
    artboard(boardHeroId, 'Hero', { x: 0, y: 0, width: 390, height: 640 }, [
      rect(
        'hero-bg',
        'Background',
        { x: 0, y: 0, width: 390, height: 640 },
        {
          red: 0.97,
          green: 0.96,
          blue: 0.99,
        },
      ),
      rect(
        'hero-panel',
        'Panel',
        { x: 24, y: 80, width: 342, height: 220 },
        {
          red: 0.44,
          green: 0.33,
          blue: 0.85,
        },
        18,
      ),
      text(
        'hero-title',
        'Title',
        { x: 48, y: 120, width: 294, height: 40 },
        'GeekDesign Demo',
        28,
        { red: 1, green: 1, blue: 1 },
      ),
      text(
        'hero-body',
        'Body',
        { x: 48, y: 172, width: 294, height: 60 },
        'Open this file to try pages, layers, and CSS inspection.',
        15,
        { red: 0.92, green: 0.9, blue: 1 },
      ),
    ]),
    artboard(boardCardId, 'Card', { x: 450, y: 0, width: 320, height: 220 }, [
      rect(
        'card-bg',
        'Card Background',
        { x: 0, y: 0, width: 320, height: 220 },
        {
          red: 1,
          green: 1,
          blue: 1,
        },
        16,
      ),
      rect(
        'card-accent',
        'Accent',
        { x: 24, y: 24, width: 56, height: 56 },
        {
          red: 0.98,
          green: 0.76,
          blue: 0.35,
        },
        12,
      ),
      text('card-title', 'Card Title', { x: 96, y: 32, width: 180, height: 24 }, 'Sample Card', 18),
      text(
        'card-copy',
        'Card Copy',
        { x: 24, y: 100, width: 272, height: 72 },
        'A small artboard for checking layout, text, and export.',
        14,
        { red: 0.4, green: 0.38, blue: 0.45 },
      ),
    ]),
  ]),
  [`pages/${pageInspectId}.json`]: page(pageInspectId, 'Inspect', [
    artboard(boardInspectId, 'Inspector Demo', { x: 0, y: 0, width: 375, height: 500 }, [
      rect(
        'inspect-bg',
        'Background',
        { x: 0, y: 0, width: 375, height: 500 },
        {
          red: 0.95,
          green: 0.95,
          blue: 0.97,
        },
      ),
      rect(
        'inspect-box',
        'Primary Button',
        { x: 32, y: 180, width: 311, height: 48 },
        {
          red: 0.44,
          green: 0.33,
          blue: 0.85,
        },
        12,
      ),
      text(
        'inspect-label',
        'Button Label',
        { x: 32, y: 192, width: 311, height: 24 },
        'Continue',
        16,
        { red: 1, green: 1, blue: 1 },
      ),
      text(
        'inspect-hint',
        'Hint',
        { x: 32, y: 250, width: 311, height: 40 },
        'Select layers on the left to inspect CSS.',
        13,
        { red: 0.45, green: 0.43, blue: 0.5 },
      ),
    ]),
  ]),
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'examples');
await mkdir(outDir, { recursive: true });
const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false });
for (const [file, data] of Object.entries(files))
  await writer.add(file, new TextReader(JSON.stringify(data)));
const bytes = await writer.close();
const target = path.join(outDir, 'geekdesign-demo.sketch');
await writeFile(target, Buffer.from(bytes));
console.log(`Wrote ${path.relative(process.cwd(), target)} (${bytes.length} bytes)`);
