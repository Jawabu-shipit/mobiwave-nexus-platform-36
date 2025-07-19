import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MspaceDebugPanel } from "@/components/admin/mspace/MspaceDebugPanel";
import { AlertTriangle, Info } from "lucide-react";

export const MspaceTroubleshooting: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MSpace Troubleshooting</h1>
          <p className="text-muted-foreground">
            Diagnose and fix MSpace integration issues
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This page helps diagnose MSpace integration issues. Use the diagnostic
          tools below to identify and resolve problems.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Common Issues & Solutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">
                ❌ "MSpace API credentials not found"
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Solution: Go to Admin → User Management → API Credentials and
                add your MSpace API credentials.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">
                ❌ "Failed to decrypt API credentials"
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Solution: Delete and re-add your MSpace credentials. The
                encryption key may have changed.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">❌ "Authentication failed"</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Solution: Log out and log back in. Your session may have
                expired.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">
                ❌ "Edge Function returned a non-2xx status code"
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Solution: Check the diagnostic panel below for detailed error
                information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <MspaceDebugPanel />
    </div>
  );
};

export default MspaceTroubleshooting;
