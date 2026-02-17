from sqlmodel import Field, SQLModel
from typing import Optional

class Shift(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: str
    work_type: str
    changed_work_type: Optional[str] = Field(default=None)

class ShiftRead(SQLModel) :
    date: str
    work_type: str
    changed_work_type: str | None = None