/* 组织层：部门 ↔ 驻地 ↔ 特遣队
   ------------------------------------------------------------------
   - 静态定义（名称、总部、隶属、来源标记）在这里；
   - 可变状态（部门等级、站点状态）在存档 world.org 里；
   - 官方写明的用 source:'canon'，按职能推定的用 'inferred'。
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

  var EXTRA = { crypto: '神秘动物学部', aiad: 'AIAD' };
  var SITE_REGION = {
    'S-19': '北美', 'S-07': '北美', 'S-41': '北美', 'S-87': '北美', 'S-106': '北美',
    'S-58': '欧洲', 'S-Σ': '欧洲', 'S-91': '欧洲', 'AREA-27': '欧洲',
    'S-33': '北美', 'S-47': '南美', 'S-169': '大洋洲', 'S-44': '大洋洲',
    'S-95': '亚洲', 'S-12': '亚洲', 'S-72': '亚洲', 'S-103': '非洲', 'ANT-01': '南极', 'S-0': '档案层'
  };

  var levels = (window.SAVE_DEFAULT && window.SAVE_DEFAULT.world && window.SAVE_DEFAULT.world.org
    && window.SAVE_DEFAULT.world.org.levels) || {};
  function lvl(id) { return levels[id] == null ? 2 : levels[id]; }

  function deptById(id) {
    for (var i = 0; i < DEPTS.length; i++) if (DEPTS[i].id === id) return DEPTS[i];
    return EXTRA[id] ? { id: id, name: EXTRA[id], short: id.toUpperCase(), hq: '—', region: '—', source: 'inferred' } : null;
  }
  function mtfsOf(id) { return MTFS.filter(function (m) { return m.dept === id; }); }

  window.Org = { depts: DEPTS, mtfs: MTFS, siteRegion: SITE_REGION, level: lvl, mtfsOf: mtfsOf };

  /* ---------- UI ---------- */
  var scr = document.querySelector('.screen');
  if (!scr) return;

  var panel = document.createElement('section');
  panel.className = 'orgpanel';
  panel.innerHTML =
    '<div class="oph"><b>组织</b><span class="opn">14 部门 · 19 站点 · 15 特遣队</span><span class="opx">×</span></div>' +
    '<div class="oplist"></div>' +
    '<div class="opdetail">' +
      '<div class="opname">—</div>' +
      '<div class="oprow"><span>总部</span><b class="ophq">—</b></div>' +
      '<div class="oprow"><span>区域</span><b class="oprg">—</b></div>' +
      '<div class="oprow"><span>等级</span><b class="oplv">—</b></div>' +
      '<div class="oprow"><span>来源</span><b class="opsrc">—</b></div>' +
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
    panel.querySelector('.oprg').textContent = d.region;
    panel.querySelector('.oplv').textContent = d.kind === 'command' ? '—' : lvl(d.id) + ' / 5';
    panel.querySelector('.opsrc').textContent = d.source === 'canon' ? '官方设定' : '按职能推定';

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
        row.querySelector('.src').textContent = m.source === 'canon' ? '官方' : '推定';
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
  if (location.search.indexOf('org') >= 0) toggle(true);
})();
