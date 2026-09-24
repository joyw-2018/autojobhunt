import re
import logging
from typing import List, Dict, Any, Optional
from ..models.fact import FactBlock
from ..services.storage_service import storage
from ..services.llm_client import llm

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an elite Tech Career Strategist and Executive Resume Tailor.
You are tailoring an executive resume for Joy Wang, a Senior Product Manager with 10+ years of leadership at Google Cloud, Fintech startups, eBay, etc.

CRITICAL RULES:
1. STRICT FACTUAL ACCURACY: You MUST ONLY use the provided verified facts in the candidate's fact base. NEVER invent, exaggerate, or hallucinate projects, numbers, or technologies not present in the fact base.
2. TAILORED PROFESSIONAL SUMMARY: Craft a high-impact, custom 3-4 sentence Executive Summary targeted specifically at the target company and role, highlighting Joy Wang's most relevant career accomplishments (e.g., 0-to-1 platform standardization, MCP & agentic telemetry, distributed systems latency optimization, FinOps).
3. BULLET SELECTION & VARIANT MATCHING:
   - For each experience, select the most relevant facts.
   - Pick the most appropriate variant (e.g. metric_focused if the JD emphasizes commercial impact/metrics, architecture_focused if the JD emphasizes technical depth and protocols, or standard).
4. SKILLS SECTION RE-PRIORITIZATION: Reorganize core competencies so the skills and frameworks most critical to this JD are placed first.
5. ATS MATCH REPORT: Analyze matched keywords, core themes, and provide an ATS match score (80-98%).

Output strictly valid JSON matching the requested schema.
"""

class TailorService:
    @staticmethod
    def tailor_resume(
        company: str,
        job_title: str,
        jd_text: str,
        target_page_length: int = 1
    ) -> Dict[str, Any]:
        """
        Tailors Joy Wang's resume to match a specific Job Description.
        """
        facts = storage.load_facts()
        if not facts:
            raise ValueError("事实库为空，请先在事实库中添加或提取事实！")

        if llm.is_configured():
            return TailorService._tailor_with_llm(company, job_title, jd_text, facts, target_page_length)
        else:
            return TailorService._tailor_deterministic(company, job_title, jd_text, facts, target_page_length)

    @staticmethod
    def _tailor_with_llm(
        company: str,
        job_title: str,
        jd_text: str,
        facts: List[FactBlock],
        target_page_length: int
    ) -> Dict[str, Any]:
        facts_summary = []
        for f in facts:
            facts_summary.append({
                "id": f.id,
                "company": f.company,
                "role": f.role,
                "date_range": f.date_range,
                "category": f.category,
                "sub_category": f.sub_category,
                "standard": f.refined_text,
                "metric_focused": f.variants.metric_focused or f.refined_text,
                "architecture_focused": f.variants.architecture_focused or f.refined_text,
                "tech_stack": f.tech_stack,
                "metrics": f.metrics,
                "is_locked": f.is_locked
            })

        user_prompt = f"""
Target Company: {company}
Target Job Title: {job_title}

--- BEGIN TARGET JOB DESCRIPTION ---
{jd_text[:8000]}
--- END TARGET JOB DESCRIPTION ---

--- CANDIDATE'S VERIFIED FACT BASE ---
{facts_summary}
--- END CANDIDATE'S VERIFIED FACT BASE ---

Instructions:
1. Synthesize a tailored Executive Summary (3-4 sentences) explicitly connecting Joy Wang's background to {company}'s {job_title} role.
2. Select and rank the best matching facts for each relevant employer. Choose the best variant ('standard', 'metric_focused', or 'architecture_focused') for each selected bullet.
3. Organize skills into 4 prioritized categories.
4. Calculate an ATS match score (e.g. 92.5), list matched keywords, and explain the tailoring strategy.

Return JSON in this format:
{{
  "candidate_name": "Joy Wang",
  "contact_info": "Phone: 617.230.9777 | Email: joy.jiayiwang@gmail.com | Status: US Permanent Resident",
  "target_company": "{company}",
  "target_job_title": "{job_title}",
  "tailored_summary": "...",
  "skills_categories": [
    {{"category": "...", "skills": "..."}}
  ],
  "experiences": [
    {{
      "company": "Google Cloud Platform",
      "role": "Senior Product Manager",
      "date_range": "2018.02 - Present",
      "bullets": [
        {{
          "fact_id": "fact_jw_01",
          "chosen_text": "...",
          "variant_type": "metric_focused",
          "match_reason": "Matches agentic infrastructure requirement"
        }}
      ]
    }}
  ],
  "education": "MBA – Rotman School of Management, University of Toronto | BS – Computer Science, Fudan University",
  "keynotes_talks": "Featured Speaker at Google Cloud Next (MLB Observability Analytics, 4.7/5 rating) & GrafanaCon; Authored 15+ official Google Cloud technical whitepapers.",
  "match_report": {{
    "ats_score": 94,
    "matched_keywords": ["MCP", "Agentic Workflows", "Observability", "0-to-1", "Platform", "SLOs"],
    "strategy_rationale": "Prioritized Google Cloud UDF 0-to-1 platform standardization and MCP agentic observability..."
  }}
}}
"""
        try:
            return llm.generate_json(user_prompt, system_instruction=SYSTEM_PROMPT)
        except Exception as e:
            logger.warning(f"LLM tailoring error: {e}, falling back to deterministic matching.")
            return TailorService._tailor_deterministic(company, job_title, jd_text, facts, target_page_length)

    @staticmethod
    def _tailor_deterministic(
        company: str,
        job_title: str,
        jd_text: str,
        facts: List[FactBlock],
        target_page_length: int
    ) -> Dict[str, Any]:
        """
        Smart deterministic keyword & semantic scoring when LLM is offline or for instant preview.
        """
        jd_lower = jd_text.lower()
        
        # Detect JD Themes
        wants_ai = any(k in jd_lower for k in ["ai", "llm", "agent", "mcp", "genai", "model context", "machine learning"])
        wants_devex = any(k in jd_lower for k in ["developer", "devex", "sdk", "api", "internal platform", "golden path"])
        wants_finops = any(k in jd_lower for k in ["cost", "spend", "finops", "billing", "unit economic", "pricing"])
        wants_perf = any(k in jd_lower for k in ["latency", "throughput", "distributed", "performance", "high-volume", "scalability", "slo"])
        wants_0to1 = any(k in jd_lower for k in ["0-to-1", "0 to 1", "conception to launch", "greenfield", "incubate", "zero to one"])

        # Score facts
        scored_facts = []
        matched_keywords = set()
        for f in facts:
            score = 10
            # Check tech stack overlap
            for t in f.tech_stack:
                if t.lower() in jd_lower:
                    score += 25
                    matched_keywords.add(t)

            # Check category alignment
            if wants_ai and "AI" in f.category:
                score += 30
            if wants_perf and ("Backend" in f.category or "Search" in f.category):
                score += 20
            if wants_0to1 and "0-to-1" in f.refined_text:
                score += 25
            if wants_finops and "FinOps" in f.refined_text:
                score += 30

            # Decide variant
            if wants_finops or any(m in jd_lower for m in ["roi", "revenue", "metric", "business impact"]):
                chosen_text = f.variants.metric_focused or f.refined_text
                variant_type = "metric_focused"
            elif wants_perf or wants_ai:
                chosen_text = f.variants.architecture_focused or f.refined_text
                variant_type = "architecture_focused"
            else:
                chosen_text = f.refined_text
                variant_type = "standard"

            scored_facts.append({
                "fact": f,
                "score": score,
                "chosen_text": chosen_text,
                "variant_type": variant_type
            })

        # Sort by score descending
        scored_facts.sort(key=lambda x: x["score"], reverse=True)

        # Canonical Employers in strict chronological order
        canonical_order = [
            ("Google Cloud Platform", "Senior Product Manager", "2018.02 - Present", 4 if target_page_length == 1 else 7),
            ("Scotiabank", "Product Manager", "2017.02 - 2018.02", 1 if target_page_length == 1 else 2),
            ("Net Credit Group (NCF - Fintech Startup)", "Head of Product", "2016.04 - 2017.02", 1 if target_page_length == 1 else 2),
            ("eBay Inc.", "Product Manager", "2012.10 - 2016.04", 1 if target_page_length == 1 else 2),
            ("Rogers Communications", "Product Manager", "2010.05 - 2012.10", 1 if target_page_length == 1 else 2),
            ("Google Inc", "Senior Account Manager", "2005.12 - 2008.11", 1 if target_page_length == 1 else 2),
        ]

        ordered_experiences = []
        for comp_name, comp_role, comp_dates, max_b in canonical_order:
            comp_facts = [
                item for item in scored_facts
                if (comp_name == "Google Inc" and item["fact"].company == "Google Inc") or
                   (comp_name == "Google Cloud Platform" and ("Google Cloud" in item["fact"].company or item["fact"].company == "Google")) or
                   (comp_name not in ["Google Inc", "Google Cloud Platform"] and comp_name.lower().split()[0] in item["fact"].company.lower())
            ]
            bullets = []
            for item in comp_facts[:max_b]:
                bullets.append({
                    "fact_id": item["fact"].id,
                    "chosen_text": item["chosen_text"],
                    "variant_type": item["variant_type"],
                    "match_reason": f"High relevance score ({item['score']}) for target requirements."
                })
            
            # If empty or needs more bullets, fallback to facts in storage
            if len(bullets) < max_b:
                used_ids = {b["fact_id"] for b in bullets}
                for f in facts:
                    if f.id in used_ids:
                        continue
                    if (comp_name == "Google Inc" and f.company == "Google Inc") or \
                       (comp_name == "Google Cloud Platform" and ("Google Cloud" in f.company or f.company == "Google")) or \
                       (comp_name not in ["Google Inc", "Google Cloud Platform"] and comp_name.lower().split()[0] in f.company.lower()):
                        bullets.append({
                            "fact_id": f.id,
                            "chosen_text": f.refined_text,
                            "variant_type": "standard",
                            "match_reason": "Verified career achievement"
                        })
                        if len(bullets) >= max_b:
                            break

            ordered_experiences.append({
                "company": comp_name,
                "role": comp_role,
                "date_range": comp_dates,
                "bullets": bullets
            })

        # Generate custom Executive Summary for Joy Wang
        ai_focus_text = "agentic workflow orchestration, Model Context Protocol (MCP), and AI observability infrastructure" if wants_ai else "enterprise cloud platforms, distributed systems, and developer platform ecosystems"
        exec_summary = (
            f"Senior Product Management Leader with 10+ years of product leadership, including 8+ years architecting enterprise-scale cloud platforms and {ai_focus_text} at Google Cloud. "
            f"Proven track record driving 0-to-1 platform standardization (Google Cloud Tech Impact Award), zero-downtime platform migrations (Google Feats of Engineering Award), and high-throughput query performance (cutting zero-state latency by 70%). "
            f"Passionate about leveraging deep enterprise telemetry and systems architecture acumen to accelerate product innovation and developer velocity for {company}'s {job_title} role."
        )

        # Dynamic Skills Priority
        skills = [
            {"category": "AI & Agent Platforms", "skills": "Model Context Protocol (MCP), Agentic Workflows & Trajectories, LLM APIs, AI Observability, BigQuery Data Plane"},
            {"category": "Cloud Infrastructure & Platforms", "skills": "Google Cloud Platform (Pantheon Console), Distributed Query Systems, Caching & Sampling, Platform-as-a-Product, Golden Paths"},
            {"category": "Governance, FinOps & Performance", "skills": "GKE Cost Insights, Workload Unit Economics, IAM Governance, Zero-Downtime Migration, Latency Optimization (SLOs)"},
            {"category": "Product Leadership & Strategy", "skills": "0-to-1 Platform Standardization, Product Intake Frameworks, CUJ Mapping, Influence Without Authority, Cross-Functional Alignment"}
        ]

        if not wants_ai and wants_perf:
            # Swap order
            skills[0], skills[1] = skills[1], skills[0]

        calc_score = min(96.0, 80.0 + len(matched_keywords) * 2.5)

        return {
            "candidate_name": "Joy Wang",
            "contact_info": "Phone: 617.230.9777 | Email: joy.jiayiwang@gmail.com | Status: US Permanent Resident",
            "target_company": company,
            "target_job_title": job_title,
            "tailored_summary": exec_summary,
            "skills_categories": skills,
            "experiences": ordered_experiences,
            "education": "MBA – Rotman School of Management, University of Toronto | BS – Computer Science, Fudan University",
            "keynotes_talks": "Featured Speaker at Google Cloud Next (MLB Observability Analytics, 4.7/5 rating) & GrafanaCon (2019); Authored 15+ official Google Cloud technical whitepapers and blogs on Query Telemetry with SQL for AI Observability.",
            "side_projects": "Side Project: Designed and built interactive learning website for youth financial literacy (invest-in-future.onrender.com)",
            "match_report": {
                "ats_score": round(calc_score, 1),
                "matched_keywords": list(matched_keywords)[:12] or ["Cloud Infrastructure", "Distributed Systems", "0-to-1 Platform", "Telemetry", "APIs"],
                "strategy_rationale": f"Prioritized Joy Wang's core achievements matching {company}'s requirements: highlighting {', '.join(list(matched_keywords)[:4]) or 'cloud platform standardization and systems optimization'}."
            }
        }
