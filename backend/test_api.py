import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.services.storage_service import storage

client = TestClient(app)

def test_full_pipeline():
    print("=== 1. Testing Health & Stats API ===")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("Root API response:", res.json())

    res = client.get("/api/stats")
    assert res.status_code == 200
    print("Initial Stats:", res.json())

    print("\n=== 2. Testing Resume File Upload ===")
    sample_file_path = backend_dir.parent / "data" / "resumes" / "sample_backend_resume.txt"
    assert sample_file_path.exists(), "Sample resume file does not exist!"

    with open(sample_file_path, "rb") as f:
        files = [("files", ("sample_backend_resume.txt", f, "text/plain"))]
        res = client.post("/api/resumes/upload", files=files)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    uploaded = res.json()
    print(f"Uploaded {len(uploaded)} resume(s). First ID: {uploaded[0]['id']}")
    resume_id = uploaded[0]["id"]

    print("\n=== 3. Testing Fact Extraction from Resume ===")
    res = client.post(f"/api/resumes/{resume_id}/extract")
    assert res.status_code == 200, f"Extraction failed: {res.text}"
    extracted_facts = res.json()
    print(f"Successfully extracted {len(extracted_facts)} atomic facts!")
    for i, fact in enumerate(extracted_facts):
        print(f"  Fact {i+1} [{fact['company']} - {fact['role']}]: {fact['refined_text'][:80]}...")

    first_fact_id = extracted_facts[0]["id"]

    print("\n=== 4. Testing Fact Base Query & Filters ===")
    res = client.get("/api/facts")
    assert res.status_code == 200
    all_facts = res.json()
    assert len(all_facts) >= len(extracted_facts)
    print(f"Total facts in store: {len(all_facts)}")

    print("\n=== 5. Testing Fact Inline Editing ===")
    updated_text = "Spearheaded the redesign of the core payment pipeline in Go, reducing p99 API latency from 240ms to 95ms (60% cut) across 15M transactions."
    res = client.put(f"/api/facts/{first_fact_id}", json={"refined_text": updated_text})
    assert res.status_code == 200
    assert res.json()["refined_text"] == updated_text
    print("Fact successfully updated with refined text!")

    print("\n=== 6. Testing Fact Lock Toggle ===")
    res = client.post(f"/api/facts/{first_fact_id}/lock")
    assert res.status_code == 200
    assert res.json()["is_locked"] is True
    print(f"Fact {first_fact_id} is now locked: {res.json()['is_locked']}")

    print("\n=== 7. Testing Manual Fact Creation ===")
    manual_payload = {
        "company": "Google",
        "role": "Staff Software Engineer",
        "date_range": "2024.01 - Present",
        "category": "Backend / Architecture",
        "sub_category": "Greenfield Architecture",
        "refined_text": "Architected next-gen distributed vector search indexing engine handling 100K QPS with sub-10ms response time.",
        "tech_stack": ["C++", "Kubernetes", "gRPC"],
        "metrics": ["100K QPS", "sub-10ms latency"],
        "personal_notes": "Important achievement for AI infrastructure roles."
    }
    res = client.post("/api/facts", json=manual_payload)
    assert res.status_code == 200
    manual_fact = res.json()
    print(f"Manually created fact ID: {manual_fact['id']}, locked: {manual_fact['is_locked']}")

    print("\n=== 8. Checking Updated App Stats ===")
    res = client.get("/api/stats")
    assert res.status_code == 200
    print("Final Stats:", res.json())
    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_full_pipeline()
