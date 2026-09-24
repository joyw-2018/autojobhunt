import React from 'react';
import { Layers, Globe, Sparkles, Clock, CheckCircle, ExternalLink } from 'lucide-react';

export const BatchTailorPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">批量 5 个 JD 网页 URL 并发定制 (Phase 2)</h2>
            <p className="text-xs text-slate-500">
              一次性粘贴 1~5 个公开职位网页链接，自动抓取去噪，并发挑选事实库最优组合，生成对应简历
            </p>
          </div>
        </div>

        {/* Mock URL inputs */}
        <div className="space-y-3 pt-2">
          {[
            'https://boards.greenhouse.io/stripe/jobs/4829103 - Senior Backend Engineer',
            'https://jobs.lever.co/databricks/772183 - Staff Platform Infrastructure Engineer',
            'https://careers.google.com/jobs/results/19283 - Senior Software Engineer III',
            'https://jobs.netflix.com/jobs/839102 - Distributed Systems Engineer',
            'https://openai.com/careers/software-engineer-platform',
          ].map((url, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                {i + 1}
              </span>
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-700 truncate flex-1">{url}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                就绪
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Phase 1 事实库就绪后，此模块将作为 Phase 2 立即接入。</span>
          <button disabled className="px-4 py-2 bg-indigo-600/40 text-white rounded-xl font-medium cursor-not-allowed">
            开始并发生成 5 份针对性简历 (即将上线)
          </button>
        </div>
      </div>
    </div>
  );
};
