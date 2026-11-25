/* 资源分布面板 + 士气反馈
   ------------------------------------------------------------------
   - 点顶栏任一资源，查看它在部门 / 站点之间的分布；
   - 每月按编制与 D 级缺口调整部门士气；
   - 士气低于 40 的部门标记"低效"。
*/
(function () {
  'use strict';
  if (!window.Org) return;

  var scr = document.querySelector('.screen');
  if (!scr) return;

  var META = {
    staff:  { label: '编制', unit: '', dept: true, site: false },
    budget: { label: '经费', unit: '$', dept: true, site: false },
    morale: { label: '士气', unit: '', dept: true, site: false },
    cap:    { label: '容量', unit: '', dept: false, site: true },
    contam: { label: '污染', unit: '', dept: false, site: true },
    asset:  { label: '资产', unit: '', dept: false, site: false },
    veil:   { label: '帷幕', unit: '', dept: false, site: false },
    authority: { label: '权威', unit: '', dept: false, site: false },
    consensus: { label: '共识', unit: '', dept: false, site: false }
  };
  var KEY_BY_LABEL = {
    '经费': 'budget', '编制': 'staff', '士气': 'morale', '容量': 'cap',
    '污染': 'contam', '资产': 'asset', '帷幕': 'veil', '权威': 'authority', '共识': 'consensus'
  };

  var panel = document.createElement('section');
  panel.className = 'respanel';
  panel.innerHTML =
    '<div class="rsh"><b class="rst">资源</b><span class="rsn"></span><span class="rsx">×</span></div>' +
    '<div class="rstabs"><button data-tab="dept">部门</button><button data-tab="site">站点</button></div>' +
    '<div class="rslist"></div>' +
    '<div class="rsfoot"></div>';
  scr.appendChild(panel);

  var state = { key: 'staff', tab: 'dept' };
  var listEl = panel.querySelector('.rslist');
  var tabsEl = panel.querySelector('.rstabs');

  function deptById(id) { return Org.depts.find(function (d) { return d.id === id; }); }

  function statusOf(ratio) {
    return ratio >= 1 ? '充足' : ratio >= 0.8 ? '紧张' : '缺员';
  }

  function render() {
    var m = META[state.key] || META.staff;
    panel.querySelector('.rst').textContent = m.label;
    var total = '';
    if (state.key === 'staff') total = '84 / 100';
    else if (state.key === 'budget') total = '月度 $93.7M · 现金 $300M';
    else if (state.key === 'morale') total = '平均 ' + avgMorale();
    else if (state.key === 'cap') total = '28 / 48';
    else if (state.key === 'contam') total = '08 / 100';
    else total = '全局指标';
    panel.querySelector('.rsn').textContent = total;

    tabsEl.style.display = (m.dept && m.site) ? '' : 'none';
    tabsEl.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === state.tab);
    });

    listEl.innerHTML = '';

    if (!m.dept && !m.site) {
      listEl.innerHTML = '<div class="rsglobal">该资源是全局指标，不按部门或站点分配。<br>它由事件、K 级与预算结算共同决定。</div>';
      return;
    }

    if (state.tab === 'dept') {
      Org.deptData().forEach(function (d) {
        var val, need, ratio, unit = '';
        if (state.key === 'staff') { val = d.staff; need = d.needStaff; ratio = val / need; }
        else if (state.key === 'budget') { val = d.budget; need = 0; ratio = 1; unit = '$'; }
        else { val = d.morale; need = 100; ratio = val / 100; }
        var row = document.createElement('div');
        row.className = 'rsrow';
        row.innerHTML = '<span class="rsnm"></span><span class="rsv"></span>' +
          '<span class="rsbar"><i></i></span><span class="rsst"></span>';
        row.querySelector('.rsnm').textContent = d.name;
        row.querySelector('.rsv').textContent = unit + val + (need ? ' / ' + need : '');
        var pct = Math.min(100, ratio * 100);
        row.querySelector('.rsbar i').style.width = pct + '%';
        var st = state.key === 'staff' ? statusOf(ratio)
               : state.key === 'morale' ? (d.morale < 40 ? '低效' : d.morale < 55 ? '低落' : '正常')
               : '分配';
        row.querySelector('.rsst').textContent = st;
        row.querySelector('.rsst').className = 'rsst ' + (st === '缺员' || st === '低效' ? 'bad' : st === '紧张' || st === '低落' ? 'warn' : '');
        var bar = row.querySelector('.rsbar i');
        if (st === '缺员' || st === '低效') bar.style.background = 'var(--danger)';
        else if (st === '紧张' || st === '低落') bar.style.background = 'var(--muted)';
        listEl.appendChild(row);
      });
    } else {
      Org.sitesRes.forEach(function (s) {
        var val = state.key === 'cap' ? s.cap : s.contam;
        var max = state.key === 'cap' ? s.capMax : 2;
        var row = document.createElement('div');
        row.className = 'rsrow';
        row.innerHTML = '<span class="rsnm"></span><span class="rsv"></span>' +
          '<span class="rsbar"><i></i></span><span class="rsst"></span>';
        row.querySelector('.rsnm').textContent = s.id;
        row.querySelector('.rsv').textContent = val + ' / ' + max;
        row.querySelector('.rsbar i').style.width = (max ? Math.min(100, val / max * 100) : 0) + '%';
        row.querySelector('.rsst').textContent = s.region;
        listEl.appendChild(row);
      });
    }

    panel.querySelector('.rsfoot').textContent = state.key === 'staff'
      ? '缺员部门每月士气 −2；D 级不足再 −1。士气 < 40 记为低效。'
      : state.key === 'morale' ? '士气由编制与 D 级满足度决定，每月结算一次。'
      : '';
  }

  function avgMorale() {
    var d = Org.deptData();
    return Math.round(d.reduce(function (a, x) { return a + x.morale; }, 0) / d.length);
  }

  function open(key) {
    state.key = key || 'staff';
    state.tab = (META[state.key] && META[state.key].site && !META[state.key].dept) ? 'site' : 'dept';
    document.querySelectorAll('.orgpanel.open,.dippanel.open').forEach(function (p) { p.classList.remove('open'); });
    panel.classList.add('open');
    render();
  }

  tabsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    state.tab = b.dataset.tab;
    render();
  });
  panel.querySelector('.rsx').addEventListener('click', function () { panel.classList.remove('open'); });

  /* 顶栏资源点击 */
  Array.prototype.forEach.call(document.querySelectorAll('.topbar .metric'), function (m) {
    var k = m.querySelector('.k');
    if (!k) return;
    m.style.cursor = 'pointer';
    m.addEventListener('click', function () {
      var key = KEY_BY_LABEL[k.textContent.trim()];
      if (key) open(key);
    });
  });

  /* 每月士气结算 */
  var lastDay = -1;
  function tick(st) {
    var day = st.day;
    if (lastDay < 0) lastDay = day;
    if (day - lastDay < 30) return;
    lastDay = day;
    Org.deptData().forEach(function (d) {
      var r = Org.data[d.id];
      var sr = d.staff / d.needStaff, dr = d.dclass / d.needDClass;
      var delta = sr >= 1 ? 1 : sr >= 0.8 ? -1 : -2;
      if (dr < 0.7) delta -= 1;
      r.morale = Math.max(0, Math.min(95, r.morale + delta));
    });
    render();
    updateTopMorale();
  }

  function updateTopMorale() {
    var metrics = document.querySelectorAll('.topbar .metric');
    for (var i = 0; i < metrics.length; i++) {
      var k = metrics[i].querySelector('.k');
      if (k && k.textContent.trim() === '士气') {
        metrics[i].querySelector('.v').textContent = avgMorale();
      }
    }
  }

  if (window.GameAPI && window.GameAPI.on) window.GameAPI.on('tick', tick);
  updateTopMorale();
  if (location.search.indexOf('res=') >= 0) {
    var m = location.search.match(/res=([a-z]+)/);
    open(m ? m[1] : 'staff');
  } else if (location.search.indexOf('res') >= 0) {
    open('staff');
  }
})();
