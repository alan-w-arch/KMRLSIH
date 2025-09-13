import os
import aiohttp
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

app = FastAPI()

UPLOAD_DIR = "./temp"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI with Docker!"}

class URLRequest(BaseModel):
    url: str

@app.post("/url")
async def receive_url(request: URLRequest):
    file_url = request.url

    # Extract filename from URL
    filename = file_url.split("/")[-1]
    file_location = os.path.join(UPLOAD_DIR, filename)

    # Download file from URL and save it
    async with aiohttp.ClientSession() as session:
        async with session.get(file_url) as resp:
            if resp.status != 200:
                return {"error": f"Failed to download file, status: {resp.status}"}
            
            content = await resp.read()
            with open(file_location, "wb") as f:
                f.write(content)

    return {
        "downloaded_url": file_url,
        "saved_location": file_location,
        "filename": filename,
        "size": len(content)
    }

@app.post("/file")
async def receive_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "saved_location": file_location
    }
