FROM python:3.13.12-alpine3.23

WORKDIR /app

COPY requirements.txt ./
RUN apk add --no-cache sqlite tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install -e .

ENV TZ=Asia/Shanghai

EXPOSE 8000
CMD ["self", "start"]
