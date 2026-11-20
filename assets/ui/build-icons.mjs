#!/usr/bin/env node
/* 由 assets/ui/*.svg 母版生成 assets/icons.js 里的 frame-* symbol。
 *
 * 母版是唯一真源：改形状只改 .svg，然后 `node assets/ui/build-icons.mjs`。
 * 之前文件与 sprite 各写一份，尺寸已经漂过一次（76×26 vs 76×28），故改为生成。
 *
 * 规则：
 *   - 去掉母版里那层深色底 <rect fill="#0A0D10">
 *   - 去掉固定 width/height，只留 viewBox
 *   - 预览色（琥珀/钢灰）换成 currentColor，跟随四套主题
 *   - #fff / #000 原样保留（做法：保留字面白/黑，供各主题共用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const iconsPath = path.join(here, '..', 'icons.js');
const svgPath = path.join(here, '..', 'icons.svg');
const START = '<!-- frames:start -->';
const END = '<!-- frames:end -->';

const MAP = [
  ['btn-alert.svg', 'frame-abtn'],
  ['btn-action.svg', 'frame-btn'],
  ['btn-door.svg', 'frame-door'],
  ['btn-rail.svg', 'frame-rail'],
  ['btn-mode.svg', 'frame-mode'],
  ['btn-gear.svg', 'frame-gear'],
  ['btn-stamp.svg', 'frame-stamp'],
  ['card-event.svg', 'frame-card'],
  ['tab.svg', 'frame-tab'],
];

const PREVIEW_COLOR = /#(D6A24A|8A97A3)/gi;

function toSymbol(file, id) {
  let src = fs.readFileSync(path.join(here, file), 'utf8');
  const viewBox = (src.match(/viewBox="([^"]+)"/) || [])[1];
  if (!viewBox) throw new Error(`${file}: 缺少 viewBox`);

  const inner = src
    .slice(src.indexOf('>', src.search(/<svg[^>]*>/)) + 1, src.lastIndexOf('</svg>'))
    .replace(/^\s*<rect[^>]*fill="#0A0D10"[^>]*\/>\s*$/m, '')
    .replace(PREVIEW_COLOR, 'currentColor')
    .trim()
    .split('\n')
    .map((line) => (line.trim() ? '    ' + line.trim() : ''))
    .join('\n');

  return `  <symbol id="${id}" viewBox="${viewBox}">\n${inner}\n  </symbol>`;
}

const block = MAP.map(([file, id]) => toSymbol(file, id)).join('\n');

let js = fs.readFileSync(iconsPath, 'utf8');
const a = js.indexOf(START);
const b = js.indexOf(END);
if (a < 0 || b < 0) throw new Error('icons.js 里找不到 frames:start / frames:end 标记');

js = js.slice(0, a + START.length) + '\n' + block + '\n  ' + js.slice(b);
fs.writeFileSync(iconsPath, js);

/* icons.svg 曾经是第三份手抄副本，会和 icons.js 漂移。现在整份由 icons.js 生成：
   两条路都只认 assets/ui/*.svg（控件）+ icons.js 里的 i-* （线性图标）。 */
const open = js.match(/<svg class="sprites"[^>]*>/)[0];
const rootAttrs = open
  .replace('<svg class="sprites" ', '<svg ')
  .replace(/>$/, '>');
const body = js.slice(js.indexOf(open) + open.length, js.lastIndexOf('</svg>'));
fs.writeFileSync(svgPath, `${rootAttrs}\n${body}</svg>\n`);

console.log(`frame-* symbol 已从母版重建：${MAP.map(([, id]) => id).join(' ')}`);
console.log('icons.js 与 icons.svg 已同步');
