# 可选 AI 后端

静态版无需任何密钥，所有检索在浏览器本地运行。
本项目已提供服务端适配器，但未配置或验证任何真实模型账户。

## 本地配置

1. 安装 Node.js 22 或以上。
2. 将 `.env.example` 复制为 `.env`。
3. 根据所选服务的官方文档填写完整 HTTPS Chat Completions 接口 URL、模型名与密钥：
   - LLM_ENDPOINT
   - LLM_MODEL
   - LLM_API_KEY
4. 运行 `npm run build`，再运行 `npm run start:ai`。
5. 打开本地网站，在 Heritage AI 勾选“使用已配置的 AI 后端”。

服务端默认只把状态为“已审核”“已复核”或“审核通过”的资料发给模型。
目前工作簿记录全部待复核，因此默认返回原表检索结果，不调用模型。
如果你决定在私人研究环境试用未核材料，可以设置 ALLOW_UNREVIEWED_AI=true。

## GitHub Pages 与后端搭配

GitHub Pages 本身不能执行 Node 服务。可将同一份 server 部署在支持 Node 的主机上。
设置其 PUBLIC_ORIGIN 为 GitHub Pages 的 origin（例如 https://你的用户名.github.io，
不包含仓库路径），并设置 ATLAS_ACCESS_TOKEN。
在前端 `data/config.json` 的 aiEndpoint 填写后端完整 HTTPS `/api/chat` 地址。
后端只对配置的 PUBLIC_ORIGIN 提供 CORS，不使用通配符。
网站读者输入的是站点访问口令，绝不能把模型密钥贴到浏览器。

## 当前能力与限制

- 检索：本地字符串和中文短片段匹配，不是向量数据库。
- 生成：选出匹配证据，由后端发送到所选服务。
- 引用：检查模型返回 ID 是否属于提供的证据集合。
- 错误：未审核资料、缺少密钥、超时、无效引用或格式错误都有返回提示。
- 安全：密钥不进静态包；限制请求长度、频率、来源与访问口令。
- 测试：模型适配器使用模拟响应。当前没有真实模型成功调用的证据。
- 学术边界：ID 存在并不能证明每句话受到来源支持，仍要人工核验。

正式多人使用时，应在部署层补账户、配额、监控和成本管理。
不要将这款研究工具的口令机制视为完整的用户权限平台。
