
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Globe, 
  Shield, 
  TrendingUp,
  MapPin,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'email';
  value: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  first_seen: string;
  last_seen: string;
  confidence: number;
  source: string;
}

interface AttackPattern {
  id: string;
  name: string;
  technique: string;
  tactic: string;
  description: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigations: string[];
}

export function ThreatIntelligence() {
  const [indicators] = useState<ThreatIndicator[]>([
    {
      id: '1',
      type: 'ip',
      value: '203.0.113.1',
      threat_level: 'high',
      category: 'Malicious IP',
      description: 'Known botnet command and control server',
      first_seen: '2024-06-10',
      last_seen: '2024-06-15',
      confidence: 95,
      source: 'Threat Intel Feed'
    },
    {
      id: '2',
      type: 'domain',
      value: 'malicious-site.example',
      threat_level: 'critical',
      category: 'Phishing',
      description: 'Active phishing campaign targeting financial institutions',
      first_seen: '2024-06-12',
      last_seen: '2024-06-15',
      confidence: 98,
      source: 'Security Research'
    }
  ]);

  const [attackPatterns] = useState<AttackPattern[]>([
    {
      id: '1',
      name: 'Credential Stuffing',
      technique: 'T1110.004',
      tactic: 'Credential Access',
      description: 'Automated login attempts using stolen credentials',
      frequency: 45,
      severity: 'high',
      mitigations: ['Multi-factor Authentication', 'Rate Limiting', 'Account Lockout']
    },
    {
      id: '2',
      name: 'SQL Injection',
      technique: 'T1190',
      tactic: 'Initial Access',
      description: 'Attempts to exploit database vulnerabilities',
      frequency: 23,
      severity: 'critical',
      mitigations: ['Input Validation', 'Parameterized Queries', 'Web Application Firewall']
    }
  ]);

  const threatMetrics = {
    total_indicators: indicators.length,
    critical_threats: indicators.filter(i => i.threat_level === 'critical').length,
    blocked_attacks: 156,
    detection_rate: 94
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip':
        return <Globe className="w-4 h-4" />;
      case 'domain':
        return <Globe className="w-4 h-4" />;
      case 'hash':
        return <Shield className="w-4 h-4" />;
      case 'email':
        return <Target className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Threat Intelligence
          </h3>
          <p className="text-gray-600">Monitor and analyze threat indicators and attack patterns</p>
        </div>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Update Feed
        </Button>
      </div>

      {/* Threat Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{threatMetrics.total_indicators}</div>
            <p className="text-sm text-gray-600">Active Indicators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{threatMetrics.critical_threats}</div>
            <p className="text-sm text-gray-600">Critical Threats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{threatMetrics.blocked_attacks}</div>
            <p className="text-sm text-gray-600">Blocked Attacks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{threatMetrics.detection_rate}%</div>
            <p className="text-sm text-gray-600">Detection Rate</p>
            <Progress value={threatMetrics.detection_rate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Threat Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Active Threat Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {indicators.map((indicator) => (
              <div key={indicator.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(indicator.type)}
                    <Badge variant="outline" className="text-xs">
                      {indicator.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-medium">{indicator.value}</span>
                      <Badge className={getSeverityColor(indicator.threat_level)}>
                        {indicator.threat_level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{indicator.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Category: {indicator.category}</span>
                      <span>Confidence: {indicator.confidence}%</span>
                      <span>Source: {indicator.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last seen: {indicator.last_seen}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Block
                  </Button>
                  <Button size="sm" variant="outline">
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attack Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Common Attack Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attackPatterns.map((pattern) => (
              <div key={pattern.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{pattern.name}</h4>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    {pattern.frequency} attempts this week
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Technique:</span>
                    <span className="ml-2 font-mono">{pattern.technique}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tactic:</span>
                    <span className="ml-2">{pattern.tactic}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700">Mitigations:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pattern.mitigations.map((mitigation, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {mitigation}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
