FROM python:3.13.12-alpine3.23

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python init_db.py
RUN mkdir -p ~/.self
VOLUME ["~/.self"]
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
