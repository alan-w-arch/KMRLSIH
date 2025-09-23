from pydantic import BaseModel

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

class HISTORYRequest(BaseModel):
    doc_id: str
    user_id: str

class TransactionRequest(BaseModel):
    from_user: str
    to_department: str
    doc_id: str
    timestamp: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: str
    role: str
    phone: str