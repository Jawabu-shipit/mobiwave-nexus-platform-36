
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Users, Clock, Eye } from 'lucide-react';
import { useSurveys } from '@/hooks/useSurveys';
import { SurveyBuilder } from './SurveyBuilder';
import { SurveyAnalytics } from './SurveyAnalytics';

export function SurveyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const { surveys, isLoading, publishSurvey } = useSurveys();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeSurveys = surveys.filter(s => s.status === 'active').length;
  const totalResponses = surveys.reduce((sum, survey) => {
    // This would normally come from survey_responses table
    return sum + Math.floor(Math.random() * 100);
  }, 0);

  if (activeTab === 'builder') {
    return <SurveyBuilder onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'analytics' && selectedSurvey) {
    return (
      <SurveyAnalytics 
        surveyId={selectedSurvey} 
        onBack={() => {
          setActiveTab('overview');
          setSelectedSurvey(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Survey Platform</h2>
          <p className="text-gray-600">Create, manage, and analyze your SMS surveys</p>
        </div>
        <Button onClick={() => setActiveTab('builder')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveys.length}</div>
            <p className="text-xs text-gray-600">{activeSurveys} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-gray-600">Across all surveys</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-gray-600">Average completion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Surveys</CardTitle>
          <CardDescription>Manage and track your survey campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No surveys created yet</p>
              <Button onClick={() => setActiveTab('builder')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Survey
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div key={survey.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{survey.title}</h3>
                      <Badge className={getStatusColor(survey.status)}>
                        {survey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSurvey(survey.id);
                          setActiveTab('analytics');
                        }}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      {survey.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => publishSurvey(survey.id)}
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {survey.description && (
                    <p className="text-sm text-gray-600 mb-3">{survey.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 100)} responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Created {new Date(survey.created_at).toLocaleDateString()}</span>
                    </div>
                    {survey.question_flow && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{survey.question_flow.length} questions</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
