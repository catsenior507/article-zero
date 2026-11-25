/* 组织层：部门 ↔ 驻地 ↔ 特遣队 + 部门资源
   ------------------------------------------------------------------
   - 静态定义（名称、总部、隶属、需求线、预算）在这里；
   - 可变状态（部门人数、D 级、士气）在存档 world.org.depts 里；
   - 官方写明的用 source:'canon'，按职能推定的用 'inferred'（面板里只作小字注脚）。
*/
(function () {
  'use strict';

  var DEPTS = [
    { id: 'ops',   name: '站点运营部', short: 'OPS',   hq: 'S-19',   region: '北美',   source: 'inferred' },
    { id: 'anti',  name: '逆模因部',   short: 'ANTI',  hq: 'S-41',   region: '北美',   source: 'inferred' },
    { id: 'pata',  name: '超形上学部', short: 'PATA',  hq: 'S-87',   region: '北美',   source: 'canon' },
    { id: 'math',  name: '数学部',     short: 'MATH',  hq: 'S-Σ',    region: '欧洲',   source: 'canon' },
    { id: 'dt',    name: '时间异常部', short: 'Δt',    hq: '—',      region: '无固定', source: 'canon' },
    { id: 'theo',  name: '战术神学部', short: 'THEO',  hq: 'AREA-27', region: '欧洲',  source: 'canon' },
    { id: 'misc',  name: '误传部',     short: 'MISC',  hq: 'S-58',   region: '欧洲',   source: 'inferred' },
    { id: 'raisa', name: 'RAISA',      short: 'RAISA', hq: 'S-07',   region: '北美',   source: 'inferred' },
    { id: 'proc',  name: '采购与清算部', short: 'PROC', hq: 'S-106', region: '北美',   source: 'canon' },
    { id: 'alch',  name: '炼金学部 / 兵器', short: 'ALCH', hq: 'S-91', region: '欧洲', source: 'inferred' },
    { id: 'del',   name: '删除部',     short: 'DEL',   hq: 'S-0',    region: '档案层', source: 'inferred' },
    { id: 'cont',  name: '延续部',     short: 'CONT',  hq: 'S-33',   region: '北美',   source: 'inferred' },
    { id: 'decom', name: '废除部',     short: 'DECOM', hq: 'S-47',   region: '南美',   source: 'inferred' },
    { id: 'aeed',  name: 'AEED 接触科', short: 'AEED', hq: 'S-169',  region: '大洋洲', source: 'canon' },
    { id: 'crypto', name: '神秘动物学部', short: 'CRYP', hq: 'S-44', region: '大洋洲', source: 'canon', kind: 'aux' },
    { id: 'aiad',  name: 'AIAD',       short: 'AIAD',  hq: 'S-72',   region: '亚洲',   source: 'inferred', kind: 'aux' },
    { id: 'o5',    name: 'O5 议会',    short: 'O5',    hq: '—',      region: '移动',   source: 'canon', kind: 'command' },
    { id: 'ethics', name: '伦理委员会', short: 'ETH',  hq: '—',      region: '移动',   source: 'canon', kind: 'command' }
  ];

  var MTFS = [
    { id: 'alpha1', name: 'Alpha-1 红右手',      dept: 'o5',     base: '—',      source: 'canon' },
    { id: 'omega1', name: 'Omega-1 律法左手',    dept: 'ethics', base: '—',      source: 'canon' },
    { id: 'nu7',    name: 'Nu-7 落锤',           dept: 'ops',    base: 'S-19',   source: 'inferred' },
    { id: 'e11',    name: 'Epsilon-11 九尾狐',   dept: 'ops',    base: 'S-19',   source: 'inferred' },
    { id: 'd4',     name: 'Delta-4 民兵',        dept: 'ops',    base: 'S-12',   source: 'inferred' },
    { id: 'g5',     name: 'Gamma-5 红鲱鱼',      dept: 'misc',   base: 'S-58',   source: 'inferred' },
    { id: 'a4',     name: 'Alpha-4 小马快递',    dept: 'proc',   base: 'S-106',  source: 'inferred' },
    { id: 'b777',   name: 'Beta-777 赫卡忒之矛', dept: 'theo',   base: 'S-91',   source: 'inferred' },
    { id: 's3',     name: 'Sigma-3 书志学家',    dept: 'raisa',  base: 'S-07',   source: 'inferred' },
    { id: 'e10',    name: 'Eta-10 非礼勿视',     dept: 'anti',   base: 'S-41',   source: 'inferred' },
    { id: 'a9',     name: 'Alpha-9 最后的希望',  dept: 'aeed',   base: 'S-169',  source: 'inferred' },
    { id: 'l5',     name: 'Lambda-5 白兔',       dept: 'pata',   base: 'S-87',   source: 'inferred' },
    { id: 't5',     name: 'Tau-5 轮回',          dept: 'alch',   base: 'S-91',   source: 'inferred' },
    { id: 'g4',     name: 'Gamma-4 绿牡鹿',      dept: 'crypto', base: 'S-44',   source: 'canon' },
    { id: 'mu4',    name: 'Mu-4 调试器',         dept: 'aiad',   base: 'S-72',   source: 'inferred' }
  ];

  /* 部门资源：需求线与预算（静态） */
  var NEED = {
    ops:   { staff: 22, dclass: 480 }, anti:  { staff: 6,  dclass: 90 },
    pata:  { staff: 7,  dclass: 140 }, math:  { staff: 5,  dclass: 100 },
    dt:    { staff: 5,  dclass: 80 },  theo:  { staff: 5,  dclass: 70 },
    misc:  { staff: 5,  dclass: 90 },  raisa: { staff: 8,  dclass: 45 },
    proc:  { staff: 7,  dclass: 65 },  alch:  { staff: 5,  dclass: 130 },
    del:   { staff: 4,  dclass: 40 },  cont:  { staff: 4,  dclass: 25 },
    decom: { staff: 3,  dclass: 180 }, aeed:  { staff: 5,  dclass: 140 }
  };
  var BUDGET = { ops: 19.7, anti: 6, pata: 7, math: 6, dt: 5, theo: 5, misc: 6,
                 raisa: 9, proc: 8, alch: 6, del: 3, cont: 4, decom: 4, aeed: 5 };

  /* 默认值（存档缺失时用） */
  var BASE = {
    ops:   { staff: 20, dclass: 420, morale: 62 }, anti:  { staff: 6, dclass: 80,  morale: 58 },
    pata:  { staff: 6,  dclass: 120, morale: 71 }, math:  { staff: 5, dclass: 90,  morale: 66 },
    dt:    { staff: 4,  dclass: 70,  morale: 60 }, theo:  { staff: 4, dclass: 60,  morale: 55 },
    misc:  { staff: 5,  dclass: 80,  morale: 64 }, raisa: { staff: 8, dclass: 40,  morale: 70 },
    proc:  { staff: 7,  dclass: 60,  morale: 68 }, alch:  { staff: 5, dclass: 110, morale: 61 },
    del:   { staff: 3,  dclass: 30,  morale: 48 }, cont:  { staff: 4, dclass: 20,  morale: 57 },
    decom: { staff: 3,  dclass: 150, morale: 52 }, aeed:  { staff: 4, dclass: 120, morale: 66 }
  };

  var SITES_RES = [
    { id: 'S-19', region: '北美', cap: 5, capMax: 8, contam: 2 },
    { id: 'S-87', region: '北美', cap: 3, capMax: 4, contam: 1 },
    { id: 'S-44', region: '大洋洲', cap: 2, capMax: 3, contam: 1 },
    { id: 'S-106', region: '北美', cap: 2, capMax: 3, contam: 1 },
    { id: 'S-95', region: '亚洲', cap: 2, capMax: 3, contam: 1 },
    { id: 'S-Σ', region: '欧洲', cap: 2, capMax: 3, contam: 1 },
    { id: 'AREA-27', region: '欧洲', cap: 2, capMax: 3, contam: 1 },
    { id: 'S-07', region: '北美', cap: 2, capMax: 3, contam: 0 },
    { id: 'S-41', region: '北美', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-58', region: '欧洲', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-91', region: '欧洲', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-33', region: '北美', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-47', region: '南美', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-169', region: '大洋洲', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-12', region: '亚洲', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-72', region: '亚洲', cap: 1, capMax: 2, contam: 0 },
    { id: 'S-103', region: '非洲', cap: 0, capMax: 1, contam: 0 },
    { id: 'ANT-01', region: '南极', cap: 0, capMax: 1, contam: 0 },
    { id: 'S-0', region: '档案层', cap: 0, capMax: 0, contam: 0 }
  ];

  var EXTRA = { crypto: '神秘动物学部', aiad: 'AIAD' };
  var SITE_REGION = {};
  SITES_RES.forEach(function (s) { SITE_REGION[s.id] = s.region; });

  /* 合并存档 */
  var savedDepts = (window.SAVE_DEFAULT && window.SAVE_DEFAULT.world && window.SAVE_DEFAULT.world.org
    && window.SAVE_DEFAULT.world.org.depts) || {};
  var DATA = {};
  Object.keys(BASE).forEach(function (id) {
    DATA[id] = Object.assign({}, BASE[id], savedDepts[id] || {});
  });

  var levels = (window.SAVE_DEFAULT && window.SAVE_DEFAULT.world && window.SAVE_DEFAULT.world.org
    && window.SAVE_DEFAULT.world.org.levels) || {};
  function lvl(id) { return levels[id] == null ? 2 : levels[id]; }

  function deptById(id) {
    for (var i = 0; i < DEPTS.length; i++) if (DEPTS[i].id === id) return DEPTS[i];
    return EXTRA[id] ? { id: id, name: EXTRA[id], short: id.toUpperCase(), hq: '—', region: '—', source: 'inferred' } : null;
  }
  function mtfsOf(id) { return MTFS.filter(function (m) { return m.dept === id; }); }

  function deptData() {
    return DEPTS.filter(function (d) { return d.kind !== 'command' && d.kind !== 'aux'; }).map(function (d) {
      var r = DATA[d.id];
      return {
        id: d.id, name: d.name, short: d.short, hq: d.hq, region: d.region,
        staff: r.staff, needStaff: NEED[d.id].staff,
        dclass: r.dclass, needDClass: NEED[d.id].dclass,
        morale: r.morale, budget: BUDGET[d.id]
      };
    });
  }

  window.Org = {
    depts: DEPTS, mtfs: MTFS, siteRegion: SITE_REGION, sitesRes: SITES_RES,
    level: lvl, mtfsOf: mtfsOf, deptData: deptData, data: DATA, need: NEED
  };

  /* ---------- 组织面板 ---------- */
  var scr = document.querySelector('.screen');
  if (!scr) return;

  var panel = document.createElement('section');
  panel.className = 'orgpanel';
  panel.innerHTML =
    '<div class="oph"><b>组织</b><span class="opn">14 部门 · 19 站点 · 15 特遣队</span><span class="opx">×</span></div>' +
    '<div class="oplist"></div>' +
    '<div class="opdetail">' +
      '<div class="opname">—</div>' +
      '<div class="oprow"><span>总部</span><b class="ophq">—</b><i class="opsrc2"></i></div>' +
      '<div class="oprow"><span>区域</span><b class="oprg">—</b></div>' +
      '<div class="oprow"><span>等级</span><b class="oplv">—</b></div>' +
      '<div class="oprow"><span>编制</span><b class="opstaff">—</b></div>' +
      '<div class="oprow"><span>D 级</span><b class="opd">—</b></div>' +
      '<div class="oprow"><span>士气</span><b class="opmor">—</b></div>' +
      '<div class="oprow"><span>月预算</span><b class="opbud">—</b></div>' +
      '<div class="opmtf-h">所属特遣队</div>' +
      '<div class="opmtfs"></div>' +
      '<div class="ophint">总部失守 → 部门 −1 级、所属特遣队停摆 2 回合</div>' +
    '</div>';
  scr.appendChild(panel);

  var listEl = panel.querySelector('.oplist');
  var selected = 'pata';

  function renderList() {
    listEl.innerHTML = '';
    DEPTS.forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'opitem' + (d.id === selected ? ' on' : '') + (d.kind === 'command' ? ' cmd' : '');
      row.innerHTML = '<span class="opshort"></span><span class="opnm"></span><span class="ophqs"></span>';
      row.querySelector('.opshort').textContent = d.short;
      row.querySelector('.opnm').textContent = d.name;
      row.querySelector('.ophqs').textContent = d.hq === '—' ? '移动' : d.hq;
      row.addEventListener('click', function () { selected = d.id; render(); });
      listEl.appendChild(row);
    });
  }

  function renderDetail() {
    var d = deptById(selected);
    if (!d) return;
    panel.querySelector('.opname').textContent = d.name + (d.kind === 'command' ? ' · 指挥' : '');
    panel.querySelector('.ophq').textContent = d.hq === '—' ? (d.kind === 'command' ? '移动' : '无固定') : d.hq;
    panel.querySelector('.opsrc2').textContent = d.source === 'canon' ? '（官方设定）' : '（按职能推定）';
    panel.querySelector('.oprg').textContent = d.region;
    panel.querySelector('.oplv').textContent = d.kind === 'command' ? '—' : lvl(d.id) + ' / 5';

    var r = DATA[d.id];
    if (r && NEED[d.id]) {
      var st = r.staff / NEED[d.id].staff, dr = r.dclass / NEED[d.id].dclass;
      panel.querySelector('.opstaff').textContent = r.staff + ' / ' + NEED[d.id].staff +
        (st < 0.8 ? ' · 缺员' : st < 1 ? ' · 紧张' : '');
      panel.querySelector('.opd').textContent = r.dclass + ' / ' + NEED[d.id].dclass +
        (dr < 0.7 ? ' · 不足' : dr < 1 ? ' · 紧张' : '');
      panel.querySelector('.opmor').textContent = r.morale + (r.morale < 40 ? ' · 低效' : '');
      panel.querySelector('.opbud').textContent = '$' + BUDGET[d.id] + 'M';
    } else {
      panel.querySelector('.opstaff').textContent = '—';
      panel.querySelector('.opd').textContent = '—';
      panel.querySelector('.opmor').textContent = '—';
      panel.querySelector('.opbud').textContent = '—';
    }

    var box = panel.querySelector('.opmtfs');
    box.innerHTML = '';
    var list = mtfsOf(d.id);
    if (!list.length) {
      box.innerHTML = '<div class="opempty">没有直属特遣队</div>';
    } else {
      list.forEach(function (m) {
        var row = document.createElement('div');
        row.className = 'opmtf';
        row.innerHTML = '<b></b><span class="base"></span><i class="src"></i>';
        row.querySelector('b').textContent = m.name;
        row.querySelector('.base').textContent = m.base === '—' ? '移动' : '基地 ' + m.base;
        row.querySelector('.src').textContent = m.source === 'canon' ? '（官方）' : '（推定）';
        box.appendChild(row);
      });
    }
  }

  function render() { renderList(); renderDetail(); }

  function toggle(open) {
    if (open == null) open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    var btn = document.querySelector('.rbtn[title="特遣队"]');
    if (btn) btn.classList.toggle('on', open);
  }

  var btn = document.querySelector('.rbtn[title="特遣队"]');
  if (btn) btn.addEventListener('click', function () { toggle(); });
  panel.querySelector('.opx').addEventListener('click', function () { panel.classList.remove('open'); });

  render();
  window.Org.render = render;
  if (location.search.indexOf('org') >= 0) toggle(true);
})();
