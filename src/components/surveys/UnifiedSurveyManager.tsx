
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Users, Clock, Eye, Edit } from 'lucide-react';
import { useSurveys } from '@/hooks/useSurveys';
import { SurveyBuilder } from './SurveyBuilder';
import { SurveyAnalytics } from './SurveyAnalytics';

export function UnifiedSurveyManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [editingSurvey, setEditingSurvey] = useState<string | null>(null);
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

  // Safely handle surveys array with default empty array
  const surveysList = surveys || [];
  const activeSurveys = surveysList.filter(s => s.status === 'active').length;
  const totalResponses = surveysList.reduce((sum, survey) => {
    return sum + Math.floor(Math.random() * 100);
  }, 0);

  // Handle navigation
  if (activeTab === 'builder') {
    return (
      <SurveyBuilder 
        onBack={() => setActiveTab('dashboard')}
        editingSurveyId={editingSurvey}
      />
    );
  }

  if (activeTab === 'analytics' && selectedSurvey) {
    return (
      <SurveyAnalytics 
        surveyId={selectedSurvey} 
        onBack={() => {
          setActiveTab('dashboard');
          setSelectedSurvey(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Survey & Forms Platform</h2>
          <p className="text-gray-600">Create, manage, and analyze your surveys and forms</p>
        </div>
        <Button onClick={() => {
          setEditingSurvey(null);
          setActiveTab('builder');
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="surveys">My Surveys</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{surveysList.length}</div>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSurveys}</div>
                <p className="text-xs text-gray-600">Currently running</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with survey creation and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    setEditingSurvey(null);
                    setActiveTab('builder');
                  }}
                >
                  <Plus className="w-6 h-6 mb-2" />
                  Create New Survey
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('templates')}
                >
                  <Eye className="w-6 h-6 mb-2" />
                  Browse Templates
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('surveys')}
                >
                  <BarChart3 className="w-6 h-6 mb-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Surveys */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Surveys</CardTitle>
              <CardDescription>Your latest survey activity</CardDescription>
            </CardHeader>
            <CardContent>
              {surveysList.slice(0, 3).map((survey) => (
                <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg mb-3 last:mb-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{survey.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge className={getStatusColor(survey.status)}>
                          {survey.status}
                        </Badge>
                        <span>{survey.question_flow?.length || 0} questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSurvey(survey.id);
                        setActiveTab('builder');
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSurvey(survey.id);
                        setActiveTab('analytics');
                      }}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {surveysList.length === 0 && (
                <p className="text-gray-500 text-center py-4">No surveys created yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Surveys</CardTitle>
              <CardDescription>Manage and track your survey campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : surveysList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No surveys created yet</p>
                  <Button onClick={() => {
                    setEditingSurvey(null);
                    setActiveTab('builder');
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Survey
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {surveysList.map((survey) => (
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
                              setEditingSurvey(survey.id);
                              setActiveTab('builder');
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
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
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Templates</CardTitle>
              <CardDescription>Pre-built templates to get you started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Template placeholders - these would come from service templates */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Customer Satisfaction</h4>
                    <p className="text-sm text-gray-600 mb-3">Measure customer happiness and feedback</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Product Feedback</h4>
                    <p className="text-sm text-gray-600 mb-3">Collect insights about your products</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Event Registration</h4>
                    <p className="text-sm text-gray-600 mb-3">Register attendees for your events</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
