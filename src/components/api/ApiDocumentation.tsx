
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Code, 
  Play, 
  Copy,
  ExternalLink,
  Download
} from 'lucide-react';

export function ApiDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('users');

  const apiEndpoints = {
    users: {
      title: 'Users API',
      description: 'Manage user accounts and profiles',
      endpoints: [
        {
          method: 'GET',
          path: '/api/users',
          description: 'Get all users',
          params: [
            { name: 'page', type: 'integer', required: false, description: 'Page number for pagination' },
            { name: 'limit', type: 'integer', required: false, description: 'Number of users per page' }
          ]
        },
        {
          method: 'POST',
          path: '/api/users',
          description: 'Create a new user',
          params: [
            { name: 'email', type: 'string', required: true, description: 'User email address' },
            { name: 'password', type: 'string', required: true, description: 'User password' }
          ]
        }
      ]
    },
    services: {
      title: 'Services API',
      description: 'Manage services and subscriptions',
      endpoints: [
        {
          method: 'GET',
          path: '/api/services',
          description: 'Get all available services',
          params: []
        },
        {
          method: 'POST',
          path: '/api/services/:id/subscribe',
          description: 'Subscribe to a service',
          params: [
            { name: 'id', type: 'string', required: true, description: 'Service ID' }
          ]
        }
      ]
    },
    messaging: {
      title: 'Messaging API',
      description: 'Send SMS and manage campaigns',
      endpoints: [
        {
          method: 'POST',
          path: '/api/sms/send',
          description: 'Send SMS message',
          params: [
            { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
            { name: 'message', type: 'string', required: true, description: 'Message content' }
          ]
        }
      ]
    }
  };

  const codeExamples = {
    javascript: `
// Send SMS using JavaScript
const response = await fetch('/api/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    to: '+254700000000',
    message: 'Hello World!'
  })
});

const result = await response.json();
console.log(result);
    `,
    python: `
# Send SMS using Python
import requests

url = "https://api.example.com/sms/send"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
data = {
    "to": "+254700000000",
    "message": "Hello World!"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
    `,
    curl: `
# Send SMS using cURL
curl -X POST https://api.example.com/sms/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "to": "+254700000000",
    "message": "Hello World!"
  }'
    `
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Documentation</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download OpenAPI Spec
          </Button>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Online Docs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">API Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(apiEndpoints).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setSelectedEndpoint(key)}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    selectedEndpoint === key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints] && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints].title}
                  </CardTitle>
                  <p className="text-gray-600">
                    {apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints].description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints].endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-gray-600 mb-4">{endpoint.description}</p>
                        
                        {endpoint.params.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Parameters</h5>
                            <div className="space-y-2">
                              {endpoint.params.map((param, paramIndex) => (
                                <div key={paramIndex} className="flex items-center gap-4 text-sm">
                                  <code className="font-mono">{param.name}</code>
                                  <Badge variant="outline">{param.type}</Badge>
                                  {param.required && <Badge variant="destructive">Required</Badge>}
                                  <span className="text-gray-600">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            Try it
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Code Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{code.trim()}</code>
                          </pre>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="absolute top-2 right-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
