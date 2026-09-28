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

@router.delete("/{resume_id}")
def delete_resume(resume_id: str):
    """Delete an uploaded resume and its file from disk."""
    success = storage.delete_resume(resume_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"success": True, "id": resume_id}

@router.post("/upload", response_model=List[ResumeMetadata])
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    Upload one or multiple past resumes (PDF, DOCX, TXT, MD).
    Saves files to data/resumes/ and returns initial metadata.
    Enforces a maximum of 10 resumes total.
    """
    current_items = storage.load_resumes_meta()
    if len(current_items) + len(files) > 10:
        raise HTTPException(
            status_code=400, 
            detail=f"最多支持上传 10 份简历。当前已有 {len(current_items)} 份，本次尝试上传 {len(files)} 份，已超过上限。"
        )

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

@router.post("/regenerate-facts", response_model=List[FactBlock])
def regenerate_facts():
    """
    Regenerates the Fact Base based on all currently uploaded resumes.
    - Preserves locked facts (is_locked=True) so user edits and locked facts are protected.
    - Keeps track of existing fact text signatures so previously existing facts have is_new=False.
    - Any newly discovered/generated facts from the uploaded resumes are tagged with is_new=True.
    - Updates resume statuses and counts accordingly.
    """
    current_resumes = storage.load_resumes_meta()
    existing_facts = storage.load_facts()
    
    # Existing locked facts must be preserved completely
    locked_facts = [f for f in existing_facts if f.is_locked]
    # Set of existing fact texts (cleaned) to determine if a fact is brand new
    existing_texts = {f.refined_text.lower().strip() for f in existing_facts}

    # All non-locked facts from previous run will be rebuilt from the active resumes
    # However, to preserve previously existing facts without wiping them if not extracted,
    # or to regenerate fresh facts from active resumes:
    # We re-extract across all existing resumes.
    all_extracted: List[FactBlock] = []
    
    for meta in current_resumes:
        file_path = settings.RESUMES_DIR / meta.filename
        if not file_path.exists():
            continue
        try:
            raw_text, _ = ResumeParser.extract_text(file_path)
            meta.character_count = len(raw_text)
            facts = FactExtractor.extract_facts_from_text(meta.id, meta.filename, raw_text)
            meta.extracted_fact_count = len(facts)
            meta.status = "EXTRACTED"
            meta.error_message = None
            storage.upsert_resume_meta(meta)
            all_extracted.extend(facts)
        except Exception as e:
            meta.status = "ERROR"
            meta.error_message = str(e)
            storage.upsert_resume_meta(meta)

    # Now assemble the new fact list:
    # 1. Start with all locked facts (is_new=False)
    merged_facts: List[FactBlock] = []
    seen_texts = set()

    for lf in locked_facts:
        lf.is_new = False
        merged_facts.append(lf)
        seen_texts.add(lf.refined_text.lower().strip())

    # 2. Add extracted facts from active resumes
    for fact in all_extracted:
        norm_text = fact.refined_text.lower().strip()
        if norm_text not in seen_texts:
            # If this fact did NOT exist in previous fact base, mark it as is_new = True
            if norm_text not in existing_texts:
                fact.is_new = True
            else:
                fact.is_new = False
            merged_facts.append(fact)
            seen_texts.add(norm_text)
        else:
            # Already have this fact, merge source_resume_ids if needed
            existing_match = next((f for f in merged_facts if f.refined_text.lower().strip() == norm_text), None)
            if existing_match and fact.source_resume_ids:
                for rid in fact.source_resume_ids:
                    if rid not in existing_match.source_resume_ids:
                        existing_match.source_resume_ids.append(rid)

    storage.save_facts(merged_facts)
    return merged_facts

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
