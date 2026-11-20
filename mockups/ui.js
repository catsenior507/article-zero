/* 《第零条》原型交互层 `file://` 下直接可用，无依赖
   目的：让静态稿真的能按——点了有反馈、状态能切换，方便验收每个控件的热区与状态。
   只做"按下 → 有什么反应"，不含任何游戏逻辑。
   01-main.html / 02-dept.html 共用；参数：
     ?test=1   显示测试台（事件标点切换 / 主题切换 / 点击日志）
     ?auto=1   载入后自动依次点击几个控件（截图验收用）
     ?events=1 直接展开待决事件面板
     ?dot=unread|expiring|none  强制事件门标点状态
*/
(function () {
  var q = location.search;
  var TEST = q.indexOf('test') >= 0;
  var scr = document.querySelector('.screen');
  if (!scr) return;

  /* ---------- 提示条 + 日志 ---------- */
  var flashEl = document.createElement('div');
  flashEl.id = 'flashbar';
  scr.appendChild(flashEl);
  var logEl = null;

  function flash(text) {
    flashEl.textContent = text;
    flashEl.classList.add('on');
    clearTimeout(flashEl._t);
    flashEl._t = setTimeout(function () { flashEl.classList.remove('on'); }, 1600);
    if (logEl) {
      var row = document.createElement('div');
      var t = new Date();
      row.textContent = ('0' + t.getMinutes()).slice(-2) + ':' + ('0' + t.getSeconds()).slice(-2) + '  ' + text;
      logEl.insertBefore(row, logEl.firstChild);
      while (logEl.children.length > 20) logEl.removeChild(logEl.lastChild);
    }
  }

  function press(el) {
    el.classList.add('pressed');
    setTimeout(function () { el.classList.remove('pressed'); }, 160);
  }

  /* ---------- 事件门：展开 / 收起 + 红黄标点 ---------- */
  var evdoor = document.querySelector('.evdoor');
  var evpanel = document.querySelector('.evpanel');
  var dot = document.querySelector('.evdoor .dot');

  function setDot(state) {                       // unread | expiring | none
    if (!dot) return;
    dot.className = 'dot' + (state === 'none' ? '' : ' ' + state);
    dot.style.display = state === 'none' ? 'none' : '';
  }
  function openPanel(open) {
    if (!evpanel) return;
    evpanel.classList.toggle('open', open);
    if (evdoor) evdoor.classList.toggle('on', open);
    if (open) setDot('expiring');               // 展开 = 读过；之后保持黄点，不退回红点
  }

  if (evdoor) {
    evdoor.addEventListener('click', function () {
      press(evdoor);
      var willOpen = !evpanel.classList.contains('open');
      openPanel(willOpen);
      flash(willOpen ? '待决事件：展开（读过 → 黄点）' : '待决事件：收起');
    });
  }
  if (evpanel) {
    var x = evpanel.querySelector('.x');
    if (x) x.addEventListener('click', function (e) {
      e.stopPropagation();
      openPanel(false);
      flash('待决事件：关闭');
    });
    Array.prototype.forEach.call(evpanel.querySelectorAll('.evrow'), function (row) {
      row.addEventListener('click', function () {
        press(row);
        flash('处置：' + row.querySelector('.ti').textContent);
      });
    });
  }

  if (q.indexOf('events') >= 0) openPanel(true);
  else if (q.indexOf('dot=expiring') >= 0) setDot('expiring');
  else if (q.indexOf('dot=none') >= 0) setDot('none');

  /* ---------- 通用：所有门 / 按钮 / 图层键 ---------- */
  function bindAll(sel, label, group) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      if (el.classList.contains('evdoor')) return;
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        press(el);
        if (group) {
          Array.prototype.forEach.call(el.parentNode.children, function (s) { s.classList.remove('on'); });
          el.classList.add('on');
        }
        var name = el.getAttribute('title') || el.textContent.trim().slice(0, 14) || el.className;
        flash(label + '：' + name);
      });
    });
  }
  bindAll('.rbtn', '右侧面板', true);
  bindAll('.mmode', '地图图层', true);
  bindAll('.door', '底栏门', false);
  bindAll('.abtn', '预警按钮', false);
  bindAll('.btn', '面板动作', false);
  bindAll('.stamp', '归档本月', false);
  bindAll('.gear', '设置', false);

  /* ---------- 测试台 ---------- */
  if (TEST) {
    var pad = document.createElement('div');
    pad.className = 'testpad';
    pad.innerHTML =
      '<b>控制台 / TEST</b>' +
      '<div class="row"><span>事件标点</span>' +
        '<button data-dot="unread">红·未读</button>' +
        '<button data-dot="expiring">黄·将过期</button>' +
        '<button data-dot="none">无</button></div>' +
      '<div class="row"><span>事件面板</span>' +
        '<button data-panel="open">展开</button>' +
        '<button data-panel="close">收起</button></div>' +
      '<div class="row"><span>主题</span>' +
        '<button data-theme="black">黑</button>' +
        '<button data-theme="white">白</button>' +
        '<button data-theme="blue">蓝</button>' +
        '<button data-theme="red">红</button></div>' +
      '<div class="log"></div>';
    document.body.appendChild(pad);
    logEl = pad.querySelector('.log');

    pad.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.dot) { setDot(b.dataset.dot); flash('标点 → ' + b.dataset.dot); }
      if (b.dataset.panel) { openPanel(b.dataset.panel === 'open'); flash('面板 → ' + b.dataset.panel); }
      if (b.dataset.theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        document.body.classList.add('theme-' + b.dataset.theme);
        flash('主题 → ' + b.dataset.theme);
      }
    });
    flash('测试台就绪：点任意按钮看日志');
  }

  /* ---------- 自动点击（截图验收） ---------- */
  if (q.indexOf('auto') >= 0) {
    var seq = ['.door[title="科研"]', '.door[title="外交"]', '.abtn', '.rbtn', '.mmode', '.stamp'];
    var i = 0;
    (function step() {
      if (i >= seq.length) return;
      var el = document.querySelector(seq[i++]);
      if (el) el.click();
      setTimeout(step, 260);
    })();
  }
})();
