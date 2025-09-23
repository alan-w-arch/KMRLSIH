from fastapi import APIRouter, HTTPException
from api.app.config import supabase
from api.app.schemas.models import VIEWRequest, SUMMARYRequest, HISTORYRequest

router = APIRouter()

@router.post("/viewed")
async def viewed(request: VIEWRequest):
    existing = supabase.table("views").select("*") \
        .eq("user_id", request.user_id).eq("doc_id", request.doc_id).execute()

    if existing.data:
        return {"message": "Already viewed"}

    supabase.table("views").insert({
        "user_id": request.user_id,
        "doc_id": request.doc_id
    }).execute()
    return {"message": "View logged"}

@router.get("/summary")
async def summary(request: SUMMARYRequest):
    response = supabase.table("summaries").select("content") \
        .eq("doc_id", request.doc_id).execute()
    if response.data:
        return {"summary": response.data[0]["content"]}
    return {"error": "No summary found"}

@router.get("/history")
async def history(request: HISTORYRequest):
    response = supabase.table("transexions").select("*") \
        .eq("doc_id", request.doc_id).execute()
    if response.data:
        return {"history": response.data}
    return {"error": "No history found"}
