import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw, Sparkles, Layers } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);
    setIsUploading(true);
    setErrorMsg(null);
    try {
      await api.uploadResumes(fileList);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || '上传简历失败，请检查文件格式。');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExtractSingle = async (id: string) => {
    setExtractingId(id);
    setErrorMsg(null);
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
            <span>个人履历统一资产库</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">导入你过去的 5~6 份历史简历</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            喂给系统过往不同阶段或侧重点的简历（如中英文版、全栈版、架构版、团队管理版）。
            系统将进行去噪对齐，萃取原子级 STAR / X-Y-Z 事实块，杜绝 AI 改简历时的凭空捏造。
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 transition-all rounded-2xl p-8 text-center cursor-pointer group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-105">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-800">
          {isUploading ? '正在上传与读取文件...' : '点击或将 5~6 份历史简历拖拽至此'}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          支持格式：PDF、DOCX、TXT、Markdown（支持批量选择多个文件）
        </p>
      </div>

      {/* Resume List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">已导入的简历列表 ({resumes.length})</h3>
            <p className="text-xs text-slate-500">提取出来的事实将统一汇总至你的个人事实库</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchExtract}
              disabled={isBatchExtracting || resumes.length === 0}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {isBatchExtracting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span>一键提取全部简历事实</span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
