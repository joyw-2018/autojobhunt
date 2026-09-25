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
  Palette,
  Copy,
  Printer,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  GoogleDocsFormatConfig, 
  DEFAULT_DOC_FORMAT, 
  FORMAT_PRESETS, 
  docFormatService 
} from '../services/docFormatService';
import { tailorResumeService } from '../services/tailorResumeService';
import { GoogleDocsExportModal } from './GoogleDocsExportModal';

export const TemplateSettingsPreview: React.FC = () => {
  const [config, setConfig] = useState<GoogleDocsFormatConfig>(() => docFormatService.getStoredConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Resume state from tailorResumeService
  const initialTailor = tailorResumeService.getStoredState();
  const [previewPageLength, setPreviewPageLength] = useState<number>(initialTailor.pageLength || 2);
  const [resumeState, setResumeState] = useState(() => tailorResumeService.getActiveResumeExportData(initialTailor.pageLength || 2));
  const [forceMaster, setForceMaster] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setConfig(e.detail);
    };
    const handleTailorUpdate = () => {
      setResumeState(tailorResumeService.getActiveResumeExportData(previewPageLength));
    };
    window.addEventListener('doc-format-updated', handleUpdate);
    window.addEventListener('tailored-resume-updated', handleTailorUpdate);
    return () => {
      window.removeEventListener('doc-format-updated', handleUpdate);
      window.removeEventListener('tailored-resume-updated', handleTailorUpdate);
    };
  }, [previewPageLength]);

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
    setActivePreset('joy_wang_official');
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const currentResumeData = (forceMaster || !resumeState.isTailored)
    ? tailorResumeService.getActiveResumeExportData(previewPageLength).data
    : resumeState.data;

  const handleCopy = () => {
    let text = `${currentResumeData.candidateName}\n${currentResumeData.contactInfo}\n\n`;
    text += `EXECUTIVE SUMMARY\n${currentResumeData.summary}\n\n`;
    text += `CORE COMPETENCIES & DOMAIN EXPERTISE\n`;
    currentResumeData.skillsCategories.forEach(sc => {
      text += `${sc.category}: ${sc.skills}\n`;
    });
    text += `\nPROFESSIONAL EXPERIENCE\n`;
    currentResumeData.experiences.forEach(exp => {
      text += `${exp.company} — ${exp.role} (${exp.date_range})\n`;
      exp.bullets.forEach(b => {
        text += `• ${b.chosen_text}\n`;
      });
      text += `\n`;
    });
    if (previewPageLength === 2 && currentResumeData.sideProjects) {
      text += `RECENT TECHNICAL SIDE PROJECTS\n${currentResumeData.sideProjects}\n\n`;
    }
    if (currentResumeData.keynotesTalks) {
      text += `KEYNOTES & TECHNICAL THOUGHT LEADERSHIP\n${currentResumeData.keynotesTalks}\n\n`;
    }
    if (currentResumeData.education) {
      text += `EDUCATION\n${currentResumeData.education}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Font family dropdown options
  const fontFamilies = [
    { label: 'Arial (官方默认 · 现代无衬线)', value: 'Arial' },
    { label: 'Calibri (微软官方正文)', value: 'Calibri' },
    { label: 'Times New Roman (常青藤经典衬线)', value: 'Times New Roman' },
    { label: 'Georgia (优雅衬线体)', value: 'Georgia' },
    { label: 'Garamond (学术出版排版)', value: 'Garamond' },
    { label: 'Roboto (Google 官方体)', value: 'Roboto' },
    { label: 'Inter (现代 UI 极简风)', value: 'Inter' },
  ];

  // Font size dropdown options
  const candidateNameSizes = [
    { label: '18 pt (紧凑)', value: 18 },
    { label: '20 pt (标准)', value: 20 },
    { label: '22 pt (22pt · 官方默认)', value: 22 },
    { label: '24 pt (醒目加粗)', value: 24 },
    { label: '26 pt (大气突出)', value: 26 },
    { label: '28 pt (特大)', value: 28 },
  ];

  const sectionHeaderSizes = [
    { label: '10.0 pt (超紧凑)', value: 10.0 },
    { label: '10.5 pt (紧凑)', value: 10.5 },
    { label: '11.0 pt (11pt · 官方默认)', value: 11.0 },
    { label: '11.5 pt (适中)', value: 11.5 },
    { label: '12.0 pt (醒目)', value: 12.0 },
    { label: '13.0 pt (大标题)', value: 13.0 },
  ];

  const roleOrgSizes = [
    { label: '9.5 pt (紧凑)', value: 9.5 },
    { label: '10.0 pt (标准)', value: 10.0 },
    { label: '10.5 pt (10.5pt · 官方默认)', value: 10.5 },
    { label: '11.0 pt (突出)', value: 11.0 },
    { label: '11.5 pt (大号)', value: 11.5 },
  ];

  const bodySizes = [
    { label: '8.5 pt (超小号)', value: 8.5 },
    { label: '9.0 pt (小号)', value: 9.0 },
    { label: '9.5 pt (紧凑大厂)', value: 9.5 },
    { label: '10.0 pt (10pt · 官方默认)', value: 10.0 },
    { label: '10.5 pt (舒适易读)', value: 10.5 },
    { label: '11.0 pt (大字号)', value: 11.0 },
  ];

  const contactInfoSizes = [
    { label: '8.5 pt (超小)', value: 8.5 },
    { label: '9.0 pt (紧凑)', value: 9.0 },
    { label: '9.5 pt (9.5pt · 官方默认)', value: 9.5 },
    { label: '10.0 pt (标准)', value: 10.0 },
  ];

  const lineSpacings = [
    { label: '1.15 倍 (超紧凑)', value: 1.15 },
    { label: '1.20 倍 (大厂紧凑)', value: 1.20 },
    { label: '1.25 倍 (经典比例)', value: 1.25 },
    { label: '1.28 倍 (1.28x · 官方默认)', value: 1.28 },
    { label: '1.35 倍 (舒适易读)', value: 1.35 },
    { label: '1.50 倍 (宽松版面)', value: 1.50 },
  ];

  const paragraphSpacings = [
    { label: '2 pt (超紧凑)', value: 2 },
    { label: '3 pt (紧凑 3pt)', value: 3 },
    { label: '4 pt (4pt · 官方默认)', value: 4 },
    { label: '5 pt (适中 5pt)', value: 5 },
    { label: '6 pt (宽松 6pt)', value: 6 },
  ];

  const headerColors = [
    { label: '经典大厂深蓝 (#1e3a8a · 官方默认)', value: '#1e3a8a' },
    { label: '纯净深邃黑 (#0f172a)', value: '#0f172a' },
    { label: '商务靛蓝 (#1d4ed8)', value: '#1d4ed8' },
    { label: '石板深灰 (#334155)', value: '#334155' },
  ];

  const marginOptions = [
    { label: '0.50 英寸 (36 pt 紧凑)', value: 0.5 },
    { label: '0.65 英寸 (47 pt 平衡)', value: 0.65 },
    { label: '0.75 英寸 (54 pt · 官方默认)', value: 0.75 },
    { label: '1.00 英寸 (72 pt 宽松)', value: 1.0 },
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
                下拉菜单精准操控
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              已对齐 Joy Wang 最新官方 PDF 格式规范（Arial 22pt/11pt/10pt，大厂蓝标题，小节零横线），所有字体字号均可通过下拉菜单自由调配
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复官方默认</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-100 transition-all hover:shadow-none"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? '排版已保存！' : '保存排版规范'}</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>导出此版至 Google Docs</span>
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
                ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
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
          {/* Section 1: Typography Dropdowns (All controlled by select) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Type className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">字体与字号操控 (下拉菜单选择)</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 1. Font Family Dropdown */}
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

              {/* 2. Candidate Name Size Dropdown & Alignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">候选人姓名大小</label>
                  <select
                    value={config.candidateNameSize}
                    onChange={(e) => handleChange('candidateNameSize', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {candidateNameSizes.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">姓名对齐方式</label>
                  <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleChange('candidateNameAlign', 'center')}
                      className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                        config.candidateNameAlign === 'center' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      居中 (默认)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('candidateNameAlign', 'left')}
                      className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                        config.candidateNameAlign === 'left' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      居左
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Section Header Size & Header Color Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">一级小节标题大小</label>
                  <select
                    value={config.sectionHeaderSize}
                    onChange={(e) => handleChange('sectionHeaderSize', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {sectionHeaderSizes.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">小节标题颜色</label>
                  <select
                    value={config.sectionHeaderColor || '#1e3a8a'}
                    onChange={(e) => handleChange('sectionHeaderColor', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {headerColors.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Role & Org Size Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">公司与职位行大小</label>
                  <select
                    value={config.roleAndOrgSize}
                    onChange={(e) => handleChange('roleAndOrgSize', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {roleOrgSizes.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">正文与 Bullet 大小</label>
                  <select
                    value={config.bodySize}
                    onChange={(e) => handleChange('bodySize', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {bodySizes.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. Contact Info Size & Line Spacing Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">联系信息大小</label>
                  <select
                    value={config.contactInfoSize || 9.5}
                    onChange={(e) => handleChange('contactInfoSize', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {contactInfoSizes.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">全文行距倍率</label>
                  <select
                    value={config.lineSpacing}
                    onChange={(e) => handleChange('lineSpacing', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {lineSpacings.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6. Paragraph / Bullet Spacing & Uppercase toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">条目与段落间距</label>
                  <select
                    value={config.paragraphSpacing}
                    onChange={(e) => handleChange('paragraphSpacing', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {paragraphSpacings.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">小节标题大小写</label>
                  <select
                    value={config.sectionHeaderUppercase ? 'upper' : 'normal'}
                    onChange={(e) => handleChange('sectionHeaderUppercase', e.target.value === 'upper')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="upper">全部大写 ALL CAPS (默认)</option>
                    <option value="normal">首字母大写 Title Case</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Lines & Dividers Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <MinusCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">横线与分割样式操控</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Section Dividers Dropdown */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">小节标题下方横线 (Section Dividers)</label>
                <select
                  value={config.showSectionDividers ? 'show' : 'hide'}
                  onChange={(e) => handleChange('showSectionDividers', e.target.value === 'show')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="hide">无横线 (纯净大方 · 官方默认，去掉额外横线)</option>
                  <option value="show">显示横线 (粗细 1pt)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  官方 PDF 规范：小节标题下方不带任何横向划线，保持视觉通透与层次感。
                </p>
              </div>

              {/* Header Divider Dropdown */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">姓名联系栏下方横线 (Header Divider)</label>
                <select
                  value={config.showHeaderDivider ? 'show' : 'hide'}
                  onChange={(e) => handleChange('showHeaderDivider', e.target.value === 'show')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="show">显示深色实线分割 (对齐官方 PDF 规范)</option>
                  <option value="hide">无横线 (纯空白过渡)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  官方 PDF 规范：在顶部联系电话/邮箱行下方呈现单条利落深色分割线。
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Margins & Storage */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">版面边距与存储目标</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">纸张尺寸</label>
                  <select
                    value={config.paperSize}
                    onChange={(e) => handleChange('paperSize', e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {marginOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">默认目标 Google Drive 目录</label>
                <input
                  type="text"
                  value={config.driveTargetFolder}
                  onChange={(e) => handleChange('driveTargetFolder', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="/AutoJobHunt/Resumes/2026/"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Sheet: 7 Cols (Rendered with real tailored resume or master) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Active Tailored Resume Banner */}
          {resumeState.isTailored && !forceMaster ? (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>正在排版当前生成的专属定制简历：</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                      {resumeState.company} · {resumeState.jobTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    基于您在「JD 智能定制」生成的事实匹配成果，当前所做的所有字体、字号、间距微调将直接作用于此版本。
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setForceMaster(true)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium transition-colors"
                >
                  查看通用母版
                </button>
              </div>
            </div>
          ) : forceMaster ? (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-600">当前正在查看官方通用母版简历</span>
              <button
                onClick={() => setForceMaster(false)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow-xs"
              >
                返回查看 {resumeState.company} 定制简历
              </button>
            </div>
          ) : (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
              <span>💡 当前为官方标准母版预览。若在「JD 智能定制简历」中输入岗位要求生成了专属简历，将自动无缝同步至此处供您排版并导出。</span>
            </div>
          )}

          {/* Sub Toolbar: Page length switch, copy, print, export */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1.5 font-bold text-slate-800">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>实时排版渲染预览</span>
              </span>
              <div className="inline-flex rounded-xl p-0.5 bg-slate-200/70 border border-slate-300/60">
                <button
                  onClick={() => {
                    setPreviewPageLength(1);
                    setResumeState(tailorResumeService.getActiveResumeExportData(1));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewPageLength === 1 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  严格 1 页版
                </button>
                <button
                  onClick={() => {
                    setPreviewPageLength(2);
                    setResumeState(tailorResumeService.getActiveResumeExportData(2));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewPageLength === 2 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2 页完整版
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copySuccess ? '已复制！' : '复制全文'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>打印 / PDF</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>导出至 Google Docs</span>
              </button>
            </div>
          </div>

          {/* Visual Paper Sheet */}
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all text-slate-900"
            style={{
              padding: `${Math.round(config.marginInches * 60)}px`,
              fontFamily: `${config.fontFamily}, Arial, sans-serif`,
              lineHeight: config.lineSpacing,
            }}
          >
            {/* Candidate Header */}
            <div 
              style={{
                textAlign: config.candidateNameAlign,
                borderBottom: config.showHeaderDivider ? `${config.dividerThickness || 1.5}px solid ${config.dividerColor || '#0f172a'}` : 'none',
                paddingBottom: config.showHeaderDivider ? '10px' : '4px',
                marginBottom: '14px',
              }}
            >
              <h1 
                style={{
                  fontSize: `${config.candidateNameSize * 1.15}px`,
                  fontWeight: config.candidateNameBold ? 'bold' : '600',
                  color: '#0f172a',
                  margin: '0 0 6px 0',
                }}
              >
                {currentResumeData.candidateName}
              </h1>
              <p style={{ fontSize: `${(config.contactInfoSize || 9.5) * 1.1}px`, color: '#1e293b', margin: 0 }}>
                {currentResumeData.contactInfo}
              </p>
            </div>

            {/* EXECUTIVE SUMMARY Section */}
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: `${config.sectionHeaderSize * 1.15}px`,
                  fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                  textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                  letterSpacing: '0.5px',
                  color: config.sectionHeaderColor || '#1e3a8a',
                  borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor || '#1e3a8a'}` : 'none',
                  paddingBottom: config.showSectionDividers ? '3px' : '0px',
                  marginBottom: '6px',
                }}
              >
                EXECUTIVE SUMMARY
              </h2>
              <p style={{ fontSize: `${config.bodySize * 1.1}px`, color: '#1e293b', margin: 0 }}>
                {currentResumeData.summary}
              </p>
            </div>

            {/* CORE COMPETENCIES & DOMAIN EXPERTISE Section */}
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: `${config.sectionHeaderSize * 1.15}px`,
                  fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                  textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                  letterSpacing: '0.5px',
                  color: config.sectionHeaderColor || '#1e3a8a',
                  borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor || '#1e3a8a'}` : 'none',
                  paddingBottom: config.showSectionDividers ? '3px' : '0px',
                  marginBottom: '6px',
                }}
              >
                CORE COMPETENCIES & DOMAIN EXPERTISE
              </h2>
              <div style={{ fontSize: `${config.bodySize * 1.1}px`, color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {currentResumeData.skillsCategories.map((sc, i) => (
                  <div key={i}>
                    <strong style={{ color: '#0f172a' }}>{sc.category}:</strong>
                    <span style={{ color: '#334155' }}> {sc.skills}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WORK HISTORY Section */}
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: `${config.sectionHeaderSize * 1.15}px`,
                  fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                  textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                  letterSpacing: '0.5px',
                  color: config.sectionHeaderColor || '#1e3a8a',
                  borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor || '#1e3a8a'}` : 'none',
                  paddingBottom: config.showSectionDividers ? '3px' : '0px',
                  marginBottom: '6px',
                }}
              >
                WORK HISTORY
              </h2>

              {currentResumeData.experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: `${config.paragraphSpacing * 2.2}px` }}>
                  <div style={{ fontSize: `${config.roleAndOrgSize * 1.1}px`, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{exp.company}</strong>
                      <span style={{ color: '#475569' }}> — {exp.role}</span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '9pt', fontFamily: 'monospace' }}>{exp.date_range}</span>
                  </div>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: `${config.bodySize * 1.1}px`, color: '#1e293b', listStyleType: 'disc' }}>
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: `${config.paragraphSpacing}px` }}>
                        {b.chosen_text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Keynotes & Thought Leadership */}
            {currentResumeData.keynotesTalks && (
              <div style={{ marginBottom: '16px' }}>
                <h2
                  style={{
                    fontSize: `${config.sectionHeaderSize * 1.15}px`,
                    fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                    textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                    letterSpacing: '0.5px',
                    color: config.sectionHeaderColor || '#1e3a8a',
                    borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor || '#1e3a8a'}` : 'none',
                    paddingBottom: config.showSectionDividers ? '3px' : '0px',
                    marginBottom: '6px',
                  }}
                >
                  KEYNOTES & TECHNICAL THOUGHT LEADERSHIP
                </h2>
                <p style={{ fontSize: `${config.bodySize * 1.1}px`, color: '#1e293b', margin: 0 }}>
                  {currentResumeData.keynotesTalks}
                </p>
              </div>
            )}

            {/* Recent Technical Side Projects */}
            {previewPageLength === 2 && currentResumeData.sideProjects && (
              <div style={{ marginBottom: '16px' }}>
                <h2
                  style={{
                    fontSize: `${config.sectionHeaderSize * 1.15}px`,
                    fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                    textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                    letterSpacing: '0.5px',
                    color: config.sectionHeaderColor || '#1e3a8a',
                    borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor || '#1e3a8a'}` : 'none',
                    paddingBottom: config.showSectionDividers ? '3px' : '0px',
                    marginBottom: '6px',
                  }}
                >
                  RECENT TECHNICAL SIDE PROJECTS
                </h2>
                <p style={{ fontSize: `${config.bodySize * 1.1}px`, color: '#1e293b', margin: 0 }}>
                  {currentResumeData.sideProjects}
                </p>
              </div>
            )}

            {/* Education */}
            {currentResumeData.education && (
              <div style={{ marginBottom: '16px' }}>
                <h2
                  style={{
                    fontSize: `${config.sectionHeaderSize * 1.15}px`,
                    fontWeight: config.sectionHeaderBold ? 'bold' : '600',
                    textTransform: config.sectionHeaderUppercase ? 'uppercase' : 'none',
                    letterSpacing: '0.5px',
                    color: config.sectionHeaderColor || '#1e3a8a',
                    borderBottom: config.showSectionDividers ? `1px solid ${config.dividerColor || '#1e3a8a'}` : 'none',
                    paddingBottom: config.showSectionDividers ? '3px' : '0px',
                    marginBottom: '6px',
                  }}
                >
                  EDUCATION
                </h2>
                <p style={{ fontSize: `${config.bodySize * 1.1}px`, color: '#1e293b', margin: 0 }}>
                  {currentResumeData.education}
                </p>
              </div>
            )}

            {/* Page Footer Visual Stamp */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>{currentResumeData.candidateName} — Executive Resume ({resumeState.isTailored && !forceMaster ? `针对 ${currentResumeData.targetCompany} 定制版` : '官方母版规范'})</span>
              <span>Page 1 of {previewPageLength}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Docs Export Modal */}
      <GoogleDocsExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeData={{
          ...currentResumeData,
          pageLength: previewPageLength,
          formatConfig: config,
        }}
      />
    </div>
  );
};
