# 明代浙江舆图 · 手势交互

[在线体验](https://yueee-0305.github.io/zhedong_Yutu/) · [已发布卫所数据 JSON](assets/historical-map-verified.json) · [图文坐标对照 CSV](assets/historical-map-verified.csv)

本项目以明嘉靖时期《浙江地图》为图面，使用 Three.js、MediaPipe Tasks Vision 和 JavaScript 实现手势探索。原图尺寸为 **1600 × 1220 像素**。

## 已发布的原图卫所标注

本次发布仅收录图上可直接辨认、且与明代海防建置表明确对应的四处军事机构：

| 原图文字 | 规范名称 | 建置类别 | 原图像素坐标（x, y） | 主要文献 |
| --- | --- | --- | --- | --- |
| 臨山衛 | 临山卫 | 沿海卫 | (917, 484) | 《浙江通志》卷98〈海防四〉 |
| 三山所 | 三山所 | 千户所 | (965, 486) | 《浙江通志》卷98〈海防四〉 |
| 昌國衛 | 昌国卫 | 沿海卫 | (1297, 607) | 《浙江通志》卷97〈海防三〉 |
| 台州衛 | 台州卫 | 府城卫 | (923, 717) | 《浙江通志》卷98〈海防四〉 |

依据工作簿 `明代浙东海防建制_五府历史方位与GIS精定位版.xlsx` 的 `数据表`，在 JSON 数据中记录原始表格行号、历史方位、建置年代（有据时）及主要史料。

图像坐标从**原图左上角**起算，x 向右、y 向下，表示的是古地图上的文字锚点，**不等于现代地理坐标或考古遗址实测位置**。

## 仓库结构

```text
index.html
.nojekyll
README.md
assets/
  ming-zhejiang-map.jpg
  vedio.mp4
  historical-map-verified.json  # 网站直接读取的卫所资料
  historical-map-verified.csv   # 可直接检查的表格副本
atlas/                        # 浙东海防数字图志
platform/                     # 数字图志数据维护与开发资料
coastal-defense-map/          # 其他海防地理展示
```

根目录 `index.html` 通过 `fetch("./assets/historical-map-verified.json")` 加载位置与史料，不再维护第二套硬编码卫所坐标。更新数据文件后，地图及右上角索引会使用同一份资料。

## 使用方法

1. 使用 Chrome 或 Edge 打开 [在线交互页面](https://yueee-0305.github.io/zhedong_Yutu/)。
2. 点击“启用摄像头”，在摄像头前握拳保持 **2 秒**进入。
3. 张开手掌移动，通过圆形光圈局部放大、照亮原图。
4. 右上角打开“卫所定位”索引，点击地名直接移动到原图对应位置。
5. 不使用摄像头时，可以点击“鼠标体验”，通过鼠标移动光圈。
6. 右下角视频预览使用高斯模糊处理背景，并在其上描绘手部骨骼连线。

手势识别在 GPU 模式不可用时自动使用 CPU；同步推理频率限制为约 30fps，以降低浏览器主线程负担。

## 本地运行

根目录执行：

```bash
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080`。如使用摄像头，请允许浏览器摄像头权限。MediaPipe 与 Three.js 资源由 CDN 加载，需要互联网连接。

## 关联项目

- [浙东海防遗产数字图志](https://yueee-0305.github.io/zhedong_Yutu/atlas/)
- [数字图志开发维护说明](platform/README.md)
- [数字图志离线页面](atlas/offline.html)
