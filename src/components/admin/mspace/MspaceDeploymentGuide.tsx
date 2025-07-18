import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Terminal,
  Copy,
  Server,
  Key,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export function MspaceDeploymentGuide() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const deploymentCommands = [
    {
      title: "1. Login to Supabase",
      command: "npx supabase login",
      description: "Authenticate with your Supabase account",
    },
    {
      title: "2. Deploy Mspace Balance Function",
      command: "cd supabase && npx supabase functions deploy mspace-balance",
      description: "Deploy the main balance checking function",
    },
    {
      title: "3. Deploy Mspace Proxy Function",
      command: "cd supabase && npx supabase functions deploy mspace-proxy",
      description: "Deploy the general API proxy function",
    },
    {
      title: "4. Set Environment Variables",
      command: `npx supabase secrets set API_KEY_ENCRYPTION_KEY_B64=your_base64_key
npx supabase secrets set SUPABASE_URL=your_supabase_url
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`,
      description: "Configure required environment variables",
    },
    {
      title: "5. Test Functions",
      command:
        "npx supabase functions invoke mspace-balance --header 'Authorization: Bearer your_jwt_token'",
      description: "Test the deployed functions",
    },
  ];

  const copyToClipboard = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(title);
      toast.success(`📋 ${title} copied to clipboard!`);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Edge Function Deployment Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Authentication Required:</strong> You need valid Supabase
              credentials to deploy edge functions. If deployment fails, use the
              manual API testing tools instead.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {deploymentCommands.map((cmd, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {cmd.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {cmd.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <Textarea
                      value={cmd.command}
                      readOnly
                      className="font-mono text-xs resize-none bg-gray-50"
                      rows={cmd.command.split("\n").length}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cmd.command, cmd.title)}
                      className="shrink-0"
                    >
                      {copiedCommand === cmd.title ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alternative: Manual Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Recommended Approach:</strong> If edge function deployment
              is blocked by authentication issues, use the comprehensive manual
              API testing tools provided in each tab. These tools generate curl
              commands, Node.js scripts, and Postman collections for testing
              your mspace API credentials externally.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Manual Testing Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>No deployment or authentication issues</li>
              <li>Direct testing with real mspace API</li>
              <li>Multiple testing methods (curl, Node.js, Postman)</li>
              <li>Real-time credential validation</li>
              <li>Copy-paste ready commands</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">Authentication Errors</h4>
              <p className="text-xs text-muted-foreground">
                Run `npx supabase login` and ensure you have project access
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">
                Missing Environment Variables
              </h4>
              <p className="text-xs text-muted-foreground">
                Set all required secrets using `npx supabase secrets set`
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Function Deployment Fails</h4>
              <p className="text-xs text-muted-foreground">
                Use manual testing tools - they work without backend deployment
              </p>
            </div>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Documentation:</strong> Visit the Supabase docs for
              detailed edge function deployment guidance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
