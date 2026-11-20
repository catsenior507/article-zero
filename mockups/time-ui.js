/* 时间轴 + 测试控制台
   ------------------------------------------------------------------
   挂在 Engine 上的一层 UI，不改 v2.css、不动原有 DOM 结构：
   - 时间轴：日期 / 播放暂停 / 1×2×4× / 54 个月进度条 / 下一事件倒计时；
   - 控制台：~ 或 ?console=1 打开，手动触发事件、跳时间、改速度；
   - 后端接口：window.GameAPI = engine（与 engine.js 的方法一一对应）。

   参数：
     ?console=1        打开控制台
     ?speed=1|2|4      初始速度（默认 0 = 暂停）
     ?date=2026-12-01  跳到指定日期
     ?freeze=1         不跑 requestAnimationFrame（截图用）
*/
(function () {
  if (!window.Engine) return;
  var q = location.search;
  var scr = document.querySelector('.screen');
  if (!scr) return;

  var pad = Engine.pad;
  var SAVE = window.SAVE_DEFAULT || null;
  var engine = Engine.create({
    start: (SAVE && SAVE.game && SAVE.game.date) || '2026-11-20',
    turns: (SAVE && SAVE.game && SAVE.game.turns) || 54,
    msPerDay: 400,
    seed: (SAVE && SAVE.world && SAVE.world.pending) || []
  });
  var catalog = window.EVENT_CATALOG || [];
  var byId = {};
  catalog.forEach(function (e) { byId[e.id] = e; });

  window.GameAPI = engine;
  window.GAME = { engine: engine, catalog: catalog };

  /* ================= 时间轴 ================= */
  var rail = document.createElement('div');
  rail.className = 'timerail';
  rail.innerHTML =
    '<svg class="railart" viewBox="0 0 860 48" preserveAspectRatio="none">' +
      '<path d="M14 0H846L860 14V34L846 48H14L0 34V14Z"/></svg>' +
    '<button class="tplay" title="暂停 / 继续">‖</button>' +
    '<div class="tspeeds">' +
      '<button data-sp="1">1×</button><button data-sp="2">2×</button><button data-sp="4">4×</button>' +
    '</div>' +
    '<div class="tdate"><b class="ty">2026</b><i>·</i><b class="tm">11</b><i>·</i><em class="td">20</em></div>' +
    '<div class="ttrack"><div class="tfill"></div><div class="tticks"></div><div class="thead"></div></div>' +
    '<div class="tnext">下一事件 <b>—</b></div>';
  scr.appendChild(rail);

  var tfill = rail.querySelector('.tfill');
  var thead = rail.querySelector('.thead');
  var track = rail.querySelector('.ttrack');
  var playBtn = rail.querySelector('.tplay');
  var nextEl = rail.querySelector('.tnext b');
  var spBtns = Array.prototype.slice.call(rail.querySelectorAll('.tspeeds button'));

  for (var i = 1; i < 54; i++) {
    var tick = document.createElement('i');
    tick.style.left = (i / 54 * 100) + '%';
    if (i % 12 === 0) tick.className = 'y';
    track.appendChild(tick);
  }

  playBtn.addEventListener('click', function () {
    var st = engine.state();
    var next = st.speed ? 0 : (st.lastSpeed || 1);
    engine.setSpeed(next);
  });
  spBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var v = +b.dataset.sp;
      engine.setSpeed(engine.state().speed === v ? 0 : v);
    });
  });

  /* ================= 控制台 ================= */
  var con = document.createElement('div');
  con.className = 'console';
  con.innerHTML =
    '<div class="ch"><b>测试控制台</b><span>GAME API</span><span class="cx">×</span></div>' +
    '<div class="cbody">' +
      '<div class="csec"><em>时间</em>' +
        '<div class="crow"><span class="cd">—</span>' +
          '<button class="cbtn" data-cmd="pause">暂停</button>' +
          '<button class="cbtn" data-cmd="1">1×</button>' +
          '<button class="cbtn" data-cmd="2">2×</button>' +
          '<button class="cbtn" data-cmd="4">4×</button></div>' +
        '<div class="crow">' +
          '<button class="cbtn" data-cmd="+1d">+1 天</button>' +
          '<button class="cbtn" data-cmd="+1m">+1 月</button>' +
          '<button class="cbtn" data-cmd="reset">重置</button></div>' +
      '</div>' +
      '<div class="csec"><em>事件 · 点击触发</em><div class="cevs"></div></div>' +
    '</div>' +
    '<div class="clog"></div>';
  document.body.appendChild(con);

  var cdEl = con.querySelector('.cd');
  var cl = con.querySelector('.clog');
  var cevs = con.querySelector('.cevs');

  catalog.forEach(function (e) {
    var row = document.createElement('div');
    row.className = 'cev';
    row.innerHTML = '<span class="t"></span><span class="g"></span><button class="cbtn go">触发</button>';
    row.querySelector('.t').textContent = e.title;
    row.querySelector('.g').textContent = e.type;
    row.querySelector('.go').addEventListener('click', function () {
      engine.trigger(e.id);
      log('手动触发 ' + e.id);
    });
    cevs.appendChild(row);
  });

  function log(text) {
    var st = engine.state();
    var row = document.createElement('div');
    row.innerHTML = '<b>D+' + st.day + '</b> · ';
    row.appendChild(document.createTextNode(text));
    cl.insertBefore(row, cl.firstChild);
    while (cl.children.length > 24) cl.removeChild(cl.lastChild);
  }

  con.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-cmd]');
    if (!b) return;
    var c = b.dataset.cmd;
    if (c === 'pause') engine.setSpeed(0);
    else if (c === '1' || c === '2' || c === '4') engine.setSpeed(+c);
    else if (c === '+1d') engine.advanceDays(1);
    else if (c === '+1m') engine.nextMonth();
    else if (c === 'reset') engine.reset();
    log('命令 ' + c);
  });
  con.querySelector('.cx').addEventListener('click', function () { con.classList.remove('open'); });

  function toggleConsole(open) {
    if (open == null) open = !con.classList.contains('open');
    con.classList.toggle('open', open);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === '`' || e.key === '~') { e.preventDefault(); toggleConsole(); }
    else if (e.key === 'Escape') con.classList.remove('open');
  });

  /* ================= 事件落地到界面 ================= */
  var toastMsg = document.querySelector('.toast span:last-child');
  var evlist = document.querySelector('.evpanel .evlist');
  var doorCnt = document.querySelector('.evdoor .cnt');

  function bumpPending() {
    var n = engine.state().pending.length;
    if (doorCnt) doorCnt.textContent = pad(n);
    var al = document.querySelectorAll('.alertbar .right .al');
    if (al[1]) { var b = al[1].querySelector('b'); if (b) b.textContent = pad(n); }
  }

  engine.on('event', function (d) {
    var e = byId[d.id];
    var title = e ? e.title : d.id;
    log((d.source === 'auto' ? '自动' : '手动') + '事件 ' + d.id + ' · ' + title);
    if (toastMsg) toastMsg.innerHTML = '<b>' + (e ? e.type : '事件') + '</b> ' + title;
    if (evlist && e) {
      var row = document.createElement('div');
      row.className = 'evrow unread';
      row.innerHTML = '<i class="bar ' + (e.tone || '') + '"></i>' +
                      '<span class="ty"></span><span class="ti"></span><span class="tm">NEW</span>';
      row.querySelector('.ty').textContent = e.type;
      row.querySelector('.ti').textContent = e.title;
      evlist.insertBefore(row, evlist.firstChild);
      while (evlist.children.length > 10) evlist.removeChild(evlist.lastChild);
    }
    bumpPending();
  });

  /* ================= 渲染 ================= */
  function render() {
    var st = engine.state();

    rail.querySelector('.ty').textContent = st.date.y;
    rail.querySelector('.tm').textContent = pad(st.date.m);
    rail.querySelector('.td').textContent = pad(st.date.d);

    var pos = ((st.monthIndex + st.progress) / st.turns) * 100;
    tfill.style.width = pos + '%';
    thead.style.left = pos + '%';

    if (st.nextEvent) {
      var d = st.nextEvent.inDays;
      nextEl.textContent = d <= 0 ? '今日' : d + ' 天';
    } else {
      nextEl.textContent = '—';
    }

    playBtn.classList.toggle('on', st.speed > 0);
    playBtn.textContent = st.speed ? '‖' : '▶';
    spBtns.forEach(function (b) { b.classList.toggle('on', +b.dataset.sp === st.speed); });
    if (st.speed) engine.lastSpeed = st.speed;

    var tb = document.querySelector('.timebox .date');
    if (tb) tb.textContent = st.date.y + '·' + pad(st.date.m) + '·' + pad(st.date.d);
    var sub = document.querySelector('.timebox .sub');
    if (sub) sub.textContent = '任期 ' + pad(st.term) + ' / ' + st.turns;
    var mt = document.querySelector('.map-title small');
    if (mt) mt.textContent = 'GLOBAL SITUATION / 第 ' + pad(st.monthIndex + 1) + ' 月';

    cdEl.textContent = st.iso;
    bumpPending();
  }

  engine.on('tick', render);
  engine.on('speed', render);
  engine.on('date', render);
  engine.on('reset', function () { log('重置到 ' + engine.start); render(); });
  engine.on('schedule', render);

  /* ================= 开局档案 → 界面 ================= */
  function applySave() {
    if (!SAVE) return;
    var w = SAVE.world || {}, r = SAVE.resources || {};

    // 无 K 级：预警条切常态，帷幕与站点数来自存档
    var bar = document.querySelector('.alertbar');
    if (bar && !w.threat) {
      bar.classList.add('no-threat');
      var note = bar.querySelector('.inote');
      if (note && w.veil) note.textContent = (w.sites || 0) + ' 个站点在线 · 帷幕 ' + w.veil.value + ' · ' + w.veil.state;
      var al = bar.querySelectorAll('.right .al');
      if (al[0] && w.veil) {
        var vb = al[0].querySelector('b'); if (vb) vb.textContent = w.veil.value;
        var neg = al[0].querySelector('.neg'); if (neg) neg.style.display = 'none';
      }
    }

    // 资源
    var map = { '经费': 'funding', '编制': 'staff', '士气': 'morale', '容量': 'capacity',
                '污染': 'contam', '资产': 'asset', '帷幕': 'veil', '权威': 'authority', '共识': 'consensus' };
    Array.prototype.forEach.call(document.querySelectorAll('.metric'), function (m) {
      var k = m.querySelector('.k'); if (!k) return;
      var key = map[k.textContent.trim()];
      if (key && r[key] != null) { var v = m.querySelector('.v'); if (v) v.textContent = r[key]; }
    });

    // 待决面板只显示存档里有的条目
    var ids = (w.pending || []).slice();
    var byTitle = {};
    catalog.forEach(function (e) { byTitle[e.title] = e.id; });
    Array.prototype.forEach.call(document.querySelectorAll('.evpanel .evrow'), function (row) {
      var ti = row.querySelector('.ti'); if (!ti) return;
      var id = byTitle[ti.textContent.trim()];
      if (id && ids.indexOf(id) < 0) row.style.display = 'none';
    });
    var en = document.querySelector('.evh .n');
    if (en) en.textContent = pad(ids.length) + ' 项';

    // 提示条
    if (toastMsg && w.notice) toastMsg.innerHTML = '<b>通知</b> ' + w.notice;
  }

  /* ================= 启动 ================= */
  engine.schedule('s44', 12);          // 演示：12 天后自动来一条 SITE-44
  render();
  applySave();

  // 归档本月 = 跳到下月 1 号（与时间轴同步）
  var stamp = document.querySelector('.stamp');
  if (stamp) stamp.addEventListener('click', function () {
    engine.nextMonth();
    log('归档本月 → ' + engine.state().iso);
  });

  if (q.indexOf('console') >= 0) toggleConsole(true);
  var sm = q.match(/speed=([0-9]+)/);
  if (sm) engine.setSpeed(+sm[1]);
  var dm = q.match(/date=([0-9-]+)/);
  if (dm) engine.setDate(dm[1]);
  var tm = q.match(/trigger=([a-z0-9-]+)/);   // 冒烟测试：载入即触发一条事件
  if (tm) engine.trigger(tm[1]);

  if (q.indexOf('freeze') < 0) {
    var last = performance.now();
    (function loop(t) {
      var dt = t - last; last = t;
      engine.tick(dt);
      requestAnimationFrame(loop);
    })(last);
  }

  // 布局标定：?rects=1 把关键元素的舞台坐标写进 <title>，便于 --dump-dom 读取
  if (q.indexOf('rects') >= 0) {
    setTimeout(function () {
      var out = {};
      ['.timebox', '.rail', '.map-modes', '.map-title', '.toast', '.timerail'].forEach(function (s) {
        var el = document.querySelector(s);
        if (el) out[s] = [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight];
      });
      document.title = 'RECTS ' + JSON.stringify(out);
    }, 600);
  }
})();
