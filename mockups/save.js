/* 开局档案（默认存档）
   ------------------------------------------------------------------
   时间点：2026-11-20，第 1 回合。
   世界状态：**未发现任何 K 级事件**，帷幕 78（正常），19 个站点在线。
   待决队列里只有两件日常人事，没有异常条目。

   这是"默认存档"的第一版：目前只被 time-ui.js 读取（时间、待决、帷幕、资源）。
   接后端后，它应该由存档接口返回同样的结构。
*/
window.SAVE_DEFAULT = {
  version: 1,
  id: 'default-2026-11-20',
  name: '开局 · 2026.11',
  createdAt: '2026-11-20',

  game: {
    date: '2026-11-20',
    speed: 0,                 // 0 = 暂停
    term: 1,
    turns: 54
  },

  world: {
    threat: null,             // 无 K 级；有值时形如 { code, name, progress, countdown }
    veil: { value: 78, state: '正常', delta: 0 },
    sites: 19,
    pending: ['d02', 'd03'],  // 清洁工的加班单 / 新人的第一课
    notice: 'SITE-44 报告一次未登记的人员变动。',

    // 外交：七个区域政府的可变状态（名称、预算与条件在 diplomacy.js 里）
    governments: [
      { id: 'na', relation: 62, cooldownDay: 0, concessions: [] },
      { id: 'eu', relation: 48, cooldownDay: 0, concessions: [] },
      { id: 'as', relation: 41, cooldownDay: 0, concessions: [] },
      { id: 'sa', relation: 35, cooldownDay: 0, concessions: [] },
      { id: 'af', relation: 28, cooldownDay: 0, concessions: [] },
      { id: 'oc', relation: 52, cooldownDay: 0, concessions: [] },
      { id: 'an', relation: 20, cooldownDay: 0, concessions: [] }
    ],

    // 组织：部门等级（驻地与隶属在 org.js 里）
    org: {
      levels: {
        ops: 4, anti: 2, pata: 3, math: 3, dt: 2, theo: 2, misc: 2,
        raisa: 3, proc: 3, alch: 2, del: 1, cont: 1, decom: 1, aeed: 1
      }
    }
  },

  resources: {
    funding: '$300',
    staff: 84,
    morale: 65,
    capacity: 28,
    contam: '08',
    asset: '06',
    authority: 60,
    consensus: 55
  }
};
