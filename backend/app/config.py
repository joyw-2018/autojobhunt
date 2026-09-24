from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    LLM_PROVIDER: str = "gemini"  # "gemini" or "openai"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Paths (always absolute)
    BASE_DIR: Path = PROJECT_ROOT
    DATA_DIR: Path = PROJECT_ROOT / "data"
    RESUMES_DIR: Path = PROJECT_ROOT / "data" / "resumes"
    FACT_BASE_FILE: Path = PROJECT_ROOT / "data" / "fact_base.json"
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    class Config:
        env_file = Path(__file__).resolve().parent.parent / ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.RESUMES_DIR.mkdir(parents=True, exist_ok=True)
