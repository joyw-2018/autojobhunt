import re
import logging
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

class ScraperService:
    @staticmethod
    async def scrape_jd_url(url: str) -> Dict[str, Any]:
        """
        Fetch and parse public Job Description URL.
        Extracts clean body text, company name, and job title.
        """
        url = url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        domain = urlparse(url).netloc.lower()
        
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
            "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Upgrade-Insecure-Requests": "1"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code >= 400:
                    raise ValueError(f"HTTP {resp.status_code} Error while fetching webpage.")
                html = resp.text
        except Exception as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            raise ValueError(f"无法抓取该网页: {str(e)}。建议直接粘贴该岗位的招聘文本。")

        return ScraperService.parse_html_content(html, url, domain)

    @staticmethod
    def parse_html_content(html: str, url: str = "", domain: str = "") -> Dict[str, Any]:
        soup = BeautifulSoup(html, "lxml")

        # 1. Clean boilerplate elements
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "button", "iframe"]):
            tag.decompose()

        # 2. Extract Title heuristics
        title = ""
        # Check og:title
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()

        # Check H1
        if not title:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text().strip()

        # Check document title
        if not title and soup.title:
            title = soup.title.get_text().strip()

        # Clean title (e.g. "Staff Product Manager - AI | Stripe Careers" -> "Staff Product Manager - AI")
        cleaned_title = re.split(r"[-–|•:]\s*(?:Careers|Jobs|Job Application|At|Inc)", title, flags=re.IGNORECASE)[0].strip()
        if not cleaned_title:
            cleaned_title = title

        # 3. Extract Company heuristics
        company = ""
        if "google.com" in domain or "google.com" in url:
            company = "Google"
        elif "openai.com" in domain or "openai.com" in url:
            company = "OpenAI"
        elif "stripe.com" in domain or "stripe.com" in url:
            company = "Stripe"
        elif "databricks.com" in domain or "databricks.com" in url:
            company = "Databricks"

        if not company:
            og_site = soup.find("meta", property="og:site_name")
            if og_site and og_site.get("content"):
                company = og_site["content"].strip()

        if not company and domain:
            # Parse from domain like boards.greenhouse.io/stripe -> stripe
            parts = domain.split(".")
            if "greenhouse" in domain or "lever" in domain:
                path_parts = [p for p in urlparse(url).path.split("/") if p]
                if path_parts:
                    company = path_parts[0].capitalize()
            elif len(parts) >= 2:
                company = parts[-2].capitalize()

        # 4. Extract Text Content
        # Look for typical job description wrappers if present
        jd_container = (
            soup.find("div", id=re.compile(r"job[-_]?description|posting[-_]?content|app[-_]?body", re.I)) or
            soup.find("section", class_=re.compile(r"job[-_]?description|posting[-_]?content", re.I)) or
            soup.find("main") or
            soup.body or
            soup
        )

        lines = (line.strip() for line in jd_container.get_text(separator="\n").splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = "\n".join(chunk for chunk in chunks if chunk)

        # Truncate if gigantic (keep within 15000 chars)
        if len(clean_text) > 15000:
            clean_text = clean_text[:15000]

        return {
            "url": url,
            "domain": domain,
            "job_title": cleaned_title or "Target Job Title",
            "company": company or "Target Company",
            "raw_text": clean_text,
            "raw_jd_text": clean_text,
            "job_description": clean_text
        }
