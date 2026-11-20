/* 任务树检查器
   跑法：node tools/tasks-check.mjs
   检查：id 唯一、状态/角色合法、依赖存在、无循环；并列出当前可并行领取的任务。
*/
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'tasks.json'), 'utf8'));

const errors = [];
const nodes = [];

function walk(list, parent) {
  for (const n of list) {
    nodes.push({ ...n, parent });
    if (n.children) walk(n.children, n.id);
  }
}
walk(data.tree, null);

const byId = new Map();
for (const n of nodes) {
  if (!n.id) { errors.push('节点缺少 id: ' + (n.title || '?')); continue; }
  if (byId.has(n.id)) errors.push('重复 id: ' + n.id);
  byId.set(n.id, n);
  if (!/^M\d+(\.\d+)?$/.test(n.id)) errors.push(`${n.id}: id 格式应为 M0 / M1.2`);
}

const statuses = new Set(data.meta.statuses);
const roles = new Set(data.roles.map(r => r.id));

for (const n of nodes) {
  if (n.status && !statuses.has(n.status)) errors.push(`${n.id}: 非法状态 ${n.status}`);
  if (n.owner && !roles.has(n.owner)) errors.push(`${n.id}: 未知 owner ${n.owner}`);
  for (const d of n.deps || []) {
    if (d === n.id) errors.push(`${n.id}: 依赖自己`);
    if (!byId.has(d)) errors.push(`${n.id}: 依赖不存在 ${d}`);
  }
}

// 循环依赖
const mark = new Map();
function visit(id, stack) {
  if (mark.get(id) === 2) return;
  if (mark.get(id) === 1) {
    const at = stack.indexOf(id);
    errors.push('循环依赖: ' + stack.slice(at).concat(id).join(' → '));
    return;
  }
  mark.set(id, 1);
  for (const d of byId.get(id).deps || []) if (byId.has(d)) visit(d, stack.concat(id));
  mark.set(id, 2);
}
for (const n of nodes) visit(n.id, []);

const leaves = nodes.filter(n => !(n.children && n.children.length));
const ready = leaves.filter(n =>
  n.status === 'todo' && (n.deps || []).every(d => byId.get(d) && byId.get(d).status === 'done'));
const waiting = leaves.filter(n =>
  n.status === 'todo' && (n.deps || []).some(d => byId.get(d) && byId.get(d).status !== 'done'));

const counts = {};
for (const n of nodes) counts[n.status || '未标'] = (counts[n.status || '未标'] || 0) + 1;

console.log(`节点 ${nodes.length} 个（叶子 ${leaves.length}）  状态 ${JSON.stringify(counts)}`);

if (ready.length) {
  console.log('\n可并行领取：');
  for (const n of ready) console.log(`  ${n.id.padEnd(5)} ${n.title}  [${n.owner || '未分配'}]  prio ${n.prio || '-'}`);
}
if (waiting.length) {
  console.log('\n等待依赖：');
  for (const n of waiting.slice(0, 10)) {
    console.log(`  ${n.id.padEnd(5)} ${n.title}  ← ${(n.deps || []).join(', ')}`);
  }
}
const unowned = leaves.filter(n => !n.owner && n.status !== 'done');
if (unowned.length) console.log(`\n未分配 owner：${unowned.map(n => n.id).join(', ')}`);

if (errors.length) {
  console.log('\n错误：');
  for (const e of errors) console.log('  ! ' + e);
  process.exit(1);
}
console.log('\nOK');
