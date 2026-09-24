import { FactBlock, ResumeMetadata, FactCreatePayload, FactUpdatePayload, AppStats } from '../types/fact';

const BASE_URL = 'http://localhost:8000/api';

export interface ScrapedJD {
  url: string;
  domain: string;
  job_title: string;
  company: string;
  raw_text: string;
  raw_jd_text?: string;
  job_description?: string;
}

export function cleanScrapedJobData(url: string, data: any): ScrapedJD {
  const rawContent: string = (
    data.raw_jd_text ||
    data.raw_text ||
    data.job_description ||
    data.text ||
    ''
  ).trim();

  // 1. Company Detection
  let detectedCompany = '';
  const urlLower = url.toLowerCase();
  if (urlLower.includes('google.com') || rawContent.includes('Google Careers') || rawContent.includes('At Google') || rawContent.includes('Google Cloud')) {
    detectedCompany = 'Google';
  } else if (urlLower.includes('openai.com') || rawContent.includes('OpenAI')) {
    detectedCompany = 'OpenAI';
  } else if (urlLower.includes('stripe.com') || rawContent.includes('Stripe')) {
    detectedCompany = 'Stripe';
  } else if (urlLower.includes('databricks.com') || rawContent.includes('Databricks')) {
    detectedCompany = 'Databricks';
  } else if (urlLower.includes('meta.com') || urlLower.includes('facebook.com')) {
    detectedCompany = 'Meta';
  } else if (urlLower.includes('apple.com')) {
    detectedCompany = 'Apple';
  } else if (urlLower.includes('amazon.com')) {
    detectedCompany = 'Amazon';
  } else if (urlLower.includes('microsoft.com')) {
    detectedCompany = 'Microsoft';
  } else if (data.company && !['目标科技公司', 'Target Company', '公司'].includes(data.company.trim())) {
    detectedCompany = data.company.trim();
  } else {
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const host = parsedUrl.hostname.replace('www.', '');
      const domainPart = host.split('.')[0];
      if (domainPart && domainPart.length > 1) {
        detectedCompany = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
      }
    } catch {
      detectedCompany = data.company || 'Target Company';
    }
  }

  // 2. Job Title Detection & Untruncation
  let detectedTitle = (data.job_title || data.title || '').trim();
  const firstLine = rawContent.split('\n')[0]?.trim() || '';
  if (firstLine.includes('—') || firstLine.includes(' - ') || firstLine.includes(' | ')) {
    const candidate = firstLine.split(/\s*(?:—| - | \| )\s*(?:Google|Careers|Jobs|Job Application)/i)[0]?.trim();
    if (candidate && candidate.length >= detectedTitle.length) {
      detectedTitle = candidate;
    }
  }
  if (!detectedTitle || detectedTitle === 'Target Position' || detectedTitle === 'Target Job Title') {
    detectedTitle = 'Senior Product Manager';
  }

  // 3. Clean JD Text Body (strip navigation header and footer legal disclaimers)
  let cleanText = rawContent;
  if (cleanText) {
    const startMarkers = [
      'Minimum qualifications:',
      'Minimum qualifications',
      'Basic Qualifications:',
      'Basic Qualifications',
      'About the job',
      'Role Description',
      'Overview:',
      'Responsibilities:',
      'Job Description',
      'Qualifications:'
    ];
    let startIdx = -1;
    for (const marker of startMarkers) {
      const idx = cleanText.indexOf(marker);
      if (idx !== -1) {
        if (startIdx === -1 || idx < startIdx) {
          startIdx = idx;
        }
      }
    }

    const endMarkers = [
      'Information collected and processed as part of your',
      'Google is proud to be an equal opportunity',
      'Equal Opportunity Employer',
      'Applicant and Candidate Privacy Policy',
      'We are an equal opportunity employer',
      'EEO Statement'
    ];
    let endIdx = -1;
    for (const marker of endMarkers) {
      const idx = cleanText.indexOf(marker);
      if (idx !== -1 && (startIdx === -1 || idx > startIdx)) {
        if (endIdx === -1 || idx < endIdx) {
          endIdx = idx;
        }
      }
    }

    if (startIdx !== -1) {
      cleanText = endIdx !== -1 ? cleanText.substring(startIdx, endIdx).trim() : cleanText.substring(startIdx).trim();
    } else if (endIdx !== -1) {
      cleanText = cleanText.substring(0, endIdx).trim();
    }
  }

  return {
    url,
    domain: data.domain || '',
    job_title: detectedTitle,
    company: detectedCompany,
    raw_text: cleanText || rawContent,
    raw_jd_text: rawContent,
    job_description: cleanText || rawContent
  };
}

export interface TailoredResumeResult {
  candidate_name: string;
  contact_info: string;
  target_company: string;
  target_job_title: string;
  tailored_summary: string;
  skills_categories: Array<{ category: string; skills: string }>;
  experiences: Array<{
    company: string;
    role: string;
    date_range: string;
    bullets: Array<{
      fact_id: string;
      chosen_text: string;
      variant_type: string;
      match_reason?: string;
    }>;
  }>;
  education: string;
  keynotes_talks: string;
  match_report: {
    ats_score: number;
    matched_keywords: string[];
    strategy_rationale: string;
  };
}

export const api = {
  // Resumes
  async getResumes(): Promise<ResumeMetadata[]> {
    const res = await fetch(`${BASE_URL}/resumes`);
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
  },

  async uploadResumes(files: File[]): Promise<ResumeMetadata[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`${BASE_URL}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload resumes');
    return res.json();
  },

  async extractFactsFromResume(resumeId: string): Promise<FactBlock[]> {
    const res = await fetch(`${BASE_URL}/resumes/${resumeId}/extract`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to extract facts');
    return res.json();
  },

  async batchExtractAll(): Promise<FactBlock[]> {
    const res = await fetch(`${BASE_URL}/resumes/batch-extract`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to batch extract facts');
    return res.json();
  },

  // Facts
  async getFacts(params?: { category?: string; company?: string; is_locked?: boolean; search?: string }): Promise<FactBlock[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.company) searchParams.append('company', params.company);
    if (params?.is_locked !== undefined) searchParams.append('is_locked', String(params.is_locked));
    if (params?.search) searchParams.append('search', params.search);

    const res = await fetch(`${BASE_URL}/facts?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch facts');
    return res.json();
  },

  async createFact(payload: FactCreatePayload): Promise<FactBlock> {
    const res = await fetch(`${BASE_URL}/facts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create fact');
    return res.json();
  },

  async updateFact(id: string, payload: FactUpdatePayload): Promise<FactBlock> {
    const res = await fetch(`${BASE_URL}/facts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update fact');
    return res.json();
  },

  async toggleLock(id: string): Promise<FactBlock> {
    const res = await fetch(`${BASE_URL}/facts/${id}/lock`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle lock');
    return res.json();
  },

  async polishFact(id: string, target_focus: string, instruction?: string): Promise<FactBlock> {
    const res = await fetch(`${BASE_URL}/facts/${id}/polish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_focus, user_instruction: instruction }),
    });
    if (!res.ok) throw new Error('Failed to polish fact');
    return res.json();
  },

  async deleteFact(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/facts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete fact');
  },

  // Tailor API
  async scrapeJobUrl(url: string): Promise<ScrapedJD> {
    let rawData: any = null;

    try {
      const res = await fetch(`${BASE_URL}/tailor/parse-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        rawData = await res.json();
      }
    } catch {}

    if (!rawData) {
      const res2 = await fetch(`${BASE_URL}/tailor/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res2.ok) {
        const err = await res2.json().catch(() => ({ detail: '抓取失败' }));
        throw new Error(err.detail || '抓取失败，建议直接粘贴该职位的 JD 文本');
      }
      rawData = await res2.json();
    }

    return cleanScrapedJobData(url, rawData);
  },

  async generateTailoredResume(payload: {
    url?: string;
    company: string;
    job_title: string;
    jd_text: string;
    target_page_length?: number;
  }): Promise<any> {
    const body = {
      company: payload.company,
      job_title: payload.job_title,
      job_description: payload.jd_text,
      jd_text: payload.jd_text,
      url: payload.url,
      target_page_length: payload.target_page_length || 1,
    };
    const res = await fetch(`${BASE_URL}/tailor/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: '生成定制简历失败' }));
      throw new Error(err.detail || '生成定制简历失败');
    }
    return res.json();
  },

  // Stats
  async getStats(): Promise<AppStats> {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },
};
