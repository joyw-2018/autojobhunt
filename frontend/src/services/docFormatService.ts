/**
 * Service and types for customizing Google Docs resume typography, margins, and formatting rules.
 * Default template matches Joy Wang's official 2026 Executive Resume PDF format.
 */

export interface GoogleDocsFormatConfig {
  // Typography
  fontFamily: string;
  candidateNameSize: number;
  candidateNameBold: boolean;
  candidateNameAlign: 'center' | 'left';
  contactInfoSize: number;
  sectionHeaderSize: number;
  sectionHeaderColor: string; // e.g. '#1e3a8a' Navy Blue
  sectionHeaderBold: boolean;
  sectionHeaderUppercase: boolean;
  roleAndOrgSize: number;
  bodySize: number;
  lineSpacing: number;
  paragraphSpacing: number; // Bullet spacing

  // Horizontal Lines / Dividers
  showSectionDividers: boolean; // default: false (小节无多余横线)
  showHeaderDivider: boolean;   // default: true (联系方式下方单条实线，与PDF一致)
  dividerColor: string;
  dividerThickness: number;

  // Page Setup & Margins
  paperSize: 'letter' | 'a4';
  marginInches: number; // 0.5, 0.65, 0.75, 1.0
  targetPageLength: 1 | 2;

  // Target Google Drive Folder
  driveTargetFolder: string;
}

/**
 * 默认简历格式模板：严格对齐 Joy Wang 官方 PDF 格式规范
 * - 字体：Arial
 * - 候选人姓名：22 pt (Bold, Center)
 * - 联系方式行：9.5 pt (Pipe 分隔，下方单条实线)
 * - 一级小节标题：11 pt (Bold, ALL CAPS, 经典大厂蓝 #1e3a8a, 无额外横线)
 * - 经历与机构行：10.5 pt (Company, Role, DateRange, 加粗突出)
 * - 正文与 Bullets：10 pt (行距 1.28, 条目间距 4pt)
 * - 边距：0.75 英寸 (54 pt)
 */
export const DEFAULT_DOC_FORMAT: GoogleDocsFormatConfig = {
  fontFamily: 'Arial',
  candidateNameSize: 22,
  candidateNameBold: true,
  candidateNameAlign: 'center',
  contactInfoSize: 9.5,
  sectionHeaderSize: 11,
  sectionHeaderColor: '#1e3a8a', // 经典大厂深海军蓝
  sectionHeaderBold: true,
  sectionHeaderUppercase: true,
  roleAndOrgSize: 10.5,
  bodySize: 10,
  lineSpacing: 1.28,
  paragraphSpacing: 4,
  showSectionDividers: false,    // 小节标题绝无多余横线干扰
  showHeaderDivider: true,       // 顶部姓名与联系方式下方一条干净实线 (对齐PDF)
  dividerColor: '#0f172a',       // 典雅黑灰色分割线
  dividerThickness: 1.5,
  paperSize: 'letter',
  marginInches: 0.75,            // 0.75 英寸舒适留白
  targetPageLength: 2,
  driveTargetFolder: '/AutoJobHunt/Resumes/2026/',
};

export const FORMAT_PRESETS: Record<string, { name: string; description: string; config: Partial<GoogleDocsFormatConfig> }> = {
  joy_wang_official: {
    name: 'Joy Wang 官方 PDF 模板 (当前默认)',
    description: '对齐官方最新简历排版：Arial 22pt/11pt/10pt，大厂蓝小节标题，小节零横线，高雅大方',
    config: {
      fontFamily: 'Arial',
      candidateNameSize: 22,
      candidateNameAlign: 'center',
      contactInfoSize: 9.5,
      sectionHeaderSize: 11,
      sectionHeaderColor: '#1e3a8a',
      sectionHeaderUppercase: true,
      roleAndOrgSize: 10.5,
      bodySize: 10,
      lineSpacing: 1.28,
      paragraphSpacing: 4,
      showSectionDividers: false,
      showHeaderDivider: true,
      dividerColor: '#0f172a',
      dividerThickness: 1.5,
      marginInches: 0.75,
    },
  },
  modern_minimal: {
    name: '极简全无横线版',
    description: '全篇没有任何横线（包含姓名栏），通过纯留白与字号梯度建立清晰层级',
    config: {
      fontFamily: 'Arial',
      candidateNameSize: 22,
      candidateNameAlign: 'center',
      contactInfoSize: 9.5,
      sectionHeaderSize: 11,
      sectionHeaderColor: '#0f172a',
      sectionHeaderUppercase: true,
      roleAndOrgSize: 10.5,
      bodySize: 9.5,
      lineSpacing: 1.25,
      paragraphSpacing: 3.5,
      showSectionDividers: false,
      showHeaderDivider: false,
      marginInches: 0.65,
    },
  },
  tech_compact: {
    name: 'Calibri 紧凑高密度版',
    description: 'Calibri 字体，适合 1 页紧凑版面，容纳大量项目与技能信息',
    config: {
      fontFamily: 'Calibri',
      candidateNameSize: 20,
      candidateNameAlign: 'center',
      contactInfoSize: 9,
      sectionHeaderSize: 10.5,
      sectionHeaderColor: '#1e3a8a',
      sectionHeaderUppercase: true,
      roleAndOrgSize: 10,
      bodySize: 9.5,
      lineSpacing: 1.2,
      paragraphSpacing: 3,
      showSectionDividers: false,
      showHeaderDivider: true,
      marginInches: 0.5,
    },
  },
};

const STORAGE_KEY = 'autojobhunt_google_docs_format';

export const docFormatService = {
  getStoredConfig(): GoogleDocsFormatConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_DOC_FORMAT,
          ...parsed,
          sectionHeaderColor: parsed.sectionHeaderColor || DEFAULT_DOC_FORMAT.sectionHeaderColor,
          contactInfoSize: parsed.contactInfoSize || DEFAULT_DOC_FORMAT.contactInfoSize,
        };
      }
    } catch (e) {
      console.warn('Failed to load stored format config:', e);
    }
    return { ...DEFAULT_DOC_FORMAT };
  },

  saveStoredConfig(config: GoogleDocsFormatConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('doc-format-updated', { detail: config }));
    } catch (e) {
      console.error('Failed to save format config:', e);
    }
  },

  resetToDefault(): GoogleDocsFormatConfig {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('doc-format-updated', { detail: DEFAULT_DOC_FORMAT }));
    } catch {}
    return { ...DEFAULT_DOC_FORMAT };
  },
};
