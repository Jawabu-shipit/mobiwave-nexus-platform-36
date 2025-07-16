
import { supabase } from '@/integrations/supabase/client';

// Secure encryption utility that uses Supabase secrets
export class SecureCrypto {
  private static instance: SecureCrypto;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): SecureCrypto {
    if (!SecureCrypto.instance) {
      SecureCrypto.instance = new SecureCrypto();
    }
    return SecureCrypto.instance;
  }

  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      // Use edge function to get encryption key from Supabase secrets
      const { data, error } = await supabase.functions.invoke('get-encryption-key');
      
      if (error) {
        throw new Error('Failed to retrieve encryption key');
      }

      this.encryptionKey = data.key;
      return this.encryptionKey;
    } catch (error) {
      console.error('Encryption key retrieval failed:', error);
      throw new Error('Encryption service unavailable');
    }
  }

  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      
      // Use edge function for server-side encryption
      const { data: encrypted, error } = await supabase.functions.invoke('encrypt-data', {
        body: { data, operation: 'encrypt' }
      });

      if (error) {
        throw new Error('Encryption failed');
      }

      return encrypted.result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      
      // Use edge function for server-side decryption
      const { data: decrypted, error } = await supabase.functions.invoke('encrypt-data', {
        body: { data: encryptedData, operation: 'decrypt' }
      });

      if (error) {
        throw new Error('Decryption failed');
      }

      return decrypted.result;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }
}
