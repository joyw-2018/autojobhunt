from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import resumes, facts, tailor
from .services.storage_service import storage

app = FastAPI(
    title="AutoJobHunt & Resume Tailor API",
    description="Personal career copilot API for multi-resume fact extraction, refinement, and tailoring.",
    version="1.1.0"
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Local tool, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resumes.router, prefix="/api")
app.include_router(facts.router, prefix="/api")
app.include_router(tailor.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "AutoJobHunt & Resume Tailor",
        "version": "1.1.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/stats")
def get_stats():
    """Get overall status and statistics for the fact base and uploaded resumes."""
    fact_items = storage.load_facts()
    resume_items = storage.load_resumes_meta()
    
    all_tech = set()
    companies = set()
    categories = {}
    locked_count = 0
    
    for f in fact_items:
        companies.add(f.company)
        for t in f.tech_stack:
            all_tech.add(t)
        categories[f.category] = categories.get(f.category, 0) + 1
        if f.is_locked:
            locked_count += 1
            
    return {
        "total_resumes": len(resume_items),
        "total_facts": len(fact_items),
        "locked_facts": locked_count,
        "unique_companies": len(companies),
        "unique_tech_count": len(all_tech),
        "categories_breakdown": categories
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
