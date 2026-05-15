# ARM64 / AMD64 通用 (multi-arch base image)
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    DEBIAN_FRONTEND=noninteractive

# 系統相依：Tesseract (多語言)、poppler、編譯工具
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-chi-tra \
    tesseract-ocr-chi-sim \
    tesseract-ocr-eng \
    tesseract-ocr-vie \
    tesseract-ocr-jpn \
    tesseract-ocr-kor \
    tesseract-ocr-tha \
    tesseract-ocr-fra \
    tesseract-ocr-deu \
    tesseract-ocr-spa \
    tesseract-ocr-por \
    poppler-utils \
    libpoppler-cpp-dev \
    build-essential \
    pkg-config \
    curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先 copy requirements 利用 docker layer cache
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# 預載 Docling 模型，避免首次請求 cold start (~30s+)
# 若 ARM 編譯失敗可註解此行，運行時會自動下載
RUN python -c "from docling.document_converter import DocumentConverter; DocumentConverter()" || true

COPY parser.py main.py ./

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
