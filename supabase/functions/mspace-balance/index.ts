import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Helper: Save credentials with encryption ---
/**
 * Save or update mspace API credentials for a user, encrypting the API key before storing.
 * Usage: await saveMspaceApiCredentials(supabase, userId, apiKey, username)
 */
export async function saveMspaceApiCredentials(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  apiKey: string,
  username: string,
) {
  const encryptedApiKey = await encryptApiKey(apiKey);
  const additional_config = { username };
  // Upsert credentials (insert or update if exists)
  const { error } = await supabaseClient.from("api_credentials").upsert(
    [
      {
        user_id: userId,
        service_name: "mspace",
        api_key_encrypted: encryptedApiKey,
        additional_config,
        is_active: true,
      },
    ],
    { onConflict: "user_id,service_name" },
  );
  if (error) throw new Error("Failed to save credentials: " + error.message);
}

// --- AES-GCM encryption/decryption helpers ---
// The encryption key must be 32 bytes (256 bits) for AES-256-GCM
const ENCRYPTION_KEY_B64 = Deno.env.get("API_KEY_ENCRYPTION_KEY_B64") ?? "";
if (!ENCRYPTION_KEY_B64) {
  throw new Error(
    "API_KEY_ENCRYPTION_KEY_B64 environment variable is required for encryption/decryption.",
  );
}
const ENCRYPTION_KEY = Uint8Array.from(atob(ENCRYPTION_KEY_B64), (c) =>
  c.charCodeAt(0),
);

// Encrypts a string and returns base64(iv):base64(ciphertext)
export async function encryptApiKey(plainText: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const key = await crypto.subtle.importKey(
    "raw",
    ENCRYPTION_KEY,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const encoded = new TextEncoder().encode(plainText);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
  return `${ivB64}:${cipherB64}`;
}

// Decrypts base64(iv):base64(ciphertext) to string
export async function decryptApiKey(encrypted: string): Promise<string> {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Balance check request started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Authenticate user and get user-specific credentials ONLY from the table
    let apiKey: string | undefined = undefined;
    let username: string | undefined = undefined;
    let userId: string | undefined = undefined;
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (!authError && user) {
        userId = user.id;
        console.log("User authenticated:", userId);
        // Try to get user-specific API credentials
        const { data: credentials, error: credError } = await supabase
          .from("api_credentials")
          .select("*")
          .eq("user_id", userId)
          .eq("service_name", "mspace")
          .eq("is_active", true)
          .single();
        if (!credError && credentials) {
          console.log("Using user-specific credentials");
          // Decrypt the API key from api_key_encrypted
          const encryptedApiKey = credentials.api_key_encrypted as string;
          if (!encryptedApiKey) {
            throw new Error(
              "Encrypted API key is missing in api_key_encrypted column.",
            );
          }
          apiKey = await decryptApiKey(encryptedApiKey);
          // Username can still be stored in additional_config
          const config = credentials.additional_config as Record<
            string,
            unknown
          >;
          username = config?.username as string;
        } else {
          throw new Error(
            `No user-specific credentials found for user: ${userId}`,
          );
        }
      } else {
        console.log("Authentication failed:", authError?.message);
      }
    } catch (authError) {
      console.log("Authentication error:", authError);
    }

    if (!apiKey || !username) {
      throw new Error(
        "Mspace API credentials not available. Please configure them in user settings.",
      );
    }

        console.log("Checking balance with API key");

    // Use the correct mspace API format from documentation
    console.log("Making balance request to mspace API");
    const response = await fetch(
      "https://api.mspace.co.ke/smsapi/v2/balance",
      {
        method: "POST",
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ apikey: apiKey }),
      },
    );

    const responseText = await response.text();
    console.log("Balance response status:", response.status);
    console.log("Balance response body:", responseText);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}. Response: ${responseText}`);
    }

    // Parse response according to mspace documentation
    let balanceData;
    try {
      balanceData = JSON.parse(responseText);

      // Ensure we have a balance field
      if (typeof balanceData.balance !== 'undefined') {
        // Success - normalize the response format
        balanceData = {
          balance: parseInt(balanceData.balance),
          status: "success",
          currency: balanceData.currency || "KES",
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error("Invalid response format: missing balance field");
      }
    } catch (parseError) {
      // If not JSON, try to parse as plain number (fallback)
      const balance = parseInt(responseText.trim());
      if (!isNaN(balance)) {
        balanceData = {
          balance,
          status: "success",
          currency: "KES",
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error("Invalid balance response format: " + responseText);
      }
        }

    // Ensure we have a valid balance
    if (
      typeof balanceData.balance === "undefined" &&
      typeof balanceData === "number"
    ) {
      balanceData = { balance: balanceData, status: "success" };
    }

    if (typeof balanceData.balance === "undefined") {
      throw new Error("Balance not found in API response");
    }

    console.log("Final balance data:", balanceData);

    return new Response(JSON.stringify(balanceData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mspace-balance function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
})

// Remove this extra part if exists
            // If we get a 505 error, try XML format
            console.log("Got 505 error, trying POST with XML format");
            try {
              const xmlResponse = await fetch(
                "https://api.mspace.co.ke/smsapi/v2/balance",
                {
                  method: "POST",
                  headers: {
                    apikey: apiKey,
                    "Content-Type": "application/xml",
                    Accept: "application/xml",
                  },
                  body: `<user><username>${username}</username></user>`,
                },
              );

              console.log(
                "XML POST response status:",
                xmlResponse.status,
                xmlResponse.statusText,
              );
              const xmlResponseText = await xmlResponse.text();
              console.log("XML POST response body:", xmlResponseText);

              if (xmlResponse.ok) {
                // Try to parse as number first
                const balance = parseInt(xmlResponseText.trim());
                if (!isNaN(balance)) {
                  balanceData = { balance, status: "success" };
                  break;
                }

                // If not a number, check if it's XML with balance tag
                if (xmlResponseText.includes("<balance>")) {
                  const balanceMatch = xmlResponseText.match(
                    /<balance>(.*?)<\/balance>/,
                  );
                  if (balanceMatch && balanceMatch[1]) {
                    const balance = parseInt(balanceMatch[1].trim());
                    if (!isNaN(balance)) {
                      balanceData = { balance, status: "success" };
                      break;
                    }
                  }
                }
              }
            } catch (xmlError) {
              console.log("XML request failed:", xmlError);
            }
          } else {
            console.log(
              `POST request failed with status ${postResponse.status}: ${postResponse.statusText}`,
            );
            // Continue to try GET method
          }
        } catch (postError) {
          console.log("POST method failed, trying GET method:", postError);
          // Continue to try GET method
        }

        // Try GET method with format from documentation
        try {
          console.log("Trying GET method with format from documentation");
          const getUrl1 = `https://api.mspace.co.ke/smsapi/v2/balance/apikey=${apiKey}/username=${username}`;
          console.log("GET URL (format 1):", getUrl1);

          const getResponse1 = await fetch(getUrl1);
          const responseText1 = await getResponse1.text();
          console.log(
            "GET Balance response status (format 1):",
            getResponse1.status,
          );
          console.log("GET Balance response body (format 1):", responseText1);

          if (getResponse1.ok) {
            try {
              balanceData = JSON.parse(responseText1);
            } catch {
              const balance = parseInt(responseText1.trim());
              if (isNaN(balance)) {
                throw new Error("Invalid balance response format");
              }
              balanceData = { balance, status: "success" };
            }

            // If we got valid data, break out of the retry loop
            break;
          } else {
            console.log(
              `GET request (format 1) failed with status ${getResponse1.status}: ${getResponse1.statusText}`,
            );
            // Try alternative GET format
          }
        } catch (getError1) {
          console.log(
            "GET method (format 1) failed, trying alternative format:",
            getError1,
          );
          // Try alternative GET format
        }

        // Try GET method with standard query parameters
        try {
          console.log("Trying GET method with standard query parameters");
          const getUrl2 = `https://api.mspace.co.ke/smsapi/v2/balance?apikey=${apiKey}&username=${username}`;
          console.log("GET URL (format 2):", getUrl2);

          const getResponse2 = await fetch(getUrl2);
          const responseText2 = await getResponse2.text();
          console.log(
            "GET Balance response status (format 2):",
            getResponse2.status,
          );
          console.log("GET Balance response body (format 2):", responseText2);

          if (getResponse2.ok) {
            try {
              balanceData = JSON.parse(responseText2);
            } catch {
              const balance = parseInt(responseText2.trim());
              if (isNaN(balance)) {
                throw new Error("Invalid balance response format");
              }
              balanceData = { balance, status: "success" };
            }

            // If we got valid data, break out of the retry loop
            break;
          } else {
            console.log(
              `GET request (format 2) failed with status ${getResponse2.status}: ${getResponse2.statusText}`,
            );

            // If this is the last attempt, throw an error
            if (attempt === maxRetries - 1) {
              throw new Error(
                `All request methods failed after ${maxRetries} attempts`,
              );
            }

            // Otherwise, wait before retrying
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (getError2) {
          console.log("GET method (format 2) failed:", getError2);

          // If this is the last attempt, throw an error
          if (attempt === maxRetries - 1) {
            throw new Error(
              `All request methods failed after ${maxRetries} attempts: ${getError2.message}`,
            );
          }

          // Otherwise, wait before retrying
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (attemptError) {
        console.error(`Attempt ${attempt + 1} failed:`, attemptError);

        // If this is the last attempt, throw an error
        if (attempt === maxRetries - 1) {
          throw new Error(
            `Balance check failed after ${maxRetries} attempts: ${attemptError.message}`,
          );
        }

        // Otherwise, wait before retrying
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Ensure we have a valid balance
    if (
      typeof balanceData.balance === "undefined" &&
      typeof balanceData === "number"
    ) {
      balanceData = { balance: balanceData, status: "success" };
    }

    if (typeof balanceData.balance === "undefined") {
      throw new Error("Balance not found in API response");
    }

    console.log("Final balance data:", balanceData);

    return new Response(JSON.stringify(balanceData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mspace-balance function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});