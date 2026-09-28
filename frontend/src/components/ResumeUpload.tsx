import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw, Sparkles, Layers, Trash2 } from 'lucide-react';
import { ResumeMetadata } from '../types/fact';
import { api } from '../api/client';

interface ResumeUploadProps {
  resumes: ResumeMetadata[];
  onRefresh: () => void;
  onExtracted: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ resumes, onRefresh, onExtracted }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [isBatchExtracting, setIsBatchExtracting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = resumes.length >= 10;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);

    if (resumes.length + fileList.length > 10) {
      setErrorMsg(`最多只支持上传 10 份简历。当前已有 ${resumes.length} 份，本次选择 ${fileList.length} 份，超出上限。请先删除部分简历后再上传。`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.uploadResumes(fileList);
      onRefresh();
      setSuccessMsg(`成功上传 ${fileList.length} 份简历！您可以点击“重新生成事实库”萃取最新事实。`);
    } catch (err: any) {
      setErrorMsg(err.message || '上传简历失败，请检查文件格式。');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (id: string, filename: string) => {
    if (!confirm(`确定要删除简历「${filename}」吗？文件将从系统中移除。`)) return;
    setDeletingId(id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.deleteResume(id);
      onRefresh();
      setSuccessMsg(`已成功删除简历「${filename}」`);
    } catch (err: any) {
      setErrorMsg(err.message || '删除简历失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRegenerateFacts = async () => {
    if (resumes.length === 0) {
      setErrorMsg('请至少上传一份简历后再重新生成事实库。');
      return;
    }
    setIsRegenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updatedFacts = await api.regenerateFactBase();
      const newFactsCount = updatedFacts.filter(f => f.is_new).length;
      onRefresh();
      onExtracted();
      setSuccessMsg(`事实库重新生成完成！共获得 ${updatedFacts.length} 条事实（其中包含 ${newFactsCount} 条带「新事实」标签的全新条目）。已自动跳转至事实库。`);
    } catch (err: any) {
      setErrorMsg(err.message || '重新生成事实库失败');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExtractSingle = async (id: string) => {
    setExtractingId(id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.extractFactsFromResume(id);
      onRefresh();
      onExtracted();
    } catch (err: any) {
      setErrorMsg(err.message || '提取事实失败');
    } finally {
      setExtractingId(null);
    }
  };

  const handleBatchExtract = async () => {
    setIsBatchExtracting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.batchExtractAll();
      onRefresh();
      onExtracted();
    } catch (err: any) {
      setErrorMsg(err.message || '批量提取事实失败');
    } finally {
      setIsBatchExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>个人履历统一资产库 (支持最多 10 份简历)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">导入你过去的 5~10 份历史简历</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            喂给系统过往不同阶段或侧重点的简历（如中英文版、全栈版、架构版、团队管理版）。
            上传新简历后，点击<strong>「重新生成事实库」</strong>即可根据全部简历萃取事实，系统会自动标记新增的<strong>「新事实」</strong>，并永久保护已锁定的事实。
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center space-x-3 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => {
          if (!isLimitReached) {
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed transition-all rounded-2xl p-8 text-center ${
          isLimitReached
            ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-80'
            : 'border-indigo-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 cursor-pointer group'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          disabled={isLimitReached}
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-transform ${
          isLimitReached ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 group-hover:scale-105'
        }`}>
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-800">
          {isUploading
            ? '正在上传与读取文件...'
            : isLimitReached
            ? '已达到最多 10 份简历上限，如需上传新简历请先删除不需要的简历'
            : '点击或将历史简历拖拽至此（最多 10 份）'}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          支持格式：PDF、DOCX、TXT、Markdown（当前已上传 {resumes.length}/10 份）
        </p>
      </div>

      {/* Resume List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-slate-900">
                已导入的简历列表 ({resumes.length}/10)
              </h3>
              {resumes.length >= 10 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  已达上限 (10/10)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">上传新简历后，可点击“重新生成事实库”全量萃取并标注新事实</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRegenerateFacts}
              disabled={isRegenerating || resumes.length === 0}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
              title="根据当前所有上传的简历重新萃取并生成事实库，并标记新事实"
            >
              {isRegenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>{isRegenerating ? '正在重新萃取事实库...' : '重新生成事实库'}</span>
            </button>
            <button
              onClick={handleBatchExtract}
              disabled={isBatchExtracting || resumes.length === 0}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {isBatchExtracting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span>一键增量提取</span>
            </button>
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto opacity-40 mb-3" />
            <p className="text-sm">暂未上传任何简历，请点击上方区域上传你的过往简历。</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs">
                    {resume.file_type}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-sm sm:max-w-md">
                      {resume.filename}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                      <span>{(resume.file_size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{new Date(resume.uploaded_at).toLocaleDateString()}</span>
                      {resume.character_count > 0 && (
                        <>
                          <span>•</span>
                          <span>约 {resume.character_count} 字</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {resume.status === 'EXTRACTED' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>已提取 {resume.extracted_fact_count} 条事实</span>
                    </span>
                  ) : resume.status === 'ERROR' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>提取异常</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <span>未提取</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleExtractSingle(resume.id)}
                    disabled={extractingId === resume.id}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-xs font-medium text-slate-700 bg-white hover:bg-indigo-50/20 disabled:opacity-50 transition-colors inline-flex items-center space-x-1.5"
                  >
                    {extractingId === resume.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>提取中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{resume.status === 'EXTRACTED' ? '重新提取' : '提取事实块'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteResume(resume.id, resume.filename)}
                    disabled={deletingId === resume.id}
                    className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    title="删除此简历"
                  >
                    {deletingId === resume.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
