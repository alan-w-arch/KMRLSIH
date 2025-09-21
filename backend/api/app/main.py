import os
import aiohttp
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from nlpPipelne.ProcessPipeline import process_file
import cloudinary.uploader
from api.app import config

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
    filename = file_url.split("/")[-1]
    file_location = os.path.join(UPLOAD_DIR, filename)

    # Download file
    async with aiohttp.ClientSession() as session:
        async with session.get(file_url) as resp:
            if resp.status != 200:
                return {"error": f"Failed to download file, status: {resp.status}"}
            
            content = await resp.read()
            with open(file_location, "wb") as f:
                f.write(content)

    # Process locally
    output = process_file(file_location)

    # Upload to Cloudinary (using bytes)
    upload_result = cloudinary.uploader.upload(content, resource_type="auto")

    # Clean up
    os.remove(file_location)

    return {
        "downloaded_url": file_url,
        "filename": filename,
        "size": len(content),
        "processed": output,
        "cloudinary_url": upload_result.get("secure_url")
    }


@app.post("/file")
async def receive_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    content = await file.read()
    with open(file_location, "wb") as f:
        f.write(content)

    # Process locally
    output = process_file(file_location)

    # Upload to Cloudinary (using bytes)
    upload_result = cloudinary.uploader.upload(content, resource_type="auto")

    # Clean up
    os.remove(file_location)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "processed": output,
        "cloudinary_url": upload_result.get("secure_url")
    }
