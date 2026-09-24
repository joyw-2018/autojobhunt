import os
import json
import logging
from typing import Dict, Any, Optional
from ..config import settings

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY", "")
        
        self.gemini_client = None
        self.openai_client = None
        self._init_clients()

    def _init_clients(self):
        if self.gemini_key:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.gemini_key)
                logger.info("Initialized Google GenAI Client.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")

        if self.openai_key:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=self.openai_key)
                logger.info("Initialized OpenAI Client.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")

    def is_configured(self) -> bool:
        if self.provider == "gemini" and self.gemini_client:
            return True
        if self.provider == "openai" and self.openai_client:
            return True
        return False

    def generate_json(self, prompt: str, system_instruction: str = "") -> Any:
        """
        Generate structured JSON output from LLM.
        """
        if not self.is_configured():
            # If no API key configured, check if we can initialize on-the-fly from env
            self._init_clients()

        if self.provider == "gemini" and self.gemini_client:
            return self._call_gemini_json(prompt, system_instruction)
        elif self.provider == "openai" and self.openai_client:
            return self._call_openai_json(prompt, system_instruction)
        else:
            raise ValueError(
                "No active LLM API key found! Please configure GEMINI_API_KEY or OPENAI_API_KEY in backend/.env"
            )

    def _call_gemini_json(self, prompt: str, system_instruction: str) -> Any:
        from google import genai
        from google.genai import types
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction or "You are an expert career and resume data extraction AI. Always respond in valid JSON.",
            response_mime_type="application/json",
            temperature=0.2
        )
        
        # Default to gemini-2.5-flash or gemini-1.5-flash
        model_name = "gemini-2.5-flash"
        try:
            response = self.gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )
            return json.loads(response.text)
        except Exception as e:
            # Fallback to gemini-1.5-flash if 2.5 is not available
            logger.warning(f"Gemini {model_name} error: {e}, trying gemini-1.5-flash...")
            response = self.gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=config
            )
            return json.loads(response.text)

    def _call_openai_json(self, prompt: str, system_instruction: str) -> Any:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2
        )
        content = response.choices[0].message.content
        return json.loads(content)

llm = LLMClient()
