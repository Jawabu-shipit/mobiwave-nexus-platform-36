import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useEnhancedDataHub } from '@/hooks/useEnhancedDataHub';
import { useDataModels } from '@/hooks/useDataModels';
import { formatDistanceToNow } from 'date-fns';

export function ImportJobsMonitor() {
  const { useImportJobs } = useEnhancedDataHub();
  const { dataModels } = useDataModels();
  const { data: importJobs, isLoading, refetch } = useImportJobs();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModelName = (modelId: string) => {
    const model = dataModels?.find(m => m.id === modelId);
    return model?.name || 'Unknown Model';
  };

  const getProgress = (job: any) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'failed') return 0;
    if (job.total_records && job.processed_records) {
      return (job.processed_records / job.total_records) * 100;
    }
    return job.status === 'processing' ? 50 : 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading import jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Import Jobs</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {importJobs && importJobs.length > 0 ? (
          <div className="space-y-4">
            {importJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className="font-medium">{getModelName(job.model_id)}</span>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>File: {job.file_url.split('/').pop()}</span>
                    <span>
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {(job.status === 'processing' || job.status === 'completed') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {job.processed_records || 0} / {job.total_records || 0} records
                        </span>
                      </div>
                      <Progress value={getProgress(job)} className="h-2" />
                    </div>
                  )}

                  {job.status === 'failed' && job.error_message && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      <strong>Error:</strong> {job.error_message}
                    </div>
                  )}

                  {job.status === 'completed' && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      <strong>Success:</strong> {job.processed_records} records imported successfully
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No import jobs found</p>
            <p className="text-sm">Upload a file to see import jobs here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}