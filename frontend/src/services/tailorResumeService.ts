/**
 * Service for managing tailored resume state across tabs and sessions.
 * Preserves the generated resume, input fields, and provides data for Google Docs preview & export.
 */
import { ResumeExportData } from './googleDocsService';

export interface CanonicalEmployer {
  company: string;
  role: string;
  date_range: string;
  aliases: string[];
  page1Bullets: Array<{ fact_id: string; text: string }>;
  page2Bullets: Array<{ fact_id: string; text: string }>;
}

export const CANONICAL_EMPLOYERS: CanonicalEmployer[] = [
  {
    company: 'Google Cloud Platform',
    role: 'Senior Product Manager',
    date_range: '2018.02 - Present',
    aliases: ['google cloud platform', 'google cloud', 'google'],
    page1Bullets: [
      {
        fact_id: 'fact_jw_01',
        text: 'Spearheaded the integration of AI-ready telemetry, Model Context Protocol (MCP), and agentic workflows into platform logs, traces, and agent trajectories; productized natural-language query analytics and LLM-powered insights enabling autonomous agents and developers to diagnose complex distributed infrastructure, unblocking $100M+ in enterprise sales pipeline.'
      },
      {
        fact_id: 'fact_jw_04',
        text: 'Conceived, built, and scaled the Universal Dashboard Framework (UDF) from 0-to-1 as sole PM, unifying fragmented tools into a reusable, API-first platform component framework across 20+ GCP infrastructure teams, slashing partner onboarding support tickets by 50% in Month 1 (Awarded Google Cloud Tech Impact Award).'
      },
      {
        fact_id: 'fact_jw_03',
        text: 'Diagnosed an 8x latency bottleneck across distributed API and e2e query layers; led architecture tradeoff discussions with core systems engineering to redesign sampling, partition pruning, and caching strategies, slashing zero-state query latency by 70% and establishing rigorous platform SLOs.'
      },
      {
        fact_id: 'fact_jw_05',
        text: 'Orchestrated the end-to-end platform migration of legacy Stackdriver infrastructure into Google Cloud Console (Pantheon); led cross-functional alignment across IAM, feature parity, backend replication, and core systems with zero downtime, driving full deprecation while expanding active enterprise users by 20% (Awarded Google Feats of Engineering Award).'
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_01',
        text: 'Spearheaded the integration of AI-ready telemetry, Model Context Protocol (MCP), and agentic workflows into platform logs, traces, and agent trajectories; productized natural-language query analytics and LLM-powered insights enabling autonomous agents and developers to diagnose complex distributed infrastructure, unblocking $100M+ in enterprise sales pipeline.'
      },
      {
        fact_id: 'fact_jw_04',
        text: 'Conceived, built, and scaled the Universal Dashboard Framework (UDF) from 0-to-1 as sole PM, unifying fragmented tools into a reusable, API-first platform component framework across 20+ GCP infrastructure teams, slashing partner onboarding support tickets by 50% in Month 1 (Awarded Google Cloud Tech Impact Award).'
      },
      {
        fact_id: 'fact_jw_03',
        text: 'Diagnosed an 8x latency bottleneck across distributed API and e2e query layers; led architecture tradeoff discussions with core systems engineering to redesign sampling, partition pruning, and caching strategies, slashing zero-state query latency by 70% and establishing rigorous platform SLOs.'
      },
      {
        fact_id: 'fact_jw_05',
        text: 'Orchestrated the end-to-end platform migration of legacy Stackdriver infrastructure into Google Cloud Console (Pantheon); led cross-functional alignment across IAM, feature parity, backend replication, and core systems with zero downtime, driving full deprecation while expanding active enterprise users by 20% (Awarded Google Feats of Engineering Award).'
      },
      {
        fact_id: 'fact_jw_02',
        text: 'Architected the observability strategy for automated diagnostic workflows; established standardized benchmarks and task completion metrics (MTTR) that eliminated diagnostic friction and dramatically accelerated root-cause resolution for developers and autonomous coding agents.'
      },
      {
        fact_id: 'fact_jw_06',
        text: 'Co-authored and launched GKE Cost Insights and platform utilization architecture combining Cloud Monitoring and BigQuery; empowered enterprise organizations to model cost-to-serve, forecast multi-tenant compute/AI workload spend, and automate storage tiering, driving multi-million-dollar efficiency gains.'
      },
      {
        fact_id: 'fact_jw_07',
        text: 'Partnered with UX, Data Science, and 60+ distributed engineers to ship 10+ core capabilities in 1 year; established structured product intake frameworks and outcome-driven roadmap governance, balancing technical velocity with reliability benchmarks and driving a 30% increase in execution efficiency.'
      }
    ]
  },
  {
    company: 'Scotiabank',
    role: 'Product Manager',
    date_range: '2017.02 - 2018.02',
    aliases: ['scotiabank', 'scotia'],
    page1Bullets: [
      {
        fact_id: 'fact_jw_08',
        text: 'Defined product strategy and API roadmaps for regulated banking workflows across web and mobile channels; diagnosed systemic infrastructure vulnerabilities causing 5x service latency spikes, delivering architectural recommendations to restore service resiliency and establish regional Banking-as-a-Service (BaaS) platform vision.'
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_08',
        text: 'Defined product strategy and API roadmaps for regulated banking workflows across web and mobile channels; diagnosed systemic infrastructure vulnerabilities causing 5x service latency spikes, delivering architectural recommendations to restore service resiliency and establish regional Banking-as-a-Service (BaaS) platform vision.'
      },
      {
        fact_id: 'fact_jw_08_b',
        text: 'Partnered with security, enterprise architecture, and compliance to modernize mission-critical core banking infrastructure, establishing self-service API access policies across retail and commercial units.'
      }
    ]
  },
  {
    company: 'Net Credit Group (NCF - Fintech Startup)',
    role: 'Head of Product',
    date_range: '2016.04 - 2017.02',
    aliases: ['net credit group', 'ncf', 'ncfg'],
    page1Bullets: [
      {
        fact_id: 'fact_jw_09',
        text: 'Led product lifecycle from conception to launch in 5 months as Head of Product, designing high-throughput transaction ledgers, risk evaluation workflows, and merchant APIs; launched 2 consumer mobile applications and partner portals, scaling platform adoption to 200,000+ active users within 90 days.'
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_09',
        text: 'Led product lifecycle from conception to launch in 5 months as Head of Product, designing high-throughput transaction ledgers, risk evaluation workflows, and merchant APIs; launched 2 consumer mobile applications and partner portals, scaling platform adoption to 200,000+ active users within 90 days.'
      },
      {
        fact_id: 'fact_jw_09_b',
        text: 'Collaborated closely with legal, risk, and operations teams to embed automated risk evaluation engines and compliance guardrails directly into merchant APIs and consumer mobile transaction flows.'
      }
    ]
  },
  {
    company: 'eBay Inc.',
    role: 'Product Manager',
    date_range: '2012.10 - 2016.04',
    aliases: ['ebay', 'ebay inc', 'ebay inc.'],
    page1Bullets: [
      {
        fact_id: 'fact_jw_10',
        text: 'Drove 20%+ year-over-year organic traffic growth for 3 consecutive years by optimizing consumer search discovery pipelines and executing continuous large-scale A/B testing frameworks across millions of user queries.'
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_10',
        text: 'Drove 20%+ year-over-year organic traffic growth for 3 consecutive years by optimizing consumer search discovery pipelines and executing continuous large-scale A/B testing frameworks across millions of user queries.'
      },
      {
        fact_id: 'fact_jw_10_b',
        text: 'Analyzed complex consumer query funnels and search relevance metrics to minimize query friction and optimize conversion paths, validating improvements through rigorous statistical evaluation.'
      }
    ]
  },
  {
    company: 'Rogers Communications',
    role: 'Product Manager',
    date_range: '2010.05 - 2012.10',
    aliases: ['rogers', 'rogers communications'],
    page1Bullets: [
      {
        fact_id: 'fact_jw_11',
        text: "Fine-tuned Endeca NLP and search indexing pipelines for Canada's largest telecom portal, improving search accuracy by 30% and expanding search keyword and query coverage by 50%."
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_11',
        text: "Fine-tuned Endeca NLP and search indexing pipelines for Canada's largest telecom portal, improving search accuracy by 30% and expanding search keyword and query coverage by 50%."
      },
      {
        fact_id: 'fact_jw_11_b',
        text: 'Standardized telecom product search taxonomy and automated catalog data ingestion pipelines, reducing zero-result search queries by 25% and enhancing customer self-service discoverability.'
      }
    ]
  },
  {
    company: 'Google Inc',
    role: 'Senior Account Manager',
    date_range: '2005.12 - 2008.11',
    aliases: ['google inc', 'google inc.'],
    page1Bullets: [
      {
        fact_id: 'fact_jw_12',
        text: 'Scaled digital performance campaigns across high-value client portfolios, achieving 40%+ YoY growth for 3 consecutive years; built and led a 30-person sales operations team and a 20-person acquisition team, increasing new client onboarding by 5x in Year 1.'
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_12',
        text: 'Scaled digital performance campaigns across high-value client portfolios, achieving 40%+ YoY growth for 3 consecutive years; built and led a 30-person sales operations team and a 20-person acquisition team, increasing new client onboarding by 5x in Year 1.'
      },
      {
        fact_id: 'fact_jw_12_b',
        text: 'Built structured client acquisition playbooks and cross-functional training programs for a 50-person sales operations and client acquisition organization, reducing new enterprise account ramp-up time by 40%.'
      }
    ]
  }
];

export function buildAllCanonicalExperiences(
  rawExperiences: any[] | undefined,
  matchedFacts: any[] | undefined,
  targetPageLength: number = 1
) {
  const matchedFactMap = new Map<string, any>();
  if (matchedFacts && Array.isArray(matchedFacts)) {
    matchedFacts.forEach(mf => {
      if (mf.fact_id) matchedFactMap.set(mf.fact_id, mf);
    });
  }

  const rawBulletsByCompany = new Map<string, Array<{ fact_id: string; chosen_text: string; variant_type?: string }>>();
  if (rawExperiences && Array.isArray(rawExperiences)) {
    rawExperiences.forEach(exp => {
      const compKey = (exp.company || '').toLowerCase();
      if (!rawBulletsByCompany.has(compKey)) rawBulletsByCompany.set(compKey, []);
      if (exp.bullets && Array.isArray(exp.bullets)) {
        rawBulletsByCompany.get(compKey)!.push(...exp.bullets);
      }
    });
  }

  return CANONICAL_EMPLOYERS.map(employer => {
    const matchedBullets: Array<{ fact_id: string; chosen_text: string; variant_type?: string }> = [];
    const usedFactIds = new Set<string>();

    // 1. Check raw experiences for this company
    for (const [key, bullets] of rawBulletsByCompany.entries()) {
      const isGoogleIncKey = key.includes('google inc');
      const isThisGoogleInc = employer.company === 'Google Inc';
      let matches = false;
      if (isThisGoogleInc) {
        matches = isGoogleIncKey;
      } else if (employer.company === 'Google Cloud Platform') {
        matches = !isGoogleIncKey && employer.aliases.some(alias => key.includes(alias));
      } else {
        matches = employer.aliases.some(alias => key.includes(alias));
      }

      if (matches) {
        bullets.forEach(b => {
          if (!usedFactIds.has(b.fact_id)) {
            usedFactIds.add(b.fact_id);
            matchedBullets.push(b);
          }
        });
      }
    }

    // 2. Check matched_facts from backend
    if (matchedFacts && Array.isArray(matchedFacts)) {
      matchedFacts.forEach(mf => {
        const mfComp = (mf.company || '').toLowerCase();
        const isGoogleInc = mfComp.includes('google inc') || mf.fact_id.startsWith('fact_jw_12');
        const isThisGoogleInc = employer.company === 'Google Inc';
        
        let matches = false;
        if (isThisGoogleInc) {
          matches = isGoogleInc;
        } else if (employer.company === 'Google Cloud Platform') {
          matches = !isGoogleInc && employer.aliases.some(alias => mfComp.includes(alias));
        } else {
          matches = employer.aliases.some(alias => mfComp.includes(alias));
        }

        if (matches && !usedFactIds.has(mf.fact_id)) {
          usedFactIds.add(mf.fact_id);
          matchedBullets.push({
            fact_id: mf.fact_id,
            chosen_text: mf.tailored_text || mf.original_text,
            variant_type: mf.relevance_score ? `匹配度 ${mf.relevance_score}%` : 'standard'
          });
        }
      });
    }

    // 3. Ensure each company has sufficient verified bullets
    const minBulletsNeeded = employer.company === 'Google Cloud Platform' 
      ? (targetPageLength === 2 ? 7 : 4) 
      : (targetPageLength === 2 ? 2 : 1);
    
    const candidateBullets = targetPageLength === 2 ? employer.page2Bullets : employer.page1Bullets;

    for (const defBullet of candidateBullets) {
      if (matchedBullets.length >= minBulletsNeeded) break;
      if (!usedFactIds.has(defBullet.fact_id)) {
        const mf = matchedFactMap.get(defBullet.fact_id);
        usedFactIds.add(defBullet.fact_id);
        matchedBullets.push({
          fact_id: defBullet.fact_id,
          chosen_text: mf?.tailored_text || mf?.original_text || defBullet.text,
          variant_type: mf?.relevance_score ? `匹配度 ${mf.relevance_score}%` : 'standard'
        });
      }
    }

    return {
      company: employer.company,
      role: employer.role,
      date_range: employer.date_range,
      bullets: matchedBullets
    };
  });
}

export interface TailorState {
  url: string;
  company: string;
  jobTitle: string;
  jdText: string;
  pageLength: number;
  showManualPaste: boolean;
  result: any | null;
  lastUpdated: number;
}

const STORAGE_KEY = 'autojobhunt_active_tailor_state';

const DEFAULT_STATE: TailorState = {
  url: '',
  company: '',
  jobTitle: '',
  jdText: '',
  pageLength: 2, // Default to 2-page detailed executive format per official resume
  showManualPaste: false,
  result: null,
  lastUpdated: 0,
};

export const tailorResumeService = {
  getStoredState(): TailorState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_STATE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to parse stored tailor state:', e);
    }
    return DEFAULT_STATE;
  },

  saveStoredState(patch: Partial<TailorState>): void {
    const current = this.getStoredState();
    const updated: TailorState = {
      ...current,
      ...patch,
      lastUpdated: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tailored-resume-updated', { detail: updated }));
    } catch (e) {
      console.warn('Failed to save tailor state:', e);
    }
  },

  clearStoredState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('tailored-resume-updated', { detail: DEFAULT_STATE }));
    } catch (e) {
      console.warn('Failed to clear tailor state:', e);
    }
  },

  /**
   * Returns a normalized ResumeExportData from either the stored tailored resume
   * or falls back to the Joy Wang master resume.
   */
  getActiveResumeExportData(targetPageLength?: number): {
    isTailored: boolean;
    data: ResumeExportData;
    company: string;
    jobTitle: string;
  } {
    const state = this.getStoredState();
    const effectivePageLength = targetPageLength || state.pageLength || 2;

    if (state.result) {
      const res = state.result;
      const experiences = buildAllCanonicalExperiences(res.experiences, res.matched_facts, effectivePageLength);

      return {
        isTailored: true,
        company: state.company || res.target_company || 'Target Company',
        jobTitle: state.jobTitle || res.target_job_title || 'Product Leader',
        data: {
          candidateName: res.candidate_name || 'Joy Wang',
          contactInfo: res.contact_info || 'Phone: 617.230.9777 | Email: joy.jiayiwang@gmail.com | Status: US Permanent Resident',
          targetCompany: state.company || res.target_company || 'Target Company',
          targetJobTitle: state.jobTitle || res.target_job_title || 'Target Role',
          summary: res.tailored_summary || res.summary_statement || 'Senior Product Management Leader with 10+ years of product leadership, including 8+ years architecting enterprise-scale cloud platforms, AI-ready developer infrastructure, and observability data systems at Google Cloud.',
          skillsCategories: (res.skills_categories?.length ? res.skills_categories : [
            { category: 'AI & Agent Ecosystem', skills: 'Model Context Protocol (MCP), Agentic Workflows & Trajectory Tracing, LLM Tool Use, Autonomous Coding Agents, BigQuery Data Plane' },
            { category: 'Cloud Infrastructure & Platforms', skills: 'Google Cloud Platform (Pantheon), API-First Component Frameworks, Self-Service Golden Paths, Distributed Query Systems' },
            { category: 'Governance, FinOps & Performance', skills: 'GKE Cost Insights, Workload Unit Economics, IAM Governance, Zero-Downtime Migration, Latency Optimization (SLOs)' },
            { category: 'Product Leadership & Strategy', skills: '0-to-1 Platform Standardization (Tech Impact Award), Product Intake Frameworks, CUJ Mapping, Influence Without Authority, Cross-Functional Alignment' }
          ]),
          experiences,
          education: res.education || 'MBA – Rotman School of Management, University of Toronto | BS – Computer Science, Fudan University',
          keynotesTalks: res.keynotes_talks || 'Featured Speaker at Google Cloud Next (MLB Observability Analytics, 4.7/5 rating) & GrafanaCon (2019); Authored 15+ official Google Cloud technical whitepapers and blogs on Query Telemetry with SQL for AI Observability, Log Analytics, and GKE Cost Visibility.',
          sideProjects: res.side_projects || 'Designed and built interactive learning website for youth financial literacy (invest-in-future.onrender.com), delivering engaging digital financial education experiences.',
          pageLength: effectivePageLength,
        }
      };
    }

    // Default Master Resume (Joy Wang Official)
    const masterExperiences = buildAllCanonicalExperiences(undefined, undefined, effectivePageLength);
    return {
      isTailored: false,
      company: 'Google Cloud Platform',
      jobTitle: 'Senior Product Manager',
      data: {
        candidateName: 'Joy Wang',
        contactInfo: 'Phone: 617.230.9777 | Email: joy.jiayiwang@gmail.com | Status: US Permanent Resident',
        targetCompany: 'Enterprise / Tech Platforms',
        targetJobTitle: 'Senior / Staff Product Manager',
        summary: 'Technical product leader with 10+ years in product management, including 8+ years at Google Cloud building enterprise observability, analytics, and developer platforms. Experience bringing natural-language and SQL-driven workflows to infrastructure data, launching reusable analysis interfaces, and connecting telemetry with business cost data. Led platforms adopted by 20+ product teams and helped unblock $100M+ in enterprise cloud sales pipeline.',
        skillsCategories: [
          { category: 'AI Driven Telemetry Analytics', skills: 'Natural-language query experiences, LLM-driven diagnostics, context grounding, MCP, agentic workflows' },
          { category: 'Analytics Data platforms', skills: 'SQL-driven analytics, BigQuery, logs/metrics/traces, dashboards, data schemas, query performance' },
          { category: 'Product leadership', skills: '0-to-1 launches, platform strategy, API governance, cross-functional delivery, enterprise adoption' },
          { category: 'Core Strengths', skills: 'Cross-functional alignment, strategic roadmapping, enterprise customer discovery, 0-to-1 execution' },
        ],
        experiences: masterExperiences,
        education: 'MBA – Rotman School of Management, University of Toronto | BS – Computer Science, Fudan University',
        keynotesTalks: 'Featured Speaker at Google Cloud Next & GrafanaCon (2019); Authored 15+ official Google Cloud technical whitepapers and blogs on Query Telemetry with SQL for AI Observability, Log Analytics, and GKE Cost Visibility.',
        sideProjects: 'Designed and built interactive learning website for youth financial literacy (invest-in-future.onrender.com), delivering engaging digital financial education experiences.',
        pageLength: effectivePageLength,
      }
    };
  }
};
