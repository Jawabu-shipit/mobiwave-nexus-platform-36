import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("USSD webhook request received");

    const formData = await req.formData();
    const phoneNumber = formData.get("phoneNumber") as string;
    const text = formData.get("text") as string;
    const serviceCode = formData.get("serviceCode") as string;

    console.log("USSD Request:", { phoneNumber, text, serviceCode });

    if (!phoneNumber || !serviceCode) {
      return new Response("CON Invalid request parameters", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("CON Authentication required", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response("CON Authentication failed", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
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
      console.error("Credentials error:", credError);
      return new Response("CON Service temporarily unavailable", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Decrypt the API key from api_key_encrypted column
    const encryptedApiKey = credentials.api_key_encrypted as string;
    if (!encryptedApiKey) {
      console.error(`Encrypted API key missing for user ${user.id}`);
      return new Response("CON Service configuration error", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    let apiKey: string;
    try {
      apiKey = await decryptApiKey(encryptedApiKey);
    } catch (decryptError) {
      console.error("Failed to decrypt API key:", decryptError);
      return new Response("CON Service configuration error", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Get username from the username column directly
    const username = credentials.username as string;

    if (!username) {
      console.error(
        `Username not found in username column for user ${user.id}`,
      );
      return new Response("CON Service configuration error", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    console.log(
      `Retrieved USSD credentials for user ${user.id}, username: ${username}`,
    );

    // Find the USSD application for this service code
    const { data: application, error: appError } = await supabase
      .from("mspace_ussd_applications")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_code", serviceCode)
      .eq("is_active", true)
      .single();

    if (appError || !application) {
      console.error("USSD application not found:", appError);
      return new Response("CON Service not available", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Process USSD request based on application configuration
    const response = await processUSSDRequest(
      application,
      phoneNumber,
      text,
      apiKey,
      username,
    );

    return new Response(response, {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error in mspace-ussd-webhook:", error);
    return new Response("CON Service temporarily unavailable", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});

async function processUSSDRequest(
  application: any,
  phoneNumber: string,
  text: string,
  apiKey: string,
  username: string,
): Promise<string> {
  try {
    // Parse the menu structure
    const menuStructure = application.menu_structure || {};
    const currentLevel = text ? text.split("*").length : 0;

    // Simple menu navigation logic
    if (!text || text === "") {
      // Show main menu
      return `CON ${application.welcome_message || "Welcome"}\n${generateMenuFromStructure(menuStructure)}`;
    }

    // Process user input based on menu structure
    const userChoices = text.split("*");
    const lastChoice = userChoices[userChoices.length - 1];

    // Navigate through menu structure
    let currentMenu = menuStructure;
    for (let i = 0; i < userChoices.length - 1; i++) {
      const choice = userChoices[i];
      if (currentMenu.options && currentMenu.options[choice]) {
        currentMenu = currentMenu.options[choice];
      } else {
        return "END Invalid selection";
      }
    }

    // Check if current choice is valid
    if (currentMenu.options && currentMenu.options[lastChoice]) {
      const selectedOption = currentMenu.options[lastChoice];

      if (selectedOption.action === "end") {
        return `END ${selectedOption.message || "Thank you"}`;
      } else if (selectedOption.submenu) {
        return `CON ${selectedOption.message || ""}\n${generateMenuFromStructure(selectedOption.submenu)}`;
      }
    }

    return "END Invalid selection";
  } catch (error) {
    console.error("Error processing USSD request:", error);
    return "END Service error occurred";
  }
}

function generateMenuFromStructure(structure: any): string {
  if (!structure || !structure.options) {
    return "";
  }

  const menuItems = Object.entries(structure.options).map(
    ([key, value]: [string, any]) => {
      return `${key}. ${value.label || value.message || "Option " + key}`;
    },
  );

  return menuItems.join("\n");
}
