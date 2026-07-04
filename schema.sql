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

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'user' 或 'admin'
  avatar TEXT,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- 用户喜欢的书籍表 (多对多关系)
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 用户下载历史表
CREATE TABLE IF NOT EXISTS user_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  format TEXT NOT NULL, -- 'pdf', 'epub', 'mobi'
  downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

INSERT INTO books (title, author, cover, publisher, year, pages, language, rating, downloads, category, formats, description)
VALUES
  ('百年孤独', '加西亚·马尔克斯', '/api/files/covers/sample.jpg', '南海出版公司', 2011, 360, '中文', 4.9, 125000, '文学', 'pdf,epub,mobi', '《百年孤独》是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事。'),
  ('三体', '刘慈欣', '/api/files/covers/sample.jpg', '重庆出版社', 2008, 302, '中文', 4.8, 210000, '科技', 'pdf,epub,mobi', '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。'),
  ('人类简史', '尤瓦尔·赫拉利', '/api/files/covers/sample.jpg', '中信出版社', 2014, 440, '中文', 4.7, 98000, '历史', 'pdf,epub', '十万年前，地球上至少有六种不同的人。但今日，世界舞台为什么只剩下了我们自己？'),
  ('设计心理学', '唐纳德·诺曼', '/api/files/covers/sample.jpg', '中信出版社', 2010, 288, '中文', 4.6, 45000, '艺术', 'pdf,epub,mobi', '日用品心理学经典之作，诺曼博士用诙谐的语言阐述了以用户为中心的设计原则。'),
  ('活着', '余华', '/api/files/covers/sample.jpg', '作家出版社', 1993, 195, '中文', 4.8, 189000, '文学', 'pdf,epub,mobi', '《活着》讲述了农村人福贵悲惨的人生遭遇。'),
  ('小王子', '圣埃克苏佩里', '/api/files/covers/sample.jpg', '人民文学出版社', 2003, 96, '中文', 4.9, 230000, '文学', 'pdf,epub,mobi', '小王子是一个超凡脱俗的仙童，他住在一颗只比他大一丁点儿的小行星上。');

-- 默认管理员账户
INSERT INTO users (email, username, password_hash, role, bio) 
VALUES (
  'admin@zlibrary.com',
  '系统管理员',
  'admin123', -- 注意: 生产环境应使用加密密码
  'admin',
  '系统管理员账户'
);
