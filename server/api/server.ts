import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  initDb,
  searchBooks,
  getBookById,
  getAllCategories,
  getPopularBooks,
  createBook,
  updateBook,
  deleteBook,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "..", "..", "client", "public");
const COVERS_DIR = path.join(PUBLIC_DIR, "covers");
const BOOKS_DIR = path.join(PUBLIC_DIR, "books");

if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = (req.body as any).type || "cover";
    const dir = type === "book" ? BOOKS_DIR : COVERS_DIR;
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "_" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// 简单认证中间件
function authAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "未授权" });
  }
  next();
}

// ========== 公开接口 ==========

app.get("/api/categories", (_req, res) => {
  res.json(getAllCategories());
});

app.get("/api/books/popular", (req, res) => {
  const limit = parseInt((req.query.limit as string) || "8", 10);
  res.json(getPopularBooks(limit));
});

app.get("/api/books/search", (req, res) => {
  const {
    q = "",
    category = "",
    formats = "",
    language = "",
    sortBy = "relevance",
    page = "1",
    pageSize = "10",
  } = req.query as Record<string, string>;

  const result = searchBooks({
    q,
    category,
    formats: formats ? formats.split(",") : [],
    language,
    sortBy: sortBy as any,
    page: parseInt(page, 10) || 1,
    pageSize: parseInt(pageSize, 10) || 10,
  });

  res.json(result);
});

app.get("/api/books/:id", (req, res) => {
  const book = getBookById(String(req.params.id));
  if (!book) {
    return res.status(404).json({ error: "书籍未找到" });
  }
  res.json(book);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "sqlite" });
});

// ========== 管理员接口 ==========

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_PASSWORD, success: true });
  } else {
    res.status(401).json({ error: "密码错误", success: false });
  }
});

app.get("/api/admin/books", authAdmin, (req, res) => {
  const { q = "", page = "1", pageSize = "20" } = req.query as Record<string, string>;
  const result = searchBooks({
    q,
    page: parseInt(page, 10) || 1,
    pageSize: parseInt(pageSize, 10) || 20,
  });
  res.json(result);
});

app.post("/api/admin/books", authAdmin, (req, res) => {
  const {
    title,
    author,
    cover,
    publisher,
    year,
    pages,
    language,
    rating,
    downloads,
    category,
    formats,
    description,
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "书名和作者必填" });
  }

  const id = createBook({
    title,
    author,
    cover: cover || "",
    publisher: publisher || "",
    year: parseInt(year, 10) || 0,
    pages: parseInt(pages, 10) || 0,
    language: language || "中文",
    rating: parseFloat(rating) || 0,
    downloads: parseInt(downloads, 10) || 0,
    category: category || "",
    formats: Array.isArray(formats) ? formats.join(",") : formats || "",
    description: description || "",
  });

  res.json({ id, success: true });
});

app.put("/api/admin/books/:id", authAdmin, (req, res) => {
  const data: any = { ...req.body };
  if (Array.isArray(data.formats)) {
    data.formats = data.formats.join(",");
  }
  const ok = updateBook(String(req.params.id), data);
  res.json({ success: ok });
});

app.delete("/api/admin/books/:id", authAdmin, (req, res) => {
  deleteBook(String(req.params.id));
  res.json({ success: true });
});

app.post("/api/admin/upload", authAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "未上传文件" });
  }
  const type = req.body.type || "cover";
  const url = type === "book" ? `/books/${req.file.filename}` : `/covers/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size: req.file.size });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`[API] 后端服务运行于 http://localhost:${PORT}`);
    console.log(`[API] 管理员默认密码: ${ADMIN_PASSWORD}`);
  });
}

start();
