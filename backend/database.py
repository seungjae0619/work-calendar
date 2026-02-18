from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    poolclass=NullPool,        # Supabase Pooler(PgBouncer)가 풀링하므로 SQLAlchemy 풀링 비활성화
    connect_args={
        "connect_timeout": 10,         # 연결 시도 10초 제한
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    },
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session