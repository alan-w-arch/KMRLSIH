from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.app.routers import auth, root, transexions, notify
from api.app.utils import security
from api.app import config
import dotenv

dotenv.load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(root.router, tags=["Root"])
app.include_router(transexions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(notify.router, prefix="/notify", tags=["Notifications"])
app.include_router(config.documents.router, prefix="/documents", tags=["Documents"])
@app.get("/")
async def home():
    return {"message": "Hello, FastAPI with Docker!"}
