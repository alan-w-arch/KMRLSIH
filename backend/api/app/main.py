import os
import aiohttp
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from nlpPipelne.ProcessPipeline import process_file
import cloudinary.uploader
from api.app import config
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(supabase)

app = FastAPI()

UPLOAD_DIR = "./temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
async def root():
    return {"message": "Hello, FastAPI with Docker!"}


class URLRequest(BaseModel):
    user_id: str
    url: str
    dept_name: str

class VIEWRequest(BaseModel):
    user_id: str
    doc_id: str

class SUMMARYRequest(BaseModel):
    doc_id: str

@app.post("/url")
async def receive_url(request: URLRequest):
    file_url = request.url
    filename = file_url.split("/")[-1]
    file_location = os.path.join(UPLOAD_DIR, filename)

    async with aiohttp.ClientSession() as session:
        async with session.get(file_url) as resp:
            if resp.status != 200:
                return {"error": f"Failed to download file, status: {resp.status}"}
            
            content = await resp.read()
            with open(file_location, "wb") as f:
                f.write(content)

    output = process_file(file_location)

    upload_result = cloudinary.uploader.upload(content, resource_type="auto")

    data = {
        "title": filename,
        "classification": "Backend Head",
        "url": upload_result.get("secure_url"),
        "medium": "url",
        "priority": "normal",
    }
    response = supabase.table("documents").insert(data).execute()

    inserted_doc = response.data[0] if response.data else None

    if inserted_doc:
        doc_id = inserted_doc["doc_id"]
        supabase.table("summaries").insert({
            "doc_id": doc_id, 
            "content": output["doc_summary"]
            }).execute()
        supabase.table("transexions").insert({
            "from_user": request.user_id,
            "to_department": supabase.table("departments") \
                       .select("dept_id") \
                       .eq("name", request.dept_name) \
                       .execute(),
            "doc_id": doc_id
        })

    os.remove(file_location)

    return {
        "downloaded_url": file_url,
        "filename": filename,
        "size": len(content),
        "processed": output,
        "cloudinary_url": upload_result.get("secure_url")
    }


@app.post("/file")
async def receive_file(file: UploadFile = File(...), user_id: str = Form(...), dept_name: str = Form):
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    content = await file.read()
    with open(file_location, "wb") as f:
        f.write(content)

    output = process_file(file_location)

    upload_result = cloudinary.uploader.upload(content, resource_type="auto")

    data = {
        "title": file.filename,
        "classification": "Backend Head",
        "url": upload_result.get("secure_url"),
        "medium": "direct file",
        "priority": "normal",
    }
    response = supabase.table("documents").insert(data).execute()

    inserted_doc = response.data[0] if response.data else None

    if inserted_doc:
        doc_id = inserted_doc["doc_id"]
        supabase.table("summaries").insert({
            "doc_id": doc_id,
            "content": output["doc_summary"]
        })
        supabase.table("transexions").insert({
            "from_user": user_id,
            "to_department": supabase.table("departments") \
                       .select("dept_id") \
                       .eq("name", dept_name) \
                       .execute(),
            "doc_id": doc_id
        })
    
    os.remove(file_location)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "processed": output,
        "cloudinary_url": upload_result.get("secure_url")
    }

@app.post("/viewed")
async def viewed(request: VIEWRequest):
    existing = supabase.table("views").select("*").eq("user_id", request.user_id).eq("doc_id", request.doc_id).execute()

    if existing.data:
        return {"message": "Already viewed."}

    data = {
        "user_id": request.user_id,
        "doc_id": request.doc_id
    }
    supabase.table("views").insert(data).execute()
    return {"message": "Hey you MF you viewed it."}

@app.get("/summary")
async def summary(request: SUMMARYRequest):
    response = supabase.table("summaries") \
                       .select("content") \
                       .eq("doc_id", request.doc_id) \
                       .execute()

    if response.data and len(response.data) > 0:
        return {"summary": response.data[0]["content"]}
    else:
        return {"error": "No summary found for this doc_id"}

