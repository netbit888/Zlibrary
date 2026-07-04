// 数据库初始化脚本
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// 读取schema.sql文件
const schemaPath = join(process.cwd(), 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

// 删除旧数据库文件
const dbPath = join(process.cwd(), 'data', 'zlibrary.db');
try {
  await import('fs').then(fs => fs.unlinkSync(dbPath));
  console.log('删除旧数据库文件');
} catch {
  console.log('数据库文件不存在，开始创建');
}

console.log('初始化数据库表...');
console.log('数据库文件位置:', dbPath);

// 创建新的SQLite数据库
const db = new (await import('better-sqlite3'))(dbPath, { verbose: console.log });

// 执行schema.sql中的所有SQL语句
const statements = schema.split(';').filter(stmt => stmt.trim());

for (const stmt of statements) {
  try {
    db.exec(stmt + ';');
    console.log('执行SQL:', stmt.substring(0, 100) + '...');
  } catch (error) {
    console.error('SQL执行错误:', error.message);
    console.error('SQL语句:', stmt.substring(0, 200));
  }
}

db.close();
console.log('数据库初始化完成！');