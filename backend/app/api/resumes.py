import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..config import settings
from ..models.resume import ResumeMetadata
from ..models.fact import FactBlock
from ..services.storage_service import storage
from ..services.resume_parser import ResumeParser
from ..services.fact_extractor import FactExtractor

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.get("", response_model=List[ResumeMetadata])
def list_resumes():
    """List all uploaded resumes with metadata."""
    return storage.load_resumes_meta()

@router.post("/upload", response_model=List[ResumeMetadata])
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    Upload one or multiple past resumes (PDF, DOCX, TXT, MD).
    Saves files to data/resumes/ and returns initial metadata.
    """
    saved_metadata = []
    for file in files:
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in [".pdf", ".docx", ".doc", ".txt", ".md"]:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {file.filename}")
        
        target_path = settings.RESUMES_DIR / file.filename
        # Save file to disk
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = target_path.stat().st_size
        meta = ResumeMetadata(
            filename=file.filename,
            file_type=file_ext.replace(".", "").upper(),
            file_size=file_size,
            status="UPLOADED"
        )
        storage.upsert_resume_meta(meta)
        saved_metadata.append(meta)
        
    return saved_metadata

@router.post("/{resume_id}/extract", response_model=List[FactBlock])
def extract_facts(resume_id: str):
    """
    Extract atomic fact blocks from a specific uploaded resume file.
    Merges newly extracted facts into the Fact Base.
    """
    items = storage.load_resumes_meta()
    meta = next((m for m in items if m.id == resume_id), None)
    if not meta:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    file_path = settings.RESUMES_DIR / meta.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File {meta.filename} not found on disk")
    
    try:
        raw_text, _ = ResumeParser.extract_text(file_path)
        meta.character_count = len(raw_text)
        
        extracted_facts = FactExtractor.extract_facts_from_text(
            resume_id=meta.id,
            filename=meta.filename,
            resume_text=raw_text
        )
        
        meta.extracted_fact_count = len(extracted_facts)
        meta.status = "EXTRACTED"
        storage.upsert_resume_meta(meta)
        
        # Merge into existing fact base without overwriting locked facts
        existing_facts = storage.load_facts()
        existing_texts = {f.refined_text.lower().strip() for f in existing_facts}
        
        added_facts = []
        for fact in extracted_facts:
            # Check for exact duplicate text
            if fact.refined_text.lower().strip() not in existing_texts:
                existing_facts.append(fact)
                added_facts.append(fact)
                existing_texts.add(fact.refined_text.lower().strip())
                
        storage.save_facts(existing_facts)
        return extracted_facts
    except Exception as e:
        meta.status = "ERROR"
        meta.error_message = str(e)
        storage.upsert_resume_meta(meta)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {e}")

@router.post("/batch-extract", response_model=List[FactBlock])
def batch_extract_all():
    """Extract facts from all uploaded resumes that haven't been extracted yet."""
    items = storage.load_resumes_meta()
    all_new_facts = []
    for meta in items:
        file_path = settings.RESUMES_DIR / meta.filename
        if file_path.exists():
            try:
                raw_text, _ = ResumeParser.extract_text(file_path)
                meta.character_count = len(raw_text)
                facts = FactExtractor.extract_facts_from_text(meta.id, meta.filename, raw_text)
                meta.extracted_fact_count = len(facts)
                meta.status = "EXTRACTED"
                storage.upsert_resume_meta(meta)
                all_new_facts.extend(facts)
            except Exception as e:
                meta.status = "ERROR"
                meta.error_message = str(e)
                storage.upsert_resume_meta(meta)

    # Save to storage
    existing_facts = storage.load_facts()
    existing_texts = {f.refined_text.lower().strip() for f in existing_facts}
    for fact in all_new_facts:
        if fact.refined_text.lower().strip() not in existing_texts:
            existing_facts.append(fact)
            existing_texts.add(fact.refined_text.lower().strip())
    storage.save_facts(existing_facts)
    return storage.load_facts()
