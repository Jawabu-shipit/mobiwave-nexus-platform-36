// Secure Admin Users Function
// Provides secure user management operations with proper authorization and audit logging

/// <reference path="./deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Security constants
const ADMIN_ROLES = ["super_admin", "admin"];
const MAX_REQUESTS_PER_MINUTE = 20;
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

// Rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitEntry>();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Request body interface for action-based operations
interface ActionRequestBody {
  action: string;
  userId: string;
  adminId?: string;
  data?: Record<string, unknown>;
}

interface AdminUser {
  id: string;
  email?: string;
}

interface Profile {
  role: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for admin operations (from Edge Function secrets)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify the user making the request has admin privileges
    // Supabase v2 getUser does not take a token argument in Edge Functions; use getUser() and check user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseAdmin.auth.getUser();
    const user = userData?.user ?? null;
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const profile: Profile | null = (profileData && typeof profileData === 'object' && profileData !== null && Object.prototype.hasOwnProperty.call(profileData, 'role')) ? (profileData as Profile) : null;
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting
    const clientIp = req.headers.get("x-real-ip") || "unknown";
    const rateKey = `${user.id}:${clientIp}`;
    
    const now = Date.now();
    const rateEntry = rateLimits.get(rateKey) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    // Reset counter if the window has passed
    if (now > rateEntry.resetTime) {
      rateEntry.count = 0;
      rateEntry.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    // Check if rate limit exceeded
    if (rateEntry.count >= MAX_REQUESTS_PER_MINUTE) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          details: `Maximum ${MAX_REQUESTS_PER_MINUTE} requests per minute allowed`
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': `${Math.ceil((rateEntry.resetTime - now) / 1000)}`
          } 
        }
      );
    }
    
    // Increment request count
    rateEntry.count++;
    rateLimits.set(rateKey, rateEntry);

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Fetch all users securely
      // @ts-expect-error: admin API is available in Edge Functions
      const usersResult = await supabaseAdmin.auth.admin.listUsers();
      // usersResult: { users: User[] }
      // Log the action for audit purposes
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user.id,
        action: 'LIST_USERS',
        resource: 'users',
        data: {
          adminId: user.id,
          clientIp,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({ users: usersResult?.users ?? [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      // Parse request body
      const requestBody = await req.json();
      
      // Check if this is an action-based request
      if (requestBody.action) {
        return await handleActionRequest(requestBody, user, clientIp, supabaseAdmin);
      }
      
      // Otherwise, handle as a user creation request
      const { email, password, userData } = requestBody;
      
      // Validate required fields
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create user securely on server-side
      // @ts-expect-error: admin API is available in Edge Functions
      const createResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: userData,
        email_confirm: true
      });
      if (!createResult.user) {
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Log the action for audit purposes
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user.id,
        action: 'CREATE_USER',
        resource: `user/${createResult.user.id}`,
        data: {
          adminId: user.id,
          newUserId: createResult.user.id,
          email: createResult.user.email,
          clientIp,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({ user: createResult.user }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle action-based requests (deactivate, reactivate, update role, etc.)
 */
async function handleActionRequest(
  requestBody: ActionRequestBody, 
  adminUser: AdminUser, 
  clientIp: string,
  supabase: ReturnType<typeof createClient>
) {
  const { action, userId, data } = requestBody;
  
  // Validate required fields
  if (!action || !userId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields (action, userId)' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Log the action for audit purposes
  await supabase.from("audit_logs").insert({
    user_id: adminUser.id,
    action: `ADMIN_${action.toUpperCase()}`,
    resource: `user/${userId}`,
    data: {
      adminId: adminUser.id,
      targetUserId: userId,
      action,
      clientIp,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
  
  // Process the action
  let result: unknown;
  switch (action.toLowerCase()) {
    case "deactivate":
      result = await deactivateUser(userId, adminUser.id, supabase);
      break;
    case "reactivate":
      result = await reactivateUser(userId, adminUser.id, supabase);
      break;
    case "delete":
      // Hard delete is not allowed through this function for safety
      return new Response(
        JSON.stringify({ error: "Hard delete is not allowed for security reasons" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    case "update_role":
      if (!data || typeof data !== 'object' || !('role' in data)) {
        return new Response(
          JSON.stringify({ error: "Missing role in data" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = await updateUserRole(userId, (data as { role: string }).role, adminUser.id, supabase);
      break;
    default:
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
  return new Response(
    JSON.stringify(result),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Deactivate a user (soft delete)
 */
async function deactivateUser(userId: string, adminId: string, supabase: ReturnType<typeof createClient>) {
  // First, update the user's auth metadata
  // @ts-expect-error: admin API is available in Edge Functions
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { status: "inactive", deactivated_by: adminId, deactivated_at: new Date().toISOString() } }
  );

  if (authError) {
    throw new Error(`Error updating auth user: ${authError.message}`);
  }

  // Then update the profile status
  const updateProfileResult = await supabase
    .from("profiles")
    .update({ 
      status: "inactive",
      updated_by: adminId,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .single();
  if (updateProfileResult.error) {
    const msg = typeof updateProfileResult.error === 'object' && updateProfileResult.error && 'message' in updateProfileResult.error
      ? (updateProfileResult.error as { message: string }).message
      : JSON.stringify(updateProfileResult.error);
    throw new Error(`Error updating profile: ${msg}`);
  }

  // Create a notification for the user
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Account Deactivated",
    message: "Your account has been deactivated by an administrator. Please contact support if you believe this is an error.",
    type: "security",
    is_read: false,
    created_at: new Date().toISOString(),
    created_by: adminId
  });

  return { success: true, message: "User deactivated successfully" };
}

/**
 * Reactivate a user
 */
async function reactivateUser(userId: string, adminId: string, supabase: ReturnType<typeof createClient>) {
  // First, update the user's auth metadata
  // @ts-expect-error: admin API is available in Edge Functions
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { status: "active", reactivated_by: adminId, reactivated_at: new Date().toISOString() } }
  );

  if (authError) {
    throw new Error(`Error updating auth user: ${authError.message}`);
  }

  // Then update the profile status
  const updateProfileResult = await supabase
    .from("profiles")
    .update({ 
      status: "active",
      updated_by: adminId,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .single();
  if (updateProfileResult.error) {
    const msg = typeof updateProfileResult.error === 'object' && updateProfileResult.error && 'message' in updateProfileResult.error
      ? (updateProfileResult.error as { message: string }).message
      : JSON.stringify(updateProfileResult.error);
    throw new Error(`Error updating profile: ${msg}`);
  }

  // Create a notification for the user
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Account Reactivated",
    message: "Your account has been reactivated. You can now log in again.",
    type: "security",
    is_read: false,
    created_at: new Date().toISOString(),
    created_by: adminId
  });

  return { success: true, message: "User reactivated successfully" };
}

/**
 * Update a user's role
 */
async function updateUserRole(userId: string, role: string, adminId: string, supabase: ReturnType<typeof createClient>) {
  // Validate role
  const validRoles = ["super_admin", "admin", "manager", "user"];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  // Update the profile role
  const updateProfileResult = await supabase
    .from("profiles")
    .update({ 
      role,
      updated_by: adminId,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .single();
  if (updateProfileResult.error) {
    const msg = typeof updateProfileResult.error === 'object' && updateProfileResult.error && 'message' in updateProfileResult.error
      ? (updateProfileResult.error as { message: string }).message
      : JSON.stringify(updateProfileResult.error);
    throw new Error(`Error updating profile: ${msg}`);
  }

  // Create a notification for the user
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Role Updated",
    message: `Your account role has been updated to ${role}.`,
    type: "security",
    is_read: false,
    created_at: new Date().toISOString(),
    created_by: adminId
  });

  return { success: true, message: "User role updated successfully" };
}
