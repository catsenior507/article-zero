import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('./out/dept-list.html', import.meta.url), 'utf8');

function clean(s) {
  return String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

// 分区标题（折叠块）
const sections = [];
const secRe = /<a class="collapsible-block-link"[^>]*>([^<]+)<\/a>/g;
let m;
while ((m = secRe.exec(html))) sections.push({ at: m.index, title: clean(m[1]) });

function sectionAt(idx) {
  let title = '';
  for (const s of sections) if (s.at < idx) title = s.title;
  return title;
}

const rows = [];
const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/g;
let tm;
while ((tm = tableRe.exec(html))) {
  const table = tm[1];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let rm;
  while ((rm = rowRe.exec(table))) {
    const cells = [];
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g;
    let cm;
    while ((cm = cellRe.exec(rm[1]))) cells.push(clean(cm[1]));
    if (cells.length >= 2 && cells[0]) {
      rows.push({
        section: sectionAt(tm.index),
        name: cells[0],
        desc: cells[2] || '',
        belong: cells[3] || ''
      });
    }
  }
}

// 去重（同名保留第一条有描述的）
const map = new Map();
for (const r of rows) {
  if (!map.has(r.name) || (!map.get(r.name).desc && r.desc)) map.set(r.name, r);
}
const list = [...map.values()];

// 过滤表头/空行
const cleaned = list.filter(r => r.name && !/^部门$/.test(r.name) && r.name !== '部门名称' && r.name.length <= 30);

writeFileSync(new URL('./out/departments-full.json', import.meta.url),
  JSON.stringify(cleaned, null, 2), 'utf8');

console.log('分区：' + [...new Set(cleaned.map(r => r.section))].join(' / '));
console.log('条目：' + cleaned.length);
for (const r of cleaned.slice(0, 12)) console.log(' - ' + r.name + ' | ' + r.section + ' | ' + r.desc.slice(0, 40));

// 与现有 17 个部门比对
const ours = ['站点运营', '逆模因', '超形上学', '数学', '时间异常', '战术神学', '误传', 'RAISA',
  '采购与清算', '炼金', '删除', '延续', '废除', 'AEED', '神秘动物', 'AIAD', '末日'];
const fresh = cleaned.filter(r => !ours.some(o => r.name.includes(o)));
console.log('\n新条目（不在现有 17 个里）：' + fresh.length);
for (const r of fresh) console.log(' + ' + r.name + ' | ' + r.section + ' | ' + r.desc.slice(0, 46));
