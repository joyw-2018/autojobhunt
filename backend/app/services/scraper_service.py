import re
import json
import html
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
        Supports dedicated API adapters for SPAs/ATS (HubSpot, Greenhouse, Lever)
        as well as JSON-LD schema extraction and generic HTML fallback.
        """
        url = url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        domain = urlparse(url).netloc.lower()

        # 1. Specialized scrapers for SPAs and ATS platforms
        if "hubspot.com" in domain or "hubspot.com" in url:
            hs_result = await ScraperService._scrape_hubspot(url, domain)
            if hs_result:
                return hs_result

        if "greenhouse.io" in domain:
            gh_result = await ScraperService._scrape_greenhouse(url, domain)
            if gh_result:
                return gh_result

        if "lever.co" in domain:
            lever_result = await ScraperService._scrape_lever(url, domain)
            if lever_result:
                return lever_result

        # 2. Generic HTML fetch and fallback
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
                html_text = resp.text
        except Exception as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            raise ValueError(f"无法抓取该网页: {str(e)}。建议直接粘贴该岗位的招聘文本。")

        return ScraperService.parse_html_content(html_text, url, domain)

    @staticmethod
    async def _scrape_hubspot(url: str, domain: str) -> Optional[Dict[str, Any]]:
        """
        Scrapes HubSpot career page via HubSpot GraphQL API (wtcfns.hubspot.com/careers/graphql).
        HubSpot careers pages are SPAs that dynamically load job descriptions via this endpoint.
        """
        match = re.search(r"/jobs/(\d+)", url)
        if not match:
            return None

        job_id = match.group(1)
        graphql_endpoint = "https://wtcfns.hubspot.com/careers/graphql"
        payload = {
            "operationName": "Job",
            "variables": {"id": str(job_id)},
            "query": """query Job($id: ID!) {
  job(id: $id) {
    title
    id
    content
    department {
      id
      name
    }
    office {
      location
      id
    }
  }
}"""
        }
        headers = {
            "User-Agent": USER_AGENT,
            "Origin": "https://www.hubspot.com",
            "Referer": url,
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.post(graphql_endpoint, json=payload, headers=headers)
                if resp.status_code != 200:
                    logger.warning(f"HubSpot GraphQL returned status {resp.status_code}")
                    return None
                data = resp.json()
                job_data = data.get("data", {}).get("job")
                if not job_data:
                    return None

                title = (job_data.get("title") or "").strip()
                department = ((job_data.get("department") or {}).get("name") or "").strip()
                location = ((job_data.get("office") or {}).get("location") or "").strip()
                raw_html = html.unescape(job_data.get("content") or "")

                soup = BeautifulSoup(raw_html, "lxml")
                for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "button", "iframe"]):
                    tag.decompose()

                lines = (line.strip() for line in soup.get_text(separator="\n").splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                body_text = "\n".join(chunk for chunk in chunks if chunk)

                header_parts = []
                if title:
                    header_parts.append(title)
                if department:
                    header_parts.append(f"Department: {department}")
                if location:
                    header_parts.append(f"Location: {location}")

                full_text = "\n".join(header_parts) + "\n\n" + body_text
                # Normalize typography
                full_text = full_text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"').replace('\u2013', '-').replace('\u2014', ' - ')

                return {
                    "url": url,
                    "domain": domain,
                    "job_title": title or "Staff Product Manager, Monetization",
                    "company": "HubSpot",
                    "raw_text": full_text,
                    "raw_jd_text": full_text,
                    "job_description": full_text
                }
        except Exception as e:
            logger.warning(f"Error calling HubSpot careers GraphQL API: {e}")
            return None

    @staticmethod
    async def _scrape_greenhouse(url: str, domain: str) -> Optional[Dict[str, Any]]:
        """
        Scrapes Greenhouse job board via its public REST API:
        https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}
        """
        match = re.search(r"(?:boards|job-boards)\.greenhouse\.io/([^/]+)/jobs/(\d+)", url)
        if not match:
            return None

        board_token = match.group(1)
        job_id = match.group(2)
        api_url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}"

        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(api_url, headers=headers)
                if resp.status_code != 200:
                    return None
                data = resp.json()
                title = (data.get("title") or "").strip()
                location = ((data.get("location") or {}).get("name") or "").strip()
                content_html = html.unescape(data.get("content") or "")

                soup = BeautifulSoup(content_html, "lxml")
                for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "button", "iframe"]):
                    tag.decompose()

                lines = (line.strip() for line in soup.get_text(separator="\n").splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                body_text = "\n".join(chunk for chunk in chunks if chunk)

                header_parts = []
                if title:
                    header_parts.append(title)
                if location:
                    header_parts.append(f"Location: {location}")

                full_text = "\n".join(header_parts) + "\n\n" + body_text
                full_text = full_text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')

                company_name = board_token.capitalize()
                return {
                    "url": url,
                    "domain": domain,
                    "job_title": title,
                    "company": company_name,
                    "raw_text": full_text,
                    "raw_jd_text": full_text,
                    "job_description": full_text
                }
        except Exception as e:
            logger.warning(f"Error calling Greenhouse API: {e}")
            return None

    @staticmethod
    async def _scrape_lever(url: str, domain: str) -> Optional[Dict[str, Any]]:
        """
        Scrapes Lever job board via its public REST API:
        https://api.lever.co/v0/postings/{company}/{job_id}
        """
        match = re.search(r"jobs\.lever\.co/([^/]+)/([a-f0-9\-]+)", url)
        if not match:
            return None

        company_slug = match.group(1)
        job_id = match.group(2)
        api_url = f"https://api.lever.co/v0/postings/{company_slug}/{job_id}"

        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(api_url, headers=headers)
                if resp.status_code != 200:
                    return None
                data = resp.json()
                title = (data.get("text") or "").strip()
                categories = data.get("categories") or {}
                location = categories.get("location") or ""
                team = categories.get("team") or ""

                parts = []
                if title:
                    parts.append(title)
                if team:
                    parts.append(f"Team: {team}")
                if location:
                    parts.append(f"Location: {location}")

                description_plain = data.get("descriptionPlain") or ""
                if description_plain:
                    parts.append("\n" + description_plain.strip())

                lists = data.get("lists") or []
                for lst in lists:
                    list_title = lst.get("text", "")
                    list_content = lst.get("content", "")
                    if list_title:
                        parts.append(f"\n{list_title}:")
                    if list_content:
                        lst_soup = BeautifulSoup(list_content, "lxml")
                        parts.append(lst_soup.get_text(separator="\n").strip())

                additional = data.get("additionalPlain") or ""
                if additional:
                    parts.append(f"\n{additional.strip()}")

                full_text = "\n".join(parts)
                full_text = full_text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')

                return {
                    "url": url,
                    "domain": domain,
                    "job_title": title,
                    "company": company_slug.capitalize(),
                    "raw_text": full_text,
                    "raw_jd_text": full_text,
                    "job_description": full_text
                }
        except Exception as e:
            logger.warning(f"Error calling Lever API: {e}")
            return None

    @staticmethod
    def parse_html_content(html_content: str, url: str = "", domain: str = "") -> Dict[str, Any]:
        soup = BeautifulSoup(html_content, "lxml")

        # 1. Check for schema.org JobPosting in JSON-LD before removing script tags
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                raw_json = script.string or script.text
                if not raw_json:
                    continue
                ld_data = json.loads(raw_json)
                items = ld_data if isinstance(ld_data, list) else [ld_data]
                if isinstance(ld_data, dict) and "@graph" in ld_data:
                    items = ld_data["@graph"]

                for item in items:
                    if not isinstance(item, dict):
                        continue
                    item_type = str(item.get("@type", ""))
                    if "JobPosting" in item_type:
                        ld_title = (item.get("title") or "").strip()
                        hiring_org = item.get("hiringOrganization")
                        ld_company = ""
                        if isinstance(hiring_org, dict):
                            ld_company = (hiring_org.get("name") or "").strip()
                        elif isinstance(hiring_org, str):
                            ld_company = hiring_org.strip()

                        ld_desc_html = item.get("description", "")
                        if ld_desc_html and len(ld_desc_html) > 100:
                            desc_soup = BeautifulSoup(html.unescape(ld_desc_html), "lxml")
                            for tag in desc_soup(["script", "style", "nav", "footer", "header", "noscript"]):
                                tag.decompose()
                            lines = (line.strip() for line in desc_soup.get_text(separator="\n").splitlines())
                            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                            desc_text = "\n".join(chunk for chunk in chunks if chunk)

                            header_parts = []
                            if ld_title:
                                header_parts.append(ld_title)
                            if ld_company:
                                header_parts.append(f"Company: {ld_company}")

                            full_ld_text = "\n".join(header_parts) + "\n\n" + desc_text
                            full_ld_text = full_ld_text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')

                            return {
                                "url": url,
                                "domain": domain,
                                "job_title": ld_title or "Target Job Title",
                                "company": ld_company or "Target Company",
                                "raw_text": full_ld_text,
                                "raw_jd_text": full_ld_text,
                                "job_description": full_ld_text
                            }
            except Exception:
                pass

        # 2. Clean boilerplate elements
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "button", "iframe"]):
            tag.decompose()

        # 3. Extract Title heuristics
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

        # 4. Extract Company heuristics
        company = ""
        if "google.com" in domain or "google.com" in url:
            company = "Google"
        elif "hubspot.com" in domain or "hubspot.com" in url:
            company = "HubSpot"
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
            parts = domain.split(".")
            if "greenhouse" in domain or "lever" in domain:
                path_parts = [p for p in urlparse(url).path.split("/") if p]
                if path_parts:
                    company = path_parts[0].capitalize()
            elif len(parts) >= 2:
                company = parts[-2].capitalize()

        # 5. Extract Text Content
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
