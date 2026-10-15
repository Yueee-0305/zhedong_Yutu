## 新增：浙东海防遗产数字图志

- [打开数字图志](https://yueee-0305.github.io/zhedong_Yutu/atlas/)
- [开发与数据维护说明](platform/README.md)
- [下载后可直接打开的离线版](atlas/offline.html)

新平台独立位于 `atlas/`，源代码位于 `platform/`；下方原浙江舆图手势交互保持不变。

---

# 明代浙江舆图手势交互

这是一个基于 Three.js、MediaPipe Tasks Vision HandLandmarker 和 JavaScript 的本地交互界面。

## 功能

- 以《明代浙江舆图》作为沉浸式画前主场景。
- 开场握拳保持 2 秒后进入交互。
- 张开手掌后，掌心位置形成正圆形光圈。
- 光圈内对图像局部放大并暖色照亮，模拟“掌心放大镜”。
- 靠近预设卫所点位时显示名称与说明。
- 右下角预览窗口保留高斯模糊隐私处理，同时突出手部骨骼线条。
- 支持摄像头输入，也支持上传的 `vedio.mp4` 示例视频输入。

## 上传到 GitHub 后运行

这个项目是纯静态网页，不需要 `npm install`，也不需要打包构建。把本文件夹中的所有内容上传到 GitHub 仓库根目录即可：

```text
index.html
README.md
.nojekyll
assets/
  ming-zhejiang-map.jpg
  vedio.mp4
```

### 方法一：GitHub 网页上传

1. 打开 GitHub，点击 `New repository` 新建仓库，例如命名为 `ming-zhejiang-map-interactive`。
2. 进入仓库页面，点击 `Add file -> Upload files`。
3. 上传本项目中的 `index.html`、`README.md`、`.nojekyll` 和整个 `assets` 文件夹。
4. 点击 `Commit changes` 保存。
5. 进入仓库：

```text
Settings -> Pages -> Build and deployment
```

6. Source 选择：

```text
Deploy from a branch
```

7. Branch 选择：

```text
main / root
```

8. 点击 `Save`，等待 1-3 分钟，GitHub 会生成一个 Pages 网址。

### 方法二：Git 命令上传

如果你本地已经安装 Git，可以在本项目文件夹内运行：

```bash
git init
git add .
git commit -m "Add Ming Zhejiang map gesture interaction"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

然后同样进入 GitHub 仓库：

```text
Settings -> Pages -> Build and deployment -> Deploy from a branch
```

选择 `main` 分支和 `/root` 目录。发布完成后，用 GitHub Pages 生成的网址打开页面即可。

## 现场展示操作

1. 用 Chrome 或 Edge 打开 GitHub Pages 网址。
2. 页面加载后，先点击 `使用示例视频` 或 `启用摄像头`。
3. 如果使用摄像头，浏览器弹出权限时选择允许。
4. 在画面前握拳保持 2 秒，进入舆图交互。
5. 张开手掌移动，掌心位置会出现正圆形光圈，放大并照亮对应区域。
6. 右下角预览窗口会保留高斯模糊，仅突出手部骨骼线条。

## 本地运行

在本目录下启动本地服务器：

```bash
python3 -m http.server 8080
```

然后打开：

```text
http://localhost:8080
```

## 修改卫所点位

在 `index.html` 中修改 `STRONGHOLDS` 数组即可。`x` 和 `y` 使用原图像素坐标，原图尺寸为 `1600 x 1220`。

```js
{ name:"观海卫", x:929, y:525, type:"沿海卫", evidence:"图上“观海”地名附近" }
```

## 注意

- MediaPipe 模型、MediaPipe WASM 和 Three.js 当前通过 CDN 加载，需要联网。
- 若摄像头无法打开，请检查浏览器权限，并确认页面运行在 `localhost` 或 HTTPS 环境。GitHub Pages 默认是 HTTPS，可以正常申请摄像头权限。
- `mediapaper` 在代码中按 Web 端常用的 `MediaPipe` 实现。


---

## 2026-10-15 点位校准与交互修订

**本页：** https://yueee-0305.github.io/zhedong_Yutu/

校准基准是上传的 1600×1220 像素《浙江地图》图像。古舆图是绘画式表达，不是等比例投影，不能用 GIS 经纬度直接换算像素。画上有些设施以组合名称出现，因此本版本只显示能够从图像锚定的 7 个代表性节点，保留“石浦二所”的合称。原先未经逐图核验的 10 个硬编码标点已替换。

| 节点 | 原画 x | 原画 y | 建置类别 | 校勘方式 |
| --- | ---: | ---: | --- | --- |
| 观海卫 | 929 | 525 | 沿海卫 | 观海区域文字锚定 |
| 临山卫 | 955 | 469 | 沿海卫 | 临山卫相关文字 |
| 定海所 | 1018 | 513 | 千户所·名称关系待核 | 定海相关文字 |
| 昌国卫 | 1297 | 607 | 沿海卫 | 原图“昌国卫”方框 |
| 石浦二所 | 1113 | 713 | 所级组合标识 | 原图合称 |
| 台州卫 | 948 | 696 | 府城卫 | 台州卫城图示 |
| 温州卫 | 911 | 911 | 府城卫 | 温州卫图示 |

参考前期资料《明代浙东海防建制_五府历史方位与GIS精定位版》及明代卫所研究中对府城卫、沿海卫、千户所的分类。这里的像素坐标是**画上标签定位**，不构成考古 GIS 精定位，也不代表全部明代海防设施。定海“所／卫”命名等复杂沿革仍应返回《浙江通志》与地方志核实。

**新操作：** 手势模式仍需握拳 2 秒；如没有摄像头或加载 MediaPipe 失败，点击“鼠标体验”可以直接进入。移动鼠标会短暂接管光圈，右上“展开索引”可准确跳转至各图上点位。预览窗继续高斯模糊并绘制关键点与骨骼线条。

**技术修复：** MediaPipe 优先 GPU，失败自动改 CPU；切换视频／摄像头时清空上一数据源的时间戳及手势状态；单帧识别异常不会终止整段循环。网页依赖在线 CDN 与模型资源；GitHub Pages 构建成功不等于已实际验证某台设备的摄像头、模型或 GPU。
