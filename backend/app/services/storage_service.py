import json
import threading
from pathlib import Path
from typing import List, Dict, Optional
from ..config import settings
from ..models.fact import FactBlock
from ..models.resume import ResumeMetadata

class StorageService:
    def __init__(self):
        self._lock = threading.Lock()
        self.fact_base_file = settings.FACT_BASE_FILE
        self.resumes_meta_file = settings.DATA_DIR / "resumes_meta.json"
        self._init_files()

    def _init_files(self):
        settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not self.fact_base_file.exists():
            with open(self.fact_base_file, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
        if not self.resumes_meta_file.exists():
            with open(self.resumes_meta_file, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)

    # --- Facts Storage ---
    def load_facts(self) -> List[FactBlock]:
        with self._lock:
            try:
                with open(self.fact_base_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return [FactBlock(**item) for item in data]
            except Exception as e:
                print(f"Error loading facts: {e}")
                return []

    def save_facts(self, facts: List[FactBlock]):
        with self._lock:
            with open(self.fact_base_file, "w", encoding="utf-8") as f:
                json.dump([f.model_dump() for f in facts], f, ensure_ascii=False, indent=2)

    def upsert_fact(self, fact: FactBlock) -> FactBlock:
        facts = self.load_facts()
        existing_idx = next((i for i, f in enumerate(facts) if f.id == fact.id), None)
        if existing_idx is not None:
            facts[existing_idx] = fact
        else:
            facts.append(fact)
        self.save_facts(facts)
        return fact

    def delete_fact(self, fact_id: str) -> bool:
        facts = self.load_facts()
        initial_len = len(facts)
        facts = [f for f in facts if f.id != fact_id]
        if len(facts) < initial_len:
            self.save_facts(facts)
            return True
        return False

    # --- Resumes Metadata Storage ---
    def load_resumes_meta(self) -> List[ResumeMetadata]:
        with self._lock:
            try:
                with open(self.resumes_meta_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return [ResumeMetadata(**item) for item in data]
            except Exception as e:
                print(f"Error loading resumes meta: {e}")
                return []

    def save_resumes_meta(self, items: List[ResumeMetadata]):
        with self._lock:
            with open(self.resumes_meta_file, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in items], f, ensure_ascii=False, indent=2)

    def upsert_resume_meta(self, meta: ResumeMetadata):
        items = self.load_resumes_meta()
        existing_idx = next((i for i, m in enumerate(items) if m.id == meta.id), None)
        if existing_idx is not None:
            items[existing_idx] = meta
        else:
            items.append(meta)
        self.save_resumes_meta(items)

storage = StorageService()
