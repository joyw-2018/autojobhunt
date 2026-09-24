import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Lock, 
  Unlock, 
  Database, 
  Sparkles, 
  Layers, 
  X, 
  Check,
  Building2,
  Briefcase,
  Tag
} from 'lucide-react';
import { FactBlock, FactCreatePayload } from '../types/fact';
import { FactCard } from './FactCard';
import { api } from '../api/client';

interface FactStudioProps {
  facts: FactBlock[];
  onRefresh: () => void;
}

const CATEGORIES = [
  'All',
  'AI / Developer Platforms',
  'Backend / Architecture',
  'Product & Platform Strategy',
  'Cloud & Enterprise Systems',
  'Engineering Leadership',
  'Fintech & Financial Infrastructure',
  'Search & Data Infrastructure',
  'Thought Leadership & Industry Impact',
];

export const FactStudio: React.FC<FactStudioProps> = ({ facts, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lockedOnly, setLockedOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New fact modal form state
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState('Backend / Architecture');
  const [newText, setNewText] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newMetrics, setNewMetrics] = useState('');

  const filteredFacts = facts.filter((f) => {
    if (selectedCategory !== 'All' && f.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (lockedOnly && !f.is_locked) {
      return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchText = f.refined_text.toLowerCase().includes(s);
      const matchCompany = f.company.toLowerCase().includes(s);
      const matchRole = f.role.toLowerCase().includes(s);
      const matchTech = f.tech_stack.some((t) => t.toLowerCase().includes(s));
      return matchText || matchCompany || matchRole || matchTech;
    }
    return true;
  });

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole || !newText) {
      alert('请完整填写公司、职位与事实文案');
      return;
    }

    const payload: FactCreatePayload = {
      company: newCompany,
      role: newRole,
      date_range: newDate || 'Recent',
      category: newCategory,
      sub_category: 'Manual Entry',
      refined_text: newText,
      tech_stack: newTech ? newTech.split(',').map((t) => t.trim()) : [],
      metrics: newMetrics ? newMetrics.split(',').map((m) => m.trim()) : [],
    };

    try {
      await api.createFact(payload);
      onRefresh();
      setIsAddModalOpen(false);
      // Reset form
      setNewCompany('');
      setNewRole('');
      setNewDate('');
      setNewText('');
      setNewTech('');
      setNewMetrics('');
    } catch (err: any) {
      alert(`添加事实失败: ${err.message}`);
    }
  };

  const handleUpdate = () => {
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteFact(id);
      onRefresh();
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] sm:min-w-[320px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索技术栈 (Go, Kafka)、公司、或经历关键字..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Action buttons: Lock filter & Add new */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLockedOnly(!lockedOnly)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                lockedOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>仅看已锁定事实 ({facts.filter((f) => f.is_locked).length})</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>手动新增事实块</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 shrink-0">职能分类:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Facts Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500 px-1">
          <span>
            共筛选出 <strong className="text-slate-900">{filteredFacts.length}</strong> 条原子事实
          </span>
          <span>点击卡片右上方锁定图标可保护事实不被修改</span>
        </div>

        {filteredFacts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
            <Database className="w-10 h-10 mx-auto opacity-40 mb-3" />
            <p className="text-sm">暂无符合条件的事实块。</p>
            <p className="text-xs text-slate-400 mt-1">
              请在“历史简历库”中上传简历并点击提取，或点击上方“手动新增事实块”。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFacts.map((fact) => (
              <FactCard
                key={fact.id}
                fact={fact}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add New Fact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">手动新增履历事实块</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFact} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">公司/机构 *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="如 Stripe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">职位/头衔 *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="如 Senior Engineer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">时间区间</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="2022.03 - 2024.08"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">职能分类</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  精炼事实文案 (STAR / Google X-Y-Z 模式) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Architected and deployed a distributed Go microservice, cutting latency by 35% across 2M users..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">技术栈标签 (逗号分隔)</label>
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Go, Kafka, Redis, AWS"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">量化指标 (逗号分隔)</label>
                  <input
                    type="text"
                    value={newMetrics}
                    onChange={(e) => setNewMetrics(e.target.value)}
                    placeholder="35% latency drop, 2M users"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-xs transition-colors"
                >
                  确认保存至事实库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
