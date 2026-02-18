from sqlmodel import create_engine, Session, SQLModel
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # 쿼리 전 연결 상태 확인
    pool_recycle=280,          # 280초마다 연결 재생성 (Supabase 5분 timeout 전에)
    pool_size=5,               # 동시 연결 수 (무료 tier는 적게)
    max_overflow=10,           # 초과 연결 허용 수
    pool_timeout=30,           # 연결 대기 최대 시간
    connect_args={
        "keepalives": 1,               # TCP keepalive 활성화
        "keepalives_idle": 30,         # 30초 idle 후 keepalive 전송
        "keepalives_interval": 10,     # 10초마다 keepalive 재전송
        "keepalives_count": 5,         # 5회 실패 시 연결 끊김 판단
    },
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session