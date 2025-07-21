import { createClient } from "npm:@supabase/supabase-js";

// Import the decryption function
const ENCRYPTION_KEY_B64 = Deno.env.get("API_KEY_ENCRYPTION_KEY_B64") ?? "";
if (!ENCRYPTION_KEY_B64) {
  throw new Error(
    "API_KEY_ENCRYPTION_KEY_B64 environment variable is required for encryption/decryption.",
  );
}
const ENCRYPTION_KEY = Uint8Array.from(atob(ENCRYPTION_KEY_B64), (c) =>
  c.charCodeAt(0),
);

// Decrypts base64(iv):base64(ciphertext) to string
async function decryptApiKey(encrypted: string): Promise<string> {
  const [ivB64, cipherB64] = encrypted.split(":");
  if (!ivB64 || !cipherB64)
    throw new Error("Invalid encrypted API key format.");
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    ENCRYPTION_KEY,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes,
  );
  return new TextDecoder().decode(plainBuffer);
}

export async function getApiCredentials(authHeader: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  if (!authHeader) {
    throw new Error("Authorization header required for mspace SMS function");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    throw new Error(
      `Authentication failed: ${authError?.message || "Invalid token"}`,
    );
  }

  // Get user-specific credentials from api_credentials table ONLY
  const { data: credentials, error: credError } = await supabase
    .from("api_credentials")
    .select("*")
    .eq("user_id", user.id)
    .eq("service_name", "mspace")
    .eq("is_active", true)
    .single();

  if (credError || !credentials) {
    throw new Error(
      `Mspace API credentials not found for user ${user.id}. Please configure credentials in the admin panel under Users > API Credentials. Error: ${credError?.message || "No credentials found"}`,
    );
  }

  // Decrypt the API key from api_key_encrypted column
  const encryptedApiKey = credentials.api_key_encrypted as string;
  if (!encryptedApiKey) {
    throw new Error(
      `Encrypted API key missing in api_key_encrypted column for user ${user.id}. Please re-configure your credentials.`,
    );
  }

  let apiKey: string;
  try {
    apiKey = await decryptApiKey(encryptedApiKey);
  } catch (decryptError) {
    throw new Error(
      `Failed to decrypt API key for user ${user.id}: ${decryptError.message}. Please re-configure your credentials.`,
    );
  }

  // Get username from the username column directly
  const username = credentials.username as string;
  const defaultSenderId = (credentials.sender_id as string) || "MOBIWAVE";

  if (!username) {
    throw new Error(
      `Username not found in username column for user ${user.id}. Please re-configure your credentials with a username.`,
    );
  }

  console.log(
    `Successfully retrieved mspace credentials for user ${user.id}, username: ${username}`,
  );

  return { user, apiKey, username, defaultSenderId };
}
