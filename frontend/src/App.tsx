import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ResumeUpload } from './components/ResumeUpload';
import { FactStudio } from './components/FactStudio';
import { ResumeTailorStudio } from './components/ResumeTailorStudio';
import { TemplateSettingsPreview } from './components/TemplateSettingsPreview';
import { ResumeMetadata, FactBlock, AppStats } from './types/fact';
import { api } from './api/client';

export function App() {
  const [activeTab, setActiveTab] = useState<'resumes' | 'studio' | 'tailor' | 'template'>('studio');
  const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
  const [facts, setFacts] = useState<FactBlock[]>([]);
  const [stats, setStats] = useState<AppStats | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resumesData, factsData, statsData] = await Promise.all([
        api.getResumes().catch(() => []),
        api.getFacts().catch(() => []),
        api.getStats().catch(() => undefined),
      ]);
      setResumes(resumesData);
      setFacts(factsData);
      setStats(statsData);
      // If there are no facts yet, guide user to resumes tab
      if (factsData.length === 0 && resumesData.length === 0) {
        setActiveTab('resumes');
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats ? {
          total_facts: stats.total_facts,
          locked_facts: stats.locked_facts,
          total_resumes: stats.total_resumes,
        } : undefined}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center p-24 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <span>正在连接并加载个人履历资产...</span>
          </div>
        ) : (
          <>
            {activeTab === 'resumes' && (
              <ResumeUpload
                resumes={resumes}
                onRefresh={loadData}
                onExtracted={() => {
                  loadData();
                  setActiveTab('studio');
                }}
              />
            )}

            {activeTab === 'studio' && (
              <FactStudio
                facts={facts}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'tailor' && <ResumeTailorStudio />}

            {activeTab === 'template' && <TemplateSettingsPreview />}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        AutoJobHunt & Resume Tailor (Solo Copilot v1.1.0) • 私有事实资产库保障 100% 真实不造假
      </footer>
    </div>
  );
}

export default App;
