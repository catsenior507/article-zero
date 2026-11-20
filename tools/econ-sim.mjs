/* 《第零条》十年经济模拟（纯后端，无 DOM）
   跑法：node tools/econ-sim.mjs
   模型：docs/14 财政 + docs/15 物价 + docs/16/17 区域经济。
   目的：看这套设计在 120 个月里会不会崩、崩在哪、哪种策略能活。

   判定规则（与游戏一致）：
   - 现金 < 0 自动发债，利率 2%/月，上限 150；
   - 债务触顶且现金为负，连续 3 个月 → 接管，模拟终止；
   - 帷幕 ≤ 0 → 破幕，模拟终止。
*/
import { writeFileSync, mkdirSync } from 'node:fs';

/* ---------- 随机数：确定性 ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(20261120);
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---------- 区域初值（docs/17 §2） ---------- */
const REGION_DEF = {
  na: { gdp: 65000, wage: 50.8, elec: 8.51, ci: 1.00, urban: .83, gini: .41, unemp: .04, inf: .08,
        sectors: { agri: .02, extract: .02, heavy: .08, light: .05, services: .75, finance: .05, tech: .03 },
        tensions: { class: .45, ethnic: .35, religion: .18, regional: .18, generation: .22 } },
  eu: { gdp: 55000, wage: 55.0, elec: 17.0, ci: 1.24, urban: .76, gini: .32, unemp: .06, inf: .12,
        sectors: { agri: .04, extract: .01, heavy: .10, light: .08, services: .70, finance: .05, tech: .02 },
        tensions: { class: .35, ethnic: .30, religion: .20, regional: .35, generation: .28 } },
  as: { gdp: 13000, wage: 12.0, elec: 9.0, ci: .55, urban: .55, gini: .42, unemp: .05, inf: .55,
        sectors: { agri: .25, extract: .06, heavy: .12, light: .14, services: .40, finance: .02, tech: .01 },
        tensions: { class: .55, ethnic: .50, religion: .45, regional: .30, generation: .35 } },
  sa: { gdp: 9000, wage: 8.0, elec: 12.0, ci: .50, urban: .81, gini: .47, unemp: .09, inf: .45,
        sectors: { agri: .15, extract: .08, heavy: .10, light: .10, services: .52, finance: .03, tech: .02 },
        tensions: { class: .60, ethnic: .30, religion: .25, regional: .30, generation: .35 } },
  af: { gdp: 2000, wage: 3.0, elec: 14.0, ci: .45, urban: .45, gini: .43, unemp: .08, inf: .80,
        sectors: { agri: .50, extract: .12, heavy: .05, light: .05, services: .27, finance: .005, tech: .005 },
        tensions: { class: .55, ethnic: .60, religion: .55, regional: .45, generation: .40 } },
  oc: { gdp: 60000, wage: 52.0, elec: 12.0, ci: 1.10, urban: .87, gini: .35, unemp: .04, inf: .10,
        sectors: { agri: .03, extract: .08, heavy: .06, light: .05, services: .73, finance: .03, tech: .02 },
        tensions: { class: .30, ethnic: .25, religion: .12, regional: .20, generation: .20 } },
  an: { gdp: 6500, wage: 120, elec: 40.0, ci: 3.00, urban: .01, gini: .30, unemp: .02, inf: .02,
        sectors: { agri: 0, extract: 0, heavy: 0, light: 0, services: .8, finance: 0, tech: .2 },
        tensions: { class: .05, ethnic: 0, religion: 0, regional: 0, generation: .10 } }
};

const SITE_COUNT = { na: 4, eu: 4, as: 5, sa: 2, af: 2, oc: 1, an: 1 };
const SIGMA = { gdp: .008, wage: .010, elec: .030, ci: .015, urban: .002,
                gini: .005, unemp: .050, inf: .020, tension: .030 };
const GROWTH = { na: .0012, eu: .0010, as: .0025, sa: .0022, af: .0022, oc: .0010, an: .0005 };
const clone = o => JSON.parse(JSON.stringify(o));

function makeRegions() {
  const out = {};
  for (const k of Object.keys(REGION_DEF)) {
    out[k] = { core: clone(REGION_DEF[k]), value: clone(REGION_DEF[k]), sigma: { ...SIGMA }, derived: null };
  }
  return out;
}
function tensionOf(v) {
  const t = v.tensions;
  return .30 * t.class + .25 * t.ethnic + .15 * t.religion + .20 * t.regional + .10 * t.generation;
}
function derive(r) {
  const v = r.value, ten = tensionOf(v);
  return {
    labor: Math.max(.2, .2 + .8 * (v.wage / 50.8)),
    energy: Math.max(.5, v.elec / 8.51),
    construction: v.ci,
    media: .4 + .6 * Math.sqrt(v.gdp / 65000) * v.urban,
    security: .5 + .5 * Math.sqrt(v.gdp / 65000) + .4 * ten,
    corruption: Math.min(.9, .03 + .5 * v.inf + .15 * ten),
    stability: Math.max(.1, Math.min(.99, .98 - .3 * ten - .25 * v.unemp - .25 * v.inf)),
    tension: ten
  };
}

function drift(regions, month, policy) {
  for (const k of Object.keys(regions)) {
    const r = regions[k], c = r.core, v = r.value, s = r.sigma;
    c.gdp *= 1 + GROWTH[k];
    c.wage *= 1 + GROWTH[k] * .8;
    c.elec *= 1.002;
    c.ci *= 1.0015;
    c.urban = Math.min(.98, c.urban + .0003);
    if (policy.dev && month >= 12 && (k === 'as' || k === 'sa' || k === 'af')) {
      c.gdp *= 1.004; c.wage *= 1.003; c.unemp = Math.max(.02, c.unemp - .0008);
      c.tensions.class = Math.max(0, c.tensions.class - .002);
      c.inf = Math.max(.05, c.inf - .001);
    }
    const step = (key, sig) => {
      v[key] = v[key] + .5 * (c[key] - v[key]) + c[key] * gauss() * sig;
      v[key] = Math.max(c[key] * .8, Math.min(c[key] * 1.2, v[key]));
    };
    step('gdp', s.gdp); step('wage', s.wage); step('elec', s.elec);
    step('ci', s.ci); step('urban', s.urban); step('gini', s.gini);
    step('unemp', s.unemp); step('inf', s.inf);
    for (const t of Object.keys(v.tensions)) {
      v.tensions[t] = v.tensions[t] + .5 * (c.tensions[t] - v.tensions[t]) + gauss() * s.tension;
      v.tensions[t] = Math.max(0, Math.min(1, v.tensions[t]));
    }
    if (rnd() < .02) {
      const e = rnd();
      if (e < .35) { c.gdp *= .88; c.ci *= 1.15; v.tensions.class = Math.min(1, v.tensions.class + .06); }
      else if (e < .60) { c.gdp *= 1.05; }
      else if (e < .85) { c.gini = Math.min(.7, c.gini + .03); c.unemp = Math.min(.4, c.unemp + .02); }
      else { c.elec *= 1.12; }
    }
    r.derived = derive(r);
  }
}

const START = { cash: 120, debt: 0, veil: 78, consensus: 55, exposure: 0 };

function monthly(policy, state, regions, month) {
  let gdpIdx = 0, gdp0 = 0, wsum = 0;
  for (const k of Object.keys(regions)) {
    gdpIdx += regions[k].value.gdp * SITE_COUNT[k];
    gdp0 += REGION_DEF[k].gdp * SITE_COUNT[k];
    wsum += SITE_COUNT[k];
  }
  gdpIdx /= wsum; gdp0 /= wsum;

  const stateBase = 40 + .3 * state.veil + .15 * state.consensus;
  let income = stateBase * Math.pow(gdpIdx / gdp0, .4);
  income += 14.4 * Math.pow(regions.na.value.gdp / REGION_DEF.na.gdp, .6);
  if (policy.monetize && month >= 24 && month < 60) income += 24;

  let personnel = 0, facility = 0, veil = 0, consumption = 0;
  for (const k of Object.keys(regions)) {
    const d = regions[k].derived, n = SITE_COUNT[k];
    personnel += n * 0.9 * d.labor * (1 + d.corruption * .2);
    facility += n * 1.275 * (0.6 * d.construction + 0.4 * d.energy);
    veil += n * 0.55 * d.media * (1 + d.corruption);
    consumption += n * 0.15 * Math.sqrt(regions[k].value.gdp / 65000);
  }
  personnel += 3.2 * regions.na.derived.labor;
  veil += 5.4 * Math.pow(regions.eu.value.gdp / 55000, .4);
  const action = 6.0 * (0.5 * regions.na.derived.labor + 0.5 * regions.na.derived.security);
  const research = 22.0 * Math.pow((regions.na.derived.labor + regions.eu.derived.labor) / 2, .7);
  const misc = 4.0;

  let expense = personnel + facility + consumption + veil + action + research + misc;
  if (policy.austerity && month >= 12) expense *= .86;
  if (policy.dev && month >= 12) expense += 1.5;

  const net = income - expense;
  state.cash += net;
  if (state.cash < 0) { state.debt += -state.cash; state.cash = 0; }
  state.debt *= 1.02;
  if (state.cash > 30 && state.debt > 0) {
    const pay = Math.min(state.cash - 30, state.debt);
    state.cash -= pay; state.debt -= pay;
  }

  if (policy.monetize && month >= 24 && month < 60) { state.veil -= 1.2; state.exposure += 3; }
  if (state.exposure >= 100) { state.exposure = 0; state.veil -= 12; }
  state.veil = Math.max(0, Math.min(100, state.veil));

  return { income, expense, net, personnel, facility, consumption, veilCost: veil, action, research, misc };
}

function run(policy, label) {
  rnd = mulberry32(20261120);
  const regions = makeRegions();
  const state = { ...START };
  for (const k of Object.keys(regions)) regions[k].derived = derive(regions[k]);

  const years = [];
  let badMonths = 0, end = null, first = null;
  for (let m = 0; m < 120; m++) {
    drift(regions, m, policy);
    const r = monthly(policy, state, regions, m);
    if (!first) first = r;
    if (state.debt >= 150 && state.cash <= 0) badMonths++; else badMonths = 0;
    if (badMonths >= 3) { end = { month: m, kind: '被接管' }; break; }
    if (state.veil <= 0) { end = { month: m, kind: '破幕' }; break; }
    if (m % 12 === 11) {
      years.push({ year: Math.floor(m / 12) + 1, cash: state.cash, debt: state.debt, veil: state.veil,
                   income: r.income, expense: r.expense, net: r.net });
    }
  }
  return { label, years, state, end, first };
}

/* ---------- 场景 ---------- */
const scenarios = [
  { label: 'A 被动：什么都不做', policy: {} },
  { label: 'B 紧缩：第 2 年起砍 14% 开支', policy: { austerity: true } },
  { label: 'C 紧缩 + 发展援助（亚/南美/非）', policy: { austerity: true, dev: true } },
  { label: 'D 紧缩 + 异常变现（第 3–5 年）', policy: { austerity: true, monetize: true } }
];

console.log('《第零条》十年经济模拟 · 120 个月 · 单次确定性运行\n');
const results = [];
for (const sc of scenarios) {
  const r = run(sc.policy, sc.label);
  results.push(r);
  console.log(`\n=== ${sc.label} ===`);
  console.log('年  现金    债务   收入    支出    净额   帷幕');
  for (const y of r.years) {
    console.log(
      String(y.year).padStart(2) + '  ' +
      y.cash.toFixed(1).padStart(6) + '  ' +
      y.debt.toFixed(1).padStart(6) + '  ' +
      y.income.toFixed(1).padStart(6) + '  ' +
      y.expense.toFixed(1).padStart(6) + '  ' +
      (y.net >= 0 ? '+' : '') + y.net.toFixed(1).padStart(5) + '  ' +
      y.veil.toFixed(0).padStart(3));
  }
  if (r.end) console.log(`** 第 ${r.end.month} 月${r.end.kind}，模拟终止 **`);
  else console.log(`十年结束：现金 ${r.state.cash.toFixed(1)} / 债务 ${r.state.debt.toFixed(1)} / 帷幕 ${r.state.veil.toFixed(0)}`);
}

/* ---------- 成本结构与判定 ---------- */
const f = results[0].first;
console.log('\n开局月成本结构：');
console.log('  人事 ' + f.personnel.toFixed(1) + '  设施 ' + f.facility.toFixed(1) +
  '  消费 ' + f.consumption.toFixed(1) + '  帷幕 ' + f.veilCost.toFixed(1) +
  '  行动 ' + f.action.toFixed(1) + '  科研 ' + f.research.toFixed(1) + '  杂项 ' + f.misc.toFixed(1));

console.log('\n--- 判定 ---');
const verdict = r => r.end ? `第 ${r.end.month} 月${r.end.kind}` : '撑到第 120 月';
for (const r of results) console.log(`${r.label}：${verdict(r)}`);

const a = results[0], last = a.years[a.years.length - 1];
if (last) {
  console.log(`\nA 的年支出从 ${a.first.expense.toFixed(1)} 涨到 ${last.expense.toFixed(1)}` +
    `（+${((last.expense / a.first.expense - 1) * 100).toFixed(0)}%），` +
    `收入从 ${a.first.income.toFixed(1)} 涨到 ${last.income.toFixed(1)}`);
}

/* ---------- 导出 ---------- */
mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
writeFileSync(new URL('./out/econ-10y.json', import.meta.url),
  JSON.stringify(results.map(r => ({ label: r.label, years: r.years, end: r.end })), null, 2));
console.log('\n数据已写入 tools/out/econ-10y.json');
