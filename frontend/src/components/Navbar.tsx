import React from 'react';
import { Database, FileText, Sparkles, Layers, Sliders, CheckCircle2, LogOut, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../services/authService';

interface NavbarProps {
  activeTab: 'resumes' | 'studio' | 'tailor' | 'template';
  setActiveTab: (tab: 'resumes' | 'studio' | 'tailor' | 'template') => void;
  stats?: {
    total_facts: number;
    locked_facts: number;
    total_resumes: number;
  };
  user?: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, stats, user, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AutoJobHunt</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Solo Copilot
                </span>
              </div>
              <p className="text-xs text-slate-500">个人履历事实资产库 & 智能定制</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('resumes')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'resumes'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>历史简历库</span>
              {stats && stats.total_resumes > 0 && (
                <span className="px-1.5 py-0.2 text-xs rounded-full bg-slate-200 text-slate-700 font-mono">
                  {stats.total_resumes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'studio'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>事实库工作台</span>
              {stats && stats.total_facts > 0 && (
                <span className="px-1.5 py-0.2 text-xs rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold">
                  {stats.total_facts}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tailor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tailor'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>JD 智能定制简历</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('template')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'template'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sliders className="w-4 h-4 text-violet-500" />
              <span>Google Docs 排版</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-800 font-medium">
                可自定义
              </span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3 text-xs">
            {stats && (
              <div className="hidden xl:flex items-center space-x-1 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>已锁定真实事实:</span>
                <span className="font-semibold text-slate-800">{stats.locked_facts} 条</span>
              </div>
            )}

            {user && (
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-bold text-slate-800 text-xs leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">{user.email}</p>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="退出登录"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors ml-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
