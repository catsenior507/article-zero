/* 《第零条》时间与事件引擎
   ------------------------------------------------------------------
   纯逻辑，不碰 DOM。浏览器与 Node 共用同一份：
     浏览器  <script src="engine.js"></script>  → window.Engine
     Node    const Engine = require('./engine.js')

   设计：
   - 游戏时间从 2026-11-20 开始，1 回合 = 1 个月，共 54 回合；
   - 速度 0 / 1 / 2 / 4，0 = 暂停，1× 下 400ms = 1 游戏日（一个月约 12 秒）；
   - 事件可以手动 trigger，也可以 schedule 到某一天自动触发；
   - 所有状态通过 state() 读出，变更通过 on('tick'|'event'|'speed'|'date'|'reset') 订阅。

   这个文件就是"后端版本"：接真实后端时，把 create() 换成 fetch 调用，
   方法签名不变，time-ui.js 不用改。
*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.Engine = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DAY = 86400000;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function serial(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / DAY); }
  function fromSerial(n) {
    var t = new Date(n * DAY);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function parseDate(x) {
    if (x && typeof x === 'object') return { y: +x.y, m: +x.m, d: +x.d };
    var p = String(x).split('-').map(Number);
    return { y: p[0] || 2026, m: p[1] || 11, d: p[2] || 20 };
  }
  function iso(d) { return d.y + '-' + pad(d.m) + '-' + pad(d.d); }

  function create(opts) {
    opts = opts || {};
    var start = parseDate(opts.start || '2026-11-20');
    var startSerial = serial(start.y, start.m, start.d);
    var turns = opts.turns || 54;
    var msPerDay = opts.msPerDay || 400;

    var s = {
      date: { y: start.y, m: start.m, d: start.d },
      day: 0,
      speed: 0,
      pending: [],
      scheduled: [],
      log: []
    };
    var acc = 0;                       // 未满一天的毫秒余数
    var subs = {};

    // 开局已有的待决事件（不触发 'event'，避免 UI 重复插入）
    (opts.seed || []).forEach(function (id) {
      s.pending.push(id);
      s.log.push({ day: 0, id: id, source: 'seed' });
    });

    function on(type, fn) {
      (subs[type] = subs[type] || []).push(fn);
      return function off() {
        var a = subs[type] || [], i = a.indexOf(fn);
        if (i >= 0) a.splice(i, 1);
      };
    }
    function emit(type, data) {
      var a = subs[type] || [];
      for (var i = 0; i < a.length; i++) { try { a[i](data, state()); } catch (e) {} }
    }

    function monthIndex() { return (s.date.y - start.y) * 12 + (s.date.m - start.m); }
    function term() { return Math.max(1, Math.min(turns, monthIndex() + 1)); }
    function progress() { return (s.date.d - 1) / daysInMonth(s.date.y, s.date.m); }

    function nextEvent() {
      var best = null;
      for (var i = 0; i < s.scheduled.length; i++) {
        var e = s.scheduled[i];
        if (e.done) continue;
        if (!best || e.at < best.at) best = e;
      }
      return best ? { id: best.id, inDays: best.at - s.day } : null;
    }

    function state() {
      return {
        date: { y: s.date.y, m: s.date.m, d: s.date.d },
        iso: iso(s.date),
        day: s.day,
        speed: s.speed,
        monthIndex: monthIndex(),
        term: term(),
        turns: turns,
        progress: progress(),
        pending: s.pending.slice(),
        scheduled: s.scheduled.map(function (e) { return { id: e.id, at: e.at, done: !!e.done }; }),
        nextEvent: nextEvent(),
        log: s.log.slice(-20)
      };
    }

    function push(id, source) {
      s.pending.push(id);
      s.log.push({ day: s.day, id: id, source: source || 'manual' });
      emit('event', { id: id, source: source || 'manual', day: s.day });
    }

    /* 把所有已到期、未触发的日程事件结算掉 */
    function collectDue() {
      var fired = [];
      for (var j = 0; j < s.scheduled.length; j++) {
        var e = s.scheduled[j];
        if (!e.done && e.at <= s.day) { e.done = true; fired.push(e.id); }
      }
      for (var k = 0; k < fired.length; k++) push(fired[k], 'auto');
      return fired;
    }

    /* 前进 n 天；沿途到期的日程事件自动触发 */
    function advance(n) {
      n = Math.max(0, Math.floor(n));
      if (!n) return 0;
      for (var i = 0; i < n; i++) {
        s.day++;
        s.date = fromSerial(startSerial + s.day);
      }
      var fired = collectDue();
      emit('tick', { days: n, fired: fired });
      return n;
    }

    /* 真实时间驱动：dt 毫秒 × 速度，攒够 msPerDay 就走一天。
       单次 dt 上限 500ms：标签页挂起后回来不会一次跳掉几个月。 */
    function tick(dt) {
      if (!s.speed || !(dt > 0)) return 0;
      acc += Math.min(dt, 500) * s.speed;
      var n = Math.floor(acc / msPerDay);
      if (n > 0) { acc -= n * msPerDay; advance(n); }
      return n;
    }

    function setSpeed(n) {
      n = Number(n) || 0;
      if (n !== 1 && n !== 2 && n !== 4) n = 0;
      s.speed = n;
      acc = 0;
      emit('speed', { speed: n });
      return n;
    }

    function setDate(x) {
      var p = parseDate(x);
      var want = serial(p.y, p.m, p.d);
      s.day = want - startSerial;
      s.date = fromSerial(want);
      acc = 0;
      collectDue();                    // 向前跳时间，逾期日程照常结算
      emit('date', { iso: iso(s.date), day: s.day });
      return iso(s.date);
    }

    /* 归档本月：跳到下个月 1 号 */
    function nextMonth() {
      var y = s.date.y, m = s.date.m + 1;
      if (m > 12) { m = 1; y++; }
      return setDate({ y: y, m: m, d: 1 });
    }

    /* when: 绝对日期 'YYYY-MM-DD'，或相对今天的天数 */
    function schedule(id, when) {
      var at;
      if (typeof when === 'string') {
        var p = parseDate(when);
        at = serial(p.y, p.m, p.d) - startSerial;
      } else {
        at = s.day + (Number(when) || 0);
      }
      s.scheduled.push({ id: id, at: at, done: false });
      emit('schedule', { id: id, at: at });
      return at;
    }

    function trigger(id) { push(id, 'manual'); return id; }

    function reset() {
      s.date = { y: start.y, m: start.m, d: start.d };
      s.day = 0; s.speed = 0; s.pending = []; s.scheduled = []; s.log = [];
      acc = 0;
      emit('reset', {});
    }

    return {
      on: on,
      state: state,
      setSpeed: setSpeed,
      setDate: setDate,
      advanceDays: advance,
      nextMonth: nextMonth,
      tick: tick,
      schedule: schedule,
      trigger: trigger,
      reset: reset,
      start: iso(start),
      turns: turns,
      msPerDay: msPerDay
    };
  }

  return { create: create, daysInMonth: daysInMonth, iso: iso, pad: pad };
});
