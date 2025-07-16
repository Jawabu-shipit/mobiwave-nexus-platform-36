// Type definitions for Deno (env redeclaration removed to avoid conflicts)

// Type declarations for Deno standard library modules
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Type declarations for Supabase client
declare module "https://esm.sh/@supabase/supabase-js@2.39.3" {
  interface SupabaseClientOptions {
    global?: {
      headers?: Record<string, string>;
    };
  }
  interface SupabaseAuth {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
    // Add more auth methods as needed
  }
  interface SupabaseFromQuery {
    select: (columns?: string) => SupabaseFromQuery;
    eq: (column: string, value: unknown) => SupabaseFromQuery;
    single: () => Promise<{ data: unknown; error: unknown }>;
    insert: (values: unknown) => SupabaseFromQuery;
    update: (values: unknown) => SupabaseFromQuery;
    delete: () => SupabaseFromQuery;
    order: (column: string, options?: { ascending: boolean }) => SupabaseFromQuery;
    limit: (count: number) => SupabaseFromQuery;
    range: (from: number, to: number) => SupabaseFromQuery;
    // Add more query methods as needed
  }
  interface SupabaseClient {
    auth: SupabaseAuth;
    from: (table: string) => SupabaseFromQuery;
    // Add more methods as needed
  }
  export function createClient(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions): SupabaseClient;
}