from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from ..services.scraper_service import ScraperService
from ..services.tailor_service import TailorService

router = APIRouter(prefix="/tailor", tags=["Resume Tailor"])

class ScrapeRequest(BaseModel):
    url: str

class TailorGenerateRequest(BaseModel):
    url: Optional[str] = None
    company: str
    job_title: str
    jd_text: Optional[str] = None
    job_description: Optional[str] = None
    selected_fact_ids: Optional[Any] = None
    target_page_length: int = 1

@router.post("/scrape")
@router.post("/parse-url")
async def scrape_job_url(req: ScrapeRequest):
    """Scrape and parse public job description webpage."""
    if not req.url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    try:
        data = await ScraperService.scrape_jd_url(req.url)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate")
def generate_tailored_resume(req: TailorGenerateRequest):
    """
    Generate a tailored resume matching the target job description based on Joy Wang's Fact Base.
    """
    jd_content = (req.jd_text or req.job_description or "").strip()
    if not jd_content or len(jd_content) < 20:
        raise HTTPException(status_code=400, detail="Job description text is too short or empty.")
    
    company = req.company.strip() or "Target Company"
    job_title = req.job_title.strip() or "Target Role"
    
    try:
        result = TailorService.tailor_resume(
            company=company,
            job_title=job_title,
            jd_text=jd_content,
            target_page_length=req.target_page_length
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tailoring failed: {str(e)}")
