FROM python:3.13.12-alpine3.23

WORKDIR /app

COPY requirements.txt ./
RUN apk add --no-cache sqlite tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install -e . && \
    addgroup -g 1001 green && \
    adduser -D -h /home/green -u 1001 -G green green && \
    mkdir -p /home/green/.self /home/green/.self-app && \
    chown -R 1001:1001 /home/green /app

ENV TZ=Asia/Shanghai \
    HOME=/home/green

USER 1001:1001

EXPOSE 8000
CMD ["self", "start"]
