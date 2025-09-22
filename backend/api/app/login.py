
from concurrent.futures import process
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from passlib.context import CryptContext
import os
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()

# Setup
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()

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

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# @app.post("/register")
# async def register(request: LoginRequest):
    

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
    return {"message": "KMRL Auth API running", "status": "ok"}