# Zlibrary 免费部署指南

本指南将帮助你把 Zlibrary 网站部署到公网，使用 Vercel + Cloudflare 的免费方案。

## 架构概览

```
用户访问: your-site.vercel.app
    │
    ├── 前端静态页面 (Vercel)
    │
    └── API 请求 → your-api.workers.dev (Cloudflare Workers)
                       │
                       ├── D1 数据库 (SQLite)
                       └── R2 存储 (封面/电子书)
```

## 步骤 1: 准备 Cloudflare 账户

1. 访问 [cloudflare.com](https://cloudflare.com) 注册免费账户
2. 登录后进入控制台

## 步骤 2: 创建 D1 数据库

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create zlibrary-db
# 会输出 database_id，保存下来
```

## 步骤 3: 创建 R2 存储桶

1. 在 Cloudflare 控制台，进入 R2
2. 创建存储桶：`zlibrary-files`
3. 设置为公开访问 (public bucket)

## 步骤 4: 初始化数据库

创建 `schema.sql` 文件：

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
```

执行建表：

```bash
wrangler d1 execute zlibrary-db --local-schema=./schema.sql
```

## 步骤 5: 配置 wrangler.toml

编辑 `wrangler.toml`，填入你创建的数据库 ID：

```toml
name = "zlibrary-api"
main = "server/api/worker.ts"
compatibility_date = "2024-07-01"

[[d1_databases]]
binding = "DB"
database_name = "zlibrary-db"
database_id = "这里填入你的 database_id"

[[r2_buckets]]
binding = "FILES_BUCKET"
bucket_name = "zlibrary-files"

[vars]
ADMIN_PASSWORD = "zlibrary"
```

## 步骤 6: 部署后端 (Cloudflare Workers)

```bash
# 部署到 Cloudflare
wrangler deploy

# 部署后会得到一个域名，例如：
# zlibrary-api.your-subdomain.workers.dev
```

## 步骤 7: 部署前端 (Vercel)

### 方式一: Git 集成 (推荐)

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com) 并用 GitHub 登录
3. 点击 "Add New..." → "Project"
4. 选择你的 GitHub 仓库
5. 配置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 在 Environment Variables 中添加：
   - Name: `VITE_API_URL`
   - Value: 你的 Workers 域名 (例如: `https://zlibrary-api.your-subdomain.workers.dev`)
7. 点击 Deploy

### 方式二: Vercel CLI

```bash
npm install -g vercel

# 在项目根目录运行
vercel

# 按照提示配置，添加环境变量 VITE_API_URL
```

## 步骤 8: 验证部署

部署完成后，访问你 Vercel 分配的域名，例如：
`https://your-project.vercel.app`

测试以下功能：
- [ ] 首页正常加载
- [ ] 搜索功能正常
- [ ] 图书详情页正常
- [ ] 下载功能正常
- [ ] 登录后台 (密码: zlibrary)

## 免费额度

每月免费额度足够个人或小规模使用：

| 服务 | 免费额度 | 说明 |
|------|---------|------|
| Vercel | 100GB 流量 | 前端静态资源 |
| Cloudflare Workers | 100,000 次请求/天 | 后端 API |
| Cloudflare D1 | 5GB 存储, 10,000 次写入/天 | SQLite 数据库 |
| Cloudflare R2 | 10GB 存储, 1M 次读取/天 | 文件存储 |

## 常见问题

### Q: 如何修改管理员密码？
A: 在 wrangler.toml 中修改 `[vars] ADMIN_PASSWORD = "your-password"`

### Q: 数据库如何备份？
A: 使用 `wrangler d1 execute zlibrary-db --command="SELECT * FROM books"` 导出数据

### Q: 上传的文件在哪里？
A: 所有文件都存储在 Cloudflare R2 存储桶中，可通过 Cloudflare 控制台管理

### Q: 如何更新部署？
A:
```bash
# 后端更新
wrangler deploy

# 前端更新
# 推送代码到 GitHub 自动触发，或使用 vercel deploy
```

## 项目文件说明

| 文件/目录 | 用途 |
|----------|------|
| `server/api/worker.ts` | Cloudflare Workers 后端代码 |
| `wrangler.toml` | Workers 配置 (D1, R2 绑定) |
| `client/.env.production.example` | 前端生产环境变量示例 |
| `client/src/services/api.ts` | 前端 API 调用 (已支持环境变量) |

## 本地开发

```bash
# 启动本地开发环境 (Express 后端 + Vite 前端)
npm run dev
```

## 注意事项

1. **生产环境密码**: 记得修改默认密码 `zlibrary`
2. **R2 域名**: 确保 R2 存储桶已设置为公开访问
3. **CORS**: Workers 已配置允许所有来源访问

---

完成！如果有其他问题，请查看代码或询问。