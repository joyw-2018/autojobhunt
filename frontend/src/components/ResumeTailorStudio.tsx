import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Printer, 
  Building2, 
  Briefcase, 
  FileText,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Layers
} from 'lucide-react';
import { api } from '../api/client';
import { GoogleDocsExportModal } from './GoogleDocsExportModal';

interface CanonicalEmployer {
  company: string;
  role: string;
  date_range: string;
  aliases: string[];
  page1Bullets: Array<{ fact_id: string; text: string }>;
  page2Bullets: Array<{ fact_id: string; text: string }>;
}

const CANONICAL_EMPLOYERS: CanonicalEmployer[] = [
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
        text: 'Fine-tuned Endeca NLP and search indexing pipelines for Canada\'s largest telecom portal, improving search accuracy by 30% and expanding search keyword and query coverage by 50%.'
      }
    ],
    page2Bullets: [
      {
        fact_id: 'fact_jw_11',
        text: 'Fine-tuned Endeca NLP and search indexing pipelines for Canada\'s largest telecom portal, improving search accuracy by 30% and expanding search keyword and query coverage by 50%.'
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

function buildAllCanonicalExperiences(
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

export const ResumeTailorStudio: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showGoogleDocsModal, setShowGoogleDocsModal] = useState(false);

  // Form states
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [pageLength, setPageLength] = useState<number>(1);
  const [showManualPaste, setShowManualPaste] = useState(false);

  // Raw result from API
  const [result, setResult] = useState<any | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      setErrorMsg('请输入目标职位的招聘网页 URL');
      return;
    }
    setIsScraping(true);
    setErrorMsg(null);
    setScrapeSuccess(null);
    try {
      const data = await api.scrapeJobUrl(url);
      if (data.company) setCompany(data.company);
      if (data.job_title) setJobTitle(data.job_title);
      if (data.raw_text) {
        setJdText(data.raw_text);
        setShowManualPaste(true);
        setScrapeSuccess(`已成功抓取并解析「${data.company} - ${data.job_title}」岗位需求 (${data.raw_text.length} 字符)`);
      } else {
        setShowManualPaste(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '抓取该网页失败，建议直接点击下方“手动编辑/粘贴 JD 正文”。');
      setShowManualPaste(true);
    } finally {
      setIsScraping(false);
    }
  };

  const handleTailor = async () => {
    if (!jdText.trim()) {
      setErrorMsg('请先输入或抓取目标岗位的 Job Description 文本');
      return;
    }
    setIsTailoring(true);
    setErrorMsg(null);
    try {
      const res = await api.generateTailoredResume({
        url: url.trim() || undefined,
        company: company.trim() || 'Target Company',
        job_title: jobTitle.trim() || 'Senior Product Manager',
        jd_text: jdText.trim(),
        target_page_length: pageLength
      });
      setResult(res);
      setTimeout(() => {
        document.getElementById('tailored-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || '生成定制简历失败');
    } finally {
      setIsTailoring(false);
    }
  };

  const loadExample = (exCompany: string, exTitle: string, exUrl: string, sampleJD: string) => {
    setUrl(exUrl);
    setCompany(exCompany);
    setJobTitle(exTitle);
    setJdText(sampleJD);
    setShowManualPaste(true);
    setErrorMsg(null);
    setScrapeSuccess(`已加载测试示例: ${exCompany} - ${exTitle}`);
  };

  // Safe normalized result
  const normalized = result ? {
    candidateName: result.candidate_name || 'Joy Wang',
    contactInfo: result.contact_info || 'Phone: 617.230.9777 | Email: joy.jiayiwang@gmail.com | Status: US Permanent Resident',
    targetCompany: result.target_company || company || 'Target Company',
    targetJobTitle: result.target_job_title || jobTitle || 'Target Role',
    atsScore: result.match_report?.ats_score ?? result.fit_analytics?.overall_match_score ?? 92,
    strategyRationale: result.match_report?.strategy_rationale || `针对 ${company || '该目标职位'} 的要求，从真实事实库中自动挑选契合度最高的核心成就与量化成果，严控虚构与编造。`,
    matchedKeywords: result.match_report?.matched_keywords ?? (Array.isArray(result.fit_analytics?.matched_skills) ? result.fit_analytics.matched_skills : ['Model Context Protocol (MCP)', 'Agentic Workflows', 'Observability', '0-to-1 Platform', 'Distributed Systems', 'SLOs']),
    summary: result.tailored_summary || result.summary_statement || `Senior Product Management Leader with 10+ years of product leadership, including 8+ years architecting enterprise-scale cloud platforms, AI-ready developer infrastructure, and observability data systems at Google Cloud. Proven track record driving 0-to-1 platform standardization, Model Context Protocol (MCP) agentic workflows, and distributed systems performance optimization.`,
    skillsCategories: (result.skills_categories?.length ? result.skills_categories : [
      { category: 'AI & Agent Ecosystem', skills: 'Model Context Protocol (MCP), Agentic Workflows & Trajectory Tracing, LLM Tool Use, Autonomous Coding Agents, BigQuery Data Plane' },
      { category: 'Cloud Infrastructure & Platforms', skills: 'Google Cloud Platform (Pantheon), API-First Component Frameworks, Self-Service Golden Paths, Distributed Query Systems' },
      { category: 'Governance, FinOps & Performance', skills: 'GKE Cost Insights, Workload Unit Economics, IAM Governance, Zero-Downtime Migration, Latency Optimization (SLOs)' },
      { category: 'Product Leadership & Strategy', skills: '0-to-1 Platform Standardization (Tech Impact Award), Product Intake Frameworks, CUJ Mapping, Influence Without Authority, Cross-Functional Alignment' }
    ]) as Array<{ category: string; skills: string }>,
    experiences: buildAllCanonicalExperiences(result.experiences, result.matched_facts, pageLength),
    education: result.education || 'MBA – Rotman School of Management, University of Toronto | BS – Computer Science, Fudan University',
    keynotesTalks: result.keynotes_talks || 'Featured Speaker at Google Cloud Next (MLB Observability Analytics, 4.7/5 rating) & GrafanaCon (2019); Authored 15+ official Google Cloud technical whitepapers and blogs on Query Telemetry with SQL for AI Observability, Log Analytics, and GKE Cost Visibility.',
    sideProjects: result.side_projects || 'Designed and built interactive learning website for youth financial literacy (invest-in-future.onrender.com), delivering engaging digital financial education experiences.'
  } : null;

  const copyToClipboard = () => {
    if (!normalized) return;
    let fullText = `${normalized.candidateName}\n${normalized.contactInfo}\n\n`;
    fullText += `EXECUTIVE SUMMARY\n${normalized.summary}\n\n`;
    fullText += `CORE COMPETENCIES & DOMAIN EXPERTISE\n`;
    normalized.skillsCategories.forEach(s => {
      fullText += `${s.category}: ${s.skills}\n`;
    });
    fullText += `\nPROFESSIONAL EXPERIENCE\n`;
    normalized.experiences.forEach(exp => {
      fullText += `${exp.company} — ${exp.role} (${exp.date_range})\n`;
      exp.bullets.forEach(b => {
        fullText += `• ${b.chosen_text}\n`;
      });
      fullText += `\n`;
    });
    if (pageLength === 2 && normalized.sideProjects) {
      fullText += `RECENT TECHNICAL SIDE PROJECTS\n${normalized.sideProjects}\n\n`;
    }
    if (normalized.keynotesTalks) {
      fullText += `KEYNOTES & TECHNICAL THOUGHT LEADERSHIP\n${normalized.keynotesTalks}\n\n`;
    }
    fullText += `EDUCATION\n${normalized.education}\n`;

    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to split experiences for 2-page view
  // Page 1: Google Cloud Platform (7 bullets)
  // Page 2: Prior 5 Employers (Scotiabank, Net Credit Group, eBay, Rogers, Google Inc - 10 bullets total)
  const gcpExperience = normalized?.experiences.find(e => e.company === 'Google Cloud Platform');
  const priorExperiences = normalized?.experiences.filter(e => e.company !== 'Google Cloud Platform') || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 2: 目标岗位 (JD) 智能匹配与简历定制</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            输入招聘网页 URL，一键量身定制匹配简历
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            系统将自动从你提供的公开职位链接中抓取核心职责与技能要求，基于你的 <strong>私有真实事实库 (Fact Base)</strong> 进行语义对齐，
            动态挑选最相关的项目经历、挑选最优表达变体，并生成契合该职位的定制摘要。<strong>100% 真实不造假</strong>。
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">操作提示</p>
            <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {scrapeSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-3 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold">抓取并解析成功</p>
            <p className="text-xs text-emerald-700 mt-0.5">{scrapeSuccess}</p>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            目标职位公开网页 URL (Job Description Link)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="例如：https://boards.greenhouse.io/... 或公司招聘页面"
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
              />
            </div>
            <button
              onClick={handleScrape}
              disabled={isScraping || !url.trim()}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shrink-0"
            >
              {isScraping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>抓取中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>一键抓取并解析</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Examples */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400">快速填入测试示例:</span>
            <button
              onClick={() => loadExample(
                'OpenAI',
                'Product Manager - AI Platform & Developer Infrastructure',
                'https://openai.com/careers/product-manager-platform',
                'OpenAI is seeking a Product Manager to lead developer platform infrastructure, Model Context Protocol (MCP), and agentic workflows. Responsibilities include building scalable telemetry, diagnostic observability for autonomous agents, API-first self-service developer tools, and driving enterprise platform adoption.'
              )}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              🤖 OpenAI (AI Platform PM)
            </button>
            <button
              onClick={() => loadExample(
                'Stripe',
                'Staff Product Manager - Observability & Distributed Infrastructure',
                'https://boards.greenhouse.io/stripe/jobs/infrastructure-pm',
                'Stripe is looking for a Staff Product Manager to lead cloud observability and distributed runtime systems. Responsibilities include architecting high-throughput query and intake pipelines, reducing API latency bottlenecks, driving zero-downtime platform migrations, and optimizing infrastructure cost economics (FinOps).'
              )}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              💳 Stripe (Infra & Observability PM)
            </button>
            <button
              onClick={() => loadExample(
                'Databricks',
                'Principal Product Manager - Platform-as-a-Product & Developer Experience',
                'https://jobs.lever.co/databricks/principal-pm-devex',
                'Lead our 0-to-1 developer platform initiatives. Drive Platform-as-a-Product operating models, self-service golden paths, standardized component frameworks across 20+ engineering organizations, and enterprise developer experience (DevEx).'
              )}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              🧱 Databricks (Platform & DevEx)
            </button>
          </div>
        </div>

        {/* Parsed / Edited Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>目标公司名称 (Target Company)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="如 OpenAI, Stripe, Databricks"
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>目标职位头衔 (Target Job Title)</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="如 Staff Product Manager - AI Infrastructure"
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Job Description Text Area */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <span>岗位招聘需求文本 (JD Content)</span>
              {jdText && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                  已填入 {jdText.length} 字符
                </span>
              )}
            </label>
            <button
              onClick={() => setShowManualPaste(!showManualPaste)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
            >
              <span>{showManualPaste ? '收起文本框' : '展开/手动编辑 JD 正文'}</span>
              {showManualPaste ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {(showManualPaste || jdText) && (
            <textarea
              rows={8}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="在此粘贴或检查抓取到的岗位说明书 (Requirements, Responsibilities, Qualifications)..."
              className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans text-slate-700 bg-slate-50/30 leading-relaxed"
            />
          )}
        </div>

        {/* Tailor Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span>目标篇幅:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                onClick={() => setPageLength(1)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  pageLength === 1 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                严格 1 页 (推荐)
              </button>
              <button
                onClick={() => setPageLength(2)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  pageLength === 2 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                2 页完整详细版
              </button>
            </div>
          </div>

          <button
            onClick={handleTailor}
            disabled={isTailoring || !jdText.trim()}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all flex items-center space-x-2"
          >
            {isTailoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在基于事实库进行精准匹配与定制...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>基于我的事实库生成专属匹配简历</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tailored Result Section */}
      {normalized && (
        <div id="tailored-result-section" className="space-y-6 animate-in fade-in duration-300">
          {/* Match Analysis Bar */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                <span className="text-xl font-black">{normalized.atsScore}%</span>
                <span className="text-[10px] font-medium tracking-tight uppercase">ATS 匹配度</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  针对 {normalized.targetCompany} · {normalized.targetJobTitle} 的定制方案已完成
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {normalized.strategyRationale}
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live Switch between 1-page and 2-page */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setPageLength(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    pageLength === 1
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>严格 1 页版 (9 条成就)</span>
                </button>
                <button
                  onClick={() => setPageLength(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    pageLength === 2
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2 页完整详细版 (17 条成就)</span>
                </button>
              </div>

              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{copySuccess ? '已复制！' : '复制全文'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>打印 / 存为 PDF</span>
              </button>
              <button
                onClick={() => setShowGoogleDocsModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>导出至 Google Docs</span>
              </button>
            </div>
          </div>

          {/* Matched Keywords Tags */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold mr-1">ATS 核心命中关键词:</span>
            {normalized.matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 font-medium text-xs border border-emerald-200"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{kw}</span>
              </span>
            ))}
          </div>

          {/* ==================== RESUME RENDERING ==================== */}
          {pageLength === 1 ? (
            /* ================= SINGLE PAGE COMPACT MODE (1-Page) ================= */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl max-w-4xl mx-auto space-y-4 font-sans text-slate-900 print:p-0 print:border-none print:shadow-none print:rounded-none">
              {/* Candidate Header */}
              <div className="text-center border-b border-slate-200 pb-2.5 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {normalized.candidateName}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {normalized.contactInfo}
                </p>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                  Executive Summary
                </h2>
                <p className="text-[12px] text-slate-800 leading-relaxed font-normal">
                  {normalized.summary}
                </p>
              </div>

              {/* Core Competencies */}
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                  Core Competencies & Domain Expertise
                </h2>
                <div className="space-y-0.5 text-xs">
                  {normalized.skillsCategories.map((sc, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                      <span className="font-bold text-slate-900 shrink-0 sm:w-48">{sc.category}:</span>
                      <span className="text-slate-700">{sc.skills}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work History (All 6 Companies: GCP 4 bullets + other 5 companies 1 bullet each = 9 bullets) */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                  Professional Experience
                </h2>

                {normalized.experiences.map((exp, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold">{exp.company}</strong>
                        <span className="text-slate-600 font-normal"> — {exp.role}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] shrink-0">{exp.date_range}</span>
                    </div>

                    <ul className="space-y-0.5 list-disc list-outside pl-4 text-[12px] text-slate-800 leading-normal">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="pl-0.5">
                          <span>{b.chosen_text}</span>
                          {b.variant_type && b.variant_type !== 'standard' && (
                            <span className="ml-2 inline-block px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-sans print:hidden">
                              {b.variant_type}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Keynotes & Thought Leadership */}
              {normalized.keynotesTalks && (
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                    Keynotes & Technical Thought Leadership
                  </h2>
                  <p className="text-[12px] text-slate-700 leading-normal">
                    {normalized.keynotesTalks}
                  </p>
                </div>
              )}

              {/* Education */}
              {normalized.education && (
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                    Education
                  </h2>
                  <p className="text-[12px] text-slate-700 font-medium">
                    {normalized.education}
                  </p>
                </div>
              )}

              {/* Page 1 Footer */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex justify-between items-center">
                <span>Joy Wang — Executive Resume</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          ) : (
            /* ================= 2-PAGE DETAILED EXECUTIVE MODE ================= */
            <div className="space-y-6">
              {/* PAGE 1: SHEET 1 (Header + Summary + Core Competencies + Google Cloud Platform All 7 Flagship Bullets) */}
              <div 
                className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl max-w-4xl mx-auto space-y-4 font-sans text-slate-900 page-break print:p-0 print:border-none print:shadow-none print:rounded-none"
                style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
              >
                {/* Candidate Header */}
                <div className="text-center border-b border-slate-200 pb-3 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {normalized.candidateName}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    {normalized.contactInfo}
                  </p>
                </div>

                {/* Executive Summary */}
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                    Executive Summary
                  </h2>
                  <p className="text-[12.5px] text-slate-800 leading-relaxed font-normal">
                    {normalized.summary}
                  </p>
                </div>

                {/* Core Competencies */}
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                    Core Competencies & Domain Expertise
                  </h2>
                  <div className="space-y-1 text-xs">
                    {normalized.skillsCategories.map((sc, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                        <span className="font-bold text-slate-900 shrink-0 sm:w-52">{sc.category}:</span>
                        <span className="text-slate-700">{sc.skills}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work History (Part 1 - Google Cloud Platform Expanded to 7 Bullets) */}
                <div className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 flex justify-between items-baseline">
                    <span>Professional Experience — Tenured Flagship Leadership</span>
                    <span className="text-[10px] text-slate-500 font-normal normal-case">Sheet 1 of 2</span>
                  </h2>

                  {gcpExperience && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <div>
                          <strong className="text-slate-900 font-bold text-sm">{gcpExperience.company}</strong>
                          <span className="text-slate-700 font-medium"> — {gcpExperience.role}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0">{gcpExperience.date_range}</span>
                      </div>

                      <ul className="space-y-1 list-disc list-outside pl-4 text-[12px] text-slate-800 leading-normal">
                        {gcpExperience.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="pl-0.5">
                            <span>{b.chosen_text}</span>
                            {b.variant_type && b.variant_type !== 'standard' && (
                              <span className="ml-2 inline-block px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-sans print:hidden">
                                {b.variant_type}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Page 1 Footer */}
                <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex justify-between items-center">
                  <span>Joy Wang — Executive Resume (Page 1 of 2)</span>
                  <span>Targeted for {normalized.targetCompany} · {normalized.targetJobTitle}</span>
                </div>
              </div>

              {/* Physical Page Break Visual Indicator in Web View (Hidden on Print) */}
              <div className="print:hidden max-w-4xl mx-auto flex items-center justify-center py-2 space-x-3 text-slate-400 text-xs">
                <div className="h-px bg-slate-300 flex-1"></div>
                <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center space-x-1.5 shadow-xs">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>📄 物理分页线 · 第 2 页 (Page 2 of 2)</span>
                </div>
                <div className="h-px bg-slate-300 flex-1"></div>
              </div>

              {/* PAGE 2: SHEET 2 (Prior 5 Employers with 2 Bullets each = 10 bullets + Side Projects + Keynotes + Education) */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl max-w-4xl mx-auto space-y-4 font-sans text-slate-900 print:p-0 print:border-none print:shadow-none print:rounded-none">
                {/* Sheet 2 Header */}
                <div className="flex justify-between items-baseline border-b border-slate-200 pb-2 text-xs text-slate-600 font-medium">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{normalized.candidateName}</span>
                    <span className="text-slate-400 ml-2">| Prior Professional Experience & Extended Record</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">joy.jiayiwang@gmail.com · 617.230.9777</span>
                </div>

                {/* Prior Experiences (5 Employers x 2 Bullets = 10 Bullets) */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                    Professional Experience (Continued)
                  </h2>

                  {priorExperiences.map((exp, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <div>
                          <strong className="text-slate-900 font-bold">{exp.company}</strong>
                          <span className="text-slate-600 font-normal"> — {exp.role}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0">{exp.date_range}</span>
                      </div>

                      <ul className="space-y-0.5 list-disc list-outside pl-4 text-[12px] text-slate-800 leading-normal">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="pl-0.5">
                            <span>{b.chosen_text}</span>
                            {b.variant_type && b.variant_type !== 'standard' && (
                              <span className="ml-2 inline-block px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-sans print:hidden">
                                {b.variant_type}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Keynotes & Thought Leadership */}
                {normalized.keynotesTalks && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                      Keynotes & Technical Thought Leadership
                    </h2>
                    <p className="text-[12px] text-slate-700 leading-normal">
                      {normalized.keynotesTalks}
                    </p>
                  </div>
                )}

                {/* Recent Technical Side Projects */}
                {normalized.sideProjects && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                      Recent Technical Side Projects
                    </h2>
                    <p className="text-[12px] text-slate-700 leading-normal">
                      {normalized.sideProjects}
                    </p>
                  </div>
                )}

                {/* Education */}
                {normalized.education && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">
                      Education
                    </h2>
                    <p className="text-[12px] text-slate-700 font-medium">
                      {normalized.education}
                    </p>
                  </div>
                )}

                {/* Page 2 Footer */}
                <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex justify-between items-center">
                  <span>Joy Wang — Executive Resume (Page 2 of 2)</span>
                  <span>Status: US Permanent Resident</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {normalized && (
        <GoogleDocsExportModal
          isOpen={showGoogleDocsModal}
          onClose={() => setShowGoogleDocsModal(false)}
          resumeData={{
            candidateName: normalized.candidateName,
            contactInfo: normalized.contactInfo,
            targetCompany: normalized.targetCompany,
            targetJobTitle: normalized.targetJobTitle,
            summary: normalized.summary,
            skillsCategories: normalized.skillsCategories,
            experiences: normalized.experiences,
            sideProjects: normalized.sideProjects,
            keynotesTalks: normalized.keynotesTalks,
            education: normalized.education,
            pageLength: pageLength,
          }}
        />
      )}
    </div>
  );
};
