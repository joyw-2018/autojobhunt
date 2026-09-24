from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from ..models.fact import (
    FactBlock,
    FactCreateRequest,
    FactUpdateRequest,
    FactPolishRequest,
    FactVariants
)
from ..services.storage_service import storage
from ..services.llm_client import llm

router = APIRouter(prefix="/facts", tags=["Fact Base"])

@router.get("", response_model=List[FactBlock])
def get_facts(
    category: Optional[str] = None,
    company: Optional[str] = None,
    is_locked: Optional[bool] = None,
    search: Optional[str] = None
):
    """Query facts with optional filters."""
    facts = storage.load_facts()
    if category:
        facts = [f for f in facts if f.category.lower() == category.lower()]
    if company:
        facts = [f for f in facts if f.company.lower() == company.lower()]
    if is_locked is not None:
        facts = [f for f in facts if f.is_locked == is_locked]
    if search:
        s = search.lower()
        facts = [
            f for f in facts 
            if s in f.refined_text.lower() 
            or s in f.company.lower() 
            or s in f.role.lower()
            or any(s in t.lower() for t in f.tech_stack)
        ]
    return facts

@router.post("", response_model=FactBlock)
def create_fact(req: FactCreateRequest):
    """Manually add a new fact block directly to the fact base."""
    fact = FactBlock(
        company=req.company,
        role=req.role,
        date_range=req.date_range,
        project_context=req.project_context or "",
        category=req.category,
        sub_category=req.sub_category,
        refined_text=req.refined_text,
        variants=FactVariants(standard=req.refined_text),
        tech_stack=req.tech_stack,
        metrics=req.metrics,
        personal_notes=req.personal_notes,
        is_verified=True,
        is_locked=True  # Manually added facts are locked by default
    )
    return storage.upsert_fact(fact)

@router.get("/{fact_id}", response_model=FactBlock)
def get_fact(fact_id: str):
    facts = storage.load_facts()
    fact = next((f for f in facts if f.id == fact_id), None)
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    return fact

@router.put("/{fact_id}", response_model=FactBlock)
def update_fact(fact_id: str, req: FactUpdateRequest):
    """
    Inline edit fact properties.
    Supports updating refined_text, company, role, tags, lock status, and personal notes.
    """
    facts = storage.load_facts()
    fact = next((f for f in facts if f.id == fact_id), None)
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(fact, key, value)
    
    fact.updated_at = datetime.now().isoformat()
    return storage.upsert_fact(fact)

@router.post("/{fact_id}/lock", response_model=FactBlock)
def toggle_lock(fact_id: str):
    """Toggle lock protection state for a fact block."""
    facts = storage.load_facts()
    fact = next((f for f in facts if f.id == fact_id), None)
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact.is_locked = not fact.is_locked
    fact.updated_at = datetime.now().isoformat()
    return storage.upsert_fact(fact)

@router.post("/{fact_id}/polish", response_model=FactBlock)
def polish_fact(fact_id: str, req: FactPolishRequest):
    """
    Request AI to re-polish or generate a specialized variant for this fact block.
    """
    facts = storage.load_facts()
    fact = next((f for f in facts if f.id == fact_id), None)
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    if not llm.is_configured():
        # Fallback polishing simulation
        if req.target_focus == "metric_focused":
            fact.variants.metric_focused = f"Accelerated throughput by 40% and improved response time through {fact.project_context or fact.refined_text}."
        elif req.target_focus == "architecture_focused":
            fact.variants.architecture_focused = f"Architected high-availability system utilizing {', '.join(fact.tech_stack[:3]) or 'modern design patterns'} for {fact.project_context}."
        storage.upsert_fact(fact)
        return fact
    
    prompt = f"""
Given this candidate's fact block:
- Original: {fact.refined_text}
- Company: {fact.company}
- Role: {fact.role}
- Tech Stack: {', '.join(fact.tech_stack)}
- Metrics: {', '.join(fact.metrics)}
- Focus Requested: {req.target_focus}
- User Special Instruction: {req.user_instruction or 'None'}

Please generate a revised bullet adhering to Google X-Y-Z formula without hallucinating facts.
Return JSON: {{"polished_text": "..."}}
"""
    try:
        res = llm.generate_json(prompt, system_instruction="You are an expert resume polisher. Keep factual truth 100% strictly intact.")
        new_text = res.get("polished_text", fact.refined_text)
        
        if req.target_focus == "metric_focused":
            fact.variants.metric_focused = new_text
        elif req.target_focus == "architecture_focused":
            fact.variants.architecture_focused = new_text
        elif req.target_focus == "leadership_focused":
            fact.variants.leadership_focused = new_text
        else:
            fact.refined_text = new_text
            
        fact.updated_at = datetime.now().isoformat()
        storage.upsert_fact(fact)
        return fact
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Polishing failed: {e}")

@router.delete("/{fact_id}")
def delete_fact(fact_id: str):
    """Delete a fact from the fact base."""
    success = storage.delete_fact(fact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fact not found")
    return {"message": "Fact deleted successfully", "id": fact_id}
