// Deno global types for Supabase Edge Functions
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  // export const env: Env; // Removed to avoid redeclaration error
}