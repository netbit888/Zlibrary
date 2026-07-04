// 用户认证相关的工具函数
import crypto from 'crypto';
import * as db from './db';

// 生成盐值
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

// 密码哈希函数  
export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
}

// 验证密码
export function verifyPassword(
  password: string, 
  hashedPassword: string, 
  salt: string
): boolean {
  const passwordHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(passwordHash, 'hex'),
    Buffer.from(hashedPassword, 'hex')
  );
}

// 生成JWT令牌（简化版，实际应该使用jsonwebtoken库）
export function generateToken(userId: string, role: string): string {
  // 在实际项目中应该使用JWT库生成安全的token
  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  })).toString('base64');

  const payload = Buffer.from(JSON.stringify({
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24小时后过期
  })).toString('base64');

  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64');

  return `${header}.${payload}.${signature}`;
}

// 验证JWT令牌
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
      .update(`${header}.${payload}`)
      .digest('base64');

    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // 检查token是否过期
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: decodedPayload.userId,
      role: decodedPayload.role,
    };
  } catch (error) {
    return null;
  }
}

// 从请求头中提取token
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// 用户认证中间件
export function authenticateUser(req: any, res: any, next: any) {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    res.status(401).json({ success: false, message: '未提供认证令牌' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ success: false, message: '无效或过期的令牌' });
    return;
  }

  // 将用户信息附加到请求对象上
  req.user = decoded;
  next();
}

// 管理员权限中间件
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.user) {
    res.status(401).json({ success: false, message: '需要认证' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: '需要管理员权限' });
    return;
  }

  next();
}

// 生成安全的随机代码（用于验证码、重置密码等）
export function generateSecureCode(length: number = 6): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomBytes(1)[0] % chars.length;
    result += chars[randomIndex];
  }
  
  return result;
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 密码强度验证
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('密码至少需要8个字符');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 用户注册校验
export async function validateRegistration(
  email: string, 
  username: string, 
  password: string
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // 验证邮箱格式
  if (!isValidEmail(email)) {
    errors.push('无效的邮箱地址');
  }

  // 检查邮箱是否已存在
  const existingUser = await db.findUserByEmail(email);
  if (existingUser) {
    errors.push('该邮箱已被注册');
  }

  // 验证用户名
  if (!username.trim()) {
    errors.push('用户名不能为空');
  } else if (username.length < 2) {
    errors.push('用户名至少需要2个字符');
  } else if (username.length > 30) {
    errors.push('用户名不能超过30个字符');
  }

  // 验证密码强度
  const passwordValidation = validatePasswordStrength(password);
  errors.push(...passwordValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 密码重置码生成和验证相关
export async function generatePasswordResetCode(userId: string): Promise<string> {
  const code = generateSecureCode(8);
  const expiresAt = new Date(Date.now() + 3600000); // 1小时后过期
  
  // 在实际项目中应该存储到数据库
  console.log(`Password reset code for user ${userId}: ${code}, expires at: ${expiresAt}`);
  
  return code;
}

export function validatePasswordResetCode(code: string, userId: string): boolean {
  // 在实际项目中应该从数据库验证code和userId
  console.log(`Validating reset code ${code} for user ${userId}`);
  
  // 简化实现：暂时返回true
  // 实际应该检查code是否存在且未过期
  return true;
}