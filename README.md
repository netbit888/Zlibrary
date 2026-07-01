# Zlibrary - 数字图书馆

一个简洁美观的在线数字图书馆系统，支持书籍浏览、搜索、筛选和管理功能。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React 18 + TypeScript | 用户界面框架 |
| **构建工具** | Vite 6 | 快速开发与构建 |
| **样式** | Tailwind CSS | 原子化 CSS 方案 |
| **状态管理** | Zustand | 轻量级状态管理 |
| **路由** | React Router DOM 7 | SPA 路由方案 |
| **后端** | Express 5 + Node.js | RESTful API 服务 |
| **数据库** | SQLite (sql.js) | 嵌入式关系型数据库 |
| **文件上传** | Multer | multipart/form-data 处理 |

## 功能特性

### 读者端
- **首页浏览**：展示热门推荐书籍和分类标签
- **智能搜索**：支持按书名、作者、简介关键词搜索
- **分类筛选**：按分类、文件格式、语言等条件过滤
- **排序功能**：按相关性、评分、出版时间排序
- **书籍详情**：查看书籍完整信息、评分、下载量
- **下载功能**：支持 PDF、EPUB、MOBI 等多种格式

### 管理端
- **管理员登录**：简单的密码认证机制
- **书籍管理**：新增、编辑、删除书籍
- **文件上传**：批量上传书籍封面和电子书文件
- **数据分页**：支持管理大量书籍数据

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

这会同时启动前端开发服务器（Vite）和后端 API 服务（Express）。

- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3001

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run check
```

## 项目结构

```
Zlibrary/
├── api/                    # 后端代码
│   ├── server.ts          # Express 服务入口
│   ├── db.ts              # SQLite 数据库操作
│   └── data/              # 数据相关文件
├── src/                    # 前端源代码
│   ├── components/        # React 组件
│   │   ├── BookCard.tsx   # 书籍卡片
│   │   ├── CategoryTag.tsx # 分类标签
│   │   ├── DownloadButton.tsx # 下载按钮
│   │   ├── Empty.tsx      # 空状态组件
│   │   ├── FilterSidebar.tsx # 筛选侧边栏
│   │   ├── Footer.tsx     # 页脚
│   │   ├── Header.tsx     # 页头导航
│   │   ├── SearchBar.tsx  # 搜索栏
│   │   ├── StarRating.tsx # 星级评分
│   │   └── Toast.tsx      # 提示消息
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx   # 首页
│   │   ├── SearchPage.tsx # 搜索页
│   │   ├── BookDetailPage.tsx # 书籍详情页
│   │   ├── AdminPage.tsx  # 管理后台
│   │   └── AdminLoginPage.tsx # 管理员登录
│   ├── services/          # API 服务层
│   │   ├── api.ts         # 公开 API 调用
│   │   └── admin.ts       # 管理员 API 调用
│   ├── store/             # 状态管理
│   │   └── useBookStore.ts # Zustand Store
│   ├── hooks/             # 自定义 Hooks
│   │   └── useTheme.ts    # 主题切换
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts       # 类型导出
│   ├── lib/               # 工具函数
│   │   └── utils.ts       # 通用工具
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── public/                # 静态资源
│   ├── covers/            # 书籍封面目录
│   ├── books/             # 电子书文件目录
│   └── favicon.svg        # 网站图标
├── data/                  # 数据存储
│   └── zlibrary.db        # SQLite 数据库文件
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind CSS 配置
└── tsconfig.json          # TypeScript 配置
```

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 获取所有分类 |
| GET | `/api/books/popular` | 获取热门书籍 |
| GET | `/api/books/search` | 搜索书籍 |
| GET | `/api/books/:id` | 获取书籍详情 |

### 管理员接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 管理员登录 |
| GET | `/api/admin/books` | 获取书籍列表（需认证） |
| POST | `/api/admin/books` | 新增书籍（需认证） |
| PUT | `/api/admin/books/:id` | 更新书籍（需认证） |
| DELETE | `/api/admin/books/:id` | 删除书籍（需认证） |
| POST | `/api/admin/upload` | 上传文件（需认证） |

### 认证方式

管理员接口需要通过 `x-admin-token` 请求头传递认证令牌。

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3001` | 后端服务端口 |
| `ADMIN_PASSWORD` | `admin123` | 管理员登录密码 |

### 设置环境变量

在项目根目录创建 `.env` 文件：

```env
PORT=3001
ADMIN_PASSWORD=your_secure_password
```

## 管理员使用

1. 访问 `/admin/login` 进入管理员登录页面
2. 输入密码登录（默认密码：`admin123`）
3. 进入管理后台进行书籍管理

### 管理后台功能

- **浏览书籍**：查看所有书籍列表，支持分页
- **搜索书籍**：按书名或作者搜索
- **新增书籍**：添加新书籍信息
- **编辑书籍**：修改现有书籍信息
- **删除书籍**：移除不需要的书籍
- **上传文件**：上传书籍封面和电子书文件

## 开发指南

### 添加新的公开 API

1. 在 `api/server.ts` 中添加路由处理函数
2. 在 `api/db.ts` 中添加数据库操作函数
3. 在 `src/services/api.ts` 中添加前端调用方法
4. 在 `src/types/index.ts` 中定义类型（如果需要）

### 添加管理员接口

1. 在 `api/server.ts` 中添加路由，使用 `authAdmin` 中间件保护
2. 在 `src/services/admin.ts` 中添加前端调用方法

### 自定义样式

- 全局样式：`src/index.css`
- Tailwind 配置：`tailwind.config.js`
- 主题颜色在 `tailwind.config.js` 的 `colors` 中定义

## 注意事项

- 数据库文件位于 `data/zlibrary.db`，首次启动时会自动创建并初始化示例数据
- 上传的书籍封面保存在 `public/covers/` 目录
- 上传的电子书文件保存在 `public/books/` 目录
- 这是一个演示/学习项目，认证机制较为简单，不适合直接用于生产环境
