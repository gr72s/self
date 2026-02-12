# Self

## Docker 相关命令

### 构建镜像

在项目根目录执行以下命令构建Docker镜像：

```bash
docker compose build
```

### 启动服务

启动所有服务（包括前端和后端）：

```bash
docker compose up -d
```

### 停止服务

停止所有服务：

```bash
docker compose down
```

### 查看服务状态

查看服务运行状态：

```bash
docker compose ps
```

### 查看服务日志

查看后端服务日志：

```bash
docker compose logs backend
```

## 后端服务

### 服务地址

后端服务启动后，可通过以下地址访问：
- **API 文档**：http://localhost:8000/docs
- **健康检查**：http://localhost:8000/health
- **根路径**：http://localhost:8000/

### 环境配置

后端服务默认以生产模式运行，通过环境变量 `SELF_ENV=production` 设置。

### 数据存储

- 数据库：SQLite
- 配置文件和数据：存储在 `~/.self` 目录，已与宿主机映射