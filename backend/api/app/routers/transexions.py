from fastapi import APIRouter, HTTPException
from api.app.config import supabase

router = APIRouter()

@router.get("/{user_id}")
async def get_transactions(user_id: str):
    response = supabase.table("transexions").select("*").eq("from_user", user_id).execute()
    if not response.data:
        return {"message": "No transactions found"}
    return {"transactions": response.data}
