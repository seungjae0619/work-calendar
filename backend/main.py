from fastapi import FastAPI, Depends, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import Annotated
from database import engine, get_session, create_db_and_tables
from models import Shift, ShiftRead
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import secrets

load_dotenv()

app = FastAPI()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
SHIFT_PATTERN = ["주"] * 7 + ["야", "휴"] * 14

# 환경 변수
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
IS_PRODUCTION = os.getenv("RAILWAY_ENVIRONMENT_NAME") == "production"

# 세션 저장소 (메모리 기반)
active_sessions = {}

# CORS 설정
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Id", "session-id"],
)

# Pydantic 모델
class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    message: str

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

def verify_session(session_id: Annotated[str | None, Header()] = None):
    """세션 검증"""
    if not session_id or session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return session_id

@app.post("/auth/login", response_model=LoginResponse, summary="관리자 로그인")
def login(request: LoginRequest, response: Response):
    """비밀번호로 세션 생성"""
    if request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="비밀번호가 잘못되었습니다.")
    
    # 세션 생성
    session_id = secrets.token_urlsafe(32)
    active_sessions[session_id] = {
        "created_at": datetime.utcnow(),
        "user": "admin"
    }
    
    # 응답 헤더에 세션 ID 추가
    response.headers["X-Session-Id"] = session_id
    
    # 쿠키에 세션 ID 저장
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=IS_PRODUCTION,  # 프로덕션에서는 HTTPS만 가능
        samesite="strict" if IS_PRODUCTION else "lax"
    )
    
    return LoginResponse(message="로그인 성공")

def verify_admin(session_id: Annotated[str | None, Header()] = None):
    """관리자 권한 검증"""
    verify_session(session_id)  # 세션 유효성 검증

@app.post("/auth/logout", summary="로그아웃")
def logout(session_id: Annotated[str | None, Header()] = None, response: Response = None):
    """세션 삭제"""
    if session_id and session_id in active_sessions:
        del active_sessions[session_id]
    
    if response:
        response.delete_cookie("session_id")
    
    return {"message": "로그아웃 성공"}

@app.get("/auth/check", summary="로그인 상태 확인")
def check_auth(session_id: Annotated[str | None, Header()] = None):
    """로그인 상태 확인"""
    if session_id and session_id in active_sessions:
        return {"authenticated": True, "message": "로그인 중"}
    return {"authenticated": False, "message": "로그인 필요"}

@app.post("/shifts", response_model=Shift, dependencies=[Depends(verify_admin)], summary="근무 생성")
def create_shift(shift: Shift, session: Session = Depends(get_session)):
    session.add(shift)
    session.commit()
    session.refresh(shift)
    return shift

@app.post("/shifts/auto-generate", dependencies=[Depends(verify_admin)], summary="주야비휴 자동 생성기")
def generate_auto_shifts(
    start_date: str, 
    end_date: str,    
    session: Session = Depends(get_session)
):
    current_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    target_date = datetime.strptime(end_date, "%Y-%m-%d").date() # 목표 종료일
    
    generated_count = 0
    pattern_idx = 0 

    while current_date <= target_date:
        
        existing = session.exec(
            select(Shift).where(Shift.date == str(current_date))
        ).first()

        if not existing:
            work_type = SHIFT_PATTERN[pattern_idx]
            new_shift = Shift(

                date=str(current_date),
                work_type=work_type
                
            )
            session.add(new_shift)
            generated_count += 1
        
        current_date += timedelta(days=1)
        pattern_idx = (pattern_idx + 1) % 21 
        
        if generated_count % 100 == 0:
            session.commit()

    session.commit()
    return {"message": f"{start_date}부터 {end_date}까지 총 {generated_count}개의 근무표 생성 완료"}

@app.get(f"/shifts/", response_model=list[ShiftRead], summary="근무표 조회")
def read_shifts(start: str | None = None, end: str | None = None, session: Session = Depends(get_session)):
    query = select(Shift).order_by(Shift.date)

    if start and end:
        query = query.where(Shift.date >= start, Shift.date <= end)
    return session.exec(query).all()


@app.patch("/shifts/{date}/{work_type}", dependencies=[Depends(verify_admin)], summary="근무표 수정")
def update_shift(date: str, work_type: str, session: Session = Depends(get_session)):
    query = select(Shift).where(Shift.date == date)
    existing_shift = session.exec(query).first()
    if not existing_shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    existing_shift.changed_work_type = work_type
    
    session.add(existing_shift)
    session.commit()
    session.refresh(existing_shift)
    return existing_shift