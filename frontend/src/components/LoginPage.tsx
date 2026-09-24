import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FileText, 
  ArrowRight, 
  Key, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { authService, UserProfile } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [clientId, setClientId] = useState(authService.getClientId());
  const [isConfiguringId, setIsConfiguringId] = useState(!authService.getClientId());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleGoogleLogin = async () => {
    const trimmedId = clientId.trim();
    if (!trimmedId) {
      setErrorMsg('请先填写您的 Google OAuth Client ID');
      setIsConfiguringId(true);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    authService.setClientId(trimmedId);

    try {
      const user = await authService.loginWithGoogle(trimmedId);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Google 账号登录失败，请检查 Client ID 及测试用户设置。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demo = authService.loginAsDemo();
    onLoginSuccess(demo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Product Introduction */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>个人履历事实资产库 · Solo Career Copilot</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              AutoJobHunt
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-medium">
              基于 100% 真实成就，定制目标岗位的 Executive 级匹配简历
            </p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            沉淀个人原子级真实事实库，杜绝 AI 编造假数据。一键抓取公开职位链接，智能挑选契合成就，
            生成严格 1 页精简版与 2 页完整详细版简历，并支持直接同步写入个人 Google Docs。
          </p>

          {/* Key Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">私有事实资产库</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">STAR / X-Y-Z 模式，已锁定成就严禁篡改</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">双模态物理排版</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">严格 1 页精简版 (9条) vs 2 页详细版 (17条)</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">JD 链接一键抓取</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">自动解析要求并进行 ATS 语义打分对齐</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Google Docs 原生同步</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">使用个人 Google 权限，自动建档秒开</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google OAuth Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Google OAuth 登录
              </h2>
              <p className="text-xs text-slate-300">
                请先登录以访问您的个人事实库与定制工作台
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold">登录提示: </span>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Google Login Action Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xl flex items-center justify-center space-x-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>正在连接 Google 授权...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google G Logo SVG */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>使用 Google 账号继续</span>
                  </>
                )}
              </button>

              {/* Client ID Configuration Field */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
                  <span className="flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>OAuth Client ID 配置</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsConfiguringId(!isConfiguringId)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    {isConfiguringId ? '收起' : (clientId ? '已配置 (点击修改)' : '未配置 (点击设置)')}
                  </button>
                </div>

                {isConfiguringId && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="如: xxxxx.apps.googleusercontent.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">存储在本地浏览器，无需重复输入</span>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showGuide ? '收起指南' : '申请指引'}</span>
                      </button>
                    </div>

                    {showGuide && (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-[11px] text-slate-300 space-y-1.5 leading-relaxed text-left">
                        <p className="font-bold text-white">Google Cloud 凭据指引：</p>
                        <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                          <li>进入 Google Cloud Console 启用 Docs & Drive API；</li>
                          <li>OAuth 同意屏幕中将您的邮箱添加到「测试用户 (Test users)」；</li>
                          <li>创建凭据 ➔ OAuth 客户端 ID ➔ Web 应用程序；</li>
                          <li>授权 JavaScript 来源填入：<code>http://localhost:5173</code>；</li>
                          <li>保存并将生成的 Client ID 粘贴到上方输入框。</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-xs">或</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Quick Demo Login Option */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>⚡ 本地免密体验 (Joy Wang 快捷登录)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 relative z-10">
        AutoJobHunt & Resume Tailor • 个人隐私数据 100% 本地运行与授权保障
      </div>
    </div>
  );
};
