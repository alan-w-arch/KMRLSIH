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
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
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
    employee_id: str
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


# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)    

# Routes
@app.post("/login")
async def login(request: LoginRequest):
    try:
        # Get user from database using employee_id as primary key
        response = supabase.table("users").select("*").eq("id", request.employee_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="Invalid employee ID or password")
    
        user = response.data[0]
        
        # Verify password
        if not verify_password(request.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid employee ID or password")
        
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "department": user["department"],
                "role": user["role"]
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")

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

