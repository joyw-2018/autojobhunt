import logging
import uuid
from typing import List, Dict, Any
from ..models.fact import FactBlock, FactVariants
from .llm_client import llm

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an elite Tech Career Strategist and Resume Archaeologist.
Your task is to analyze candidate resumes and extract granular, atomic "Source of Truth Fact Units".

Rules:
1. TRUTH FIRST: NEVER invent, hallucinate, or exaggerate technologies, metrics, or responsibilities. Every fact MUST originate from the source text.
2. ATOMIC GRANULARITY: Break down broad job experiences into individual, self-contained project/achievement bullets (STAR / Google X-Y-Z formula: "Accomplished [X] measured by [Y], by doing [Z]").
3. ACTION VERBS: Upgrade weak verbs (e.g. "helped with", "worked on") to strong, executive action verbs (e.g. "Architected", "Engineered", "Optimized", "Spearheaded").
4. MULTI-DIMENSIONAL CATEGORIZATION:
   - category: One of ["Backend / Architecture", "Frontend / Fullstack", "Data / Machine Learning", "DevOps / Cloud Native", "Engineering Leadership", "Product & Business"]
   - sub_category: One of ["Performance Optimization", "Greenfield Architecture", "Scalability & Reliability", "Cost Reduction", "Team Mentorship", "Workflow Efficiency"]
5. VARIANTS: For each bullet, generate:
   - standard: The balanced Google X-Y-Z bullet.
   - metric_focused: Emphasizes quantifiable business or technical KPIs (%, $, latency, throughput).
   - architecture_focused: Emphasizes technical depth, design patterns, protocols, and stack decisions.
6. ENTITIES:
   - tech_stack: List of specific tools, languages, databases, cloud services mentioned.
   - metrics: List of specific quantitative metrics extracted from the text.

Output strictly valid JSON with key "facts", which is a list of fact objects.
"""

USER_PROMPT_TEMPLATE = """Please extract atomic fact blocks from the following resume text.
Resume File ID: {resume_id}
Resume Filename: {filename}

--- BEGIN RESUME TEXT ---
{resume_text}
--- END RESUME TEXT ---

Return JSON format:
{{
  "facts": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "date_range": "e.g. 2022.03 - 2024.08",
      "project_context": "Context or system name",
      "category": "Backend / Architecture",
      "sub_category": "Performance Optimization",
      "refined_text": "Architected and deployed a distributed Go microservice...",
      "variants": {{
        "standard": "...",
        "metric_focused": "...",
        "architecture_focused": "..."
      }},
      "tech_stack": ["Go", "Kafka", "Redis"],
      "metrics": ["35% latency reduction", "2M DAU"],
      "raw_source_snippets": ["original sentence from text"]
    }}
  ]
}}
"""

class FactExtractor:
    @staticmethod
    def extract_facts_from_text(resume_id: str, filename: str, resume_text: str) -> List[FactBlock]:
        """
        Extract structured fact blocks from parsed resume text using LLM.
        Falls back to a demo extractor if LLM is not configured.
        """
        if not llm.is_configured():
            logger.warning("LLM client not configured. Generating realistic demo fact blocks for immediate UI exploration.")
            return FactExtractor._generate_demo_facts(resume_id, filename, resume_text)

        prompt = USER_PROMPT_TEMPLATE.format(
            resume_id=resume_id,
            filename=filename,
            resume_text=resume_text[:12000] # Safe token limit
        )

        try:
            result = llm.generate_json(prompt=prompt, system_instruction=SYSTEM_PROMPT)
            raw_facts = result.get("facts", [])
            facts = []
            for item in raw_facts:
                variants_data = item.get("variants", {})
                fact = FactBlock(
                    id=str(uuid.uuid4())[:8],
                    company=item.get("company", "Company"),
                    role=item.get("role", "Engineer"),
                    date_range=item.get("date_range", "Recent"),
                    project_context=item.get("project_context", ""),
                    category=item.get("category", "Backend / Architecture"),
                    sub_category=item.get("sub_category", "General"),
                    refined_text=item.get("refined_text", ""),
                    variants=FactVariants(
                        standard=variants_data.get("standard", item.get("refined_text", "")),
                        metric_focused=variants_data.get("metric_focused"),
                        architecture_focused=variants_data.get("architecture_focused"),
                        leadership_focused=variants_data.get("leadership_focused"),
                    ),
                    tech_stack=item.get("tech_stack", []),
                    metrics=item.get("metrics", []),
                    source_resume_ids=[resume_id],
                    raw_source_snippets=item.get("raw_source_snippets", []),
                    is_locked=False,
                    is_verified=False
                )
                facts.append(fact)
            return facts
        except Exception as e:
            logger.error(f"Error during LLM extraction: {e}")
            raise e

    @staticmethod
    def _generate_demo_facts(resume_id: str, filename: str, resume_text: str) -> List[FactBlock]:
        """
        Generates sensible starter facts if LLM is not yet configured,
        ensuring the user can test the UI, editing, locking, and filtering immediately.
        """
        return [
            FactBlock(
                id=str(uuid.uuid4())[:8],
                company="TechCorp Global",
                role="Senior Backend Engineer",
                date_range="2022.06 - 2025.02",
                project_context="High-Throughput Payment Gateway",
                category="Backend / Architecture",
                sub_category="Performance Optimization",
                refined_text="Architected and deployed a distributed payment processing pipeline in Go and Kafka, cutting p99 transaction latency by 42% across 15M daily operations.",
                variants=FactVariants(
                    standard="Architected and deployed a distributed payment processing pipeline in Go and Kafka, cutting p99 transaction latency by 42% across 15M daily operations.",
                    metric_focused="Cut p99 payment latency by 42% and saved $140K in annual AWS infrastructure costs across 15M daily transactions.",
                    architecture_focused="Designed an idempotent, event-driven payment gateway using Go, Apache Kafka, and Redis cluster with 99.999% SLA."
                ),
                tech_stack=["Go", "Kafka", "Redis", "Kubernetes", "AWS"],
                metrics=["42% p99 latency cut", "15M daily operations", "$140K cost savings"],
                source_resume_ids=[resume_id],
                raw_source_snippets=["Responsible for payment gateway optimization and microservices development."]
            ),
            FactBlock(
                id=str(uuid.uuid4())[:8],
                company="DataScale Systems",
                role="Software Engineer II",
                date_range="2020.03 - 2022.05",
                project_context="Real-time Analytics Ingestion Platform",
                category="Data / Machine Learning",
                sub_category="Scalability & Reliability",
                refined_text="Engineered real-time streaming data ingestion pipelines handling 50K events/sec using Apache Flink and ClickHouse, reducing dashboard sync delay from 15 min to sub-second.",
                variants=FactVariants(
                    standard="Engineered real-time streaming data ingestion pipelines handling 50K events/sec using Apache Flink and ClickHouse, reducing dashboard sync delay from 15 min to sub-second.",
                    metric_focused="Reduced data sync delay from 15 minutes to 800ms while scaling ingestion throughput to 50K events/sec.",
                    architecture_focused="Architected stream-table dual processing layer with Apache Flink, ClickHouse, and protobuf serialization."
                ),
                tech_stack=["Python", "Apache Flink", "ClickHouse", "Docker", "gRPC"],
                metrics=["50K events/sec", "sub-second dashboard sync (from 15 min)"],
                source_resume_ids=[resume_id],
                raw_source_snippets=["Built data processing pipeline with Flink and ClickHouse for real-time reporting."]
            )
        ]
