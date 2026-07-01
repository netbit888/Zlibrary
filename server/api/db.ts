import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, "..", "..", "data", "zlibrary.db");
const DB_DIR = path.dirname(DB_FILE);

let db: any = null;

export async function initDb() {
  const wasmPath = path.resolve(__dirname, "..", "..", "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    const buf = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buf);
    console.log(`[DB] 已加载数据库: ${DB_FILE}`);
  } else {
    db = new SQL.Database();
    console.log(`[DB] 新建数据库: ${DB_FILE}`);
    createTables();
    seedData();
    saveDb();
  }
}

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

function createTables() {
  db.run(`
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
  `);

  // 如果旧表没有新字段，添加它们
  try {
    db.run("ALTER TABLE books ADD COLUMN pdf_url TEXT");
  } catch {}
  try {
    db.run("ALTER TABLE books ADD COLUMN epub_url TEXT");
  } catch {}
  try {
    db.run("ALTER TABLE books ADD COLUMN mobi_url TEXT");
  } catch {}

  console.log("[DB] 表结构已创建");
}

function seedData() {
  const books = [
    { title: "百年孤独", author: "加西亚·马尔克斯", cover: "/covers/百年孤独.jpg", publisher: "南海出版公司", year: 2011, pages: 360, language: "中文", rating: 4.9, downloads: 125000, category: "文学", formats: "pdf,epub,mobi", description: "《百年孤独》是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事。" },
    { title: "三体", author: "刘慈欣", cover: "/covers/三体.jpg", publisher: "重庆出版社", year: 2008, pages: 302, language: "中文", rating: 4.8, downloads: 210000, category: "科技", formats: "pdf,epub,mobi", description: "文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划\"红岸工程\"取得了突破性进展。" },
    { title: "人类简史", author: "尤瓦尔·赫拉利", cover: "/covers/人类简史.jpg", publisher: "中信出版社", year: 2014, pages: 440, language: "中文", rating: 4.7, downloads: 98000, category: "历史", formats: "pdf,epub", description: "十万年前，地球上至少有六种不同的人。但今日，世界舞台为什么只剩下了我们自己？" },
    { title: "设计心理学", author: "唐纳德·诺曼", cover: "/covers/设计心理学.jpg", publisher: "中信出版社", year: 2010, pages: 288, language: "中文", rating: 4.6, downloads: 45000, category: "艺术", formats: "pdf,epub,mobi", description: "日用品心理学经典之作，诺曼博士用诙谐的语言阐述了以用户为中心的设计原则。" },
    { title: "苏菲的世界", author: "乔斯坦·贾德", cover: "/covers/苏菲的世界.jpg", publisher: "作家出版社", year: 1996, pages: 512, language: "中文", rating: 4.5, downloads: 67000, category: "哲学", formats: "pdf,epub", description: "14岁的少女苏菲某天放学回家，发现了神秘的一封信。" },
    { title: "活着", author: "余华", cover: "/covers/活着.jpg", publisher: "作家出版社", year: 1993, pages: 195, language: "中文", rating: 4.8, downloads: 189000, category: "文学", formats: "pdf,epub,mobi", description: "《活着》讲述了农村人福贵悲惨的人生遭遇。" },
    { title: "深入浅出React", author: "程墨", cover: "/covers/深入浅出React.jpg", publisher: "电子工业出版社", year: 2022, pages: 380, language: "中文", rating: 4.4, downloads: 32000, category: "科技", formats: "pdf,epub", description: "本书从React的基本概念出发，逐步深入讲解核心知识点。" },
    { title: "明朝那些事儿", author: "当年明月", cover: "/covers/明朝那些事儿.jpg", publisher: "中国友谊出版公司", year: 2006, pages: 960, language: "中文", rating: 4.8, downloads: 156000, category: "历史", formats: "pdf,epub,mobi", description: "这套书主要讲述的是从1344年到1644年这三百年间关于明朝的一些故事。" },
    { title: "追风筝的人", author: "卡勒德·胡赛尼", cover: "/covers/追风筝的人.jpg", publisher: "上海人民出版社", year: 2006, pages: 360, language: "中文", rating: 4.7, downloads: 112000, category: "文学", formats: "pdf,epub,mobi", description: "12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。" },
    { title: "小王子", author: "圣埃克苏佩里", cover: "/covers/小王子.jpg", publisher: "人民文学出版社", year: 2003, pages: 96, language: "中文", rating: 4.9, downloads: 230000, category: "文学", formats: "pdf,epub,mobi", description: "小王子是一个超凡脱俗的仙童，他住在一颗只比他大一丁点儿的小行星上。" },
    { title: "红楼梦", author: "曹雪芹", cover: "/covers/红楼梦.jpg", publisher: "人民文学出版社", year: 1982, pages: 1200, language: "中文", rating: 4.9, downloads: 175000, category: "文学", formats: "pdf,epub,mobi", description: "中国古典四大名著之首。" },
    { title: "1984", author: "乔治·奥威尔", cover: "/covers/1984.jpg", publisher: "北京十月文艺出版社", year: 2010, pages: 328, language: "中文", rating: 4.8, downloads: 145000, category: "文学", formats: "pdf,epub,mobi", description: "反乌托邦文学的经典之作。" },
    { title: "万历十五年", author: "黄仁宇", cover: "/covers/万历十五年.jpg", publisher: "中华书局", year: 1982, pages: 280, language: "中文", rating: 4.7, downloads: 89000, category: "历史", formats: "pdf,epub,mobi", description: "万历十五年，亦即公元1587年。" },
    { title: "艺术的故事", author: "贡布里希", cover: "/covers/艺术的故事.jpg", publisher: "广西美术出版社", year: 2008, pages: 688, language: "中文", rating: 4.8, downloads: 41000, category: "艺术", formats: "pdf,epub", description: "这是一部有关艺术史的经典之作。" },
    { title: "理想国", author: "柏拉图", cover: "/covers/理想国.jpg", publisher: "商务印书馆", year: 1986, pages: 448, language: "中文", rating: 4.5, downloads: 56000, category: "哲学", formats: "pdf,epub,mobi", description: "《理想国》是柏拉图最重要的对话录之一。" },
    { title: "论语", author: "孔子及其弟子", cover: "/covers/论语.jpg", publisher: "中华书局", year: 2006, pages: 280, language: "中文", rating: 4.7, downloads: 95000, category: "哲学", formats: "pdf,epub,mobi", description: "儒家经典之一。" },
    { title: "道德经", author: "老子", cover: "/covers/道德经.jpg", publisher: "中华书局", year: 2008, pages: 160, language: "中文", rating: 4.7, downloads: 82000, category: "哲学", formats: "pdf,epub,mobi", description: "道家最重要的经典。" },
    { title: "史记", author: "司马迁", cover: "/covers/史记.jpg", publisher: "中华书局", year: 1959, pages: 3000, language: "中文", rating: 4.8, downloads: 68000, category: "历史", formats: "pdf", description: "中国第一部纪传体通史。" },
    { title: "全球通史", author: "斯塔夫里阿诺斯", cover: "/covers/全球通史.jpg", publisher: "北京大学出版社", year: 2006, pages: 1200, language: "中文", rating: 4.6, downloads: 47000, category: "历史", formats: "pdf,epub", description: "本书是一部世界历史的经典巨著。" },
    { title: "枪炮、病菌与钢铁", author: "贾雷德·戴蒙德", cover: "/covers/枪炮病菌与钢铁.jpg", publisher: "上海译文出版社", year: 2006, pages: 493, language: "中文", rating: 4.6, downloads: 62000, category: "历史", formats: "pdf,epub", description: "为什么现代社会中的财富和权力分配会是今天这个样子？" },
  ];

  const stmt = db.prepare(
    `INSERT INTO books (title, author, cover, publisher, year, pages, language, rating, downloads, category, formats, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  books.forEach((b) =>
    stmt.run([
      b.title, b.author, b.cover, b.publisher, b.year, b.pages,
      b.language, b.rating, b.downloads, b.category, b.formats, b.description
    ])
  );
  stmt.free();
  console.log(`[DB] 已初始化 ${books.length} 条书籍数据`);
}

function rowToBook(row: any): any {
  return {
    id: String(row[0]),
    title: row[1],
    author: row[2],
    cover: row[3],
    publisher: row[4],
    year: row[5],
    pages: row[6],
    language: row[7],
    rating: row[8],
    downloads: row[9],
    category: row[10],
    formats: (row[11] || "").split(",").filter(Boolean),
    description: row[12],
    pdf_url: row[13] || "",
    epub_url: row[14] || "",
    mobi_url: row[15] || "",
  };
}

export function getBookById(id: string): any | null {
  const stmt = db.prepare("SELECT * FROM books WHERE id = ?");
  const result = stmt.getAsObject([id]);
  stmt.free();
  if (!result) return null;
  const cols = ["id", "title", "author", "cover", "publisher", "year", "pages", "language", "rating", "downloads", "category", "formats", "description", "pdf_url", "epub_url", "mobi_url"];
  const row = cols.map((c) => result[c]);
  return rowToBook(row);
}

export function getAllCategories(): string[] {
  const res = db.exec("SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category");
  if (res.length === 0) return [];
  return res[0].values.map((row: any) => row[0]);
}

export function getPopularBooks(limit: number = 8): any[] {
  const stmt = db.prepare("SELECT * FROM books ORDER BY downloads DESC LIMIT ?");
  const result = stmt.getAsObject([limit]);
  stmt.free();
  if (!result) return [];
  const results = db.exec("SELECT * FROM books ORDER BY downloads DESC LIMIT " + limit);
  if (results.length === 0) return [];
  return results[0].values.map((row: any) => rowToBook(row));
}

export function searchBooks(params: {
  q?: string;
  category?: string;
  formats?: string[];
  language?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}): { books: any[]; total: number; page: number; pageSize: number } {
  const {
    q = "",
    category = "",
    formats = [],
    language = "",
    sortBy = "relevance",
    page = 1,
    pageSize = 10,
  } = params;

  let where: string[] = [];
  let args: any[] = [];

  if (q) {
    where.push("(title LIKE ? OR author LIKE ? OR description LIKE ?)");
    const kw = `%${q}%`;
    args.push(kw, kw, kw);
  }
  if (category) {
    where.push("category = ?");
    args.push(category);
  }
  if (formats && formats.length > 0) {
    const ors = formats.map(() => "formats LIKE ?").join(" OR ");
    where.push(`(${ors})`);
    formats.forEach((f) => args.push(`%${f}%`));
  }
  if (language) {
    where.push("language = ?");
    args.push(language);
  }

  const whereSql = where.length > 0 ? "WHERE " + where.join(" AND ") : "";

  // count
  const countRes = db.exec(`SELECT COUNT(*) FROM books ${whereSql}`, args);
  const total = countRes[0].values[0][0];

  // sort
  let orderSql = "";
  if (sortBy === "rating") orderSql = "ORDER BY rating DESC";
  else if (sortBy === "newest") orderSql = "ORDER BY year DESC";

  const offset = (page - 1) * pageSize;
  const querySql = `SELECT * FROM books ${whereSql} ${orderSql} LIMIT ${pageSize} OFFSET ${offset}`;
  const res = db.exec(querySql, args);
  const books = res.length > 0 ? res[0].values.map((row: any) => rowToBook(row)) : [];

  return { books, total, page, pageSize };
}

export { saveDb };

export function createBook(data: {
  title: string;
  author: string;
  cover?: string;
  publisher?: string;
  year?: number;
  pages?: number;
  language?: string;
  rating?: number;
  downloads?: number;
  category?: string;
  formats?: string;
  description?: string;
  pdf_url?: string;
  epub_url?: string;
  mobi_url?: string;
}): number {
  const stmt = db.prepare(
    `INSERT INTO books (title, author, cover, publisher, year, pages, language, rating, downloads, category, formats, description, pdf_url, epub_url, mobi_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run([
    data.title,
    data.author,
    data.cover || "",
    data.publisher || "",
    data.year || 0,
    data.pages || 0,
    data.language || "中文",
    data.rating || 0,
    data.downloads || 0,
    data.category || "",
    data.formats || "",
    data.description || "",
    data.pdf_url || "",
    data.epub_url || "",
    data.mobi_url || "",
  ]);
  stmt.free();
  const id = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
  saveDb();
  return id;
}

export function updateBook(
  id: string,
  data: Partial<{
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
    formats: string;
    description: string;
    pdf_url: string;
    epub_url: string;
    mobi_url: string;
  }>
): boolean {
  const cols: Array<[string, any]> = [
    ["title", data.title],
    ["author", data.author],
    ["cover", data.cover],
    ["publisher", data.publisher],
    ["year", data.year],
    ["pages", data.pages],
    ["language", data.language],
    ["rating", data.rating],
    ["downloads", data.downloads],
    ["category", data.category],
    ["formats", data.formats],
    ["description", data.description],
    ["pdf_url", data.pdf_url],
    ["epub_url", data.epub_url],
    ["mobi_url", data.mobi_url],
  ];

  const fields = cols.filter(([, v]) => v !== undefined).map(([col]) => `${col} = ?`);
  const values = cols.filter(([, v]) => v !== undefined).map(([, v]) => v);

  if (fields.length === 0) return false;

  const stmt = db.prepare(`UPDATE books SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run([...values, id]);
  stmt.free();
  saveDb();
  return true;
}

export function deleteBook(id: string): boolean {
  const stmt = db.prepare("DELETE FROM books WHERE id = ?");
  stmt.run([id]);
  stmt.free();
  saveDb();
  return true;
}

export function incrementDownloads(id: string): boolean {
  const stmt = db.prepare("UPDATE books SET downloads = downloads + 1 WHERE id = ?");
  stmt.run([id]);
  stmt.free();
  saveDb();
  return true;
}
