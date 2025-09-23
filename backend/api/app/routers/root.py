from fastapi import APIRouter

router = APIRouter()

@router.get("/profile/{employee_id}")
async def get_profile(employee_id: str):
    # logic here...
    return {"user": {"id": employee_id}}
