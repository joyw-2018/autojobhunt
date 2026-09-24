from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class FactVariants(BaseModel):
    standard: str = ""
    metric_focused: Optional[str] = None
    architecture_focused: Optional[str] = None
    leadership_focused: Optional[str] = None

class FactBlock(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    company: str = "Unknown Company"
    role: str = "Software Engineer"
    date_range: str = "Present"
    project_context: str = ""
    category: str = "Backend / Architecture"
    sub_category: str = "General"
    
    # Primary polished text (Google X-Y-Z formula)
    refined_text: str
    
    # Pre-generated variants for different JD emphasis
    variants: FactVariants = Field(default_factory=FactVariants)
    
    # Tags & Entities
    tech_stack: List[str] = Field(default_factory=list)
    metrics: List[str] = Field(default_factory=list)
    
    # Control flags
    is_locked: bool = False
    is_verified: bool = False
    personal_notes: Optional[str] = None
    
    # Source traceability
    source_resume_ids: List[str] = Field(default_factory=list)
    raw_source_snippets: List[str] = Field(default_factory=list)
    
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class FactCreateRequest(BaseModel):
    company: str
    role: str
    date_range: str
    project_context: Optional[str] = ""
    category: str = "Backend / Architecture"
    sub_category: str = "General"
    refined_text: str
    tech_stack: List[str] = []
    metrics: List[str] = []
    personal_notes: Optional[str] = None

class FactUpdateRequest(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    date_range: Optional[str] = None
    project_context: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    refined_text: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    metrics: Optional[List[str]] = None
    is_locked: Optional[bool] = None
    is_verified: Optional[bool] = None
    personal_notes: Optional[str] = None

class FactPolishRequest(BaseModel):
    target_focus: str = "metric_focused"  # "metric_focused", "architecture_focused", "leadership_focused"
    user_instruction: Optional[str] = None
