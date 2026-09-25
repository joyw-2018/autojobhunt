/**
 * Service and types for customizing Google Docs resume typography, margins, and formatting rules.
 */

export interface GoogleDocsFormatConfig {
  // Typography
  fontFamily: string;
  candidateNameSize: number;
  candidateNameBold: boolean;
  candidateNameAlign: 'center' | 'left';
  sectionHeaderSize: number;
  sectionHeaderBold: boolean;
  sectionHeaderUppercase: boolean;
  roleAndOrgSize: number;
  bodySize: number;
  lineSpacing: number;
  paragraphSpacing: number;

  // Horizontal Lines / Dividers (User requested removal of extra lines)
  showSectionDividers: boolean; // default: false (去掉Docs额外横线)
  showHeaderDivider: boolean;   // default: false (去掉候选人下方横线)
  dividerColor: string;
  dividerThickness: number;

  // Page Setup & Margins
  paperSize: 'letter' | 'a4';
  marginInches: number; // 0.5, 0.75, 1.0
  targetPageLength: 1 | 2;

  // Target Google Drive Folder
  driveTargetFolder: string;
}

export const DEFAULT_DOC_FORMAT: GoogleDocsFormatConfig = {
  fontFamily: 'Arial',
  candidateNameSize: 20,
  candidateNameBold: true,
  candidateNameAlign: 'center',
  sectionHeaderSize: 11,
  sectionHeaderBold: true,
  sectionHeaderUppercase: true,
  roleAndOrgSize: 10.5,
  bodySize: 9.5,
  lineSpacing: 1.25,
  paragraphSpacing: 4,
  showSectionDividers: false, // 彻底去掉小节多余横线
  showHeaderDivider: false,   // 彻底去掉姓名多余横线
  dividerColor: '#cbd5e1',
  dividerThickness: 1,
  paperSize: 'letter',
  marginInches: 0.5,
  targetPageLength: 1,
  driveTargetFolder: '/AutoJobHunt/Resumes/2026/',
};

export const FORMAT_PRESETS: Record<string, { name: string; description: string; config: Partial<GoogleDocsFormatConfig> }> = {
  modern_clean: {
    name: '现代极简无横线 (推荐)',
    description: '现代科技公司通用，纯净无横线干扰，高阅读流程度',
    config: {
      fontFamily: 'Arial',
      candidateNameSize: 20,
      candidateNameAlign: 'center',
      sectionHeaderSize: 11,
      sectionHeaderUppercase: true,
      bodySize: 9.5,
      lineSpacing: 1.25,
      paragraphSpacing: 4,
      showSectionDividers: false,
      showHeaderDivider: false,
      marginInches: 0.5,
    },
  },
  tech_lead: {
    name: '硅谷大厂高密度',
    description: 'Calibri 紧凑字体，1页高信息量黄金排版，无任何多余线条',
    config: {
      fontFamily: 'Calibri',
      candidateNameSize: 19,
      candidateNameAlign: 'center',
      sectionHeaderSize: 10.5,
      sectionHeaderUppercase: true,
      bodySize: 9,
      lineSpacing: 1.2,
      paragraphSpacing: 3,
      showSectionDividers: false,
      showHeaderDivider: false,
      marginInches: 0.5,
    },
  },
  classic_ivy: {
    name: '常青藤衬线经典',
    description: 'Times New Roman 典雅风格，适合投递传统金融或咨询',
    config: {
      fontFamily: 'Times New Roman',
      candidateNameSize: 22,
      candidateNameAlign: 'center',
      sectionHeaderSize: 11.5,
      sectionHeaderUppercase: true,
      bodySize: 10,
      lineSpacing: 1.3,
      paragraphSpacing: 5,
      showSectionDividers: false,
      showHeaderDivider: false,
      marginInches: 0.75,
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
          // 强制保证用户要求：默认不显示横线
          showSectionDividers: parsed.showSectionDividers ?? false,
          showHeaderDivider: parsed.showHeaderDivider ?? false,
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
      // Dispatch custom event to notify all components
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
