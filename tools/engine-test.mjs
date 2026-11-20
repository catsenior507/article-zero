/* 引擎测试（Node，无浏览器）
   跑法：node tools/engine-test.mjs
   这是"后端版本"的验收：不点界面，直接驱动 engine.js。
*/
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const Engine = require('../mockups/engine.js');

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

const e = Engine.create({ start: '2026-11-20', turns: 54, msPerDay: 400 });

console.log('engine: ' + e.start + ' → ' + e.turns + ' 回合, ' + e.msPerDay + 'ms/日');

t('初始日期 2026-11-20，暂停，第 1 回合', () => {
  const s = e.state();
  assert.equal(s.iso, '2026-11-20');
  assert.equal(s.day, 0);
  assert.equal(s.speed, 0);
  assert.equal(s.term, 1);
  assert.equal(s.monthIndex, 0);
});

t('暂停时 tick 不推进', () => {
  e.tick(5000);
  assert.equal(e.state().iso, '2026-11-20');
});

t('1× 下 400ms = 1 天', () => {
  e.setSpeed(1);
  e.tick(400);
  assert.equal(e.state().iso, '2026-11-21');
  e.tick(400);
  e.tick(400);
  assert.equal(e.state().iso, '2026-11-23');
});

t('跨月：11-30 → 12-01，回合 +1', () => {
  e.setSpeed(0);
  e.advanceDays(7);
  assert.equal(e.state().iso, '2026-11-30');
  e.advanceDays(1);
  const s = e.state();
  assert.equal(s.iso, '2026-12-01');
  assert.equal(s.monthIndex, 1);
  assert.equal(s.term, 2);
});

t('跳日期：2027-01-01 是第 42 天', () => {
  e.setDate('2027-01-01');
  const s = e.state();
  assert.equal(s.day, 42);
  assert.equal(s.monthIndex, 2);
  assert.equal(s.term, 3);
});

t('跨年：2027-11-20 → 第 13 回合', () => {
  e.setDate('2027-11-20');
  assert.equal(e.state().monthIndex, 12);
  assert.equal(e.state().term, 13);
});

t('手动触发事件进入待决', () => {
  e.reset();
  e.trigger('d01');
  assert.deepEqual(e.state().pending, ['d01']);
});

t('日程事件到期自动触发', () => {
  const at = e.schedule('p01', 3);
  assert.equal(at, 3);
  assert.equal(e.state().nextEvent.inDays, 3);
  e.advanceDays(3);
  assert.deepEqual(e.state().pending, ['d01', 'p01']);
  assert.equal(e.state().nextEvent, null);
});

t('跳到未来会结算逾期日程', () => {
  e.reset();
  e.schedule('k01', 10);
  e.setDate('2026-12-05');          // 第 15 天，已越过第 10 天
  assert.deepEqual(e.state().pending, ['k01']);
});

t('重置回开局', () => {
  e.reset();
  const s = e.state();
  assert.equal(s.iso, '2026-11-20');
  assert.equal(s.speed, 0);
  assert.equal(s.pending.length, 0);
  assert.equal(s.scheduled.length, 0);
});

t('月末（12-31 + 1 天 = 次年 01-01）', () => {
  e.setDate('2026-12-31');
  e.advanceDays(1);
  assert.equal(e.state().iso, '2027-01-01');
});

t('4× 速度按倍率推进', () => {
  e.reset();
  e.setSpeed(4);
  e.tick(400);            // 4× → 4 天
  assert.equal(e.state().iso, '2026-11-24');
});

t('无效速度归零', () => {
  e.setSpeed(3);
  assert.equal(e.state().speed, 0);
  e.setSpeed(0);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
