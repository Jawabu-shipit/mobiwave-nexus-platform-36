import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  ChevronLeft, 
  Database, 
  Users, 
  MessageSquare, 
  Send,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDataModels } from '@/hooks/useDataModels';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useEnhancedDataHub } from '@/hooks/useEnhancedDataHub';
import { toast } from 'sonner';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface CampaignData {
  name: string;
  message: string;
  dataModelId?: string;
  targetCriteria?: any;
  recipients: any[];
  scheduledAt?: string;
}

export function GuidedBulkSMSFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    message: '',
    recipients: []
  });

  const { dataModels, isLoadingModels } = useDataModels();
  const { createCampaign } = useCampaigns();
  const { getRecords, getRecipients } = useEnhancedDataHub();

  const steps: FlowStep[] = [
    {
      id: 'data-source',
      title: 'Choose Data Source',
      description: 'Select where your recipients will come from',
      icon: <Database className="w-5 h-5" />,
      completed: !!campaignData.dataModelId
    },
    {
      id: 'target-audience',
      title: 'Target Audience',
      description: 'Define who will receive your messages',
      icon: <Users className="w-5 h-5" />,
      completed: campaignData.recipients.length > 0
    },
    {
      id: 'compose-message',
      title: 'Compose Message',
      description: 'Write your SMS content',
      icon: <MessageSquare className="w-5 h-5" />,
      completed: !!campaignData.message && !!campaignData.name
    },
    {
      id: 'review-send',
      title: 'Review & Send',
      description: 'Review your campaign and send',
      icon: <Send className="w-5 h-5" />,
      completed: false
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendCampaign = async () => {
    try {
      await createCampaign.mutateAsync({
        name: campaignData.name,
        type: 'sms',
        content: campaignData.message,
        message: campaignData.message,
        recipient_count: campaignData.recipients.length,
        status: 'sending',
        data_model_id: campaignData.dataModelId,
        target_criteria: campaignData.targetCriteria,
        scheduled_at: campaignData.scheduledAt
      });

      toast.success('Campaign created and sending started!');
      
      // Reset form
      setCampaignData({
        name: '',
        message: '',
        recipients: []
      });
      setCurrentStep(0);
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Guided Bulk SMS Campaign
          </CardTitle>
          <div className="space-y-4">
            <Progress value={(currentStep + 1) / steps.length * 100} className="w-full" />
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    index === currentStep ? 'text-blue-600' : 
                    step.completed ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="text-sm font-medium hidden sm:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <DataSourceStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
              dataModels={dataModels}
              isLoadingModels={isLoadingModels}
            />
          )}
          
          {currentStep === 1 && (
            <TargetAudienceStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
              dataModels={dataModels}
            />
          )}
          
          {currentStep === 2 && (
            <ComposeMessageStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
            />
          )}
          
          {currentStep === 3 && (
            <ReviewSendStep 
              campaignData={campaignData}
              onSend={handleSendCampaign}
              isLoading={createCampaign.isPending}
            />
          )}
        </CardContent>
        
        {/* Navigation */}
        <div className="flex justify-between p-6 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={nextStep}
              disabled={!steps[currentStep].completed}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSendCampaign}
              disabled={!campaignData.name || !campaignData.message || campaignData.recipients.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Campaign
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function DataSourceStep({ 
  campaignData, 
  setCampaignData, 
  dataModels, 
  isLoadingModels 
}: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  dataModels: any[];
  isLoadingModels: boolean;
}) {
  const [sourceType, setSourceType] = useState<'data-model' | 'upload' | 'manual'>('data-model');

  const handleDataModelSelect = (modelId: string) => {
    setCampaignData({
      ...campaignData,
      dataModelId: modelId,
      recipients: [] // Reset recipients when changing model
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={sourceType} onValueChange={(value: any) => setSourceType(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data-model">
            <Database className="w-4 h-4 mr-2" />
            Data Models
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="manual">
            <FileText className="w-4 h-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-model" className="space-y-4">
          {isLoadingModels ? (
            <div>Loading data models...</div>
          ) : dataModels && dataModels.length > 0 ? (
            <div className="grid gap-4">
              {dataModels.map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-colors ${
                    campaignData.dataModelId === model.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleDataModelSelect(model.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-sm text-gray-600">{model.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.fields?.map((field: any) => (
                            <Badge key={field.id} variant="secondary" className="text-xs">
                              {field.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {campaignData.dataModelId === model.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No data models found. Create a data model first in the Data Hub.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              File upload functionality will be implemented in the next phase.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Manual entry functionality will be implemented in the next phase.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TargetAudienceStep({ 
  campaignData, 
  setCampaignData, 
  dataModels 
}: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  dataModels: any[];
}) {
  const [criteria, setCriteria] = useState<any>({});
  const [previewRecipients, setPreviewRecipients] = useState<any[]>([]);
  const { getRecords } = useEnhancedDataHub();

  const selectedModel = dataModels?.find(m => m.id === campaignData.dataModelId);

  useEffect(() => {
    if (campaignData.dataModelId) {
      loadRecipients();
    }
  }, [campaignData.dataModelId, criteria]);

  const loadRecipients = async () => {
    if (!campaignData.dataModelId) return;

    try {
      const records = await getRecords(campaignData.dataModelId);
      
      // Apply filtering criteria
      let filteredRecords = records;
      if (Object.keys(criteria).length > 0) {
        filteredRecords = records.filter(record => {
          return Object.entries(criteria).every(([field, value]) => {
            if (!value) return true;
            const recordValue = record.data[field];
            return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
          });
        });
      }

      setPreviewRecipients(filteredRecords.slice(0, 10)); // Show first 10 for preview
      setCampaignData({
        ...campaignData,
        recipients: filteredRecords,
        targetCriteria: criteria
      });
    } catch (error) {
      toast.error('Failed to load recipients');
    }
  };

  const handleCriteriaChange = (field: string, value: string) => {
    setCriteria({
      ...criteria,
      [field]: value
    });
  };

  if (!selectedModel) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a data model first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Filter Recipients</h3>
        <div className="grid gap-4">
          {selectedModel.fields?.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.name}>{field.name}</Label>
              <Input
                id={field.name}
                placeholder={`Filter by ${field.name}...`}
                value={criteria[field.name] || ''}
                onChange={(e) => handleCriteriaChange(field.name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">
          Recipients Preview ({campaignData.recipients.length} total)
        </h3>
        {previewRecipients.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                {selectedModel.fields?.slice(0, 3).map((field: any) => (
                  <div key={field.id}>{field.name}</div>
                ))}
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {previewRecipients.map((recipient, index) => (
                <div key={recipient.id} className="p-3 border-b last:border-b-0">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {selectedModel.fields?.slice(0, 3).map((field: any) => (
                      <div key={field.id}>{recipient.data[field.name] || '-'}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No recipients found with the current criteria.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

function ComposeMessageStep({ 
  campaignData, 
  setCampaignData 
}: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
}) {
  const [messageLength, setMessageLength] = useState(0);

  useEffect(() => {
    setMessageLength(campaignData.message.length);
  }, [campaignData.message]);

  const handleMessageChange = (value: string) => {
    setCampaignData({
      ...campaignData,
      message: value
    });
  };

  const handleNameChange = (value: string) => {
    setCampaignData({
      ...campaignData,
      name: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign Name *</Label>
        <Input
          id="campaign-name"
          placeholder="Enter campaign name..."
          value={campaignData.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">SMS Message *</Label>
        <Textarea
          id="message"
          placeholder="Type your SMS message here..."
          value={campaignData.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          rows={4}
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{messageLength} characters</span>
          <span>{Math.ceil(messageLength / 160)} SMS{messageLength > 160 ? ' parts' : ''}</span>
        </div>
      </div>

      {messageLength > 160 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your message is longer than 160 characters and will be sent as multiple SMS parts.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="schedule">Schedule (Optional)</Label>
        <Input
          id="schedule"
          type="datetime-local"
          value={campaignData.scheduledAt || ''}
          onChange={(e) => setCampaignData({
            ...campaignData,
            scheduledAt: e.target.value
          })}
        />
      </div>
    </div>
  );
}

function ReviewSendStep({ 
  campaignData, 
  onSend, 
  isLoading 
}: {
  campaignData: CampaignData;
  onSend: () => void;
  isLoading: boolean;
}) {
  const estimatedCost = campaignData.recipients.length * 0.05; // Assuming $0.05 per SMS

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Campaign Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Campaign Name:</span>
              <span>{campaignData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Recipients:</span>
              <span>{campaignData.recipients.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Estimated Cost:</span>
              <span>${estimatedCost.toFixed(2)}</span>
            </div>
            {campaignData.scheduledAt && (
              <div className="flex justify-between">
                <span className="font-medium">Scheduled:</span>
                <span>{new Date(campaignData.scheduledAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Message Preview</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="bg-white p-3 rounded border max-w-sm">
              {campaignData.message}
            </div>
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Once sent, this campaign cannot be stopped. Please review all details carefully.
        </AlertDescription>
      </Alert>

      <Button 
        onClick={onSend}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        {isLoading ? (
          <>Sending Campaign...</>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Campaign Now
          </>
        )}
      </Button>
    </div>
  );
}