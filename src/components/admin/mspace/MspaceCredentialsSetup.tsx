import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Key, User, Save } from "lucide-react";

export function MspaceCredentialsSetup() {
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingCredentials, setExistingCredentials] = useState<any>(null);

  const checkExistingCredentials = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No authenticated user");
        return;
      }

      const { data: credentials, error } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_name", "mspace")
        .eq("is_active", true);

      if (error) {
        console.error("Error checking credentials:", error);
        toast.error("Failed to check existing credentials");
        return;
      }

      setExistingCredentials(credentials || []);
      if (credentials && credentials.length > 0) {
        const cred = credentials[0];
        const config = cred.additional_config as Record<string, unknown>;
        setUsername((config?.username as string) || "");
        toast.info("Found existing credentials");
      } else {
        toast.info("No existing credentials found");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error: " + error.message);
    }
  };

  const saveCredentials = async () => {
    if (!apiKey.trim() || !username.trim()) {
      toast.error("Please enter both API key and username");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No authenticated user");
        return;
      }

      // Call the encrypt function to encrypt the API key
      const { data: encryptedData, error: encryptError } =
        await supabase.functions.invoke("encrypt-data", {
          body: { data: apiKey },
        });

      if (encryptError || !encryptedData?.encrypted) {
        console.error("Encryption error:", encryptError);
        toast.error(
          "Failed to encrypt API key: " +
            (encryptError?.message || "Unknown error"),
        );
        return;
      }

      // Save to api_credentials table
      const { error: saveError } = await supabase
        .from("api_credentials")
        .upsert(
          {
            user_id: user.id,
            service_name: "mspace",
            api_key_encrypted: encryptedData.encrypted,
            additional_config: { username: username.trim() },
            is_active: true,
          },
          {
            onConflict: "user_id,service_name",
          },
        );

      if (saveError) {
        console.error("Save error:", saveError);
        toast.error("Failed to save credentials: " + saveError.message);
        return;
      }

      toast.success("Mspace credentials saved successfully!");
      setApiKey(""); // Clear the API key for security
      await checkExistingCredentials(); // Refresh the status
    } catch (error: any) {
      console.error("Error saving credentials:", error);
      toast.error("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkExistingCredentials();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Mspace API Credentials Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingCredentials && existingCredentials.length > 0 && (
          <Alert>
            <AlertDescription>
              ✅ Credentials found for user {existingCredentials[0].user_id}
              <br />
              Username:{" "}
              {existingCredentials[0].additional_config?.username || "Not set"}
              <br />
              Status: {existingCredentials[0].is_active ? "Active" : "Inactive"}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mspace Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your mspace username"
            />
          </div>

          <div>
            <Label htmlFor="apikey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Mspace API Key
            </Label>
            <Input
              id="apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your mspace API key"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={saveCredentials}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Credentials"}
            </Button>
            <Button variant="outline" onClick={checkExistingCredentials}>
              Check Status
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Note:</strong> Credentials are stored in the{" "}
            <code>api_credentials</code> table only. The API key is encrypted
            before storage for security.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
