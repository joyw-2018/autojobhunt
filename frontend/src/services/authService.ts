/**
 * Authentication service for Google OAuth 2.0 Login and Session Management.
 */

export interface UserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
  loginAt: string;
}

const AUTH_STORAGE_KEY = 'autojobhunt_auth_user';
const CLIENT_ID_STORAGE_KEY = 'autojobhunt_google_client_id';

export const authService = {
  getStoredUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setStoredUser(user: UserProfile): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getClientId(): string {
    return localStorage.getItem(CLIENT_ID_STORAGE_KEY) || '';
  },

  setClientId(clientId: string): void {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
  },

  /**
   * Fetches Google User Profile using OAuth 2.0 Access Token.
   */
  async fetchUserProfile(accessToken: string): Promise<UserProfile> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error('获取 Google 个人信息失败，请重试');
    }

    const data = await res.json();
    const user: UserProfile = {
      sub: data.sub || 'google_user',
      name: data.name || 'Joy Wang',
      email: data.email || 'joy.jiayiwang@gmail.com',
      picture: data.picture,
      accessToken,
      loginAt: new Date().toISOString(),
    };

    this.setStoredUser(user);
    return user;
  },

  /**
   * Initiates Google OAuth Login Flow via Google Identity Services.
   */
  async loginWithGoogle(clientId: string): Promise<UserProfile> {
    if (!window.google?.accounts?.oauth2) {
      // Ensure GIS is loaded
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById('google-gis-script');
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-gis-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('无法加载 Google 登录组件'));
        document.head.appendChild(script);
      });
    }

    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file',
          callback: async (resp: any) => {
            if (resp.error) {
              reject(new Error(resp.error_description || resp.error || 'Google 账号授权取消或失败'));
              return;
            }
            if (resp.access_token) {
              try {
                const profile = await authService.fetchUserProfile(resp.access_token);
                resolve(profile);
              } catch (e: any) {
                reject(e);
              }
            } else {
              reject(new Error('未能获取到有效的 Google Access Token'));
            }
          },
        });

        client.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        reject(new Error(`初始化 Google OAuth 失败: ${err.message}`));
      }
    });
  },

  /**
   * Fast Demo Login for local offline verification / testing.
   */
  loginAsDemo(): UserProfile {
    const demoUser: UserProfile = {
      sub: 'joy_wang_demo',
      name: 'Joy Wang',
      email: 'joy.jiayiwang@gmail.com',
      picture: undefined,
      loginAt: new Date().toISOString(),
    };
    this.setStoredUser(demoUser);
    return demoUser;
  },
};
