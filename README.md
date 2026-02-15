# Self

## Bootstrap

- prepare env

```bash
cat > .env <<'EOF'
SELF_HOME=/home/green/.self
SELF_APP_HOME=/home/green/.self-app
EOF
```

- init project (first deploy only)

```bash
docker compose --profile init run --rm --build init
```

- start backend

```bash
docker compose up -d --build backend
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
docker compose logs -f backend
```

- rerun init (reset `~/.self` data, use with caution)

```bash
docker compose --profile init run --rm --build init
```

## 后端服务

### 服务地址

后端服务启动后，可通过以下地址访问：
- **API 文档**：http://localhost:8000/docs
- **健康检查**：http://localhost:8000/health
- **根路径**：http://localhost:8000/

### 环境配置

后端服务默认以生产模式运行（`BOOT_ENV=production`，在 `docker-compose.yml` 中设置）。
Compose 使用项目根目录 `.env` 中的 `SELF_HOME` 和 `SELF_APP_HOME` 作为宿主机挂载路径。

### 数据存储

- 数据库：SQLite
- 配置文件和数据：存储在 `~/.self` 目录，已与宿主机映射
