FROM python:3.13.12-alpine3.23

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# 安装当前项目，生成self可执行文件
RUN pip install -e .

# 创建必要的目录结构
RUN mkdir -p /root/.self /root/.self-app

# 挂载宿主机的配置目录
VOLUME ["/root/.self", "/root/.self-app"]
EXPOSE 8000

# 直接启动self
CMD ["self", "start"]
