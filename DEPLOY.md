# Zlibrary 部署指南

把项目部署到 Cloudflare Pages，**全程免费、无需绑卡**。

## 架构概览

```
前端 + 后端 → Cloudflare Pages
              ├── 静态资源 (dist/)   → 浏览器直接加载
              ├── /api/*             → Pages Functions (functions/api/[[path]].ts)
              ├── Cloudflare D1      → 书籍元数据 (5GB 免费)
              └── Cloudflare KV      → 封面与电子书文件 (1GB 免费)
自动构建     →  GitHub push → Cloudflare Pages build → 自动部署
```

所有组件都在 Cloudflare 生态内：
- 前后端同源，无 CORS / `*.workers.dev` 被墙的问题
- D1 每天 500 万次读、10 万次写
- KV 每天 10 万次读、1 万次写
- Functions 每天 10 万次请求

## 为什么选这个方案

| 平台 | 需绑卡 | 数据库 | 文件存储 | 后端 |
|------|--------|--------|----------|------|
| Vercel + R2 | **是** | 外部 | R2 | Serverless |
| Render | **是** | 磁盘 | 磁盘 | 长驻进程 |
| **Cloudflare 全家桶** | **否** | **D1** | **KV** | **Pages Functions** |

Cloudflare 是**唯一完全免绑卡**且能跑完整后端的方案。

## 文件大小限制

**单文件 ≤ 25MB**（KV 限制）。绝大多数 PDF / EPUB / MOBI 都在此范围内。

---

## 部署步骤

### 前置准备

- Cloudflare 账号（<https://dash.cloudflare.com/sign-up>，无需绑卡）
- 已安装 Node.js ≥ 18
- 项目已 push 到 GitHub

### 步骤 1: 安装 Wrangler 并登录

```bash
npm install -g wrangler
wrangler login
```

浏览器会跳到 Cloudflare 授权。

### 步骤 2: 创建 D1 数据库

```bash
wrangler d1 create zlibrary-db
```

输出形如：

```
[[d1_databases]]
binding = "DB"
database_name = "zlibrary-db"
database_id = "xxxx-xxxx-xxxx"
```

把 `database_id` 填到项目 `wrangler.toml` 的 `[[d1_databases]]` 段。

### 步骤 3: 创建 KV 命名空间

```bash
wrangler kv namespace create FILES_KV
```

输出形如：

```
[[kv_namespaces]]
binding = "FILES_KV"
id = "yyyyyyyy"
```

把 `id` 填到 `wrangler.toml` 的 `[[kv_namespaces]]` 段。

### 步骤 4: 初始化 D1 表结构

执行 `schema.sql`：

```bash
wrangler d1 execute zlibrary-db --file=./schema.sql
```

这会创建 `books` 表并插入示例数据。

### 步骤 5: 在 Cloudflare Dashboard 创建 Pages 项目

1. <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选 **GitHub** → 授权 Cloudflare 访问你的 GitHub
3. 选仓库 `netbit888/Zlibrary`（或你的 fork）
4. **Project name**：填 `zlibrary`（决定域名 `zlibrary.pages.dev`）
5. **Production branch**：选你的主分支（默认 `main`，本项目用 `Render-一站式部署`）
6. **Build settings**：
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
7. 点 **Save and Deploy**

第一次会自动 build，可能失败（因为 bindings 还没配），正常。

### 步骤 6: 配置 Pages 项目 Bindings

进入 Pages 项目 → **Settings** → **Functions** → **Bindings** → **Add**：

| 类型 | Variable name | 选择 / 值 |
|------|---------------|-----------|
| **D1 database** | `DB` | 选 `zlibrary-db` |
| **KV namespace** | `FILES_KV` | 选你刚创建的 namespace |
| **Environment variables** | `ADMIN_PASSWORD` | `zlibrary`（或自定义强密码） |

> **作用域**：注意是 **Production** 标签下，**不是 Preview**。绑定时如果看到 Production / Preview 切换，要选 Production。

### 步骤 7: 触发重新部署

回到 **Deployments** 标签 → 找到最新那条 → 右上角 **Retry deployment**。

这次会成功：build → Functions bundle 包含 `functions/api/[[path]].ts` → 拿到 D1 / KV / `ADMIN_PASSWORD` bindings → 部署完成。

### 步骤 8: 验证

打开 `https://<your-project>.pages.dev`：

- [ ] 首页加载并显示热门书籍
- [ ] 搜索能返回结果
- [ ] 书籍详情页能进
- [ ] `/admin/login` 用 `ADMIN_PASSWORD` 登录成功
- [ ] 上传封面 / 文件功能正常
- [ ] 下载电子书功能正常

---

## 日常开发流程

```bash
# 本地改代码
npm run dev

# 类型检查
npm run check

# 提交
git add -A
git commit -m "feat: ..."

# 推送触发自动部署
git push origin <branch>
```

Cloudflare 检测到 push → 自动 build → 1-2 分钟内 production 域名更新。

---

## 修改管理员密码

Cloudflare Dashboard → Workers & Pages → 你的 Pages 项目 → Settings → Functions → Bindings → 找到 `ADMIN_PASSWORD` → 编辑 → 保存。

下次部署生效（push 一次触发，或手动 Retry deployment）。

---

## 故障排查

### 部署后 `/api/*` 返回 404

Functions bundle 没生效。检查：

1. `functions/api/[[path]].ts` 是否在 Git 仓库里（注意文件名是双中括号）
2. `wrangler.toml` 里有 `pages_build_output_dir = "dist"`
3. build 日志里有 `Uploading Functions bundle` 字样

### `Failed to execute 'json' on 'Response'`

后端没返回 JSON。检查：

1. 浏览器控制台 Network，看 `/api/admin/login` 响应的 status 和 body
2. 后端 catch 块会返回 `{ error: "..." }`，但前面路由出错可能返回 404 纯文本
3. 如果完全连不上后端，可能是 binding 缺失 → `env.DB` 是 undefined → 抛错

### "Failed to fetch"

CORS 或网络问题。本项目同源后不应该出现此问题。检查：

1. 是不是还指向了已废弃的 `*.workers.dev` 域名（迁移到 Functions 后应该用 `/api`）
2. 浏览器 console 完整错误

### build 报错 `Configuration file cannot contain both "main" and "pages_build_output_dir"`

`wrangler.toml` 同时有 Worker 用的 `main` 和 Pages 用的 `pages_build_output_dir`。Pages 项目**只支持** `pages_build_output_dir`，删掉 `main` 和 `[build]` 段。

### D1 数据怎么备份

```bash
wrangler d1 export zlibrary-db --output=backup.sql
```

KV 没有原生导出。建议本地保留上传的原文件备份。

---

## 资源额度

| 服务 | 免费额度 |
|------|----------|
| Pages | 无限请求、无限带宽 |
| Functions | 10 万次 / 天 |
| D1 | 5GB 存储、500 万读 / 天、10 万写 / 天 |
| KV | 1GB 存储、10 万读 / 天、1 万写 / 天 |

个人 / 小型项目完全够用。超出后会返回错误但不会扣费。

---

## 清理（如需回退到旧方案）

如果需要把后端迁回独立的 Worker 项目：

1. 改 `wrangler.toml` 加回 `main = "server/api/worker.ts"`，去掉 `pages_build_output_dir`
2. 把 `client/src/services/{api,admin}.ts` 的 `API_BASE` 改回带 `https://...workers.dev` 的绝对地址
3. 部署：`wrangler deploy`（Worker） + `wrangler pages deploy dist`（前端）

但目前 Pages Functions 方案**更省事、免绑卡、避开被墙**，建议保持。
