# 技术架构文档 —— 在线图书站

## 1. 架构设计

纯前端单页应用（SPA），使用 Mock 数据模拟书籍检索与下载流程。

```mermaid
graph TD
    A[浏览器] --> B[React SPA]
    B --> C[React Router DOM]
    B --> D[Zustand 状态管理]
    B --> E[Mock 数据层]
    E --> F[书籍数据 JSON]
```

## 2. 技术选型

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS 3
- **UI 组件**：全部手写，无外部 UI 库
- **图标**：lucide-react
- **状态管理**：Zustand
- **路由**：react-router-dom
- **初始化模板**：vite-init react-ts

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页（搜索 + 分类 + 热门推荐） |
| `/search` | 搜索结果页（支持 query 参数 `?q=关键词&category=分类`） |
| `/book/:id` | 书籍详情页 |

## 4. API 定义（Mock 层）

使用本地 TypeScript 函数模拟 API：

```typescript
// 书籍基础信息
interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  publisher: string;
  year: number;
  pages: number;
  language: string;
  rating: number;
  downloads: number;
  category: string;
  formats: ('pdf' | 'epub' | 'mobi')[];
  description: string;
}

// 搜索参数
interface SearchParams {
  q?: string;
  category?: string;
  formats?: string[];
  language?: string;
  sortBy?: 'relevance' | 'rating' | 'newest';
  page?: number;
}

// Mock API 函数
function searchBooks(params: SearchParams): Promise<{ books: Book[]; total: number }>;
function getBookById(id: string): Promise<Book | undefined>;
function getCategories(): Promise<string[]>;
function getPopularBooks(): Promise<Book[]>;
```

## 5. 数据模型

使用内存中的 Mock 数据，预置 40+ 本经典电子书数据，涵盖文学、科技、历史、艺术、哲学等分类。数据文件位于 `src/data/books.ts`。

## 6. 项目结构

```
Zlibrary/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── BookCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryTag.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── StarRating.tsx
│   │   ├── DownloadButton.tsx
│   │   └── Toast.tsx
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   └── BookDetailPage.tsx
│   ├── data/                # Mock 数据
│   │   └── books.ts
│   ├── store/               # Zustand 状态
│   │   └── useBookStore.ts
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── covers/              # 书籍封面图片（使用纯色占位图或在线图片）
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```
