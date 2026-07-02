# Zlibrary 免费部署指南（Cloudflare Pages + Workers）

本指南将帮助你把 Zlibrary 网站部署到公网，**全程免费、无需绑卡**。

## 架构概览

```
用户访问: zlibrary.pages.dev (前端)
用户访问: zlibrary-api.xxx.workers.dev (后端 API)
    │
    ├── Cloudflare Pages  →  前端静态页面 (dist/)
    ├── Cloudflare Workers →  后端 API (server/api/worker.ts)
    ├── Cloudflare D1      →  替代 SQLite 数据库（5GB 免费）
    └── Cloudflare KV      →  存储封面和电子书文件（1GB 免费）
```

## 为什么选择这个方案？

| 平台 | 免费额度 | 是否需绑卡 | 数据库 | 文件存储 |
|------|----------|-----------|--------|----------|
| Vercel + Cloudflare R2 | 较少 | **是** | D1 | R2 |
| Render | 750小时/月 | **是** | 磁盘 | 磁盘 |
| **Cloudflare 全家桶** | **充足** | **否** | **D1** | **KV** |

Cloudflare 是唯一一个**完全不需要绑卡**且能跑后端 + 数据库 + 文件存储的方案。

## 文件大小限制

- **单文件最大 25MB**（Cloudflare KV 限制）
- 适合绝大多数 PDF/EPUB 电子书
- mobi 格式文件通常远小于 25MB

## 步骤 1: 安装 Wrangler（Cloudflare CLI）

```bash
npm install -g wrangler

# 登录（会打开浏览器授权）
wrangler login
```

## 步骤 2: 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create zlibrary-db

# 输出会包含 database_id，把它复制出来
# 填到 wrangler.toml 的 database_id = "xxx" 位置
```

## 步骤 3: 创建 KV 命名空间

```bash
# 创建 KV 命名空间用于存储文件
wrangler kv namespace create FILES_KV

# 输出会包含 id，把它复制出来
# 填到 wrangler.toml 的 id = "xxx" 位置
```

## 步骤 4: 初始化 D1 数据库表

创建 `schema.sql`：

```sql
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover TEXT,
  publisher TEXT,
  year INTEGER,
  pages INTEGER,
  language TEXT DEFAULT '中文',
  rating REAL DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  category TEXT,
  formats TEXT,
  description TEXT,
  pdf_url TEXT,
  epub_url TEXT,
  mobi_url TEXT
);

-- 初始化一些示例数据
INSERT INTO books (title, author, cover, publisher, year, pages, language, rating, downloads, category, formats, description)
VALUES
  ('百年孤独', '加西亚·马尔克斯', '/api/files/covers/sample.jpg', '南海出版公司', 2011, 360, '中文', 4.9, 125000, '文学', 'pdf,epub,mobi', '《百年孤独》是魔幻现实主义文学的代表作。'),
  ('三体', '刘慈欣', '/api/files/covers/sample.jpg', '重庆出版社', 2008, 302, '中文', 4.8, 210000, '科技', 'pdf,epub,mobi', '文化大革命期间军方探寻外星文明的绝秘计划。');
```

执行：

```bash
wrangler d1 execute zlibrary-db --file=./schema.sql
```

## 步骤 5: 部署后端 API（Worker）

```bash
# 部署到 Cloudflare
wrangler deploy
```

部署成功后会输出：
```
Published zlibrary-api (x.xx sec)
  https://zlibrary-api.your-subdomain.workers.dev
```

把这个域名记下来，前端需要配置。

## 步骤 6: 部署前端（Cloudflare Pages）

### 方式 A：通过 Git 集成（推荐）

1. 把项目推送到 GitHub
2. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. 点击 "Create a project" → "Connect to Git"
4. 选择你的仓库
5. 配置构建设置：

| 设置 | 值 |
|------|-----|
| Framework preset | Vite |
| Build command | `npm run build:web` |
| Build output directory | `dist` |

6. 点击 "Save and Deploy"

### 方式 B：通过 Wrangler 直接部署

```bash
# 先构建前端
npm run build:web

# 部署到 Pages
wrangler pages deploy dist --project-name=zlibrary
```

## 步骤 7: 配置前端 API 地址

修改 `client/src/services/api.ts` 和 `client/src/services/admin.ts`：

```typescript
// 把
const API_BASE = import.meta.env.DEV ? "/api" : "";
// 改为
const API_BASE = import.meta.env.DEV 
  ? "/api" 
  : "https://zlibrary-api.your-subdomain.workers.dev";
```

或者用环境变量，在 Cloudflare Pages 设置 `VITE_API_BASE`。

## 步骤 8: 配置 CORS

后端 Worker 已配置 CORS 允许所有来源（`*`），如需限制可修改 `worker.ts` 中的 `corsHeaders`。

## 步骤 9: 验证部署

访问你的 Pages 域名，测试：
- [ ] 首页正常加载
- [ ] 搜索功能正常
- [ ] 图书详情页正常
- [ ] 登录后台（密码：`zlibrary`，可在 Cloudflare Dashboard 修改）
- [ ] 上传文件功能正常
- [ ] 下载功能正常

## 修改管理员密码

在 Cloudflare Dashboard：
1. Workers & Pages → zlibrary-api → Settings → Variables
2. 修改 `ADMIN_PASSWORD` 的值
3. 保存后会自动重新部署

## 免费额度

Cloudflare 免费版：
- **Pages**: 无限请求，无限带宽
- **Workers**: 10万请求/天
- **D1**: 5GB 存储，500万次读/天，10万次写/天
- **KV**: 1GB 存储，10万次读/天，1万次写/天

对个人项目绰绰有余。

## 常见问题

### Q: KV 的 25MB 限制怎么解决？
A: 大文件可以先压缩（zip 格式的电子书），或拆分上传。绝大多数电子书都在 25MB 以下。

### Q: 如何备份数据？
A: 
```bash
# 备份 D1
wrangler d1 export zlibrary-db --output=backup.sql

# KV 数据需要单独处理（不提供导出工具，但文件本身在 KV 中）
```

### Q: 本地开发怎么办？
A: 本地继续用 `npm run dev`，数据库是本地 SQLite，文件存在 `data/` 目录，部署到 Cloudflare 才用 D1 + KV。

### Q: 如何更新部署？
A:
- 前端：推送到 GitHub 后 Pages 自动部署
- 后端：运行 `wrangler deploy`

## 项目结构

| 目录/文件 | 用途 |
|----------|------|
| server/api/server.ts | 本地开发用的 Express 后端 |
| server/api/worker.ts | Cloudflare Workers 部署用的后端 |
| server/api/db.ts | SQLite 数据库操作（本地用） |
| client/ | 前端 React 代码 |
| data/ | 本地数据目录（开发用） |
| dist/ | 前端构建输出 |
| wrangler.toml | Cloudflare Workers 配置 |

---

完成！访问你的 Pages 域名即可使用。
