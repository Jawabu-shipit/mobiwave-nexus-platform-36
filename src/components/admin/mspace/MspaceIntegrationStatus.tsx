import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Server,
  Globe,
  Key,
} from "lucide-react";
import { useMspaceIntegration } from "@/hooks/mspace/useMspaceIntegration";

export function MspaceIntegrationStatus() {
  const {
    hasCredentials,
    hasEncryptedCredentials,
    credentialsError,
    credentialsLoading,
    canUseDirectAPI,
    needsManualTesting,
    checkBalance,
    getResellerClients,
  } = useMspaceIntegration();

  const getCredentialsStatus = () => {
    if (credentialsLoading) {
      return {
        icon: AlertTriangle,
        color: "text-yellow-500",
        text: "Loading credentials...",
      };
    }
    if (hasCredentials && canUseDirectAPI) {
      return {
        icon: CheckCircle,
        color: "text-green-500",
        text: "Credentials configured",
      };
    }
    if (hasEncryptedCredentials) {
      return {
        icon: AlertTriangle,
        color: "text-yellow-500",
        text: "Encrypted credentials detected",
      };
    }
    if (credentialsError) {
      return {
        icon: XCircle,
        color: "text-red-500",
        text: "Credentials error",
      };
    }
    return {
      icon: XCircle,
      color: "text-red-500",
      text: "No credentials found",
    };
  };

  const getBackendStatus = () => {
    // For now, we assume backend functions exist but may have auth issues
    return {
      icon: AlertTriangle,
      color: "text-yellow-500",
      text: "Edge functions need deployment",
    };
  };

  const getBrowserAPIStatus = () => {
    return {
      icon: XCircle,
      color: "text-red-500",
      text: "Blocked by CORS policy",
    };
  };

  const credStatus = getCredentialsStatus();
  const backendStatus = getBackendStatus();
  const browserStatus = getBrowserAPIStatus();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mspace Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Credentials Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <credStatus.icon className={`h-5 w-5 ${credStatus.color}`} />
              <div>
                <p className="font-medium">API Credentials</p>
                <p className="text-sm text-muted-foreground">
                  {credStatus.text}
                </p>
              </div>
            </div>
            <Key className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Backend Functions Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <backendStatus.icon
                className={`h-5 w-5 ${backendStatus.color}`}
              />
              <div>
                <p className="font-medium">Backend Functions</p>
                <p className="text-sm text-muted-foreground">
                  {backendStatus.text}
                </p>
              </div>
            </div>
            <Server className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Browser API Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <browserStatus.icon
                className={`h-5 w-5 ${browserStatus.color}`}
              />
              <div>
                <p className="font-medium">Direct Browser API</p>
                <p className="text-sm text-muted-foreground">
                  {browserStatus.text}
                </p>
              </div>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasCredentials && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Step 1:</strong> Configure your mspace API credentials
                in the API Credentials section.
              </AlertDescription>
            </Alert>
          )}

          {hasEncryptedCredentials && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Encrypted Credentials:</strong> Your credentials are
                encrypted for security. Use the manual testing tools below or
                deploy edge functions for automated API calls.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <strong>Deploy Edge Functions:</strong> Run deployment commands to
              enable backend API proxy. This bypasses CORS restrictions and
              enables automated API calls.
            </AlertDescription>
          </Alert>

          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <strong>Manual Testing:</strong> Use the API testing tools below
              to test your credentials with curl, Node.js, or Postman when
              direct calls are blocked.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {canUseDirectAPI && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => checkBalance.mutate()}
                disabled={checkBalance.isPending}
                variant="outline"
                size="sm"
              >
                Test Balance API
              </Button>
              <Button
                onClick={() => getResellerClients.mutate()}
                disabled={getResellerClients.isPending}
                variant="outline"
                size="sm"
              >
                Test Clients API
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              These tests use your configured credentials to call the backend
              functions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
