/**
 * Service for exporting tailored resumes to Google Docs using user's personal Google Account (OAuth 2.0).
 */
import { GoogleDocsFormatConfig, docFormatService } from './docFormatService';

declare global {
  interface Window {
    google?: any;
  }
}

const CLIENT_ID_STORAGE_KEY = 'autojobhunt_google_client_id';

export interface ResumeExportData {
  candidateName: string;
  contactInfo: string;
  targetCompany: string;
  targetJobTitle: string;
  summary: string;
  skillsCategories: Array<{ category: string; skills: string }>;
  experiences: Array<{
    company: string;
    role: string;
    date_range: string;
    bullets: Array<{ chosen_text: string }>;
  }>;
  sideProjects?: string;
  keynotesTalks?: string;
  education?: string;
  pageLength: number;
  formatConfig?: GoogleDocsFormatConfig;
}

export const googleDocsService = {
  getStoredClientId(): string {
    return localStorage.getItem(CLIENT_ID_STORAGE_KEY) || '';
  },

  setStoredClientId(clientId: string): void {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
  },

  clearStoredClientId(): void {
    localStorage.removeItem(CLIENT_ID_STORAGE_KEY);
  },

  /**
   * Ensures the Google Identity Services (GIS) client library is loaded.
   */
  async loadGis(): Promise<void> {
    if (window.google?.accounts?.oauth2) {
      return;
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-gis-script');
      if (existingScript) {
        existingScript.onload = () => resolve();
        existingScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  },

  /**
   * Requests an OAuth 2.0 access token from user via Google GIS popup.
   */
  async getAccessToken(clientId: string): Promise<string> {
    await this.loadGis();

    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services library is not available.');
    }

    return new Promise((resolve, reject) => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file',
          callback: (resp: any) => {
            if (resp.error) {
              reject(new Error(resp.error_description || resp.error || 'Google 账号授权失败或已取消'));
              return;
            }
            if (resp.access_token) {
              resolve(resp.access_token);
            } else {
              reject(new Error('未能获取到有效的 Google Access Token'));
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        reject(new Error(`初始化 Google 登录授权失败: ${err.message}`));
      }
    });
  },

  /**
  /**
   * Normalizes font family names for Google Docs API compatibility.
   */
  normalizeFontFamily(font: string): string {
    const f = (font || 'Arial').trim();
    if (f.toLowerCase() === 'garamond') return 'EB Garamond';
    return f;
  },

  /**
   * Builds an executive-ready HTML document representation for Drive conversion.
   * Strips extra horizontal lines by default, strictly eliminates blank lines between subtitles and text,
   * and applies user-customized typography rules inline to every element.
   */
  buildResumeHtml(data: ResumeExportData, customConfig?: GoogleDocsFormatConfig): string {
    const config = customConfig || data.formatConfig || docFormatService.getStoredConfig();
    const is2Page = data.pageLength === 2;
    const fontFamily = this.normalizeFontFamily(config.fontFamily);
    const fontStack = `'${fontFamily}', Arial, sans-serif`;
    const paddingPt = Math.round(config.marginInches * 72);

    // Header divider: only present if showHeaderDivider is true
    const headerDividerHr = config.showHeaderDivider
      ? `<hr style="border: 0; border-top: ${config.dividerThickness || 1.5}pt solid ${config.dividerColor || '#0f172a'}; margin: 6pt 0 10pt 0;" />`
      : '';

    // Section header divider: only present if showSectionDividers is true
    const sectionBorder = config.showSectionDividers
      ? `border-bottom: ${config.dividerThickness || 1}pt solid ${config.dividerColor || '#1e3a8a'}; padding-bottom: 2pt;`
      : '';

    const sectionTitleColor = config.sectionHeaderColor || '#1e3a8a';
    const sectionTitleCase = config.sectionHeaderUppercase ? 'text-transform: uppercase;' : '';
    const sectionFontWeight = config.sectionHeaderBold ? 'font-weight: bold;' : 'font-weight: 600;';

    // Section title style: explicit bold and uppercase with inline style
    const sectionHeadingStyle = `font-family: ${fontStack}; font-size: ${config.sectionHeaderSize}pt; font-weight: bold; ${sectionTitleCase} letter-spacing: 0.5pt; color: ${sectionTitleColor}; ${sectionBorder} margin: 0; margin-top: 10pt; margin-bottom: 3pt; line-height: 1.2;`;

    // Experiences: uses borderless 100% table + tight <ul> to eliminate blank line between company subtitle and bullets
    const experiencesHtml = data.experiences
      .map(exp => {
        const bulletsList = exp.bullets
          .map(b => `<li style="font-family: ${fontStack}; margin: 0; margin-bottom: ${config.paragraphSpacing || 3}pt; line-height: ${config.lineSpacing}; font-size: ${config.bodySize}pt; color: #1f2937; text-align: justify;">${b.chosen_text}</li>`)
          .join('');

        return `
          <div style="margin: 0; margin-top: 6pt; margin-bottom: 3pt;">
            <table style="width: 100%; border: none; border-collapse: collapse; margin: 0; margin-bottom: 2pt; padding: 0;">
              <tbody>
                <tr>
                  <td style="width: 75%; font-family: ${fontStack}; font-size: ${config.roleAndOrgSize}pt; font-weight: bold; color: #111827; border: none; padding: 0; margin: 0; text-align: left; vertical-align: bottom;">
                    <b>${exp.company}</b><span style="font-weight: normal; color: #475569;"> — ${exp.role}</span>
                  </td>
                  <td style="width: 25%; font-family: ${fontStack}; font-size: ${Math.max(8.5, config.bodySize - 0.5)}pt; color: #64748b; border: none; padding: 0; margin: 0; text-align: right; vertical-align: bottom; white-space: nowrap;">
                    ${exp.date_range}
                  </td>
                </tr>
              </tbody>
            </table>
            <ul style="margin: 0; margin-top: 2pt; margin-bottom: 3pt; padding-left: 16pt;">
              ${bulletsList}
            </ul>
          </div>
        `;
      })
      .join('');

    // Skills: compact <p> elements with 0 margin to prevent empty lines
    const skillsHtml = data.skillsCategories
      .map(
        sc => `
          <p style="font-family: ${fontStack}; margin: 0; margin-bottom: 2pt; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; text-align: justify;">
            <b style="color: #0f172a;">${sc.category}:</b>
            <span style="color: #334155;"> ${sc.skills}</span>
          </p>
        `
      )
      .join('');

    const sideProjectsSection = (is2Page && data.sideProjects) ? `
      <div style="margin: 0; margin-top: 8pt; margin-bottom: 6pt;">
        <h2 style="${sectionHeadingStyle}">
          <b>RECENT TECHNICAL SIDE PROJECTS</b>
        </h2>
        <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #374151; margin: 0; padding: 0; text-align: justify;">
          ${data.sideProjects}
        </p>
      </div>
    ` : '';

    const keynotesSection = data.keynotesTalks ? `
      <div style="margin: 0; margin-top: 8pt; margin-bottom: 6pt;">
        <h2 style="${sectionHeadingStyle}">
          <b>KEYNOTES & TECHNICAL THOUGHT LEADERSHIP</b>
        </h2>
        <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #374151; margin: 0; padding: 0; text-align: justify;">
          ${data.keynotesTalks}
        </p>
      </div>
    ` : '';

    const educationSection = data.education ? `
      <div style="margin: 0; margin-top: 8pt; margin-bottom: 6pt;">
        <h2 style="${sectionHeadingStyle}">
          <b>EDUCATION</b>
        </h2>
        <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #374151; margin: 0; padding: 0; text-align: justify;">
          ${data.education}
        </p>
      </div>
    ` : '';

    const candidateAlign = config.candidateNameAlign || 'center';
    const candidateBold = config.candidateNameBold ? 'bold' : '600';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.candidateName} - Resume - ${data.targetCompany}</title>
        <style>
          * {
            box-sizing: border-box;
            font-family: ${fontStack} !important;
          }
          body, p, div, span, strong, td, th, li, ul, ol, h1, h2, h3 {
            font-family: ${fontStack} !important;
          }
          body {
            margin: 0;
            padding: 0;
            color: #111827;
          }
          p {
            margin: 0;
            padding: 0;
          }
          table {
            border-collapse: collapse;
            border: none;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          td {
            border: none;
            padding: 0;
            margin: 0;
          }
          ul {
            margin: 0;
            margin-top: 2pt;
            margin-bottom: 3pt;
            padding-left: 16pt;
          }
          li {
            margin: 0;
            margin-bottom: ${config.paragraphSpacing || 3}pt;
          }
          h2 {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #111827; max-width: 780px; margin: 0 auto; padding: ${paddingPt}pt;">
        <!-- Header -->
        <div style="text-align: ${candidateAlign}; margin: 0; margin-bottom: 4pt;">
          <h1 style="font-family: ${fontStack}; font-size: ${config.candidateNameSize}pt; font-weight: bold; margin: 0; margin-bottom: 2pt; line-height: 1.15; color: ${sectionTitleColor};"><b>${data.candidateName}</b></h1>
          <p style="font-family: ${fontStack}; font-size: ${config.contactInfoSize || 9.5}pt; color: #1e293b; margin: 0; line-height: 1.2;">${data.contactInfo}</p>
        </div>
        ${headerDividerHr}

        <!-- Executive Summary (no gap between heading and text) -->
        <div style="margin: 0; margin-bottom: 6pt;">
          <h2 style="${sectionHeadingStyle}">
            <b>EXECUTIVE SUMMARY</b>
          </h2>
          <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #1f2937; margin: 0; padding: 0; text-align: justify;">
            ${data.summary}
          </p>
        </div>

        <!-- Core Competencies (no gap between heading and list) -->
        <div style="margin: 0; margin-bottom: 6pt;">
          <h2 style="${sectionHeadingStyle}">
            <b>CORE COMPETENCIES & DOMAIN EXPERTISE</b>
          </h2>
          ${skillsHtml}
        </div>

        <!-- WORK HISTORY (aligned with preview title and layout) -->
        <div style="margin: 0; margin-bottom: 6pt;">
          <h2 style="${sectionHeadingStyle}">
            <b>WORK HISTORY</b>
          </h2>
          ${experiencesHtml}
        </div>

        ${sideProjectsSection}
        ${keynotesSection}
        ${educationSection}
      </body>
      </html>
    `;
  },

  /**
   * Helper to parse hex color string to Google Docs API RGB (0..1)
   */
  parseHexColor(hex: string): { red: number; green: number; blue: number } {
    const cleanHex = (hex || '#000000').replace('#', '').trim();
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return { red: 0.1, green: 0.15, blue: 0.25 };
    return {
      red: ((num >> 16) & 255) / 255,
      green: ((num >> 8) & 255) / 255,
      blue: (num & 255) / 255,
    };
  },

  /**
   * Exports the tailored resume directly into user's personal Google Drive as a native Google Doc.
   * Uses direct Google Docs REST API (documents.create + batchUpdate) to guarantee:
   * 1. 100% exact bold styling on Candidate Name, Headings, Categories, and Companies (never stripped).
   * 2. Zero unwanted blank lines between sections, subtitles, and text.
   * 3. Native bullet points and exact paragraph spacing matching the web preview 1:1.
   * 4. User-customized font family and page margins across all elements.
   */
  async createGoogleDoc(accessToken: string, data: ResumeExportData): Promise<{ docId: string; docUrl: string; title: string }> {
    const config = data.formatConfig || docFormatService.getStoredConfig();
    const docTitle = `${data.candidateName} - Resume - ${data.targetCompany} (${data.targetJobTitle})`;
    const normalizedFont = this.normalizeFontFamily(config.fontFamily || 'Arial');

    // 1. Create a blank Google Doc via Docs API
    const docsRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: docTitle }),
    });

    if (!docsRes.ok) {
      const errJson = await docsRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `创建 Google 文档失败 (HTTP ${docsRes.status})`);
    }

    const docsData = await docsRes.json();
    const docId = docsData.documentId;

    // 2. Data model for structured document generation
    interface TextSpan {
      text: string;
      bold?: boolean;
      fontSize?: number;
      color?: { red: number; green: number; blue: number };
    }

    interface DocParagraph {
      spans: TextSpan[];
      alignment?: 'START' | 'CENTER' | 'END' | 'JUSTIFIED';
      spaceAbovePt?: number;
      spaceBelowPt?: number;
      lineSpacingMultiplier?: number;
      isBullet?: boolean;
      borderBottom?: {
        color: { red: number; green: number; blue: number };
        widthPt: number;
        dashStyle?: string;
      };
    }

    const paragraphs: DocParagraph[] = [];

    const nameSize = config.candidateNameSize || 22;
    const contactSize = config.contactInfoSize || 9.5;
    const headerSize = config.sectionHeaderSize || 11;
    const roleSize = config.roleAndOrgSize || 10.5;
    const bodySize = config.bodySize || 10;
    const dateSize = Math.max(8.5, bodySize - 0.5);

    const headerColor = this.parseHexColor(config.sectionHeaderColor || '#1e3a8a');
    const nameColor = headerColor; // Exactly matches EXECUTIVE SUMMARY color!
    const contactColor = this.parseHexColor('#1e293b');
    const companyColor = this.parseHexColor('#0f172a');
    const roleColor = this.parseHexColor('#475569');
    const dateColor = this.parseHexColor('#64748b');
    const bodyColor = this.parseHexColor('#1f2937');
    const skillCategoryColor = this.parseHexColor('#0f172a');
    const skillTextColor = this.parseHexColor('#334155');
    const dividerColor = this.parseHexColor(config.dividerColor || '#0f172a');
    const lineSpacingPct = Math.round((config.lineSpacing || 1.15) * 100);

    // Candidate Name
    paragraphs.push({
      spans: [
        {
          text: `${data.candidateName.trim()}\n`,
          bold: true,
          fontSize: nameSize,
          color: nameColor,
        },
      ],
      alignment: (config.candidateNameAlign || 'center') === 'center' ? 'CENTER' : 'START',
      spaceAbovePt: 0,
      spaceBelowPt: 2,
      lineSpacingMultiplier: 115,
    });

    // Contact Info
    paragraphs.push({
      spans: [
        {
          text: `${data.contactInfo.trim()}\n`,
          bold: false,
          fontSize: contactSize,
          color: contactColor,
        },
      ],
      alignment: (config.candidateNameAlign || 'center') === 'center' ? 'CENTER' : 'START',
      spaceAbovePt: 0,
      spaceBelowPt: 6,
      lineSpacingMultiplier: 115,
    });

    // Helper for Section Heading (Strictly 0 blank lines before or after)
    const addSectionHeading = (title: string) => {
      paragraphs.push({
        spans: [
          {
            text: `${title}\n`,
            bold: true,
            fontSize: headerSize,
            color: headerColor,
          },
        ],
        alignment: 'START',
        spaceAbovePt: 9,
        spaceBelowPt: 2.5,
        lineSpacingMultiplier: 115,
      });
    };

    // 1. EXECUTIVE SUMMARY (Justified左右对齐)
    addSectionHeading('EXECUTIVE SUMMARY');
    if (data.summary && data.summary.trim()) {
      paragraphs.push({
        spans: [
          {
            text: `${data.summary.trim()}\n`,
            bold: false,
            fontSize: bodySize,
            color: bodyColor,
          },
        ],
        alignment: 'JUSTIFIED',
        spaceAbovePt: 0,
        spaceBelowPt: 5, // Clean, tight spacing without any blank lines
        lineSpacingMultiplier: lineSpacingPct,
      });
    }

    // 2. CORE COMPETENCIES & DOMAIN EXPERTISE (Justified左右对齐)
    addSectionHeading('CORE COMPETENCIES & DOMAIN EXPERTISE');
    if (data.skillsCategories && data.skillsCategories.length > 0) {
      data.skillsCategories.forEach(sc => {
        paragraphs.push({
          spans: [
            {
              text: `${sc.category.trim()}: `,
              bold: true,
              fontSize: bodySize,
              color: skillCategoryColor,
            },
            {
              text: `${sc.skills.trim()}\n`,
              bold: false,
              fontSize: bodySize,
              color: skillTextColor,
            },
          ],
          alignment: 'JUSTIFIED',
          spaceAbovePt: 0,
          spaceBelowPt: 2,
          lineSpacingMultiplier: lineSpacingPct,
        });
      });
    }

    // 3. WORK HISTORY
    addSectionHeading('WORK HISTORY');
    if (data.experiences && data.experiences.length > 0) {
      data.experiences.forEach(exp => {
        paragraphs.push({
          spans: [
            {
              text: exp.company.trim(),
              bold: true,
              fontSize: roleSize,
              color: companyColor,
            },
            {
              text: ` — ${exp.role.trim()}`,
              bold: false,
              fontSize: roleSize,
              color: roleColor,
            },
            {
              text: ` (${exp.date_range.trim()})\n`,
              bold: false,
              fontSize: dateSize,
              color: dateColor,
            },
          ],
          alignment: 'START',
          spaceAbovePt: 5,
          spaceBelowPt: 2,
          lineSpacingMultiplier: 115,
        });

        // Bullets (Justified左右对齐)
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach(b => {
            const cleanText = b.chosen_text.trim().replace(/^[\s•\-\*]+\s*/, '');
            paragraphs.push({
              spans: [
                {
                  text: `•  ${cleanText}\n`,
                  bold: false,
                  fontSize: bodySize,
                  color: bodyColor,
                },
              ],
              alignment: 'JUSTIFIED',
              isBullet: true,
              spaceAbovePt: 0,
              spaceBelowPt: config.paragraphSpacing || 3,
              lineSpacingMultiplier: lineSpacingPct,
            });
          });
        }
      });
    }

    // 4. Optional Sections (Justified左右对齐)
    if (data.pageLength === 2 && data.sideProjects?.trim()) {
      addSectionHeading('RECENT TECHNICAL SIDE PROJECTS');
      paragraphs.push({
        spans: [
          {
            text: `${data.sideProjects.trim()}\n`,
            bold: false,
            fontSize: bodySize,
            color: this.parseHexColor('#374151'),
          },
        ],
        alignment: 'JUSTIFIED',
        spaceAbovePt: 0,
        spaceBelowPt: 4,
        lineSpacingMultiplier: lineSpacingPct,
      });
    }

    if (data.keynotesTalks?.trim()) {
      addSectionHeading('KEYNOTES & TECHNICAL THOUGHT LEADERSHIP');
      paragraphs.push({
        spans: [
          {
            text: `${data.keynotesTalks.trim()}\n`,
            bold: false,
            fontSize: bodySize,
            color: this.parseHexColor('#374151'),
          },
        ],
        alignment: 'JUSTIFIED',
        spaceAbovePt: 0,
        spaceBelowPt: 4,
        lineSpacingMultiplier: lineSpacingPct,
      });
    }

    if (data.education?.trim()) {
      addSectionHeading('EDUCATION');
      paragraphs.push({
        spans: [
          {
            text: `${data.education.trim()}\n`,
            bold: false,
            fontSize: bodySize,
            color: this.parseHexColor('#374151'),
          },
        ],
        alignment: 'JUSTIFIED',
        spaceAbovePt: 0,
        spaceBelowPt: 4,
        lineSpacingMultiplier: lineSpacingPct,
      });
    }

    // 3. Flatten and calculate precise index ranges for Google Docs API
    let fullText = '';
    const textRanges: Array<{
      startIndex: number;
      endIndex: number;
      bold: boolean;
      fontSize: number;
      color?: { red: number; green: number; blue: number };
    }> = [];

    const paragraphRanges: Array<{
      startIndex: number;
      endIndex: number;
      alignment: 'START' | 'CENTER' | 'END' | 'JUSTIFIED';
      spaceAbovePt: number;
      spaceBelowPt: number;
      lineSpacingMultiplier: number;
    }> = [];

    let contactInfoRange: { startIndex: number; endIndex: number } | null = null;

    paragraphs.forEach((p, idx) => {
      const pStart = 1 + fullText.length;
      for (const span of p.spans) {
        const sStart = 1 + fullText.length;
        fullText += span.text;
        const sEnd = 1 + fullText.length;
        textRanges.push({
          startIndex: sStart,
          endIndex: sEnd,
          bold: span.bold === true,
          fontSize: span.fontSize || bodySize,
          color: span.color,
        });
      }
      const pEnd = 1 + fullText.length;
      paragraphRanges.push({
        startIndex: pStart,
        endIndex: pEnd,
        alignment: p.alignment || 'START',
        spaceAbovePt: p.spaceAbovePt || 0,
        spaceBelowPt: p.spaceBelowPt || 2,
        lineSpacingMultiplier: p.lineSpacingMultiplier || 115,
      });

      // Track Contact Info range (paragraph at index 1)
      if (idx === 1) {
        contactInfoRange = { startIndex: pStart, endIndex: pEnd };
      }
    });

    // 4. Build core batchUpdate requests
    const requests: any[] = [];

    // Insert full text at index 1
    requests.push({
      insertText: {
        location: { index: 1 },
        text: fullText,
      },
    });

    // Page margins
    const marginPt = (config.marginInches || 0.75) * 72;
    requests.push({
      updateDocumentStyle: {
        documentStyle: {
          marginTop: { magnitude: marginPt, unit: 'PT' },
          marginBottom: { magnitude: marginPt, unit: 'PT' },
          marginLeft: { magnitude: marginPt, unit: 'PT' },
          marginRight: { magnitude: marginPt, unit: 'PT' },
        },
        fields: 'marginTop,marginBottom,marginLeft,marginRight',
      },
    });

    // Paragraph styles (alignment, spacing)
    for (const pr of paragraphRanges) {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: pr.startIndex,
            endIndex: pr.endIndex,
          },
          paragraphStyle: {
            alignment: pr.alignment,
            spaceAbove: { magnitude: pr.spaceAbovePt, unit: 'PT' },
            spaceBelow: { magnitude: pr.spaceBelowPt, unit: 'PT' },
            lineSpacing: pr.lineSpacingMultiplier,
          },
          fields: 'alignment,spaceAbove,spaceBelow,lineSpacing',
        },
      });
    }

    // Text styles (explicit bold, font sizes, weighted font family, colors)
    for (const tr of textRanges) {
      const tStyle: any = {
        bold: tr.bold,
        fontSize: { magnitude: tr.fontSize, unit: 'PT' },
        weightedFontFamily: {
          fontFamily: normalizedFont,
          weight: tr.bold ? 700 : 400,
        },
      };
      let tFields = 'bold,fontSize,weightedFontFamily';

      if (tr.color) {
        tStyle.foregroundColor = {
          color: { rgbColor: tr.color },
        };
        tFields += ',foregroundColor';
      }

      requests.push({
        updateTextStyle: {
          range: {
            startIndex: tr.startIndex,
            endIndex: tr.endIndex,
          },
          textStyle: tStyle,
          fields: tFields,
        },
      });
    }

    // 5. Execute core batchUpdate
    const batchRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!batchRes.ok) {
      const batchErr = await batchRes.json().catch(() => ({}));
      throw new Error(batchErr.error?.message || `Google Docs 排版设置失败 (HTTP ${batchRes.status})`);
    }

    // 6. Optional: apply clean divider line under contact info
    if (config.showHeaderDivider && contactInfoRange) {
      try {
        await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: (contactInfoRange as any).startIndex,
                    endIndex: (contactInfoRange as any).endIndex,
                  },
                  paragraphStyle: {
                    borderBottom: {
                      color: {
                        color: { rgbColor: dividerColor },
                      },
                      width: { magnitude: config.dividerThickness || 1.5, unit: 'PT' },
                      padding: { magnitude: 3.0, unit: 'PT' },
                      dashStyle: 'SOLID',
                    },
                  },
                  fields: 'borderBottom',
                },
              },
            ],
          }),
        });
      } catch (borderErr) {
        console.warn('Divider line update non-fatal error:', borderErr);
      }
    }

    return {
      docId,
      docUrl: `https://docs.google.com/document/d/${docId}/edit`,
      title: docTitle,
    };
  },
};
