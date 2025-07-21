import React from 'react';
import { useDataModels, DataModel } from '@/hooks/useDataModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database } from 'lucide-react';

export function DataModelList() {
  const { dataModels, isLoadingModels, modelsError } = useDataModels();

  if (isLoadingModels) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Data Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (modelsError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{modelsError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Data Models</CardTitle>
      </CardHeader>
      <CardContent>
        {dataModels && dataModels.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(model.fields) && model.fields.map((field) => (
                        <Badge key={field.id} variant="secondary">
                          {field.name} ({field.type})
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(model.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data models found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new data model.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}