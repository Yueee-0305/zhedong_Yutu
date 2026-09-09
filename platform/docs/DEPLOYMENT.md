# 发布与常见问题

## GitHub Pages

项目中的 `.github/workflows/pages.yml` 会在 main 更新时：
检出源码 → 使用 Node 22 → 构建 → 测试 → 上传 dist → 发布到 Pages。
不存在 npm 依赖安装步骤。工作流需要 Pages write 与 id-token write 权限，
配置已包含。仓库仍需在 Settings → Pages 选择 GitHub Actions。

所有静态资源采用相对路径，兼容 `用户名.github.io/仓库名/` 子目录。
详情链接使用 `#heritage/遗产ID`，刷新不依赖服务器重写。

公开精简发布目录：

```
node scripts/release.cjs --public
```

生成 `releases/coastal-atlas-public`。该目录不包含 ChatGPT 项目身份、
Git 历史、.env、研究原文、原图或设计参考图。公开版本保留原表基础事实和
待核状态；行政边界因未确认再分发许可而排除。将此目录内容上传 GitHub。

完整研究包：

```
node scripts/release.cjs
```

生成 `releases/coastal-atlas-research`，包括目前完整工作快照；适合私有研究，
公开前由维护者逐项决定资料范围。不能因为根目录是 MIT 就将第三方资料重新授权。

## 无法打开时

| 现象 | 检查方式 |
| --- | --- |
| 只有源码列表 | 这是仓库页；打开 Settings → Pages 给出的站点地址 |
| 404 | 查看 Actions 是否成功；确认 Pages 已启用、分支为 main |
| 空白或资料加载失败 | 确认完整 dist 已上传；离线请打开 offline.html |
| 地图没轮廓但有点位 | 公开精简版有意不附第三方边界；可自行加入获得许可的 GeoJSON |
| 部分档案没有点位 | 原表无坐标，不会自动补成城市中心 |
| AI 后端不可用 | Pages 只运行前端；取消后端勾选仍可本地检索 |
| 嵌入图像失败 | 检查资源 URL、HTTPS、访问权限或改为随站点本地发布 |

## 独立服务器

运行 `npm run build` 后用 `npm start` 启动 Node 服务。
若需外部访问，设置 HOST=0.0.0.0，并使用 HTTPS 反向代理。
模型相关变量见 `AI_SETUP.md`。不要把 .env 上传到 dist 或公开仓库。

## 公开后如何改

在 src 修改界面，在 data 修改内容，提交到 main，等待 Pages 工作流成功。
发布有误时，用 Git 撤销导致问题的提交，再发布。不要覆盖资料来源或重复使用 ID。

官方参考：
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
