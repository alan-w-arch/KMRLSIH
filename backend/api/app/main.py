from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.app.routers import auth, transexions, notify, documents, user
from api.app.utils import security
from api.app import config
import dotenv
import os

dotenv.load_dotenv()

app = FastAPI()

UPLOAD_DIR = "./temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/profile", tags=["User"])
app.include_router(transexions.router, prefix="/transexions", tags=["Transexions"])
app.include_router(notify.router, prefix="/notify", tags=["Notifications"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

@app.get("/")
async def home():
    return {"message": "Hello, FastAPI with Docker!"}
