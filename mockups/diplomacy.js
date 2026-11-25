/* 外交层：区域政府、拨款请求与关系状态
   ------------------------------------------------------------------
   - 政府名称全部虚构，避免指向现实国家；
   - 可变状态（关系、冷却、让步）存在存档 world.governments 里；
   - 静态定义（名称、预算、条件）在代码里，方便以后换文案；
   - 纯逻辑函数挂到 window.Diplomacy，供后端测试。
*/
(function () {
  'use strict';

  var GOV_DEFS = [
    { id: 'na', name: '阿卡迪亚合众国', short: 'AC', region: '北美', budget: 38, leverage: 0.55, condition: '驻站权' },
    { id: 'eu', name: '欧罗巴共同体', short: 'EC', region: '欧洲', budget: 30, leverage: 0.60, condition: '研究共享' },
    { id: 'as', name: '东亚联合体', short: 'EA', region: '亚洲', budget: 26, leverage: 0.50, condition: '沉默条款' },
    { id: 'sa', name: '南十字星联盟', short: 'SC', region: '南美', budget: 14, leverage: 0.35, condition: '不干涉' },
    { id: 'af', name: '赤道非洲共同体', short: 'EQ', region: '非洲', budget: 9, leverage: 0.25, condition: '基础设施' },
    { id: 'oc', name: '珊瑚海公约', short: 'CS', region: '大洋洲', budget: 12, leverage: 0.45, condition: '海域通行' },
    { id: 'an', name: '极地研究理事会', short: 'PR', region: '南极', budget: 2, leverage: 0.10, condition: '科考配额' }
  ];

  var DEFAULT_STATE = {
    na: { relation: 62, cooldownDay: 0, concessions: [] },
    eu: { relation: 48, cooldownDay: 0, concessions: [] },
    as: { relation: 41, cooldownDay: 0, concessions: [] },
    sa: { relation: 35, cooldownDay: 0, concessions: [] },
    af: { relation: 28, cooldownDay: 0, concessions: [] },
    oc: { relation: 52, cooldownDay: 0, concessions: [] },
    an: { relation: 20, cooldownDay: 0, concessions: [] }
  };

  var DAYS_PER_MONTH = 30;
  var COOLDOWN = { request: 6, negotiate: 3, pressure: 12, exchange: 9 };

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function grant(g, relation) {
    return Math.round(g.budget * (0.35 + relation / 200) * (1 + g.leverage) * 10) / 10;
  }
  function stance(rel) {
    if (rel < 20) return '敌对';
    if (rel < 40) return '冷淡';
    if (rel < 60) return '务实';
    if (rel < 80) return '合作';
    return '盟友';
  }

  /* ---------- 状态 ---------- */
  var saveState = (window.SAVE_DEFAULT && window.SAVE_DEFAULT.world && window.SAVE_DEFAULT.world.governments) || null;
  var state = {};
  GOV_DEFS.forEach(function (g) {
    var s = (saveState && saveState.find && saveState.find(function (x) { return x.id === g.id; })) || DEFAULT_STATE[g.id];
    state[g.id] = { relation: s.relation, cooldownDay: s.cooldownDay || 0, concessions: (s.concessions || []).slice() };
  });

  function day() {
    return (window.GameAPI && window.GameAPI.state) ? window.GameAPI.state().day : 0;
  }
  function monthsLeft(s) {
    return Math.max(0, Math.ceil((s.cooldownDay - day()) / DAYS_PER_MONTH));
  }

  /* ---------- 纯逻辑 ---------- */
  var lastResult = null;

  function request(id) {
    var g = byId(id), s = state[id];
    if (!g || !s) return null;
    if (monthsLeft(s) > 0) return { ok: false, reason: '冷却中', months: monthsLeft(s) };
    if (s.relation < 25) {
      s.relation = clamp(s.relation - 2, 0, 100);
      lastResult = { ok: false, reason: g.name + ' 拒绝了请求（关系过低）', relation: s.relation };
      return lastResult;
    }
    var amount = grant(g, s.relation);
    s.relation = clamp(s.relation - 3, 0, 100);
    s.cooldownDay = day() + COOLDOWN.request * DAYS_PER_MONTH;
    lastResult = { ok: true, amount: amount, gov: g, action: 'request', relation: s.relation };
    return lastResult;
  }

  function negotiate(id) {
    var g = byId(id), s = state[id];
    if (!g || !s) return null;
    if (monthsLeft(s) > 0) return { ok: false, reason: '冷却中', months: monthsLeft(s) };
    s.relation = clamp(s.relation + 6, 0, 95);
    s.cooldownDay = day() + COOLDOWN.negotiate * DAYS_PER_MONTH;
    lastResult = { ok: true, cost: 2, gov: g, action: 'negotiate', relation: s.relation };
    return lastResult;
  }

  function pressure(id) {
    var g = byId(id), s = state[id];
    if (!g || !s) return null;
    if (monthsLeft(s) > 0) return { ok: false, reason: '冷却中', months: monthsLeft(s) };
    var amount = Math.round(grant(g, s.relation) * 0.75 * 10) / 10;
    s.relation = clamp(s.relation - 12, 0, 100);
    s.cooldownDay = day() + COOLDOWN.pressure * DAYS_PER_MONTH;
    lastResult = { ok: true, amount: amount, veil: -1, gov: g, action: 'pressure', relation: s.relation };
    return lastResult;
  }

  function exchange(id) {
    var g = byId(id), s = state[id];
    if (!g || !s) return null;
    if (monthsLeft(s) > 0) return { ok: false, reason: '冷却中', months: monthsLeft(s) };
    var amount = Math.round(grant(g, s.relation) * 1.25 * 10) / 10;
    s.relation = clamp(s.relation + 2, 0, 100);
    if (s.concessions.indexOf(g.condition) < 0) s.concessions.push(g.condition);
    s.cooldownDay = day() + COOLDOWN.exchange * DAYS_PER_MONTH;
    lastResult = { ok: true, amount: amount, gov: g, action: 'exchange', relation: s.relation, concession: g.condition };
    return lastResult;
  }

  function byId(id) {
    for (var i = 0; i < GOV_DEFS.length; i++) if (GOV_DEFS[i].id === id) return GOV_DEFS[i];
    return null;
  }

  window.Diplomacy = {
    defs: GOV_DEFS,
    state: state,
    grant: grant,
    stance: stance,
    monthsLeft: monthsLeft,
    request: request, negotiate: negotiate, pressure: pressure, exchange: exchange,
    cooldown: COOLDOWN
  };

  /* ---------- UI ---------- */
  var scr = document.querySelector('.screen');
  if (!scr) return;

  var panel = document.createElement('section');
  panel.className = 'dippanel';
  panel.innerHTML =
    '<div class="dph"><b>外交</b><span class="dpn">7 个区域政府</span><span class="dpx">×</span></div>' +
    '<div class="dplist"></div>' +
    '<div class="dpdetail">' +
      '<div class="dpname">—</div>' +
      '<div class="dprow"><span>关系</span><div class="dpbar"><i></i></div><b class="dpr">—</b></div>' +
      '<div class="dprow"><span>年度预算</span><b class="dpb">—</b></div>' +
      '<div class="dprow"><span>状态</span><b class="dps">—</b></div>' +
      '<div class="dpcond">—</div>' +
      '<div class="dpacts">' +
        '<button data-act="request">请求拨款</button>' +
        '<button data-act="negotiate">谈判</button>' +
        '<button data-act="pressure">施压</button>' +
        '<button data-act="exchange">交换</button>' +
      '</div>' +
      '<div class="dphint"></div>' +
      '<div class="dplog"></div>' +
    '</div>';
  scr.appendChild(panel);

  var listEl = panel.querySelector('.dplist');
  var detail = panel.querySelector('.dpdetail');
  var selected = 'na';

  function money(n) { return '$' + (Math.round(n * 10) / 10); }

  function renderList() {
    listEl.innerHTML = '';
    GOV_DEFS.forEach(function (g) {
      var s = state[g.id];
      var row = document.createElement('div');
      row.className = 'dprow-item' + (g.id === selected ? ' on' : '');
      row.innerHTML = '<span class="dpshort"></span><span class="dpnm"></span>' +
        '<span class="dpmini"><i></i></span><b class="dpv"></b>';
      row.querySelector('.dpshort').textContent = g.short;
      row.querySelector('.dpnm').textContent = g.name;
      row.querySelector('.dpmini i').style.width = s.relation + '%';
      row.querySelector('.dpv').textContent = s.relation;
      row.addEventListener('click', function () { selected = g.id; render(); });
      listEl.appendChild(row);
    });
  }

  function renderDetail() {
    var g = byId(selected), s = state[selected];
    if (!g) return;
    detail.querySelector('.dpname').textContent = g.name + ' · ' + g.region;
    detail.querySelector('.dpbar i').style.width = s.relation + '%';
    detail.querySelector('.dpr').textContent = s.relation;
    detail.querySelector('.dpb').textContent = money(g.budget) + ' / 年';
    detail.querySelector('.dps').textContent = stance(s.relation);
    var cond = '条件：' + g.condition;
    if (s.concessions.indexOf(g.condition) >= 0) cond += '（已让步）';
    detail.querySelector('.dpcond').textContent = cond;

    var left = monthsLeft(s);
    var hint = left > 0
      ? '冷却中：还需 ' + left + ' 个月'
      : '可请求拨款 ' + money(grant(g, s.relation)) + '；施压 ' + money(grant(g, s.relation) * 0.75) + '（关系 −12）';
    detail.querySelector('.dphint').textContent = hint;
    detail.querySelectorAll('.dpacts button').forEach(function (b) { b.disabled = left > 0; });
  }

  function render() { renderList(); renderDetail(); }

  function log(text) {
    var el = detail.querySelector('.dplog');
    var row = document.createElement('div');
    row.textContent = text;
    el.insertBefore(row, el.firstChild);
    while (el.children.length > 8) el.removeChild(el.lastChild);
  }

  function addFunding(n) {
    var metrics = document.querySelectorAll('.topbar .metric');
    for (var i = 0; i < metrics.length; i++) {
      var k = metrics[i].querySelector('.k');
      if (k && k.textContent.trim() === '经费') {
        var v = metrics[i].querySelector('.v');
        var cur = parseFloat(String(v.textContent).replace(/[^0-9.]/g, '')) || 0;
        v.textContent = '$' + Math.round(cur + n);
        return;
      }
    }
  }

  function run(act) {
    var fn = { request: request, negotiate: negotiate, pressure: pressure, exchange: exchange }[act];
    var r = fn(selected);
    if (!r) return;
    if (!r.ok) { log('✕ ' + (r.reason || '无法执行')); render(); return; }
    if (r.amount) {
      addFunding(r.amount);
      log('＋ ' + r.gov.name + ' 拨款 ' + money(r.amount) + '（关系 ' + r.relation + '）');
    } else if (act === 'negotiate') {
      addFunding(-2);
      log('谈判：' + r.gov.name + ' 关系升至 ' + r.relation + '（花费 $2）');
    }
    if (r.concession) log('让步：' + r.concession);
    if (r.veil) log('施压：帷幕 −1');
    render();
  }

  panel.querySelectorAll('.dpacts button').forEach(function (b) {
    b.addEventListener('click', function () { run(b.dataset.act); });
  });
  panel.querySelector('.dpx').addEventListener('click', function () { panel.classList.remove('open'); });

  function toggle(open) {
    if (open == null) open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    var btn = document.querySelector('.rbtn[title="外交"]');
    if (btn) btn.classList.toggle('on', open);
  }
  var railBtn = document.querySelector('.rbtn[title="外交"]');
  if (railBtn) railBtn.addEventListener('click', function () { toggle(); });
  var door = document.querySelector('.door[title="外交 / GoI"]');
  if (door) door.addEventListener('click', function () { toggle(true); });

  render();
  if (location.search.indexOf('diplomacy') >= 0) toggle(true);
})();
