/* 数据完整性检查（对应 docs/24 §5 / P5）
   跑法：node tools/data-integrity.mjs
   做法：给 window/document 打桩，直接加载 mockups/org.js 的静态数据，检查合计与引用。
*/
import { readFileSync } from 'node:fs';

const errors = [];
const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;

// 打桩
globalThis.window = {};
globalThis.document = { querySelector: () => null };

const src = readFileSync(new URL('../mockups/org.js', import.meta.url), 'utf8');
// 用 Function 执行，避免 ESM 对全局 window 的绑定差异
new Function('window', 'document', src)(globalThis.window, globalThis.document);

const Org = globalThis.window.Org;
if (!Org) {
  console.error('org.js 未导出 window.Org');
  process.exit(1);
}

const sites = Org.sitesRes;
const depts = Org.deptData();
const mtfs = Org.mtfs;

// 1. 站点
if (sites.length !== 19) errors.push(`站点数 ${sites.length}，应为 19`);
const cap = sites.reduce((a, s) => a + s.cap, 0);
const capMax = sites.reduce((a, s) => a + s.capMax, 0);
const contam = sites.reduce((a, s) => a + s.contam, 0);
if (cap !== 28) errors.push(`容量合计 ${cap}，应为 28`);
if (capMax !== 48) errors.push(`容量上限合计 ${capMax}，应为 48`);
if (contam !== 8) errors.push(`污染合计 ${contam}，应为 8`);

// 2. 部门
if (depts.length !== 14) errors.push(`可培养部门 ${depts.length}，应为 14`);
const staff = depts.reduce((a, d) => a + d.staff, 0);
const dclass = depts.reduce((a, d) => a + d.dclass, 0);
const budget = depts.reduce((a, d) => a + d.budget, 0);
if (staff !== 84) errors.push(`编制合计 ${staff}，应为 84`);
if (dclass !== 1450) errors.push(`D 级合计 ${dclass}，应为 1450`);
if (!near(budget, 93.7)) errors.push(`预算合计 ${budget.toFixed(2)}，应为 93.7`);

// 3. 特遣队引用
const ids = new Set(Org.depts.map(d => d.id));
if (mtfs.length !== 15) errors.push(`特遣队 ${mtfs.length}，应为 15`);
for (const m of mtfs) {
  if (!ids.has(m.dept)) errors.push(`${m.name} 的 dept=${m.dept} 不存在`);
}

// 4. 站点引用
const siteIds = new Set(sites.map(s => s.id));
for (const d of Org.depts) {
  if (d.hq !== '—' && !siteIds.has(d.hq)) errors.push(`${d.name} 的驻地 ${d.hq} 不在站点表`);
}
for (const m of mtfs) {
  if (m.base !== '—' && !siteIds.has(m.base)) errors.push(`${m.name} 的基地 ${m.base} 不在站点表`);
}

console.log(`站点 ${sites.length}  容量 ${cap}/${capMax}  污染 ${contam}`);
console.log(`部门 ${depts.length}  编制 ${staff}  D级 ${dclass}  预算 ${budget.toFixed(1)}`);
console.log(`特遣队 ${mtfs.length}  引用 ${ids.size} 个部门`);

if (errors.length) {
  console.log('\n错误：');
  for (const e of errors) console.log('  ! ' + e);
  process.exit(1);
}
console.log('\nOK');
