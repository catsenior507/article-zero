/* 测试用事件目录（取自 docs/05 的卡名，字段按 docs/04 的 schema 简化）
   控制台从这里取列表；接真实数据后由后端返回同样结构。
   type: 日常 / 流程 / 关键；tone: k(黑) / p(紫) / ''(灰) —— 对应事件行左侧色条 */
var EVENT_CATALOG = [
  { id: 's44', type: '日常 · 异常', tone: 'k', title: 'SITE-44 人员变动',
    desc: '一次未登记的人员调动，没有对应的调令编号。' },
  { id: 'd01', type: '日常 · 异常', tone: 'k', title: '食堂的第四把椅子',
    desc: '多出来的那把椅子，每天都被擦干净。' },
  { id: 'p01', type: '流程 · 政治', tone: 'p', title: 'O5 表决：第 14 号提案',
    desc: '关于是否扩大记忆删除授权的表决。' },
  { id: 'p02', type: '流程 · 帷幕', tone: '', title: '记忆删除预算超额',
    desc: '本季度用量已达上限的 112%。' },
  { id: 'd02', type: '日常 · 人事', tone: '', title: '清洁工的加班单',
    desc: 'B 区夜班连续三周无人签退。' },
  { id: 'd03', type: '日常 · 人事', tone: '', title: '新人的第一课',
    desc: '一名三级研究员拒绝了标准入职流程。' },
  { id: 'd04', type: '日常 · 异常', tone: 'k', title: '停尸房的编号',
    desc: '编号 07 的抽屉从内部被锁上了。' },
  { id: 'k01', type: '关键 · 叙事', tone: 'p', title: '第零条的空白签署页',
    desc: '档案室出现一页没有抬头的命令纸。' }
];

if (typeof module === 'object' && module.exports) { module.exports = EVENT_CATALOG; }
