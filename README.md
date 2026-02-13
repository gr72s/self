# Self

## Bootstrap

- build 

```bash
docker compose build
```

- run

```bash
docker compose up -d
```

- run && build

```bash
docker compose up -d --build
```

- stop

```bash
docker compose down
```

- check status

```bash
docker compose ps
```

- check logs

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