from fastapi import APIRouter, Form, HTTPException

router = APIRouter()

@router.post("/email")
async def send_email(to_email: str = Form(...), subject: str = Form(...), body: str = Form(...)):
    try:
        print(f"Sending email to {to_email} with subject '{subject}'")
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")
