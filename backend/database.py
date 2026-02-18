from sqlmodel import create_engine, Session, SQLModel
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/shift_db")

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session