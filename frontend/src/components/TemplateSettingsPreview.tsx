import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Type, 
  Layout, 
  MinusCircle, 
  Check, 
  RotateCcw, 
  Save, 
  Sparkles, 
  FileText,
  AlignLeft,
  AlignCenter,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { 
  GoogleDocsFormatConfig, 
  DEFAULT_DOC_FORMAT, 
  FORMAT_PRESETS, 
  docFormatService 
} from '../services/docFormatService';

export const TemplateSettingsPreview: React.FC = () => {
  const [config, setConfig] = useState<GoogleDocsFormatConfig>(() => docFormatService.getStoredConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setConfig(e.detail);
    };
    window.addEventListener('doc-format-updated', handleUpdate);
    return () => window.removeEventListener('doc-format-updated', handleUpdate);
  }, []);

  const handleChange = <K extends keyof GoogleDocsFormatConfig>(key: K, value: GoogleDocsFormatConfig[K]) => {
    setActivePreset(null);
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = FORMAT_PRESETS[presetKey];
    if (!preset) return;
    const newConfig: GoogleDocsFormatConfig = {
      ...config,
      ...preset.config,
    };
    setConfig(newConfig);
    setActivePreset(presetKey);
    docFormatService.saveStoredConfig(newConfig);
    showSavedFeedback();
  };

  const handleSave = () => {
    docFormatService.saveStoredConfig(config);
    showSavedFeedback();
  };

  const handleReset = () => {
    const def = docFormatService.resetToDefault();
    setConfig(def);
    setActivePreset(null);
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Font choices
  const fontFamilies = [
    { label: 'Arial (现代无衬线)', value: 'Arial' },
    { label: 'Calibri (微软官方正文)', value: 'Calibri' },
    { label: 'Times New Roman (常青藤经典)', value: 'Times New Roman' },
    { label: 'Georgia (优雅衬线)', value: 'Georgia' },
    { label: 'Garamond (出版物排版)', value: 'Garamond' },
    { label: 'Roboto (Google 标准体)', value: 'Roboto' },
    { label: 'Inter (UI 极简风)', value: 'Inter' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Google Docs 专属排版规范与样式配置</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                实时自定义
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              自主定义字体族、字号层级、行距与版面边距，已默认彻底移除多余横线干扰，所见即所得
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复默认</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-100 transition-all hover:shadow-none"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? '排版已保存！' : '保存排版规范'}</span>
          </button>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(FORMAT_PRESETS).map(([key, p]) => (
          <div
            key={key}
            onClick={() => handleApplyPreset(key)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activePreset === key
                ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-slate-900">{p.name}</span>
              {activePreset === key && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Main Settings & Live Preview Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Panel: 5 Cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Lines & Dividers (Highlighted per user request) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <MinusCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">横线与分割样式 (已去多余横线)</h3>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs text-amber-800 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5 text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>已去除 Docs 中的多余横线干扰</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700">
                默认已关闭小节标题和姓名下方的黑/灰实线分割线，使 Google Docs 与预览保持无横线现代极简质感。
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">小节标题下方横线 (Section Dividers)</div>
                  <div className="text-[11px] text-slate-500">在每个大标题下方生成横向分割线</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('showSectionDividers', !config.showSectionDividers)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.showSectionDividers ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      config.showSectionDividers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">姓名联系栏下方横线 (Header Divider)</div>
                  <div className="text-[11px] text-slate-500">在候选人姓名与联系方式下方绘制分隔线</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('showHeaderDivider', !config.showHeaderDivider)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.showHeaderDivider ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      config.showHeaderDivider ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Typography */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Type className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">文字排印与字号层级</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Font Family */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">全文字体族 (Font Family)</label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {fontFamilies.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Candidate Name Size & Alignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">姓名大标题</label>
                    <span className="font-mono text-slate-900 font-bold">{config.candidateNameSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={26}
                    step={1}
                    value={config.candidateNameSize}
                    onChange={(e) => handleChange('candidateNameSize', Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">姓名对齐</label>
                  <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleChange('candidateNameAlign', 'center')}
                      className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        config.candidateNameAlign === 'center' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      居中
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('candidateNameAlign', 'left')}
                      className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        config.candidateNameAlign === 'left' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      居左
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Header Size */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-semibold">一级小节标题 (Section Headers)</label>
                  <span className="font-mono text-slate-900 font-bold">{config.sectionHeaderSize} pt</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={14}
                  step={0.5}
                  value={config.sectionHeaderSize}
                  onChange={(e) => handleChange('sectionHeaderSize', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Role & Org Size */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-semibold">经历机构与职位 (Role & Org)</label>
                  <span className="font-mono text-slate-900 font-bold">{config.roleAndOrgSize} pt</span>
                </div>
                <input
                  type="range"
                  min={9.5}
                  max={12}
                  step={0.5}
                  value={config.roleAndOrgSize}
                  onChange={(e) => handleChange('roleAndOrgSize', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Body & Bullet Size */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-semibold">正文与 Bullet Points</label>
                  <span className="font-mono text-slate-900 font-bold">{config.bodySize} pt</span>
                </div>
                <input
                  type="range"
                  min={8.5}
                  max={11}
                  step={0.5}
                  value={config.bodySize}
                  onChange={(e) => handleChange('bodySize', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Line Spacing */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">行距倍率</label>
                  <select
                    value={config.lineSpacing}
                    onChange={(e) => handleChange('lineSpacing', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={1.15}>1.15 倍 (超紧凑)</option>
                    <option value={1.2}>1.20 倍 (大厂紧凑)</option>
                    <option value={1.25}>1.25 倍 (黄金比例)</option>
                    <option value={1.35}>1.35 倍 (舒适阅读)</option>
                    <option value={1.5}>1.50 倍 (宽松版面)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">标题全大写</label>
                  <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleChange('sectionHeaderUppercase', true)}
                      className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        config.sectionHeaderUppercase ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ALL CAPS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('sectionHeaderUppercase', false)}
                      className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                        !config.sectionHeaderUppercase ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      标准大小写
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Margins & Drive */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">版面边距与存储目标</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">纸张尺寸</label>
                  <select
                    value={config.paperSize}
                    onChange={(e) => handleChange('paperSize', e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="letter">US Letter (8.5 × 11 in)</option>
                    <option value="a4">A4 (210 × 297 mm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">四周页边距</label>
                  <select
                    value={config.marginInches}
                    onChange={(e) => handleChange('marginInches', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={0.5}>0.5 英寸 (36 pt 紧凑)</option>
                    <option value={0.75}>0.75 英寸 (54 pt 标准)</option>
                    <option value={1.0}>1.0 英寸 (72 pt 宽松)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">默认目标 Google Drive 目录</label>
                <input
                  type="text"
                  value={config.driveTargetFolder}
                  onChange={(e) => handleChange('driveTargetFolder', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="/AutoJobHunt/Resumes/2026/"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Sheet: 7 Cols */}
        <div className="lg:col-span-7 sticky top-24 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>所见即所得：Google Docs 实时渲染预览 (当前已无额外横线)</span>
            </span>
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {config.fontFamily} · {config.paperSize.toUpperCase()} · 边距 {config.marginInches}in
            </span>
          </div>

          {/* Visual Paper Sheet */}
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all"
            style={{
              padding: `${Math.round(config.marginInches * 50)}px`,
              fontFamily: `${config.fontFamily}, Arial, sans-serif`,
              lineHeight: config.lineSpacing,
            }}
          >
            {/* Candidate Header */}
            <div 
              style={{
                textAlign: config.candidateNameAlign,
                borderBottom: config.showHeaderDivider ? `1px solid ${config.dividerColor}` : 'none',
                paddingBottom: config.showHeaderDivider ? '10px' : '6px',
                marginBottom: '12px',
              }}
            >
              <h1 
                style={{
                  fontSize: `${config.candidateNameSize}px`,
                  fontWeight: config.candidateNameBold ? 'bold' : '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0',
                }}
              >
                Joy Wang
              </h1>
              <p style={{ fontSize: `${Math.max(11, config.bodySize)}px`, color: '#475569', margin: 0 }}>
                San Francisco, CA · +1 (650) 000-0000 · joywang@example.com · linkedin.com/in/joywang
              </p>
            </div>

            {/* Executive Summary Section */}
            <div style={{ marginBottom: '14px' }}>
              <h2
                style={{
                  fontSize: `${config.sectionHeaderSize * 1.15}px`,
                  fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                  textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                  letterSpacing: '0.5px',
                  color: '#0f172a',
                  borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor}` : 'none',
                  paddingBottom: config.showSectionDividers ? '3px' : '2px',
                  marginBottom: '6px',
                }}
              >
                Executive Summary
              </h2>
              <p style={{ fontSize: `${config.bodySize * 1.15}px`, color: '#334155', margin: 0 }}>
                Staff Product Manager with 10+ years scaling enterprise platform infrastructure, AI agent workflows, and telemetry systems. Owned $30M+ ARR monetization surfaces and architected mission-critical analytics distributed to 250,000+ business customers.
              </p>
            </div>

            {/* Core Competencies Section */}
            <div style={{ marginBottom: '14px' }}>
              <h2
                style={{
                  fontSize: `${config.sectionHeaderSize * 1.15}px`,
                  fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                  textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                  letterSpacing: '0.5px',
                  color: '#0f172a',
                  borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor}` : 'none',
                  paddingBottom: config.showSectionDividers ? '3px' : '2px',
                  marginBottom: '6px',
                }}
              >
                Core Competencies & Domain Expertise
              </h2>
              <div style={{ fontSize: `${config.bodySize * 1.15}px`, color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>Platform Architecture:</strong> Distributed Query Engines, Multi-Tenant Telemetry, MCP Interoperability
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Product Growth:</strong> Credit-Based Monetization, PLG Funnels, Enterprise Upgrades
                </div>
              </div>
            </div>

            {/* Professional Experience Section */}
            <div style={{ marginBottom: '14px' }}>
              <h2
                style={{
                  fontSize: `${config.sectionHeaderSize * 1.15}px`,
                  fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                  textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                  letterSpacing: '0.5px',
                  color: '#0f172a',
                  borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor}` : 'none',
                  paddingBottom: config.showSectionDividers ? '3px' : '2px',
                  marginBottom: '6px',
                }}
              >
                Professional Experience
              </h2>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: `${config.roleAndOrgSize * 1.15}px` }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                    Google Cloud Platform <span style={{ fontWeight: 'normal', color: '#475569' }}>— Staff Product Manager</span>
                  </span>
                  <span style={{ fontSize: `${config.bodySize}px`, color: '#64748b', fontFamily: 'monospace' }}>2021 — Present</span>
                </div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: `${config.bodySize * 1.15}px`, color: '#334155' }}>
                  <li style={{ marginBottom: `${config.paragraphSpacing}px` }}>
                    Spearheaded Google Cloud Observability Log Analytics platform, expanding enterprise query telemetry to over 100K customer clusters.
                  </li>
                  <li style={{ marginBottom: `${config.paragraphSpacing}px` }}>
                    Delivered automated cost optimization and distributed SQL engines, reducing large-scale data ingestion latency by 38%.
                  </li>
                </ul>
              </div>
            </div>

            {/* Page Footer Visual Stamp */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Joy Wang — Customized Resume Sheet</span>
              <span>100% Google Docs Compatible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
