FROM python:3.11-slim

WORKDIR /app

# 1️⃣ Install Tesseract and language packs
RUN apt-get update && \
    apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-mal && \
    rm -rf /var/lib/apt/lists/*

# 2️⃣ Copy only requirement files first (so dependencies are cached)
COPY api/requirements.txt ./api-requirements.txt
COPY nlpPipelne/requirements.txt ./nlp-requirements.txt

# 3️⃣ Install Python dependencies
RUN pip install --no-cache-dir -r api-requirements.txt && \
    pip install --no-cache-dir -r nlp-requirements.txt

# 4️⃣ Copy the rest of the project
COPY ./api ./api
COPY ./nlpPipelne ./nlpPipelne

EXPOSE 8000

CMD ["uvicorn", "api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
