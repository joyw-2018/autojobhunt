import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Edit3, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Cpu, 
  Tag, 
  Info,
  Calendar,
  Building2,
  Briefcase
} from 'lucide-react';
import { FactBlock } from '../types/fact';
import { api } from '../api/client';

interface FactCardProps {
  fact: FactBlock;
  onUpdate: (updated: FactBlock) => void;
  onDelete: (id: string) => void;
}

export const FactCard: React.FC<FactCardProps> = ({ fact, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [activeVariant, setActiveVariant] = useState<'standard' | 'metric' | 'arch'>('standard');
  const [showSource, setShowSource] = useState(false);

  // Edit form state
  const [editText, setEditText] = useState(fact.refined_text);
  const [editCompany, setEditCompany] = useState(fact.company);
  const [editRole, setEditRole] = useState(fact.role);
  const [editDate, setEditDate] = useState(fact.date_range);
  const [editCategory, setEditCategory] = useState(fact.category);
  const [editNotes, setEditNotes] = useState(fact.personal_notes || '');

  const handleSaveEdit = async () => {
    try {
      const updated = await api.updateFact(fact.id, {
        refined_text: editText,
        company: editCompany,
        role: editRole,
        date_range: editDate,
        category: editCategory,
        personal_notes: editNotes,
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    }
  };

  const handleToggleLock = async () => {
    try {
      const updated = await api.toggleLock(fact.id);
      onUpdate(updated);
    } catch (err: any) {
      alert(`锁定切换失败: ${err.message}`);
    }
  };

  const handlePolish = async (focus: 'metric_focused' | 'architecture_focused') => {
    setIsPolishing(true);
    try {
      const updated = await api.polishFact(fact.id, focus);
      onUpdate(updated);
      if (focus === 'metric_focused') setActiveVariant('metric');
      if (focus === 'architecture_focused') setActiveVariant('arch');
    } catch (err: any) {
      alert(`AI 润色失败: ${err.message}`);
    } finally {
      setIsPolishing(false);
    }
  };

  const applyVariantAsPrimary = async (variantText: string) => {
    if (!variantText) return;
    try {
      const updated = await api.updateFact(fact.id, { refined_text: variantText });
      onUpdate(updated);
      setEditText(variantText);
    } catch (err: any) {
      alert(`切换主版本失败: ${err.message}`);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md ${
      fact.is_locked ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
    }`}>
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 rounded-t-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Badges */}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            {fact.category}
          </span>
          {fact.sub_category && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
              {fact.sub_category}
            </span>
          )}
          {fact.is_locked && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <Lock className="w-3 h-3" />
              <span>事实已锁定 (AI不可篡改)</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleLock}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              fact.is_locked
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
            title={fact.is_locked ? '点击解锁' : '点击锁定：禁止后续 AI 自动篡改'}
          >
            {fact.is_locked ? <Lock className="w-4 h-4 text-amber-700" /> : <Unlock className="w-4 h-4" />}
          </button>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="手工修改与精细润色"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('确认删除此条事实块？')) onDelete(fact.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Meta Info: Company, Role, Date */}
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-500">公司名称</label>
              <input
                type="text"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">职位职务</label>
              <input
                type="text"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">时间区间</label>
              <input
                type="text"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center space-x-1 font-semibold text-slate-900">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{fact.company}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{fact.role}</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{fact.date_range}</span>
            </span>
          </div>
        )}

        {/* Fact Text (Refined X-Y-Z) */}
        {isEditing ? (
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-500">精炼事实文案 (Google X-Y-Z 模式)</label>
            <textarea
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-sm p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 transition-colors flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>取消</span>
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存修改</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-800 leading-relaxed font-normal">
              {activeVariant === 'standard' && fact.refined_text}
              {activeVariant === 'metric' && (fact.variants?.metric_focused || fact.refined_text)}
              {activeVariant === 'arch' && (fact.variants?.architecture_focused || fact.refined_text)}
            </p>
          </div>
        )}

        {/* Pre-generated Variants Tabs */}
        {!isEditing && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400 text-[11px] mr-1">变体查看:</span>
              <button
                onClick={() => setActiveVariant('standard')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeVariant === 'standard' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                标准 X-Y-Z
              </button>
              <button
                onClick={() => setActiveVariant('metric')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeVariant === 'metric' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                指标量化版
              </button>
              <button
                onClick={() => setActiveVariant('arch')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeVariant === 'arch' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                架构深度版
              </button>
            </div>

            {/* Quick Adopt Variant Button */}
            {activeVariant !== 'standard' && (
              <button
                onClick={() => {
                  const target = activeVariant === 'metric' ? fact.variants?.metric_focused : fact.variants?.architecture_focused;
                  if (target) applyVariantAsPrimary(target);
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                采用此变体为主文案
              </button>
            )}
          </div>
        )}

        {/* Tech Stack & Metric Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {fact.tech_stack.map((t, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
            >
              <Cpu className="w-2.5 h-2.5 text-slate-400" />
              <span>{t}</span>
            </span>
          ))}
          {fact.metrics.map((m, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
              <span>{m}</span>
            </span>
          ))}
        </div>

        {/* Source Snippet Dropdown / Traceability */}
        {fact.raw_source_snippets && fact.raw_source_snippets.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowSource(!showSource)}
              className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-600"
            >
              <Info className="w-3 h-3" />
              <span>{showSource ? '收起源简历文本' : '查看原始简历出处'}</span>
            </button>
            {showSource && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                "{fact.raw_source_snippets[0]}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
