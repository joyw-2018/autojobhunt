from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class ParseUrlRequest(BaseModel):
    url: str

class JobAnalysis(BaseModel):
    url: Optional[str] = None
    company: str = "Target Company"
    job_title: str = "Target Position"
    location: Optional[str] = "Remote / Standard"
    key_skills: List[str] = Field(default_factory=list)
    key_responsibilities: List[str] = Field(default_factory=list)
    raw_jd_text: str = ""

class TailorGenerateRequest(BaseModel):
    job_title: str
    company: str
    job_description: str
    url: Optional[str] = None
    selected_fact_ids: Optional[List[str]] = None

class MatchedFact(BaseModel):
    fact_id: str
    company: str
    role: str
    category: str
    original_text: str
    tailored_text: str
    relevance_score: int
    match_rationale: str
    matched_keywords: List[str] = Field(default_factory=list)

class FitAnalytics(BaseModel):
    overall_match_score: int
    technical_match_score: int
    domain_match_score: int
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    key_highlights: List[str] = Field(default_factory=list)

class TailoredResumeResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    company: str
    job_title: str
    job_url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    fit_analytics: FitAnalytics
    summary_statement: str
    matched_facts: List[MatchedFact] = Field(default_factory=list)
    core_competencies: List[str] = Field(default_factory=list)
    full_markdown: str = ""
