import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

# .env 파일 로드
load_dotenv()

# MongoDB URI 가져오기
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://taekiz0210:7872@cluster0.y099h.mongodb.net/?retryWrites=true&w=majority")

# MongoDB 연결
client = MongoClient(MONGO_URI)
db = client["logistics_db"]
users_collection = db["users"]
logistics_collection = db["logistics"]
messages_collection = db["messages"]

print("✅ MongoDB 연결 성공!")

# FastAPI 앱 설정
app = FastAPI()

# JWT 설정
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 요청 데이터 모델
class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LogisticsRequest(BaseModel):
    date: str
    time: str
    sender: str
    receiver: str
    bus: str
    bag: int
    box: int
    dolly: int

class MessageRequest(BaseModel):
    nickname: str
    message: str
    time: str

# 회원가입 API
@app.post("/register")
def register_user(request: RegisterRequest):
    if users_collection.find_one({"email": request.email}):
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
    
    hashed_password = pwd_context.hash(request.password)
    users_collection.insert_one({"email": request.email, "password": hashed_password})
    return {"message": "회원가입 성공!"}

# 로그인 API
@app.post("/login")
def login_user(request: LoginRequest):
    user = users_collection.find_one({"email": request.email})
    if not user or not pwd_context.verify(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 잘못되었습니다.")
    
    token = jwt.encode({"sub": request.email, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"token": token}

# 배송 정보 저장 API
@app.post("/logistics")
def save_logistics(data: LogisticsRequest):
    logistics_collection.insert_one(data.dict())
    return {"message": "배송 정보 저장 완료!"}

# 배송 내역 가져오기 API
@app.get("/logistics")
def get_logistics():
    logistics_data = list(logistics_collection.find({}, {"_id": 0}))
    return logistics_data

# 채팅 메시지 저장 API
@app.post("/messages")
def save_message(data: MessageRequest):
    messages_collection.insert_one(data.dict())
    return {"message": "메시지 저장 완료!"}

# 채팅 내역 가져오기 API
@app.get("/messages")
def get_messages():
    messages_data = list(messages_collection.find({}, {"_id": 0}))
    return messages_data
