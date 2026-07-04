// 简化的用户认证功能 - 专注于核心: 注册、登录、JWT、Token验证
import crypto from 'crypto';
import * as db from './db';

// 简单密码哈希
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha256')
    .toString('hex');
  return `${salt}:${hash}`;
}

// 验证密码
export function verifyPassword(password: string, storedPassword: string): boolean {
  const [salt, hash] = storedPassword.split(':');
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha256')
    .toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(passwordHash, 'hex')
  );
}

// 生成JWT令牌 (简化版)
export function generateToken(userId: string, role: string): string {
  const payload = { userId, role };
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  
  // 创建头部
  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  })).toString('base64url');
  
  // 创建payload
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // 创建签名
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadEncoded}`)
    .digest('base64url');
  
  return `${header}.${payloadEncoded}.${signature}`;
}

// 验证JWT令牌
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const [header, payload, signature] = token.split('.');
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    
    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // 解码payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    return {
      userId: decodedPayload.userId,
      role: decodedPayload.role,
    };
  } catch (error) {
    return null;
  }
}

// 从请求头提取token
export function extractToken(headers: any): string | null {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// 用户注册
export async function registerUser(email: string, username: string, password: string) {
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('无效的邮箱地址');
  }
  
  // 检查邮箱是否已存在
  const existingUser = await db.findUserByEmail(email);
  if (existingUser) {
    throw new Error('该邮箱已被注册');
  }
  
  // 验证用户名
  if (!username.trim()) {
    throw new Error('用户名不能为空');
  }
  if (username.length < 2) {
    throw new Error('用户名至少需要2个字符');
  }
  
  // 验证密码
  if (password.length < 6) {
    throw new Error('密码至少需要6个字符');
  }
  
  // 哈希密码
  const passwordHash = hashPassword(password);
  
  // 创建用户
  const result = db.createUser(email, username, passwordHash, 'user');
  
  return {
    id: result.id,
    email,
    username,
    role: 'user'
  };
}

// 用户登录
export async function loginUser(email: string, password: string) {
  // 查找用户
  const user = await db.findUserByEmail(email);
  if (!user) {
    throw new Error('邮箱或密码错误');
  }
  
  // 验证密码
  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error('邮箱或密码错误');
  }
  
  // 更新最后登录时间
  db.updateUserLastLogin(user.id);
  
  // 生成JWT令牌
  const token = generateToken(user.id, user.role);
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    }
  };
}

// 获取用户信息
export async function getUserInfo(userId: string) {
  const user = await db.findUserById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };
}

// 认证中间件
export function authenticate(req: any, res: any, next: any) {
  try {
    const token = extractToken(req.headers);
    
    if (!token) {
      res.status(401).json({ success: false, message: '需要认证' });
      return;
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: '无效的token' });
      return;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: '认证错误' });
  }
}