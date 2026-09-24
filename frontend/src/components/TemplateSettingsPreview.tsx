import React from 'react';
import { Sliders, Type, Layout, ShieldCheck, Check } from 'lucide-react';

export const TemplateSettingsPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Google Docs 个人专属排版与样式规范 (Phase 3)</h2>
            <p className="text-xs text-slate-500">
              结构、字体、字号、边距由你完全定义，生成时严格调用 Google Docs API 自动化写入
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          {/* Typography Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Type className="w-4 h-4 text-indigo-500" />
              <span>文字排印与各级字号规则</span>
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">全文字体族 (Font Family):</span>
                <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Calibri / Arial
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">候选人姓名 (Candidate Name):</span>
                <span className="font-mono font-semibold text-slate-900">20 pt (Bold, Center)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">一级大标题 (Section Headers):</span>
                <span className="font-mono font-semibold text-slate-900">11 pt (Bold, ALL CAPS, 细分割线)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">公司与职位行 (Role & Org):</span>
                <span className="font-mono font-semibold text-slate-900">10.5 pt (Company Bold, Date Right)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">正文与 Bullet Points:</span>
                <span className="font-mono font-semibold text-slate-900">9.5 pt (行距 1.15, 段后 2.5pt)</span>
              </div>
            </div>
          </div>

          {/* Page Setup & Constraints */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Layout className="w-4 h-4 text-violet-500" />
              <span>版面边距与单页严格约束</span>
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">纸张尺寸:</span>
                <span className="font-mono font-semibold text-slate-900">US Letter (8.5 × 11 in)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">页面边距 (Margins):</span>
                <span className="font-mono font-semibold text-slate-900">0.5 英寸 (36 pt)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">单页防溢出微调 (Page Fit):</span>
                <span className="inline-flex items-center text-emerald-700 font-semibold space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>已开启自动自适应 (1 页整)</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">目标 Google Drive 目录:</span>
                <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  /AutoJobHunt/Resumes/2026/
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
