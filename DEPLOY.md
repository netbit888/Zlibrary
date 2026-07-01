# Zlibrary 免费部署指南

本指南将帮助你把 Zlibrary 网站部署到公网，使用 Render 平台的免费方案。

## 架构概览

```
用户访问: your-app.onrender.com
    │
    └── Render (Node.js 服务)
        ├── 前端静态页面 (dist/)
        ├── 后端 API (Express)
        ├── SQLite 数据库 (data/)
        └── 文件存储 (data/covers/, data/books/)
```

## 步骤 1: 注册 Render

1. 访问 [render.com](https://render.com) 注册账户
2. 使用 GitHub 登录最方便

## 步骤 2: 推送代码到 GitHub

```bash
# 初始化 git (如果没有)
git init
git add .
git commit -m "initial commit"

# 创建 GitHub 仓库并推送
# 参考 GitHub 官方文档
```

## 步骤 3: 在 Render 上创建服务

1. 登录 [render.com](https://render.com)
2. 点击 "New" → "Web Service"
3. 选择你的 GitHub 仓库
4. 配置：

| 设置 | 值 |
|------|-----|
| Name | zlibrary |
| Region | Oregon (推荐) |
| Environment | Node |
| Build Command | `npm run build` |
| Start Command | `npx tsx server/api/server.ts` |

5. 在 "Advanced" 中添加环境变量：

| Key | Value |
|-----|-------|
| ADMIN_PASSWORD | zlibrary |
| NODE_ENV | production |

6. 在 "Disks" 中添加持久化存储：

| 设置 | 值 |
|------|-----|
| Name | data |
| Mount Path | /app/data |
| Size | 1 GB |

7. 点击 "Create Web Service"

## 步骤 4: 等待部署

部署过程约需 2-5 分钟，首次部署可能更久。

部署完成后，你会得到一个域名，例如：
`https://zlibrary.onrender.com`

## 步骤 5: 验证部署

访问你 Render 分配的域名，测试：

- [ ] 首页正常加载
- [ ] 搜索功能正常
- [ ] 图书详情页正常
- [ ] 下载功能正常
- [ ] 登录后台 (密码: zlibrary)
- [ ] 上传文件功能正常

## 免费额度

Render 免费版：
- **750 小时/月** - 每月运行时间
- **1 GB 磁盘** - 数据持久化存储
- 有冷启动（超过 15 分钟不访问会休眠，再访问时约 30 秒唤醒）

## 管理数据

### 备份数据
从 Render 控制台：
1. 进入你的服务
2. 点击 "Shell"
3. 运行：
```bash
cp /app/data/zlibrary.db /app/zlibrary-backup.db
```
然后可以从 Files 下载备份文件

### 恢复数据
同上，在 Shell 中替换文件即可

## 常见问题

### Q: 如何修改管理员密码？
A: 在 Render 控制台的环境变量中修改 ADMIN_PASSWORD

### Q: 上传的文件在哪里？
A: 在 Render 的磁盘中，路径为 /app/data/covers/ 和 /app/data/books/

### Q: 服务休眠了怎么办？
A: 免费版会休眠，访问后约 30 秒自动唤醒，无需操作

### Q: 如何更新部署？
A: 推送到 GitHub 后，Render 会自动重新部署

## 本地开发

```bash
# 启动本地开发环境
npm run dev
```

## 项目结构

| 目录/文件 | 用途 |
|----------|------|
| server/api/server.ts | 后端 Express 服务 |
| server/api/db.ts | SQLite 数据库操作 |
| client/ | 前端 React 代码 |
| data/ | 本地数据目录 (开发用) |
| dist/ | 前端构建输出 |

---

完成！访问你的 Render 域名即可使用。