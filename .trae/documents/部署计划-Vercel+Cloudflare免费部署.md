# Zlibrary 免费部署计划 - Vercel + Cloudflare

## 摘要

将 Zlibrary 电子书网站部署到公网，使用完全免费的托管服务：
- 前端静态网站 → Vercel (免费)
- 后端 API → Cloudflare Workers (免费)
- 数据库 → Cloudflare D1 (SQLite， 免费 5GB)
- 文件存储 → Cloudflare R2 (免费 10GB)

## 当前状态分析

### 项目技术栈
| 组件 | 技术 | 现状 |
|------|------|------|
| 前端 | React + Vite + TypeScript | 已就绪 |
| 后端 | Express + Node.js | 需适配 Workers |
| 数据库 | SQLite (sql.js) | 需迁移到 D1 |
| 文件存储 | 本地文件系统 | 需迁移到 R2 |

### 当前架构
```
本地开发: localhost:5173 (前端) + localhost:3001 (后端)
数据存储: data/zlibrary.db (SQLite)
文件存储: data/covers/ 和 data/books/
```

## 部署架构

```
┌─────────────────────────────────────────────────────┐
│                   用户访问                           │
│                   zlib-xxx.vercel.app               │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌────────▼────────┐
        │    Vercel       │
        │  (前端静态托管) │
        └────────┬────────┘
                 │ API 调用
        ┌────────▼────────┐
        │ Cloudflare      │
        │ Workers         │
        │ (后端 API)      │
        ├─────────────────┤
        │ Cloudflare D1   │
        │ (SQLite 数据库) │
        └────────┬────────┤
                 │
        ┌────────▼────────┐
        │ Cloudflare R2   │
        │ (文件存储)      │
        │ covers/books    │
        └─────────────────┘
```

## 具体实施步骤

### 步骤 1: 准备 Cloudflare 账户和资源

创建免费账户并创建以下资源：
1. **Cloudflare D1** - 创建数据库 `zlibrary-db`
2. **Cloudflare R2** - 创建存储桶 `zlibrary-files`
3. **Cloudflare Workers** - 部署后端 API

### 步骤 2: 修改后端代码适配 Cloudflare Workers

**文件: `server/api/server.ts`**
- 移除 Express 相关依赖，改用 Workers fetch handler
- 将 SQLite 改为使用 D1 Client
- 文件上传改用 R2 API
- 配置 CORS 允许 Vercel 域名访问

**关键改动**:
```typescript
// 原来: Express 风格
const app = express();
app.get("/api/books", (req, res) => {...});

// 修改后: Workers fetch handler
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/books")) {
      // 调用 D1 查询
    }
  }
};
```

### 步骤 3: 迁移数据库到 D1

**文件: `server/api/db.ts`**
- 使用 `@cloudflare/d1` 的 D1Client 替代 `sql.js`
- 保持相同的 API 接口 (searchBooks, getBookById, createBook 等)
- 编写 SQL 建表脚本

**建表 SQL**:
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

### 步骤 4: 修改文件上传为 R2

**文件: `server/api/upload.ts` (新建)**
- 使用 `@cloudflare/workers-types` 的 R2 API
- 上传文件到 R2 存储桶
- 返回公开访问 URL

### 步骤 5: 修改前端 API 地址

**文件: `client/src/services/api.ts`**
- 开发环境: `/api` (本地代理)
- 生产环境: `{WORKERS_URL}/api` (指向 Workers)

**文件: `client/src/services/admin.ts`**
- 同样修改 API_BASE

### 步骤 6: 配置 Vercel 部署前端

1. Vercel 导入 GitHub 仓库
2. 构建命令: `npm run build`
3. 输出目录: `dist`
4. 环境变量: 添加 `VITE_API_URL` 指向 Workers 域名

### 步骤 7: 部署 Workers

1. 使用 `wrangler` CLI 部署
2. 绑定 D1 数据库
3. 绑定 R2 存储桶
4. 配置 CORS 允许 Vercel 域名

### 步骤 8: 测试验证

- 首页正常加载
- 搜索功能正常
- 图书详情正常
- 下载功能正常
- 管理后台登录正常
- 上传文件功能正常

## 文件修改清单

| 文件路径 | 改动说明 |
|---------|---------|
| `server/api/server.ts` | 重写为 Workers fetch handler |
| `server/api/db.ts` | 改用 D1 Client |
| `server/api/r2.ts` (新建) | R2 文件上传下载 |
| `client/src/services/api.ts` | 修改 API 地址 |
| `client/src/services/admin.ts` | 修改 API 地址 |
| `client/vite.config.ts` | 添加生产环境 API 配置 |
| `wrangler.toml` (新建) | Workers 配置 |
| `.env` | 添加 Workers 相关配置 |

## 免费额度和限制

| 服务 | 免费额度 | 本项目使用 |
|------|---------|-----------|
| Vercel | 100GB 流量/月 | 前端静态 |
| Cloudflare Workers | 100,000 次请求/天 | 后端 API |
| Cloudflare D1 | 5GB 存储, 10,000 次写入/天 | 数据库 |
| Cloudflare R2 | 10GB 存储, 1,000,000 次读取/天 | 文件存储 |

## 替代方案 (如果纯免费方案太复杂)

如果觉得 Cloudflare 配置复杂，可以选择：

**Render/Railway 方案 (更简单)**:
- 前端: _build 后放到 `public/`
- 后端: 整个 Node.js 应用部署到 Render/Railway
- 免费额度: 750 小时/月
- 数据和文件都存在平台上

**缺点**: 冷启动慢 (免费版有休眠)

## 实施顺序

1. 创建 Cloudflare 账户
2. 创建 D1 数据库和 R2 存储桶
3. 修改后端代码 (D1 + R2 集成)
4. 本地测试后端
5. 部署 Workers
6. 配置 Vercel 部署前端
7. 最终测试和验证

## 假设和决策

- 用户有 GitHub 账号
- 用户愿意使用 Cloudflare 生态
- 接受现有功能在云端工作方式略有不同
- 不需要迁移现有数据 (重新初始化)