# 素材库 / assets

《第零条》主界面及后续界面的素材源。**控件、图标、地图为原创；`scp/*.png` 是抓自中文维基的官方部门徽记**（授权见 `scp/ATTRIBUTION.md`）。

## 清单

| 文件 | 用途 | 生成方式 |
|---|---|---|
| `map/world-dots.png` | 战略地图底图，3840×2160，透明底 | `map/build-world.py` 从 Natural Earth 110m 生成 |
| `map/build-world.py` | 地图生成器：点阵 + 海岸线 + 悬停数据 | Natural Earth + Kavrayskiy VII |
| `map/data/*.geojson` | 陆地 / 国家多边形（**公有领域**） | 见 `map/data/README.md` |
| `map/world-data.js` | 大洲/大洋经纬度 + 投影 | 由生成器写出，**勿手改** |
| `icons.svg` | 22 个 24×24 线性图标（导航 / 图层 / 资源 / 印章） | 手写；整份由 `ui/build-icons.mjs` 导出 |
| `icons.js` | 图标精灵的运行时注入版（`file://` 下外链 `<use>` 会被拦） | `i-*` 手写；`frame-*` 由 `ui/*.svg` 母版生成 |
| `marks/logo.svg` | 作品标记：档案框中的空集符号 | 手写 SVG |
| `textures/grain.svg` | 全局胶片颗粒 | feTurbulence |
| `ui/*.svg` | **控件母版**（按钮 / 卡片，先画后用） | 见 `ui/README.md` |
| `scp/*.png` | **SCP 官方部门徽记**（抓取自中文维基部门页） | 见 `scp/ATTRIBUTION.md` |

> 顶栏徽记当前使用 `scp/logo_250.png`（官方图，CC BY-SA）；`marks/logo.svg` 保留为自绘的独立素材版。

## SCP 识别元素（v4）

界面里的基金会识别元素：按钮与线框为自绘；**部门徽记与顶栏徽记使用官方 PNG**（CC BY-SA，见 `scp/ATTRIBUTION.md`）。下表记录的是 v4 自绘阶段的设计：

| 元素 | 位置 | 说明 |
|---|---|---|
| 三向内向箭头印章 | 顶栏左侧 | 向官方三箭头徽记致意，线条与比例自绘 |
| SECURE · CONTAIN · PROTECT | 品牌副行 | 基金会格言 |
| LEVEL 5 / O5-0 EYES ONLY + 条码 | 顶栏右 | 权限等级条 |
| SCP-8███ | 预警条、面板标题 | 遮蔽编号的项目号 |
| 部门单字徽章 | 部门面板 | 站 / 逆 / 超 / 数 / 时 / 误 / 档 / 采 / 炼 / 伦 |
| 按钮切角 | 所有按钮 | 技术图纸式角标 |

**为什么不是官方文件**：

1. 当前环境无法下载二进制图片，只能取文本（SVG）；
2. 官方徽记属商标，wiki 上的图片逐张授权不同；
3. 按"找不到就模仿绘画"的原则，采用自绘致敬版。

**发布前若要换成官方素材**：按上面的合规清单逐项处理——逐张记录作者与链接、CC BY-SA 3.0、不加密分发、不使用官方 logo 作为商标。徽记建议长期保留自绘版。



## 控件边框（v5）

按钮不再用 CSS 边框。每个控件类型一张手绘 SVG 母版（`ui/*.svg`），生成到 `icons.js` 的 `frame-*` symbol，通过 `<use href="#frame-*">` 引用，`currentColor` 跟随主题：

| symbol | 尺寸 | 形状 |
|---|---|---|
| `frame-abtn` | 76×28 | 对称六角标牌，左端状态条 + 四铆钉 |
| `frame-btn` | 240×44 | 六角板，左图标井 + 铭牌 + 右指示灯 |
| `frame-rail` | 46×46 | 八角板，八角内凹 + 四螺钉 + 序号牌 |
| `frame-mode` | 36×36 | 八角小牌，底部灯座 |
| `frame-gear` | 28×28 | 八角板 + 内缩线 |
| `frame-stamp` | 150×52 | 六角印章，三层框 + 冲孔 |
| `frame-card` | 250×62 | 切角档案卡，左侧穿孔点 |

> v12：六个按钮母版重画为"边光 / 内凹 / 五金 / 状态件"四段式，并引入 `ui/build-icons.mjs`——
> 母版成为唯一真源，`icons.js` 与 `icons.svg` 都由它生成，三者不会再漂移。审查记录见 `docs/10-素材审查.md`。

文字仍是 HTML，浮在 SVG 上层；换语言、改字号都不用重画边框。

## 主题

四套配色不重出素材，全部由 `mockups/v2.css` 的 CSS 变量控制；地图只用 `filter` 变色：

| 主题 | 地图处理 |
|---|---|
| black | 原色 |
| white | `invert(1) brightness(.42)` |
| blue | `sepia + hue-rotate(155deg)` |
| red | `sepia + hue-rotate(-28deg)` |

## 为什么不用官方素材

1. SCP Wiki 的文本与图片依 **CC BY-SA 3.0**，但**逐张图片的授权不同**，部分仅限站内使用、不可商用。
2. "SCP 基金会"名称与标志是**商标**，商业发行中直接使用有风险。
3. 官方 [Games Licensing Guidelines](https://05command.wikidot.com/games-licensing-guidelines) 的结论是：派生素材需 CC BY-SA 且不加密；**原创叙事与原创异常只需署名**。
4. 因此本作走"原创资产 + 署名致敬"的路线：视觉语言像基金会，但每一张图都是自己的。

## 如果后续引入官方素材

- [ ] 只用 CC BY-SA 3.0 或更宽松的图，逐张记录作者与来源链接；
- [ ] 在游戏内"关于"页列出：作者名 + 原页面 URL + 授权类型；
- [ ] 派生素材同样以 CC BY-SA 3.0 发布，且**不加密**地随游戏分发；
- [ ] 不使用官方 logo 作为游戏标志或商标；
- [ ] 不把官方条目原文直接抄进游戏文本。

## 重新生成

**地图**：`python assets/map/build-world.py`（需要 Pillow）。

它会读 `map/data/*.geojson`，一次性重写 `world-dots.png`（3840×2160，透明底）与 `world-data.js`。
投影固定为 Kavrayskiy VII（`SCALE=335, CX=960, CY=540`），三份产物共用这一套坐标，
所以换数据、调点距都不会让界面里手写的 pin 跑位。

想调整外观就改脚本顶部的 `DOT_STEP`（点阵间隔）、`C_DOT` / `C_COAST`（颜色）；想换数据就换 `data/` 里的 GeoJSON。旧的 `map/world-gen.html` 已废弃，只留一张说明页。

**图标**：`icons.svg` 是符号源文件；因为 `file://` 下外链 `<use>` 会被浏览器拦截，构建时把 `<symbol>` 块**内联**进 HTML，再用 `<use href="#i-dept">` 引用。
