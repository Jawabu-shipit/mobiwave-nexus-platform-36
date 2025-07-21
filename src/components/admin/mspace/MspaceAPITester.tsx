import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Key, User, Terminal, Globe } from "lucide-react";
import { toast } from "sonner";

export function MspaceAPITester() {
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState("balance");

  const endpoints = {
    balance: {
      url: "https://api.mspace.co.ke/smsapi/v2/balance",
      description: "Check SMS balance",
      body: (key: string) => ({ apikey: key }),
      needsUsername: false,
    },
    resellerclients: {
      url: "https://api.mspace.co.ke/smsapi/v2/resellerclients",
      description: "Get reseller clients",
      body: (key: string, user: string) => ({ apikey: key, username: user }),
      needsUsername: true,
    },
    subusers: {
      url: "https://api.mspace.co.ke/smsapi/v2/subusers",
      description: "Get sub users",
      body: (key: string, user: string) => ({ apikey: key, username: user }),
      needsUsername: true,
    },
  };

  const generateCurlCommand = () => {
    const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints];
    const body = endpoint.needsUsername
      ? endpoint.body(apiKey, username)
      : endpoint.body(apiKey);

    return `curl -X POST "${endpoint.url}" \\
  -H "apikey: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'`;
  };

  const generatePostmanCollection = () => {
    const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints];
    const body = endpoint.needsUsername
      ? endpoint.body(apiKey, username)
      : endpoint.body(apiKey);

    return {
      info: {
        name: `Mspace API - ${endpoint.description}`,
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: [
        {
          name: endpoint.description,
          request: {
            method: "POST",
            header: [
              { key: "apikey", value: apiKey },
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(body, null, 2),
            },
            url: {
              raw: endpoint.url,
              protocol: "https",
              host: endpoint.url
                .replace("https://", "")
                .split("/")[0]
                .split("."),
              path: endpoint.url.split("/").slice(3),
            },
          },
        },
      ],
    };
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`📋 ${type} copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const testWithNodejs = () => {
    const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints];
    const body = endpoint.needsUsername
      ? endpoint.body(apiKey, username)
      : endpoint.body(apiKey);

    const nodeScript = `const fetch = require('node-fetch');

async function testMspaceAPI() {
  try {
    const response = await fetch('${endpoint.url}', {
      method: 'POST',
      headers: {
        'apikey': '${apiKey}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(${JSON.stringify(body, null, 6)})
    });
    
    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMspaceAPI();`;

    return nodeScript;
  };

  const isFormValid =
    apiKey.trim() &&
    (!endpoints[selectedEndpoint as keyof typeof endpoints].needsUsername ||
      username.trim());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Mspace API Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <strong>Browser CORS Limitation:</strong> Direct API calls from
              browsers are blocked by mspace. Use the generated commands below
              to test your API in terminal, Postman, or Node.js.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="endpoint">API Endpoint</Label>
              <select
                id="endpoint"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <option key={key} value={key}>
                    {endpoint.description} - {endpoint.url}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="apikey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </Label>
                <Input
                  id="apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your mspace API key"
                />
              </div>

              {endpoints[selectedEndpoint as keyof typeof endpoints]
                .needsUsername && (
                <div>
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your mspace username"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isFormValid && (
        <>
          {/* Curl Command */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Curl Command</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(generateCurlCommand(), "Curl command")
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generateCurlCommand()}
                readOnly
                className="font-mono text-sm"
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Run this command in your terminal to test the API
              </p>
            </CardContent>
          </Card>

          {/* Node.js Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Node.js Test Script</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(testWithNodejs(), "Node.js script")
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testWithNodejs()}
                readOnly
                className="font-mono text-sm"
                rows={12}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Save as test.js and run with: <code>node test.js</code>{" "}
                (requires node-fetch: npm install node-fetch)
              </p>
            </CardContent>
          </Card>

          {/* Postman Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Postman Collection</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(generatePostmanCollection(), null, 2),
                      "Postman collection",
                    )
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                1. Copy the JSON above 2. Open Postman 3. Click "Import" → "Raw
                text" 4. Paste the JSON and import 5. Run the request
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
