FROM python:3.13.12-alpine3.23

WORKDIR /app

COPY requirements.txt ./
RUN apk add --no-cache sqlite && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install -e .

EXPOSE 8000
CMD ["self", "start"]
