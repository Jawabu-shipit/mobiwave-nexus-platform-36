
import CryptoJS from 'crypto-js';

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  supabaseUrl: string;
  features: {
    encryption: boolean;
    auditLogging: boolean;
    rateLimit: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableRemote: boolean;
  };
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig;
  private encryptionKey: string | null = null;

  private constructor() {
    this.config = {
      isDevelopment: window.location.hostname === 'localhost',
      isProduction: window.location.hostname !== 'localhost',
      apiUrl: window.location.origin,
      supabaseUrl: 'https://xfwtjndfclckgvpvgiaj.supabase.co',
      features: {
        encryption: true,
        auditLogging: true,
        rateLimit: true
      },
      logging: {
        level: window.location.hostname === 'localhost' ? 'debug' : 'info',
        enableConsole: true,
        enableRemote: window.location.hostname !== 'localhost'
      }
    };
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      // In production, get from secure edge function
      const response = await fetch('/api/get-encryption-key', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get encryption key');
      }

      const data = await response.json();
      this.encryptionKey = data.key;
      return this.encryptionKey;
    } catch (error) {
      console.error('Error getting encryption key:', error);
      // Fallback for development
      if (this.config.isDevelopment) {
        this.encryptionKey = 'dev-encryption-key-not-for-production';
        return this.encryptionKey;
      }
      throw error;
    }
  }

  async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  setSecureApiKey(keyName: string, keyValue: string): void {
    try {
      const encryptedKey = CryptoJS.AES.encrypt(keyValue, 'local-storage-key').toString();
      localStorage.setItem(`secure_${keyName}`, encryptedKey);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to securely store API key');
    }
  }

  getSecureApiKey(keyName: string): string | null {
    try {
      const encryptedKey = localStorage.getItem(`secure_${keyName}`);
      if (!encryptedKey) return null;
      
      const bytes = CryptoJS.AES.decrypt(encryptedKey, 'local-storage-key');
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }

  validateEnvironment(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (this.config.isProduction) {
      if (window.location.protocol !== 'https:') {
        issues.push('Production environment must use HTTPS');
      }
    }

    if (!this.config.supabaseUrl) {
      issues.push('Supabase URL not configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default EnvironmentManager;
