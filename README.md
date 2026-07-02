# Zlibrary · 数字图书馆 v2.0

一个简洁美观的在线数字图书馆系统，支持书籍浏览、搜索、筛选和管理功能。

🌐 在线演示：https://zlibrary-3lw.pages.dev

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React 18 + TypeScript | 用户界面 |
| **构建工具** | Vite 6 | 开发与构建 |
| **样式** | Tailwind CSS | 原子化 CSS |
| **状态管理** | Zustand | 轻量级状态 |
| **路由** | React Router DOM 7 | SPA 路由 |
| **后端** | Cloudflare Pages Functions | 无服务器 API（与前端同源） |
| **数据库** | Cloudflare D1 | 兼容 SQLite 的分布式 SQL（5GB 免费） |
| **文件存储** | Cloudflare KV | 封面与电子书文件（1GB 免费） |
| **CI/CD** | Cloudflare Pages + GitHub | push 即部署 |

## 架构

```
用户 → https://zlibrary-3lw.pages.dev (Pages)
         │
         ├── /               → 静态前端 (dist/)
         ├── /api/*          → Pages Functions (functions/api/[[path]].ts)
         │     ├── Cloudflare D1   → 书籍元数据
         │     └── Cloudflare KV   → 封面 + 电子书文件
         └── 自动构建: GitHub push → Cloudflare Pages
```

**特点**：
- 前后端同源，无 CORS 问题
- 全 Cloudflare 生态，**无需绑卡**
- 单文件上传上限 25MB（KV 限制）
- 每天 10 万次免费 API 请求

## 功能特性

### 读者端
- 首页热门推荐与分类浏览
- 按书名 / 作者 / 简介智能搜索
- 多维度筛选（分类、格式、语言、排序）
- 书籍详情、评分、下载量
- 多格式下载（PDF / EPUB / MOBI）

### 管理端
- 密码认证登录
- 书籍 CRUD + 分页
- 封面与电子书文件批量上传
- 实时管理所有数据

## 本地开发

### 环境要求
- Node.js ≥ 18
- npm

### 启动

```bash
# 1. 安装依赖
npm install

# 2. 同时启动前端（Vite 5173）和后端（Express 3001）
npm run dev
```

前端：<http://localhost:5173>  
后端：<http://localhost:3001>

本地后端用 `server/api/server.ts`（Express + SQLite），数据落在 `data/` 目录，**仅供开发使用**。生产环境用的是 Cloudflare Functions + D1。

### 其他命令

```bash
npm run build        # 构建前端到 dist/
npm run check        # TypeScript 类型检查
npm run lint         # ESLint 检查
```

## 项目结构

```
Zlibrary/
├── client/                       # 前端代码
│   ├── src/
│   │   ├── components/           # React 组件
│   │   ├── pages/                # 页面（首页、搜索、详情、管理、登录）
│   │   ├── services/             # API 调用层
│   │   │   ├── api.ts            # 公开 API
│   │   │   └── admin.ts          # 管理员 API
│   │   ├── store/                # Zustand 状态
│   │   ├── hooks/                # 自定义 Hooks
│   │   ├── types/                # TypeScript 类型
│   │   └── lib/                  # 工具函数
│   ├── public/                   # 静态资源
│   └── index.html
├── server/
│   ├── api/
│   │   ├── server.ts             # 本地开发用 Express 后端
│   │   ├── db.ts                 # 本地 SQLite 操作
│   │   └── worker.ts             # 共享的 API 逻辑（Worker / Functions 都用）
├── functions/
│   └── api/
│       └── [[path]].ts           # Pages Functions 入口
├── schema.sql                    # D1 数据库初始化脚本
├── wrangler.toml                 # Cloudflare 部署配置
└── package.json
```

## API 接口

所有接口都挂在 `/api/*` 前缀下。生产环境通过 Pages Functions 部署，与前端同源。

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 所有分类 |
| GET | `/api/books/popular?limit=8` | 热门书籍 |
| GET | `/api/books/search?q=&category=&format=&language=&sortBy=&page=&pageSize=` | 搜索书籍 |
| GET | `/api/books/:id` | 书籍详情 |
| GET | `/api/books/:id/download/:format` | 下载电子书 |
| GET | `/api/files/...` | 访问 KV 中的封面 / 文件 |

### 管理员接口（需 `x-admin-token` 请求头）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 登录（body: `{ password }`） |
| GET | `/api/admin/books?q=&page=&pageSize=` | 书籍列表 |
| POST | `/api/admin/books` | 新增书籍 |
| PUT | `/api/admin/books/:id` | 更新书籍 |
| DELETE | `/api/admin/books/:id` | 删除书籍 |
| POST | `/api/admin/upload?type=cover\|book` | 上传文件 |

## 环境变量

### 本地开发（`.env` 文件）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ADMIN_PASSWORD` | `zlibrary` | 管理员密码 |
| `PORT` | `3001` | 后端端口 |

### 生产环境（Cloudflare Dashboard → Pages → Settings → Functions → Bindings）

| 类型 | 名称 | 目标 / 值 |
|------|------|-----------|
| D1 database | `DB` | `zlibrary-db` |
| KV namespace | `FILES_KV` | 文件存储命名空间 |
| Environment variable | `ADMIN_PASSWORD` | `zlibrary`（或自定义） |

> 前端调用 API 时，**生产环境** `API_BASE` 直接用 `/api`（同源）；**开发环境** 通过 Vite proxy 转到 `:3001`。代码里已处理好，无需额外配置。

## 部署

> 详细部署步骤见 [DEPLOY.md](./DEPLOY.md)

简述：

1. 准备 Cloudflare 账号（无需绑卡）
2. 创建 D1 数据库与 KV 命名空间，把 ID 填入 `wrangler.toml`
3. 在 Dashboard 配 Pages 项目的 D1 / KV / `ADMIN_PASSWORD` bindings
4. 把代码推送到 GitHub
5. 在 Dashboard 连接 GitHub 仓库，选定 production branch
6. 每次 `git push` 自动 build 并部署到 `https://<project>.pages.dev`

## 管理员登录

- 路径：`/admin/login`
- 密码：在 Dashboard 设置的 `ADMIN_PASSWORD`（默认 `zlibrary`）
- 登录后 token 存到 `localStorage`（key: `zlib_admin_token`），所有管理员请求带 `x-admin-token` 请求头

## 注意事项

- **单文件 ≤ 25MB**（KV 限制）
- 项目目前是个人 / 学习用途，认证机制简单，不建议直接用于商业生产
- 数据存储在 Cloudflare 全球边缘节点，删除后**无法直接恢复**（KV 没有原生导出），重要文件请在本地保留备份
