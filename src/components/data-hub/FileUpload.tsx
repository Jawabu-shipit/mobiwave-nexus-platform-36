import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download
} from 'lucide-react';
import { useDataModels } from '@/hooks/useDataModels';
import { useEnhancedDataHub } from '@/hooks/useEnhancedDataHub';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete?: (jobId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { dataModels, isLoadingModels } = useDataModels();
  const { uploadFile, createImportJob, isCreatingImportJob } = useEnhancedDataHub();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV or JSON file');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedModel) {
      toast.error('Please select a file and data model');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to storage
      const fileUrl = await uploadFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create import job
      const fileType = selectedFile.name.endsWith('.csv') ? 'csv' : 'json';
      const job = await createImportJob.mutateAsync({
        modelId: selectedModel,
        fileUrl,
        fileType
      });

      toast.success('File uploaded successfully! Import job created.');
      
      // Reset form
      setSelectedFile(null);
      setSelectedModel('');
      setUploadProgress(0);
      
      if (onUploadComplete) {
        onUploadComplete(job.id);
      }

    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const downloadTemplate = () => {
    if (!selectedModel) {
      toast.error('Please select a data model first');
      return;
    }

    const model = dataModels?.find(m => m.id === selectedModel);
    if (!model) return;

    // Create CSV template
    const headers = model.fields.map(field => field.name).join(',');
    const sampleRow = model.fields.map(field => {
      switch (field.type) {
        case 'email': return 'example@email.com';
        case 'phone': return '+1234567890';
        case 'number': return '123';
        case 'date': return '2024-01-01';
        default: return 'Sample Text';
      }
    }).join(',');

    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model-select">Select Data Model *</Label>
          <div className="flex gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a data model..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingModels ? (
                  <SelectItem value="" disabled>Loading models...</SelectItem>
                ) : dataModels && dataModels.length > 0 ? (
                  dataModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No models available</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              disabled={!selectedModel}
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="space-y-4">
          <Label>Upload File *</Label>
          
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports CSV and JSON files up to 10MB
              </p>
              <Input
                type="file"
                accept=".csv,.json"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || !selectedModel || isUploading || isCreatingImportJob}
          className="w-full"
        >
          {isUploading || isCreatingImportJob ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Import
            </>
          )}
        </Button>

        {/* Help Text */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>File Format Requirements:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• CSV files should have headers matching your data model fields</li>
              <li>• JSON files should be an array of objects with matching field names</li>
              <li>• Phone numbers should include country codes (e.g., +1234567890)</li>
              <li>• Dates should be in YYYY-MM-DD format</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}