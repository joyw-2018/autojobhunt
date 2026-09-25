import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  RefreshCw, 
  Key, 
  FileText, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { googleDocsService, ResumeExportData } from '../services/googleDocsService';
import { docFormatService } from '../services/docFormatService';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeExportData | null;
}

export const GoogleDocsExportModal: React.FC<Props> = ({ isOpen, onClose, resumeData }) => {
  const [clientId, setClientId] = useState('');
  const [isEditingId, setIsEditingId] = useState(false);
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'creating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = googleDocsService.getStoredClientId();
      setClientId(stored);
      setIsEditingId(!stored);
      setStatus('idle');
      setErrorMsg(null);
      setDocUrl(null);
    }
  }, [isOpen]);

  if (!isOpen || !resumeData) return null;

  const handleSaveAndExport = async () => {
    const trimmedId = clientId.trim();
    if (!trimmedId) {
      setErrorMsg('请输入有效的 Google OAuth Client ID');
      return;
    }

    googleDocsService.setStoredClientId(trimmedId);
    setIsEditingId(false);
    setErrorMsg(null);

    try {
      setStatus('authorizing');
      const token = await googleDocsService.getAccessToken(trimmedId);

      setStatus('creating');
      const result = await googleDocsService.createGoogleDoc(token, resumeData);

      setDocUrl(result.docUrl);
      setDocTitle(result.title);
      setStatus('success');

      // Auto open in new tab
      window.open(result.docUrl, '_blank');
    } catch (err: any) {
      console.error('Google Docs export error:', err);
      setStatus('error');
      setErrorMsg(err.message || '导出至 Google Docs 遇到错误，请检查网络或 Client ID 配置。');
    }
  };

  const handleCopyLink = () => {
    if (!docUrl) return;
    navigator.clipboard.writeText(docUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">自动填入并导出到 Google Docs</h3>
              <p className="text-[11px] text-slate-300">以您自己的 Google 账号权限创建原生文档</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold">提示: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && docUrl && (
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Google Docs 创建成功！</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  已在您的 Google Drive 根目录生成《{docTitle}》，格式与排版已自动对齐。
                </p>
              </div>

              {/* URL Display */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-700 break-all text-left">
                <span className="truncate pr-2">{docUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-sans font-semibold shrink-0 flex items-center space-x-1 shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? '已复制' : '复制链接'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 flex items-center justify-center space-x-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>立即在 Google Docs 中打开</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          )}

          {/* LOADING STATES */}
          {(status === 'authorizing' || status === 'creating') && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {status === 'authorizing' ? '正在连接 Google 官方授权窗口...' : '正在自动向您的 Google Docs 填入内容并排版...'}
                </p>
                <p className="text-xs text-slate-500">
                  {status === 'authorizing' 
                    ? '请在弹出的 Google 官方窗口中选择您的账号并点击“允许”' 
                    : '自动构建 Executive Summary、技能矩阵与经历 Bullets 清单'}
                </p>
              </div>
            </div>
          )}

          {/* ID CONFIG & IDLE FORM */}
          {(status === 'idle' || status === 'error') && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">隐私与安全性保证 (100% 本地浏览器运行)</p>
                  <p className="text-blue-700/90 leading-relaxed">
                    我们采用 Google 官方标准的 OAuth 2.0 协议。文档直接在您的个人 Google Drive 中生成，所有权限归您所有，不会上传任何数据至第三方服务器。
                  </p>
                </div>
              </div>

              {/* Active Format Badge */}
              {(() => {
                const cfg = resumeData.formatConfig || docFormatService.getStoredConfig();
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-900">排版规范:</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800">{cfg.fontFamily}</span>
                      <span className="text-slate-300">|</span>
                      <span className={!cfg.showSectionDividers ? 'text-emerald-700 font-semibold' : 'text-slate-700'}>
                        {!cfg.showSectionDividers ? '✓ 已去除多余横线' : '含小节横线'}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>边距 {cfg.marginInches}in</span>
                    </div>
                  </div>
                );
              })()}

              {/* Client ID Configuration Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    <span>您的 Google OAuth Client ID</span>
                  </label>
                  {!isEditingId && clientId && (
                    <button
                      onClick={() => setIsEditingId(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      修改 Client ID
                    </button>
                  )}
                </div>

                {isEditingId ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="例如: 1234567890-abcdef.apps.googleusercontent.com"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50/50"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-slate-400">
                        将在本地浏览器持久保存，仅需配置一次。
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showGuide ? '收起配置指引' : '查看 3 分钟申请指引'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600">
                    <span className="truncate pr-3">{clientId}</span>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      <Check className="w-3 h-3" />
                      <span>已就绪</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Guide Accordion */}
              {showGuide && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2.5 animate-in fade-in duration-150">
                  <p className="font-bold text-slate-900">快速获取免费 Google OAuth Client ID：</p>
                  <ol className="list-decimal list-outside pl-4 space-y-1.5 leading-relaxed text-slate-600 text-[11.5px]">
                    <li>
                      打开 <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Google Cloud Console</a> 并登录您的账号。
                    </li>
                    <li>在上方项目栏新建一个项目（如 <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">AutoJobHunt</code>）。</li>
                    <li>在搜索框中分别搜索并点击启用 <strong>Google Docs API</strong> 与 <strong>Google Drive API</strong>。</li>
                    <li>
                      左侧导航进入「凭据 (Credentials)」➔「配置同意屏幕」➔ 选择 <strong>外部 (External)</strong>，填写应用名及邮箱，并将您自己的邮箱添加为「测试用户 (Test users)」。
                    </li>
                    <li>
                      在「凭据」页点击「创建凭据」➔ 选择 <strong>OAuth 客户端 ID</strong> ➔ 类型选 <strong>Web 应用程序</strong>。
                    </li>
                    <li>
                      在「已获授权的 JavaScript 来源」填入：<code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-900">http://localhost:5173</code>。
                    </li>
                    <li>点击创建，将生成的 <strong>客户端 ID</strong> 复制并粘贴到上方输入框即可！</li>
                  </ol>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndExport}
                  disabled={!clientId.trim()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 disabled:opacity-50 transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>开始自动授权并导出 Google Docs</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
