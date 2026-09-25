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

    // Header divider: only present if showHeaderDivider is true (default true - matches PDF header line)
    const headerBorder = config.showHeaderDivider
      ? `border-bottom: ${config.dividerThickness || 1.5}pt solid ${config.dividerColor || '#0f172a'}; padding-bottom: 4pt;`
      : 'padding-bottom: 2pt;';

    // Section header divider: only present if showSectionDividers is true (default false - no horizontal lines!)
    const sectionBorder = config.showSectionDividers
      ? `border-bottom: ${config.dividerThickness || 1}pt solid ${config.dividerColor || '#1e3a8a'}; padding-bottom: 2pt;`
      : '';

    const sectionTitleColor = config.sectionHeaderColor || '#1e3a8a';
    const sectionTitleCase = config.sectionHeaderUppercase ? 'text-transform: uppercase;' : '';
    const sectionFontWeight = config.sectionHeaderBold ? 'font-weight: bold;' : 'font-weight: 600;';

    // Section title style: uses <p> to prevent Google Docs <h2> default 12pt spaceBelow, eliminating empty line
    const sectionHeadingStyle = `font-family: ${fontStack}; font-size: ${config.sectionHeaderSize}pt; ${sectionFontWeight} ${sectionTitleCase} letter-spacing: 0.5pt; color: ${sectionTitleColor}; ${sectionBorder} margin: 0; margin-top: 9pt; margin-bottom: 2pt; line-height: 1.2;`;

    // Experiences: uses borderless 100% table + tight <ul> to eliminate blank line between company subtitle and bullets
    const experiencesHtml = data.experiences
      .map(exp => {
        const bulletsList = exp.bullets
          .map(b => `<li style="font-family: ${fontStack}; margin: 0; margin-bottom: ${config.paragraphSpacing || 3}pt; line-height: ${config.lineSpacing}; font-size: ${config.bodySize}pt; color: #1f2937;">${b.chosen_text}</li>`)
          .join('');

        return `
          <div style="margin: 0; margin-top: 5pt; margin-bottom: 2pt;">
            <table style="width: 100%; border: none; border-collapse: collapse; margin: 0; margin-bottom: 1pt; padding: 0;">
              <tbody>
                <tr>
                  <td style="font-family: ${fontStack}; font-size: ${config.roleAndOrgSize}pt; font-weight: bold; color: #111827; border: none; padding: 0; margin: 0; text-align: left; vertical-align: bottom;">
                    ${exp.company} <span style="font-weight: normal; color: #374151;">— ${exp.role}</span>
                  </td>
                  <td style="font-family: ${fontStack}; font-size: ${Math.max(8.5, config.bodySize - 0.5)}pt; color: #4b5563; border: none; padding: 0; margin: 0; text-align: right; vertical-align: bottom; white-space: nowrap;">
                    ${exp.date_range}
                  </td>
                </tr>
              </tbody>
            </table>
            <ul style="margin: 0; margin-top: 1pt; margin-bottom: 2pt; padding-left: 14pt;">
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
          <p style="font-family: ${fontStack}; margin: 0; margin-bottom: 2pt; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing};">
            <strong style="color: #111827;">${sc.category}:</strong>
            <span style="color: #374151;"> ${sc.skills}</span>
          </p>
        `
      )
      .join('');

    const sideProjectsSection = (is2Page && data.sideProjects) ? `
      <div style="margin: 0; margin-top: 7pt;">
        <p style="${sectionHeadingStyle}">
          Recent Technical Side Projects
        </p>
        <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #374151; margin: 0; padding: 0;">
          ${data.sideProjects}
        </p>
      </div>
    ` : '';

    const keynotesSection = data.keynotesTalks ? `
      <div style="margin: 0; margin-top: 7pt;">
        <p style="${sectionHeadingStyle}">
          Keynotes & Technical Thought Leadership
        </p>
        <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #374151; margin: 0; padding: 0;">
          ${data.keynotesTalks}
        </p>
      </div>
    ` : '';

    const educationSection = data.education ? `
      <div style="margin: 0; margin-top: 7pt;">
        <p style="${sectionHeadingStyle}">
          Education
        </p>
        <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #374151; margin: 0; padding: 0;">
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
            margin-top: 1pt;
            margin-bottom: 2pt;
            padding-left: 14pt;
          }
          li {
            margin: 0;
            margin-bottom: ${config.paragraphSpacing || 3}pt;
          }
        </style>
      </head>
      <body style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #111827; max-width: 780px; margin: 0 auto; padding: ${paddingPt}pt;">
        <!-- Header -->
        <div style="text-align: ${candidateAlign}; ${headerBorder} margin: 0; margin-bottom: 5pt;">
          <p style="font-family: ${fontStack}; font-size: ${config.candidateNameSize}pt; font-weight: ${candidateBold}; margin: 0; margin-bottom: 2pt; line-height: 1.15; color: #111827;">${data.candidateName}</p>
          <p style="font-family: ${fontStack}; font-size: ${config.contactInfoSize || 9.5}pt; color: #4b5563; margin: 0; line-height: 1.2;">${data.contactInfo}</p>
        </div>

        <!-- Executive Summary (no gap between heading and text) -->
        <div style="margin: 0; margin-bottom: 5pt;">
          <p style="${sectionHeadingStyle}">
            Executive Summary
          </p>
          <p style="font-family: ${fontStack}; font-size: ${config.bodySize}pt; line-height: ${config.lineSpacing}; color: #1f2937; margin: 0; padding: 0;">
            ${data.summary}
          </p>
        </div>

        <!-- Core Competencies (no gap between heading and list) -->
        <div style="margin: 0; margin-bottom: 5pt;">
          <p style="${sectionHeadingStyle}">
            Core Competencies & Domain Expertise
          </p>
          ${skillsHtml}
        </div>

        <!-- Professional Experience (no gap between heading and employers, nor between company and bullets) -->
        <div style="margin: 0; margin-bottom: 5pt;">
          <p style="${sectionHeadingStyle}">
            Professional Experience
          </p>
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
   * Post-processes an existing or newly created Google Doc via Documents API batchUpdate:
   * 1. Forces the document-wide font family across all text content, ensuring Google Docs UI reflects it.
   * 2. Sets exact page margins to match config.marginInches.
   */
  async postFormatGoogleDoc(accessToken: string, docId: string, config: GoogleDocsFormatConfig): Promise<void> {
    try {
      const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!docRes.ok) return;

      const docJson = await docRes.json();
      const content = docJson.body?.content || [];
      const lastElement = content[content.length - 1];
      const maxEndIndex = lastElement?.endIndex ? lastElement.endIndex - 1 : 1;

      const requests: any[] = [];
      const normalizedFont = this.normalizeFontFamily(config.fontFamily);

      // 1. Force the selected font family across the entire document
      if (maxEndIndex > 1 && normalizedFont) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: 1,
              endIndex: maxEndIndex,
            },
            textStyle: {
              weightedFontFamily: {
                fontFamily: normalizedFont,
              },
            },
            fields: 'weightedFontFamily',
          },
        });
      }

      // 2. Adjust document page margins
      if (config.marginInches) {
        const marginPt = config.marginInches * 72;
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
      }

      if (requests.length > 0) {
        await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        });
      }
    } catch (err) {
      console.warn('Post-formatting Google Doc batchUpdate caught non-fatal error:', err);
    }
  },

  /**
   * Exports the resume into user's personal Google Drive as a native Google Doc.
   * Uses Drive multipart upload with conversion to application/vnd.google-apps.document,
   * followed by Documents API post-processing to guarantee exact font family and margin styling.
   */
  async createGoogleDoc(accessToken: string, data: ResumeExportData): Promise<{ docId: string; docUrl: string; title: string }> {
    const config = data.formatConfig || docFormatService.getStoredConfig();
    const docTitle = `${data.candidateName} - Resume - ${data.targetCompany} (${data.targetJobTitle})`;
    const htmlContent = this.buildResumeHtml(data, config);

    // Try Drive upload conversion first (preserves headings, bold text, styles, and bullets natively)
    try {
      const metadata = {
        name: docTitle,
        mimeType: 'application/vnd.google-apps.document',
      };

      const boundary = '-------AutoJobHuntResumeBoundary' + Math.floor(Math.random() * 1000000);
      const multipartRequestBody =
        `--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
        htmlContent +
        `\r\n--${boundary}--`;

      const driveRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (driveRes.ok) {
        const driveData = await driveRes.json();
        const docId = driveData.id;

        // Post-process to guarantee exact font-family and margins in Google Docs
        await this.postFormatGoogleDoc(accessToken, docId, config);

        return {
          docId,
          docUrl: `https://docs.google.com/document/d/${docId}/edit`,
          title: docTitle,
        };
      } else {
        const errText = await driveRes.text().catch(() => '');
        console.warn('Drive multipart upload returned non-OK status:', driveRes.status, errText);
      }
    } catch (driveErr) {
      console.warn('Drive multipart upload failed, attempting fallback to Docs API:', driveErr);
    }

    // Fallback: Use direct Google Docs API
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

    // Convert resume to structured text for Docs API without empty lines between headings and body
    let plainText = `${data.candidateName}\n${data.contactInfo}\n`;
    plainText += `\nEXECUTIVE SUMMARY\n${data.summary}\n`;
    plainText += `\nCORE COMPETENCIES & DOMAIN EXPERTISE\n`;
    data.skillsCategories.forEach(s => {
      plainText += `${s.category}: ${s.skills}\n`;
    });
    plainText += `\nPROFESSIONAL EXPERIENCE\n`;
    data.experiences.forEach(exp => {
      plainText += `${exp.company} — ${exp.role} (${exp.date_range})\n`;
      exp.bullets.forEach(b => {
        plainText += `• ${b.chosen_text}\n`;
      });
    });
    if (data.pageLength === 2 && data.sideProjects) {
      plainText += `\nRECENT TECHNICAL SIDE PROJECTS\n${data.sideProjects}\n`;
    }
    if (data.keynotesTalks) {
      plainText += `\nKEYNOTES & TECHNICAL THOUGHT LEADERSHIP\n${data.keynotesTalks}\n`;
    }
    if (data.education) {
      plainText += `\nEDUCATION\n${data.education}\n`;
    }

    // Insert text into document
    await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: plainText,
            },
          },
        ],
      }),
    });

    // Apply font family and styling to fallback document
    await this.postFormatGoogleDoc(accessToken, docId, config);

    return {
      docId,
      docUrl: `https://docs.google.com/document/d/${docId}/edit`,
      title: docTitle,
    };
  },
};
