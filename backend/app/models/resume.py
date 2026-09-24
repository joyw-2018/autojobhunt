from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class ResumeMetadata(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    filename: str
    file_type: str
    file_size: int
    uploaded_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    status: str = "UPLOADED"  # "UPLOADED", "PARSED", "EXTRACTED", "ERROR"
    character_count: int = 0
    extracted_fact_count: int = 0
    error_message: Optional[str] = None
