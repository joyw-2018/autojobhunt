/**
 * Service for exporting tailored resumes to Google Docs using user's personal Google Account (OAuth 2.0).
 */

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
   * Builds an executive-ready HTML document representation for Drive conversion.
   */
  buildResumeHtml(data: ResumeExportData): string {
    const is2Page = data.pageLength === 2;

    const experiencesHtml = data.experiences
      .map(exp => {
        const bulletsList = exp.bullets
          .map(b => `<li style="margin-bottom: 4pt; line-height: 1.35; font-size: 10pt; color: #1f2937;">${b.chosen_text}</li>`)
          .join('');

        return `
          <div style="margin-top: 8pt; margin-bottom: 6pt;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 10.5pt;">
              <span style="font-weight: bold; color: #111827;">${exp.company} <span style="font-weight: normal; color: #4b5563;">— ${exp.role}</span></span>
              <span style="font-size: 9.5pt; color: #6b7280; font-family: 'Courier New', monospace;">${exp.date_range}</span>
            </div>
            <ul style="margin-top: 3pt; margin-bottom: 6pt; padding-left: 18pt;">
              ${bulletsList}
            </ul>
          </div>
        `;
      })
      .join('');

    const skillsHtml = data.skillsCategories
      .map(
        sc => `
          <div style="margin-bottom: 3pt; font-size: 9.5pt; line-height: 1.35;">
            <strong style="color: #111827;">${sc.category}:</strong>
            <span style="color: #374151;"> ${sc.skills}</span>
          </div>
        `
      )
      .join('');

    const sideProjectsSection = (is2Page && data.sideProjects) ? `
      <div style="margin-top: 10pt;">
        <h2 style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #111827; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-bottom: 4pt;">
          Recent Technical Side Projects
        </h2>
        <p style="font-size: 9.5pt; line-height: 1.35; color: #374151; margin-top: 3pt;">
          ${data.sideProjects}
        </p>
      </div>
    ` : '';

    const keynotesSection = data.keynotesTalks ? `
      <div style="margin-top: 10pt;">
        <h2 style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #111827; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-bottom: 4pt;">
          Keynotes & Technical Thought Leadership
        </h2>
        <p style="font-size: 9.5pt; line-height: 1.35; color: #374151; margin-top: 3pt;">
          ${data.keynotesTalks}
        </p>
      </div>
    ` : '';

    const educationSection = data.education ? `
      <div style="margin-top: 10pt;">
        <h2 style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #111827; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-bottom: 4pt;">
          Education
        </h2>
        <p style="font-size: 9.5pt; line-height: 1.35; color: #374151; margin-top: 3pt;">
          ${data.education}
        </p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.candidateName} - Resume - ${data.targetCompany}</title>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.3; color: #111827; max-width: 780px; margin: 0 auto; padding: 20pt;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 1pt solid #d1d5db; padding-bottom: 6pt; margin-bottom: 8pt;">
          <h1 style="font-size: 20pt; font-weight: bold; margin: 0 0 4pt 0; color: #111827;">${data.candidateName}</h1>
          <p style="font-size: 9pt; color: #4b5563; margin: 0;">${data.contactInfo}</p>
        </div>

        <!-- Executive Summary -->
        <div style="margin-bottom: 8pt;">
          <h2 style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #111827; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-bottom: 4pt;">
            Executive Summary
          </h2>
          <p style="font-size: 9.5pt; line-height: 1.4; color: #1f2937; margin: 0;">
            ${data.summary}
          </p>
        </div>

        <!-- Core Competencies -->
        <div style="margin-bottom: 8pt;">
          <h2 style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #111827; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-bottom: 4pt;">
            Core Competencies & Domain Expertise
          </h2>
          ${skillsHtml}
        </div>

        <!-- Professional Experience -->
        <div style="margin-bottom: 8pt;">
          <h2 style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #111827; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-bottom: 4pt;">
            Professional Experience
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
   * Exports the resume into user's personal Google Drive as a native Google Doc.
   * Uses Drive multipart upload with conversion to application/vnd.google-apps.document.
   */
  async createGoogleDoc(accessToken: string, data: ResumeExportData): Promise<{ docId: string; docUrl: string; title: string }> {
    const docTitle = `${data.candidateName} - Resume - ${data.targetCompany} (${data.targetJobTitle})`;
    const htmlContent = this.buildResumeHtml(data);

    // Try Drive upload conversion first (preserves headings, bold text, styles, and bullets natively)
    try {
      const metadata = {
        name: docTitle,
        mimeType: 'application/vnd.google-apps.document',
      };

      const boundary = '-------AutoJobHuntResumeBoundary' + Math.floor(Math.random() * 1000000);
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
        htmlContent +
        closeDelimiter;

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
        return {
          docId,
          docUrl: `https://docs.google.com/document/d/${docId}/edit`,
          title: docTitle,
        };
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

    // Convert resume to structured text for Docs API
    let plainText = `${data.candidateName}\n${data.contactInfo}\n\n`;
    plainText += `EXECUTIVE SUMMARY\n${data.summary}\n\n`;
    plainText += `CORE COMPETENCIES & DOMAIN EXPERTISE\n`;
    data.skillsCategories.forEach(s => {
      plainText += `${s.category}: ${s.skills}\n`;
    });
    plainText += `\nPROFESSIONAL EXPERIENCE\n`;
    data.experiences.forEach(exp => {
      plainText += `${exp.company} — ${exp.role} (${exp.date_range})\n`;
      exp.bullets.forEach(b => {
        plainText += `• ${b.chosen_text}\n`;
      });
      plainText += `\n`;
    });
    if (data.pageLength === 2 && data.sideProjects) {
      plainText += `RECENT TECHNICAL SIDE PROJECTS\n${data.sideProjects}\n\n`;
    }
    if (data.keynotesTalks) {
      plainText += `KEYNOTES & TECHNICAL THOUGHT LEADERSHIP\n${data.keynotesTalks}\n\n`;
    }
    if (data.education) {
      plainText += `EDUCATION\n${data.education}\n`;
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

    return {
      docId,
      docUrl: `https://docs.google.com/document/d/${docId}/edit`,
      title: docTitle,
    };
  },
};
