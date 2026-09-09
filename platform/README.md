> 公开版仅包含基础元数据。在线访问 ../atlas/；离线打开 ../atlas/offline.html。研究原文未公开。

# 浙东海防遗产数字图志

可独立运行、可部署到 GitHub Pages 的文化遗产研究平台。代码采用 MIT 许可证；
资料与图像的许可单独说明，见 [DATA_LICENSE.md](DATA_LICENSE.md)。

**先体验：下载并解压完整项目，双击 `dist/offline.html`，无需登录、安装或联网。**
如果在聊天文件预览中不能运行脚本，请先下载文件，再用电脑浏览器打开。

## 已完成的功能

- 地图：原表 163 条坐标点、平移缩放、城市/体系筛选、关系图层与档案联动。
- 档案：282 条记录、搜索、分页、详情、稳定 ID 链接、筛选结果 CSV 导出。
- 知识学习：五类阅读线索，可跳转到对应真实遗产记录。
- 历史舆图：原表文件目录；填写 `data/media.json` 后可用图像放大查看器。
- 海防体系：48 条原表包含/隶属关系，点击节点打开档案。
- 资料检索：支持“观海卫城有什么历史”等问题，返回原表摘录和 ID。
- 可选 AI：Node 后端对接兼容 Chat Completions 格式的 HTTPS 服务；密钥仅在后端。
- 互动学习：可点击操作的设施功能配对，含反馈和关联案例入口。
- 制作指南：八个章节，解释数据、GIS、史料、AI、游戏与开发顺序。
- 发布：GitHub Actions、零 npm 运行依赖、本地服务器、完整离线版。

坐标系与定位精度均待核；统计是记录数而非去重后的遗址实体数。历史原图、
经审核的史料、真实模型账户和密钥未提供，因此不宣称已完成古今配准或模型实测。

## 现有仓库部署

本项目已整理为 `Yueee-0305/zhedong_Yutu` 的独立数字图志入口：

- `atlas/`：静态网站，由仓库既有 main/root Pages 发布。
- `platform/`：本项目源码与说明。
- 根目录原有 `index.html`：浙江舆图手势交互，保持原样。

在该仓库更新时进入 platform，运行 `npm run sync:repo`，提交 platform 与 atlas 的变化即可。
下面新建独立仓库的步骤用于单独部署这一平台。

## 选择一种使用方式

| 方式 | 怎么做 | 能力 |
| --- | --- | --- |
| 立即体验 | 双击 `dist/offline.html` | 数据、地图、检索、游戏均本地运行；后续外部图片除外 |
| GitHub Pages | 按下方步骤上传并启用 Pages | 在线静态平台，无需 ChatGPT 登录 |
| 本地服务 | Node.js 22，运行 `npm run build`、`npm start` | 全部前端与本地 API；网址由终端显示 |
| 模型问答 | 按 `docs/AI_SETUP.md` 配置后端 | 真实服务可用后才生成回答；费用由所选服务决定 |

## 发布到 GitHub：面向第一次操作的步骤

1. 在 GitHub 新建仓库，建议名称 `zhedong-coastal-heritage-atlas`，默认分支使用 `main`。
2. 将源码包**解压后的内容**放到仓库根目录。根目录应直接看到 `README.md`、
   `package.json`、`src/`、`data/` 和 `.github/`，不能只有一个 zip 文件。
3. 确认 `.github/workflows/pages.yml` 已上传。若使用网页上传时遗漏了隐藏目录，
   可以在 GitHub 用 Add file → Create new file 创建该完整路径，并复制对应文件内容。
4. 在仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
5. 打开 Actions → Deploy atlas to GitHub Pages → Run workflow；或者在启用 Pages 后再提交一次修改。
6. 等待流程成功，在 Settings → Pages 或工作流 deployment 步骤打开 GitHub 实际给出的网址。
   不把仓库源码网址当作网页网址。
7. 把实际仓库地址写入 `data/config.json` 的 `repositoryUrl`，再提交一次，网页会显示 GitHub 入口。

发布原始研究文字前先核对资料范围。需要公开精简包时运行
`node scripts/release.cjs --public`，见 `docs/DEPLOYMENT.md`。

工作流依据 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
GitHub Pages 托管静态网页，不运行 `server/` 中的 AI 后端。

## 本地修改

需要 Node.js 22 或以上。不需要执行 npm install。

```bash
npm run build
npm test
npm start
```

在浏览器打开 `http://127.0.0.1:8000`，保持终端运行。Windows 可以双击
`start-windows.bat`；未检测到 Node 时会转而打开离线版。
macOS/Linux 可执行 `sh start-local.sh`。

修改 `src/` 或 `data/` 后重新执行 `npm run build`。`dist/` 是生成结果，
不要仅修改它而忘记源文件。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `src/` | 原创前端界面、样式和浏览器/服务器共享检索 |
| `data/catalog.json` | Excel 数据快照，保留原字段与 ID |
| `data/media.json` | 实际图片与舆图资源登记 |
| `data/config.json` | 版本、仓库地址与可选 AI 服务地址，不放密钥 |
| `public/` | 本地静态资源及 Leaflet 许可 |
| `server/` | 可选 Node 静态服务与 AI 后端 |
| `scripts/` | 构建、Excel 导入及生成发布包 |
| `tests/` | 数据、检索、离线打包、HTTP 与模型适配器检查 |
| `docs/` | GitHub 发布、数据维护、AI 配置说明 |
| `dist/` | GitHub Pages 发布目录和离线版 |

## 数据更新

飞书导出 Excel 后，在安装 openpyxl 的 Python 环境运行：

```bash
python scripts/import_workbook.py /path/to/new-workbook.xlsx
npm run build
npm test
```

脚本更新 `data/catalog.json`，不修改原始 Excel。不执行飞书在线写回，
不自动补空值、转换未知坐标或合并同名遗址。网页主要计数按数据实时计算；
制作指南中的原始数据审阅结果是 2026-09-09 快照，内容变更时应更新说明。

## 测试边界

已验证：数据 ID 与关系完整性、名称/问题检索、离线脚本打包、HTTP 首页与资源、
请求校验、访问口令、未审核材料不外发、模型返回引用 ID 校验。
模型适配器使用模拟响应验证，未消耗真实模型额度。
未执行完整浏览器视觉或端到端验收；建议发布后按制作指南中的清单逐项试用。

## 关于先前无法打开的网址

此前的 ChatGPT 托管网址采用账号访问限制。本次检查显示发布仍有效，
但直接访问返回 403；没有证据证明只是前端代码错误。当前开源版无需依赖
该网址，可独立用离线文件、GitHub Pages 或自己的服务器访问。
