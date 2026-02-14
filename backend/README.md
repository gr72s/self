# Self API

Self Training API 是一个基于 FastAPI 框架开发的健身训练管理系统后端 API。

## 技术栈

- **Python 3.9+**
- **FastAPI** - 高性能的异步 Web 框架
- **SQLAlchemy** - ORM 数据库工具
- **Pydantic V2** - 数据验证和序列化
- **JWT** - 认证机制
- **SQLite** - 轻量级数据库

## 项目结构

```
backend/
├── app/
│   ├── api/           # API 路由
│   ├── core/          # 核心配置和工具
│   ├── models/        # 数据模型
│   ├── schemas/       # 数据验证和序列化
│   ├── services/      # 业务逻辑
│   └── utils/         # 工具函数
├── main.py            # 应用入口
├── init_db.py         # 数据库初始化脚本
├── requirements.txt   # 依赖项
└── README.md          # 项目说明
```

## 安装和运行

### 方法一：直接安装依赖

#### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 2. 初始化数据库

```bash
python init_db.py
```

#### 3. 启动应用

```bash
uvicorn main:app --reload
```

应用将在 `http://localhost:8000` 运行。

### 方法二：使用setuptools安装（推荐）

#### 1. 安装包

```bash
cd backend
pip install -e .
```

#### 2. 初始化数据库

```bash
self run python init_db.py
```

#### 3. 启动应用

```bash
self start
```

应用将在 `http://localhost:8000` 运行。

## CLI命令

安装后，可以使用以下 `self` 命令：

### 启动应用
```bash
self start
```

### 停止应用
```bash
self stop
```

### 执行自定义命令
```bash
self run <command>
```

例如：
```bash
self run ls -la
self run python --version
```

## API 文档

启动应用后，可以访问以下地址查看自动生成的 API 文档：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 默认数据

初始化数据库后，系统会自动添加以下默认数据：

### 用户
- 用户名: `admin`
- 密码: `admin123`

### 肌肉
- 胸肌
- 背肌
- 手臂
- 腿部
- 肩部

### 目标
- 增肌
- 减脂
- 耐力
- 力量
- 灵活性

### 健身房
- 健身中心 (市中心)
- 运动俱乐部 (郊区)

### 练习
- 卧推 (胸肌)
- 引体向上 (背肌)

## 主要功能

1. **用户认证** - 支持用户名/密码登录和微信登录
2. **肌肉管理** - 增删改查肌肉信息
3. **目标管理** - 管理训练目标
4. **健身房管理** - 增删改查健身房信息
5. **练习管理** - 增删改查练习信息，支持关联肌肉
6. **训练计划管理** - 创建和管理训练计划，支持模板
7. **训练槽管理** - 在训练计划中添加和管理练习
8. **训练管理** - 创建和管理训练记录，支持开始和停止训练

## 安全注意事项

1. 本项目使用 SQLite 作为数据库，适用于开发和小型应用
2. 生产环境中应使用更安全的数据库和配置
3. 微信登录功能需要在生产环境中配置真实的微信 AppID 和 AppSecret
4. JWT 密钥应在生产环境中更改为更安全的值
