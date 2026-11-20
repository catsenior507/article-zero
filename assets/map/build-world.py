#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 Natural Earth 数据重建世界地图：assets/map/world-dots.png + world-data.js

为什么重做：旧版的大陆轮廓是手写的几十个经纬度点，海岸线是"多边形 + marching squares"
凑出来的，形状是错的（南美西岸、东非、东南亚尤其明显），悬停掩膜也跟着错。

投影**完全沿用旧版**（Kavrayskiy VII，SCALE=335，CX=960，CY=540，画布 1920×1080），
所以 index.html 里手写的 pin 像素坐标、菜单面板里的坐标都不用动。

数据：Natural Earth 1:110m admin_0_countries（公有领域）。见 data/README.md。
用法：
    python assets/map/build-world.py                 # 写回 assets/map/
    python assets/map/build-world.py --out <目录>     # 写到别处做对比
"""

import argparse
import json
import math
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
COUNTRIES = os.path.join(HERE, "data", "ne_110m_admin_0_countries.geojson")
LAND = os.path.join(HERE, "data", "ne_110m_land.geojson")
MARINE = os.path.join(HERE, "data", "ne_110m_geography_marine_polys.geojson")

GEO = COUNTRIES                       # 兼容旧参数；main() 会用 --countries 覆盖
LAND_GEO = LAND
MARINE_GEO = MARINE

SCALE, CX, CY = 335.0, 960.0, 540.0   # 与 world-data.js 的 project() 保持一致
SS = 2                                # 输出 2 倍图：3840×2160
W, H = 1920 * SS, 1080 * SS

DOT_STEP = 2.2          # 点阵经纬度间隔（度）
DOT_R = 2.2             # 点半径（设备像素，2 倍图下 = 1.1 CSS px）
COAST_W = 2             # 海岸线宽（设备像素）
C_DOT = (150, 172, 192, 205)
C_COAST = (176, 198, 216, 235)
C_EQUATOR = (150, 172, 192, 90)

CONTINENTS = [
    ("na", "North America", "北美洲", [-100, 45], False),
    ("sa", "South America", "南美洲", [-60, -15], False),
    ("eu", "Europe",        "欧洲",   [15, 50],   False),
    ("af", "Africa",        "非洲",   [20, 5],    False),
    ("as", "Asia",          "亚洲",   [95, 45],   False),
    ("oc", "Oceania",       "大洋洲", [134, -25], False),
    ("an", "Antarctica",    "南极洲", None,       True),
]

# Natural Earth 把俄罗斯整块算进欧洲；悬停"欧洲"时把西伯利亚点亮显然不对，改判亚洲。
OVERRIDE = {"Russia": "as"}

OCEAN_GROUPS = [
    # (id, 名称, 标签经纬度, 大洋要素, 并入该组的海/湾要素)
    # 只保留 7 个 ocean 要素会有大片空白（地中海、加勒比海都没人管），
    # 所以把 22 个 sea/bay/gulf 并进相邻大洋，保证鼠标落在地图上任何位置都能点亮一块。
    ("pac", "太平洋", [160, 10],
     ["North Pacific Ocean", "South Pacific Ocean"],
     ["Philippine Sea", "South China Sea", "Sea of Japan", "Sea of Okhotsk",
      "Tasman Sea", "Coral Sea", "Gulf of Alaska"]),
    ("atl", "大西洋", [-30, 25],
     ["North Atlantic Ocean", "South Atlantic Ocean"],
     ["Mediterranean Sea", "Black Sea", "Caribbean Sea", "Gulf of Mexico",
      "Labrador Sea", "Hudson Bay", "Baffin Bay"]),
    ("ind", "印度洋", [80, -25],
     ["INDIAN OCEAN"],
     ["Arabian Sea", "Bay of Bengal", "Persian Gulf", "Red Sea"]),
    ("arc", "北冰洋", None,
     ["Arctic Ocean"],
     ["Beaufort Sea"]),
    ("soa", "南大洋", None,
     ["SOUTHERN OCEAN"],
     ["Ross Sea", "Weddell Sea"]),
    ("cas", "内陆水域", None,
     [],
     ["Caspian Sea"]),
]


def project(lon, lat):
    """Kavrayskiy VII —— 与 world-data.js 里的 JS 版逐字对应。"""
    l = math.radians(lon)
    p = math.radians(lat)
    s = math.sqrt(max(0.0, 1.0 / 3.0 - (p / math.pi) ** 2))
    return (CX + 1.5 * SCALE * l * s, CY - SCALE * p)


def project_px(lon, lat):
    x, y = project(lon, lat)
    return (x * SS, y * SS)


def rdp(points, eps):
    """Douglas-Peucker：投影后用，单位是设备像素，所以视觉误差可控。"""
    if len(points) < 3:
        return points
    x0, y0 = points[0]
    x1, y1 = points[-1]
    dx, dy = x1 - x0, y1 - y0
    norm = math.hypot(dx, dy)
    best, best_i = -1.0, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        if norm == 0:
            d = math.hypot(px - x0, py - y0)
        else:
            d = abs(dy * px - dx * py + x1 * y0 - y1 * x0) / norm
        if d > best:
            best, best_i = d, i
    if best <= eps:
        return [points[0], points[-1]]
    left = rdp(points[:best_i + 1], eps)
    right = rdp(points[best_i:], eps)
    return left[:-1] + right


def load_land():
    """把国家按大洲分组，每组返回 (ring_lonlat, ring_px) 列表。只用于悬停掩膜与 labels。"""
    if not os.path.exists(GEO):
        sys.exit(f"缺少数据文件：{GEO}\n见 assets/map/data/README.md 的下载说明")
    data = json.load(open(GEO, encoding="utf-8"))

    groups = {key: {"rings": [], "px": []} for key, *_ in CONTINENTS}
    for feat in data["features"]:
        props = feat["properties"]
        name = props.get("name") or ""
        cont = props.get("continent") or ""
        key = OVERRIDE.get(name)
        if key is None:
            for k, cont_name, *_ in CONTINENTS:
                if cont == cont_name:
                    key = k
                    break
        if key not in groups:
            continue
        geom = feat["geometry"]
        if not geom:
            continue
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            ring = poly[0]                       # 只取外环；110m 下的内环只有莱索托这种小洞
            if len(ring) < 4:
                continue
            lonlat = simplify_ring(ring, 0.28)
            if len(lonlat) < 4:
                continue
            groups[key]["rings"].append(lonlat)
            groups[key]["px"].append([project_px(lon, lat) for lon, lat in lonlat])
    return groups


def simplify_ring(ring, eps=0.28):
    """在经纬度空间做 RDP，eps 单位是「度」。

    早先的写法是"先投影到像素再简化，然后用顶点下标反查经纬度"——当 RDP 跳过一整段
    平直海岸线时，反查会越界，拿错顶点，掩膜就变成一堆乱多边形（悬停时看得一清二楚）。
    投影下约 5.5 设备像素/度，所以 0.28° ≈ 1.5px，视觉误差与原来相当。
    """
    pts = [(float(lon), float(lat)) for lon, lat in ring]
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]                      # 闭合点交给 JS 的 path 补 Z
    if len(pts) < 3:
        return [[round(p[0], 2), round(p[1], 2)] for p in pts]
    simp = rdp(pts, eps)
    return [[round(p[0], 2), round(p[1], 2)] for p in simp]


def load_oceans():
    """真实大洋轮廓（Natural Earth marine polys），替代旧版手画的几个粗多边形。"""
    if not os.path.exists(MARINE_GEO):
        sys.exit(f"缺少数据文件：{MARINE_GEO}\n见 assets/map/data/README.md 的下载说明")
    data = json.load(open(MARINE_GEO, encoding="utf-8"))
    keys = {}
    for key, _name, _label, oceans, seas in OCEAN_GROUPS:
        for n in oceans + seas:
            keys[n.strip().lower()] = key
    buckets = {key: [] for key, *_ in OCEAN_GROUPS}

    for feat in data["features"]:
        key = keys.get((feat["properties"].get("name") or "").strip().lower())
        if not key:
            continue
        geom = feat["geometry"]
        if not geom:
            continue
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            ring = poly[0]
            if len(ring) < 4:
                continue
            lonlat = simplify_ring(ring, 0.32)
            if len(lonlat) >= 4:
                buckets[key].append(lonlat)

    oceans_out = []
    for key, name, label, _oceans, _seas in OCEAN_GROUPS:
        if buckets[key]:
            oceans_out.append({"id": key, "name": name, "label": label, "polys": buckets[key]})
    return oceans_out


def load_draw():
    """合并后的陆地轮廓（不带国界），用于点阵、海岸线与遮罩。
    用国家数据描边会把每一道国界都画出来，读起来像政区图。"""
    if not os.path.exists(LAND_GEO):
        sys.exit(f"缺少数据文件：{LAND_GEO}\n见 assets/map/data/README.md 的下载说明")
    data = json.load(open(LAND_GEO, encoding="utf-8"))
    rings = []
    for feat in data["features"]:
        geom = feat["geometry"]
        if not geom:
            continue
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            outer = poly[0]
            if len(outer) < 4:
                continue
            faint = max(lat for _, lat in outer) < -55     # 南极洲：压淡，与 faint:true 对应
            simp = rdp([project_px(lon, lat) for lon, lat in outer], 1.4)
            if len(simp) >= 4:
                rings.append((simp, faint))
    return rings


def draw(rings, outdir):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    solid = [r for r, faint in rings if not faint]
    faint = [r for r, f in rings if f]

    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    for ring in solid:
        md.polygon(ring, fill=255)
    mask_f = Image.new("L", (W, H), 0)
    mf = ImageDraw.Draw(mask_f)
    for ring in faint:
        mf.polygon(ring, fill=255)

    dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dots)
    n = 0
    lat = -88.0
    while lat <= 88.0:
        lon = -180.0
        while lon < 180.0:
            x, y = project_px(lon, lat)
            if 0 <= x < W and 0 <= y < H:
                px, py = int(x), int(y)
                col = None
                if mask.getpixel((px, py)) > 128:
                    col = C_DOT
                elif mask_f.getpixel((px, py)) > 128:
                    col = (C_DOT[0], C_DOT[1], C_DOT[2], 70)     # 南极洲压淡
                if col:
                    dd.ellipse((x - DOT_R, y - DOT_R, x + DOT_R, y + DOT_R), fill=col)
                    n += 1
            lon += DOT_STEP
        lat += DOT_STEP
    img.alpha_composite(dots)

    coast = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(coast)
    for ring in solid:
        cd.line(list(ring) + [ring[0]], fill=C_COAST, width=COAST_W, joint="curve")
    for ring in faint:
        cd.line(list(ring) + [ring[0]], fill=(C_COAST[0], C_COAST[1], C_COAST[2], 95),
                width=COAST_W, joint="curve")
    img.alpha_composite(coast)

    # 投影边界（经度 ±180 的曲线）；旧图这里是一圈装饰性的圆
    edge = [project_px(179.9, lat) for lat in range(-90, 91, 2)]
    edge += [project_px(-179.9, lat) for lat in range(90, -91, -2)]
    ImageDraw.Draw(img).line(edge + [edge[0]], fill=(150, 172, 192, 55), width=2)

    equ = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(equ).line([(0, CY * SS), (W, CY * SS)], fill=C_EQUATOR, width=1)
    img.alpha_composite(equ)

    out = os.path.join(outdir, "world-dots.png")
    img.save(out, optimize=True)
    print(f"world-dots.png  {img.size[0]}×{img.size[1]}  {os.path.getsize(out)//1024} KB  点 {n} 个")
    return n


def js(groups, oceans, nearest):
    def fmt_polys(rings):
        lines = []
        for ring in rings:
            body = ",".join("[%g,%g]" % (p[0], p[1]) for p in ring)
            lines.append(f"        [{body}]")
        return "[\n" + ",\n".join(lines) + "\n      ]"

    def fmt_label(label):
        return "null" if label is None else "[%g, %g]" % (label[0], label[1])

    parts = []
    for key, _, name, label, faint in CONTINENTS:
        rings = groups[key]["rings"]
        if not rings:
            continue
        faint_s = ", faint: true" if faint else ""
        parts.append(
            f"    {key}: {{\n"
            f"      name: '{name}', label: {fmt_label(label)}{faint_s},\n"
            f"      polys: {fmt_polys(rings)}\n"
            f"    }}"
        )
    cont_js = ",\n".join(parts)

    oce_js = ",\n".join(
        "    { id: '%s', name: '%s', label: %s,\n      polys: %s }"
        % (o["id"], o["name"], fmt_label(o["label"]), fmt_polys(o["polys"]))
        for o in oceans
    )

    return f"""/* 《第零条》世界地图数据（自动生成，勿手改）
   数据：Natural Earth 1:110m admin_0_countries（公有领域）
   生成：assets/map/build-world.py —— 改地图请改生成器并重跑，不要直接编辑本文件。
   投影：Kavrayskiy VII，SCALE={SCALE:g}，CX={CX:g}，CY={CY:g}，画布 1920×1080；
         world-dots.png、悬停掩膜、界面上的 pin 三者共用这套坐标。 */

window.WORLD = (function () {{
  const SCALE = {SCALE:g}, CX = {CX:g}, CY = {CY:g};

  // 大洲：按 Natural Earth 的 continent 字段分组（俄罗斯并入亚洲）
  const CONTINENTS = {{
{cont_js}
  }};

  // 大洋：只用于悬停掩膜与标签
  const OCEANS = [
{oce_js}
  ];

  // 空白兜底：每个网格格子里"最近的真实区域"，悬停时用（. = 界外，不亮）
  const NEAREST = {json.dumps(nearest, ensure_ascii=False)};

  function project(lon, lat) {{
    const l = lon * Math.PI / 180;
    const p = lat * Math.PI / 180;
    const s = Math.sqrt(Math.max(0, 1 / 3 - Math.pow(p / Math.PI, 2)));
    return [CX + 1.5 * SCALE * l * s, CY - SCALE * p];
  }}

  function inPoly(lon, lat, poly) {{
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {{
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) c = !c;
    }}
    return c;
  }}

  function inAny(lon, lat, polys) {{
    for (const p of polys) if (inPoly(lon, lat, p)) return true;
    return false;
  }}

  return {{ CONTINENTS, OCEANS, NEAREST, project, inPoly, inAny }};
}})();
"""


def build_nearest(groups, oceans):
    """给"没人管"的水面做最近区域查表。

    Natural Earth 的海域多边形不铺满地表面——岛屿之间、近岸、极区都有缝，
    鼠标落上去什么都不会亮。这里按距离场算出每个空白像素最近的真实区域，
    按 20px 一格压成一张小表交给前端，悬停时兜底高亮"最近的那块"。
    """
    import numpy as np
    from scipy import ndimage

    GW, GH = 96, 54
    W1, H1 = 1920, 1080
    lab = np.zeros((H1, W1), dtype=np.int32)
    names = []
    idx = 1

    for o in oceans:
        m = Image.new("L", (W1, H1), 0)
        d = ImageDraw.Draw(m)
        for ring in o["polys"]:
            d.polygon([project(lon, lat) for lon, lat in ring], fill=255)
        lab[np.array(m) > 127] = idx
        names.append(o["name"])
        idx += 1

    for key, _name_en, name, _label, _faint in CONTINENTS:
        rings = groups[key]["px"]
        if not rings:
            continue
        m = Image.new("L", (W1, H1), 0)
        d = ImageDraw.Draw(m)
        for ring in rings:
            d.polygon([(x / SS, y / SS) for x, y in ring], fill=255)
        lab[np.array(m) > 127] = idx        # 陆地盖在海面上方，与渲染顺序一致
        names.append(name)
        idx += 1

    _, (iy, ix) = ndimage.distance_transform_edt(lab == 0, return_indices=True)
    nearest = lab[iy, ix]

    lens = Image.new("L", (W1, H1), 0)
    edge = [project(179.9, lat) for lat in range(-90, 91, 2)]
    edge += [project(-179.9, lat) for lat in range(90, -91, -2)]
    ImageDraw.Draw(lens).polygon(edge, fill=255)
    inside = np.array(lens) > 127

    cw, chh = W1 / GW, H1 / GH
    cells = []
    for gy in range(GH):
        for gx in range(GW):
            px, py = int(gx * cw + cw / 2), int(gy * chh + chh / 2)
            v = nearest[py, px] if inside[py, px] else 0
            cells.append(chr(65 + v - 1) if v > 0 else ".")
    return {"gw": GW, "gh": GH, "keys": names, "cells": "".join(cells)}


def report_coverage(groups, oceans):
    """检查掩膜覆盖：投影范围内还有多少地方是"悬停不到"的空白。"""
    import numpy as np

    m = Image.new("L", (1920, 1080), 0)
    d = ImageDraw.Draw(m)
    for g in groups.values():
        for ring in g["px"]:
            d.polygon([(x / SS, y / SS) for x, y in ring], fill=255)
    for o in oceans:
        for ring in o["polys"]:
            d.polygon([project(lon, lat) for lon, lat in ring], fill=255)

    lens = Image.new("L", (1920, 1080), 0)
    edge = [project(179.9, lat) for lat in range(-90, 91, 3)]
    edge += [project(-179.9, lat) for lat in range(90, -91, -3)]
    ImageDraw.Draw(lens).polygon(edge, fill=255)

    cov = np.array(m) > 128
    ins = np.array(lens) > 128
    total = int(ins.sum())
    hole = int((ins & ~cov).sum())
    print(f"覆盖：{100 * (1 - hole / max(1, total)):.2f}% 的图面有真实掩膜（空 {hole} px / {total} px）")
    print("      空白由 NEAREST 最近区域查表兜底，悬停时仍会点亮最近的一块")

    if hole > total * 0.004:
        gh, gw = 12, 24
        print("   空白分布（. 界外 / 空格 无空白 / - + # 渐多）：")
        for gy in range(gh):
            row = ""
            for gx in range(gw):
                y0, y1 = gy * 1080 // gh, (gy + 1) * 1080 // gh
                x0, x1 = gx * 1920 // gw, (gx + 1) * 1920 // gw
                si, sc = ins[y0:y1, x0:x1], cov[y0:y1, x0:x1]
                t = int(si.sum())
                if t < 30:
                    row += "."
                else:
                    r = 1 - (si & sc).sum() / t
                    row += " " if r < 0.15 else ("-" if r < 0.5 else ("+" if r < 0.8 else "#"))
            print("   " + row)


def main():
    global GEO, LAND_GEO, MARINE_GEO
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=HERE, help="输出目录，默认 assets/map/")
    ap.add_argument("--countries", default=COUNTRIES, help="国家 GeoJSON（悬停掩膜用）")
    ap.add_argument("--land", default=LAND, help="陆地 GeoJSON（点阵与海岸线用）")
    ap.add_argument("--marine", default=MARINE, help="大洋 GeoJSON（悬停掩膜用）")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    GEO = args.countries
    LAND_GEO = args.land
    MARINE_GEO = args.marine
    groups = load_land()
    rings = load_draw()
    oceans = load_oceans()
    total = sum(len(g["rings"]) for g in groups.values())
    pts = sum(len(r) for g in groups.values() for r in g["rings"])
    print(f"悬停掩膜：{total} 个外环，简化后 {pts} 个顶点")
    print("大洋掩膜：" + "、".join(f"{o['name']}({len(o['polys'])})" for o in oceans))
    print(f"岸线：{len(rings)} 个闭合环")
    report_coverage(groups, oceans)
    nearest = build_nearest(groups, oceans)
    draw(rings, args.out)
    p = os.path.join(args.out, "world-data.js")
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(js(groups, oceans, nearest))
    print(f"world-data.js  {os.path.getsize(p)//1024} KB")


if __name__ == "__main__":
    main()
