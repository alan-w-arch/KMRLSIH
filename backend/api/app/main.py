import os
import aiohttp
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from nlpPipelne.ProcessPipeline import process_file
import cloudinary.uploader
from api.app import config
from supabase import create_client, Client
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not found in environment")
print(SUPABASE_KEY)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(supabase.table("users").select("*").limit(1).execute())
print(supabase)

app = FastAPI()

UPLOAD_DIR = "./temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Add CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models - Match your login form
class LoginRequest(BaseModel):
    user_id: str
    password: str

class URLRequest(BaseModel):
    user_id: str
    url: str
    dept_name: str

class VIEWRequest(BaseModel):
    user_id: str
    doc_id: str

class SUMMARYRequest(BaseModel):
    doc_id: str


@app.post("/login")
async def login(request: LoginRequest):
    try:
        # Fetch user by ID
        response = (
            supabase.table("users")
            .select("*")
            .eq("id", request.user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user = response.data[0]

        # Successful login
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "department": user["department"],
                "role": user["role"],
            },
        }

    except HTTPException:
        raise  # re-raise known errors
    except Exception as e:
        # Log the error (replace with proper logging in prod)
        print("Login error:", str(e))
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")

@app.get("/profile/{employee_id}")
async def get_profile(employee_id: str):
    try:
        response = supabase.table("users").select("id,name,department,role").eq("id", employee_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "user": response.data[0]}
    
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to get profile")

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI with Docker!"}

@app.post("/url")   
async def receive_url(request: URLRequest):
    file_url = request.url
    filename = file_url.split("/")[-1]
    file_location = os.path.join(UPLOAD_DIR, filename)

    # Download file asynchronously
    async with aiohttp.ClientSession() as session:
        async with session.get(file_url) as resp:
            if resp.status != 200:
                return {"error": f"Failed to download file, status: {resp.status}"}
            content = await resp.read()
            with open(file_location, "wb") as f:
                f.write(content)

    # Process file using your NLP pipeline
    output = process_file(file_location)

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(content, resource_type="auto")

    # Get department ID once
    dept_resp = supabase.table("departments").select("dept_id").eq("name", request.dept_name).execute()
    if not dept_resp.data:
        raise HTTPException(status_code=400, detail="Department not found")
    dept_id = dept_resp.data[0]["dept_id"]

    # Insert document
    doc_data = {
        "title": filename,
        "department": dept_id,
        "url": upload_result.get("secure_url"),
        "medium": "url",
        "priority": "normal",
    }
    doc_resp = supabase.table("documents").insert(doc_data).execute()
    inserted_doc = doc_resp.data[0] if doc_resp.data else None

    if inserted_doc:
        doc_id = inserted_doc["doc_id"]
        # Insert summary
        supabase.table("summaries").insert({
            "doc_id": doc_id, 
            "content": output["doc_summary"]
        }).execute()

        # Insert transexion
        supabase.table("transexions").insert({
            "from_user": request.user_id,
            "to_department": dept_id,
            "doc_id": doc_id
        }).execute()

    # Clean up local file
    os.remove(file_location)

    return {
        "downloaded_url": file_url,
        "filename": filename,
        "size": len(content),
        "processed": output,
        "cloudinary_url": upload_result.get("secure_url")
    }

@app.post("/file")
async def receive_file(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    dept_name: str = Form(...)
):
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    # Read and save file locally
    content = await file.read()
    with open(file_location, "wb") as f:
        f.write(content)

    try:
        # Process file
        output = process_file(file_location)

        # Get department ID
        dept_resp = supabase.table("departments").select("dept_id").eq("name", dept_name).execute()
        if not dept_resp.data:
            raise HTTPException(status_code=400, detail="Department not found")
        dept_id = dept_resp.data[0]["dept_id"]

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(content, resource_type="auto")

        # Insert document
        doc_data = {
            "title": file.filename,
            "department": dept_id,
            "url": upload_result.get("secure_url"),
            "medium": "direct file",
            "priority": "normal",
        }
        doc_resp = supabase.table("documents").insert(doc_data).execute()
        inserted_doc = doc_resp.data[0] if doc_resp.data else None

        if inserted_doc:
            doc_id = inserted_doc["doc_id"]
            # Insert summary
            supabase.table("summaries").insert({
                "doc_id": doc_id,
                "content": output.get("doc_summary", "")
            }).execute()

            # Insert transexion
            supabase.table("transexions").insert({
                "from_user": user_id,
                "to_department": dept_id,
                "doc_id": doc_id
            }).execute()

    finally:
        # Always clean up local file
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

