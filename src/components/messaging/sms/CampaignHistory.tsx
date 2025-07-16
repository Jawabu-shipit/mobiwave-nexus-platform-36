
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Eye, 
  Download, 
  Filter, 
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { format } from "date-fns";
import { toast } from 'sonner';

interface CampaignHistoryItem {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'voice';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  createdAt: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  cost: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  tags: string[];
}

const mockCampaigns: CampaignHistoryItem[] = [
  {
    id: '1',
    name: 'Black Friday Sale Announcement',
    type: 'sms',
    status: 'completed',
    createdAt: new Date('2024-11-25'),
    scheduledAt: new Date('2024-11-29'),
    completedAt: new Date('2024-11-29'),
    recipients: 5000,
    sent: 4950,
    delivered: 4890,
    opened: 3420,
    clicked: 680,
    failed: 60,
    cost: 247.50,
    deliveryRate: 98.8,
    openRate: 69.9,
    clickRate: 19.9,
    tags: ['promotion', 'sale', 'urgent']
  },
  {
    id: '2',
    name: 'Weekly Newsletter - Tech Updates',
    type: 'email',
    status: 'completed',
    createdAt: new Date('2024-11-20'),
    scheduledAt: new Date('2024-11-22'),
    completedAt: new Date('2024-11-22'),
    recipients: 12000,
    sent: 11800,
    delivered: 11650,
    opened: 4890,
    clicked: 890,
    failed: 150,
    cost: 59.00,
    deliveryRate: 98.7,
    openRate: 42.0,
    clickRate: 18.2,
    tags: ['newsletter', 'tech', 'weekly']
  },
  {
    id: '3',
    name: 'Payment Reminder',
    type: 'sms',
    status: 'running',
    createdAt: new Date('2024-11-28'),
    scheduledAt: new Date('2024-11-30'),
    recipients: 850,
    sent: 320,
    delivered: 315,
    opened: 280,
    clicked: 45,
    failed: 5,
    cost: 16.00,
    deliveryRate: 98.4,
    openRate: 88.9,
    clickRate: 16.1,
    tags: ['billing', 'reminder', 'urgent']
  }
];

export function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<CampaignHistoryItem[]>(mockCampaigns);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignHistoryItem[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignHistoryItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  React.useEffect(() => {
    let filtered = campaigns;

    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === typeFilter);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, statusFilter, typeFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'paused': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportCampaignData = (campaign: CampaignHistoryItem) => {
    const csvData = [
      ['Campaign Name', campaign.name],
      ['Type', campaign.type],
      ['Status', campaign.status],
      ['Created', format(campaign.createdAt, 'PPP')],
      ['Recipients', campaign.recipients.toString()],
      ['Sent', campaign.sent.toString()],
      ['Delivered', campaign.delivered.toString()],
      ['Opened', campaign.opened.toString()],
      ['Clicked', campaign.clicked.toString()],
      ['Failed', campaign.failed.toString()],
      ['Cost', `$${campaign.cost.toFixed(2)}`],
      ['Delivery Rate', `${campaign.deliveryRate}%`],
      ['Open Rate', `${campaign.openRate}%`],
      ['Click Rate', `${campaign.clickRate}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/[^a-z0-9]/gi, '_')}_report.csv`;
    a.click();
    toast.success('Campaign report exported successfully');
  };

  const totalStats = {
    campaigns: campaigns.length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    totalCost: campaigns.reduce((sum, c) => sum + c.cost, 0),
    avgDeliveryRate: campaigns.reduce((sum, c) => sum + c.deliveryRate, 0) / campaigns.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign History</h2>
          <p className="text-gray-600">Track performance and analyze your messaging campaigns</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{totalStats.campaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold">{totalStats.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${totalStats.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Delivery Rate</p>
                <p className="text-2xl font-bold">{totalStats.avgDeliveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search Campaigns</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="type">Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign History ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(campaign.status)}
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge variant="outline" className="uppercase text-xs">
                          {campaign.type}
                        </Badge>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p className="font-medium">Recipients</p>
                          <p>{campaign.recipients.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Delivery Rate</p>
                          <p className="flex items-center gap-1">
                            {campaign.deliveryRate}%
                            {campaign.deliveryRate > 95 ? 
                              <TrendingUp className="w-3 h-3 text-green-600" /> : 
                              <TrendingDown className="w-3 h-3 text-red-600" />
                            }
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Open Rate</p>
                          <p>{campaign.openRate}%</p>
                        </div>
                        <div>
                          <p className="font-medium">Click Rate</p>
                          <p>{campaign.clickRate}%</p>
                        </div>
                        <div>
                          <p className="font-medium">Cost</p>
                          <p>${campaign.cost.toFixed(2)}</p>
                        </div>
                      </div>

                      {campaign.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round((campaign.sent / campaign.recipients) * 100)}%</span>
                          </div>
                          <Progress value={(campaign.sent / campaign.recipients) * 100} className="h-2" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {campaign.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Created: {format(campaign.createdAt, 'PPP')}
                        {campaign.completedAt && (
                          <> • Completed: {format(campaign.completedAt, 'PPP')}</>
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportCampaignData(campaign)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details: {selectedCampaign?.name}</DialogTitle>
            <DialogDescription>
              Detailed performance metrics and analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <p className="text-sm text-gray-600">Recipients</p>
                      <p className="text-lg font-bold">{selectedCampaign.recipients.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <MessageSquare className="w-6 h-6 mx-auto text-green-600 mb-1" />
                      <p className="text-sm text-gray-600">Delivered</p>
                      <p className="text-lg font-bold">{selectedCampaign.delivered.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <Eye className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                      <p className="text-sm text-gray-600">Opened</p>
                      <p className="text-lg font-bold">{selectedCampaign.opened.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <TrendingUp className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                      <p className="text-sm text-gray-600">Clicked</p>
                      <p className="text-lg font-bold">{selectedCampaign.clicked.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Delivery Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Delivery Rate</span>
                      <span className="font-medium">{selectedCampaign.deliveryRate}%</span>
                    </div>
                    <Progress value={selectedCampaign.deliveryRate} className="h-2" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Open Rate</span>
                      <span className="font-medium">{selectedCampaign.openRate}%</span>
                    </div>
                    <Progress value={selectedCampaign.openRate} className="h-2" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Conversion</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Click Rate</span>
                      <span className="font-medium">{selectedCampaign.clickRate}%</span>
                    </div>
                    <Progress value={selectedCampaign.clickRate} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportCampaignData(selectedCampaign)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
