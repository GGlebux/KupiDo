FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Срезаем возможные CRLF-переносы (если репозиторий клонировали на Windows),
# иначе шебанг start.sh ломается с "no such file or directory".
RUN mkdir -p /app/media \
    && sed -i 's/\r$//' /app/start.sh \
    && chmod +x /app/start.sh

CMD ["/app/start.sh"]
