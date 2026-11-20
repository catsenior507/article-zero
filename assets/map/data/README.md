# 地图数据（Natural Earth）

`world-dots.png` 和 `world-data.js` 都由 `../build-world.py` 从这里的两个文件生成，**不要手改生成物**。

| 文件 | 内容 | 用途 |
|---|---|---|
| `ne_110m_land.geojson` | 合并后的陆地多边形（127 个要素、128 个外环） | 点阵填充、海岸线描边 |
| `ne_110m_admin_0_countries.geojson` | 国家多边形，带 `continent` 字段 | 大洲悬停掩膜、标签 |
| `ne_110m_geography_marine_polys.geojson` | 7 个大洋 + 22 个海/湾/湾多边形 | 大洋悬停掩膜（海/湾按位置并入相邻大洋） |

## 来源与授权

- 数据集：**Natural Earth 1:110m Cultural / Physical Vectors**（<https://www.naturalearthdata.com/>）
- 授权：**公有领域（Public Domain）**，无需署名、可商用。上面仍标注来源，是为了可追溯。
- 下载（jsDelivr 镜像）：

```bash
curl -L -o ne_110m_land.geojson \
  https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson
curl -L -o ne_110m_admin_0_countries.geojson \
  https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson
curl -L -o ne_110m_geography_marine_polys.geojson \
  https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_geography_marine_polys.geojson
```

## 为什么用两个文件

- **描边/点阵**用 `land`：它是合并过的整块陆地，只描海岸线。若用国家数据描边，会把每一道国界都画出来，看起来像政区图（试过，很丑）。
- **掩膜**用 `countries`：悬停"欧洲 / 亚洲"需要按大洲分组，`land` 里没有这个信息。
- 生成器里对 **Russia** 做了特判：Natural Earth 把整块俄罗斯算进欧洲，悬停"欧洲"时点亮西伯利亚显然不对，改判亚洲。

## 投影

沿用旧版的 Kavrayskiy VII：`SCALE=335, CX=960, CY=540`，画布 1920×1080。
`world-dots.png`（2 倍图）、`world-data.js` 的 `project()`、界面上手写的 pin 像素坐标**三者共用这一套坐标**，
所以换数据不会让 pin 跑位。
