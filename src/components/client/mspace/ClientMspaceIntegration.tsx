import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  CreditCard,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  User,
  Phone,
  Eye,
} from "lucide-react";
import { useClientMspaceApi } from "@/hooks/useClientMspaceApi";
import { format } from "date-fns";
import { toast } from "sonner";

export const ClientMspaceIntegration: React.FC = () => {
  const {
    clientProfile,
    assignedCredentials,
    hasMspaceIntegration,
    hasActiveCredentials,
    integrationStatus,
    isLoading,
    sendSMS,
    checkBalance,
    refreshProfile,
    balance,
    clientId,
    clientName,
    lastSynced,
    deliveryReports,
    canSendSMS,
    canCheckBalance,
    getStatusMessage,
    getStatusType,
  } = useClientMspaceApi();

  const [smsForm, setSmsForm] = useState({
    recipients: "",
    message: "",
    senderId: "",
  });

  const statusType = getStatusType();
  const statusMessage = getStatusMessage();

  const handleSendSMS = async () => {
    if (!smsForm.recipients.trim() || !smsForm.message.trim()) {
      toast.error("Please fill in recipients and message");
      return;
    }

    const recipients = smsForm.recipients
      .split(/[,;\n]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (recipients.length === 0) {
      toast.error("Please provide valid recipients");
      return;
    }

    try {
      await sendSMS.mutateAsync({
        recipients,
        message: smsForm.message,
        senderId: smsForm.senderId || undefined,
      });

      // Clear form on success
      setSmsForm({
        recipients: "",
        message: "",
        senderId: "",
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getStatusIcon = () => {
    switch (statusType) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading MSpace integration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasMspaceIntegration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            MSpace SMS Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              MSpace integration is not available for your account. Contact your
              administrator to set up MSpace SMS services.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            MSpace SMS Integration
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshProfile.mutate()}
              disabled={refreshProfile.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshProfile.isPending ? "animate-spin" : ""}`}
              />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">Client ID</p>
                <p className="text-sm text-muted-foreground">
                  {clientId || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Balance</p>
                <p className="text-sm text-muted-foreground">
                  {balance.toLocaleString()} SMS
                  {hasActiveCredentials && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => checkBalance.mutate()}
                      disabled={!canCheckBalance}
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${checkBalance.isPending ? "animate-spin" : ""}`}
                      />
                    </Button>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {lastSynced ? format(new Date(lastSynced), "PPp") : "Never"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge variant={integrationStatus.ready ? "default" : "secondary"}>
              {integrationStatus.ready ? "Ready" : "Not Ready"}
            </Badge>
            {assignedCredentials && (
              <Badge variant="outline">
                Username: {assignedCredentials.username}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Features */}
      {hasActiveCredentials && (
        <Tabs defaultValue="send" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">Send SMS</TabsTrigger>
            <TabsTrigger value="reports">Delivery Reports</TabsTrigger>
            <TabsTrigger value="account">Account Info</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Textarea
                    id="recipients"
                    placeholder="Enter phone numbers separated by commas or new lines&#10;e.g., +254712345678, +254787654321"
                    value={smsForm.recipients}
                    onChange={(e) =>
                      setSmsForm((prev) => ({
                        ...prev,
                        recipients: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate multiple numbers with commas or new lines
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your SMS message..."
                    value={smsForm.message}
                    onChange={(e) =>
                      setSmsForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{smsForm.message.length} characters</span>
                    <span>~{Math.ceil(smsForm.message.length / 160)} SMS</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderId">Sender ID (Optional)</Label>
                  <Input
                    id="senderId"
                    placeholder="e.g., YourBrand"
                    value={smsForm.senderId}
                    onChange={(e) =>
                      setSmsForm((prev) => ({
                        ...prev,
                        senderId: e.target.value,
                      }))
                    }
                    maxLength={11}
                  />
                  <p className="text-sm text-muted-foreground">
                    Max 11 characters. Leave empty to use default.
                  </p>
                </div>

                <Button
                  onClick={handleSendSMS}
                  disabled={
                    !canSendSMS ||
                    !smsForm.recipients.trim() ||
                    !smsForm.message.trim()
                  }
                  className="w-full"
                >
                  {sendSMS.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS
                    </>
                  )}
                </Button>

                {balance < 10 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your SMS balance is low ({balance} remaining). Contact
                      your administrator to top up.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Delivery Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveryReports.length > 0 ? (
                  <div className="space-y-2">
                    {deliveryReports
                      .slice(0, 10)
                      .map((report: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{report.recipient}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.message?.substring(0, 50)}...
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                report.status === "delivered"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {report.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {report.timestamp &&
                                format(new Date(report.timestamp), "PPp")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No delivery reports available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name</Label>
                    <p className="text-sm font-medium">{clientName}</p>
                  </div>
                  <div>
                    <Label>Client ID</Label>
                    <p className="text-sm font-medium">{clientId}</p>
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <p className="text-sm font-medium">
                      {clientProfile?.user_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant="default">{clientProfile?.status}</Badge>
                  </div>
                  <div>
                    <Label>Current Balance</Label>
                    <p className="text-sm font-medium">
                      {balance.toLocaleString()} SMS
                    </p>
                  </div>
                  <div>
                    <Label>Last Sync</Label>
                    <p className="text-sm font-medium">
                      {lastSynced
                        ? format(new Date(lastSynced), "PPpp")
                        : "Never"}
                    </p>
                  </div>
                  {assignedCredentials && (
                    <>
                      <div>
                        <Label>API Username</Label>
                        <p className="text-sm font-medium">
                          {assignedCredentials.username}
                        </p>
                      </div>
                      <div>
                        <Label>Credentials Status</Label>
                        <Badge
                          variant={
                            assignedCredentials.is_active
                              ? "default"
                              : "destructive"
                          }
                        >
                          {assignedCredentials.is_active
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Integration Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {integrationStatus.profileExists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Profile Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {integrationStatus.credentialsAssigned ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Credentials Assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {integrationStatus.credentialsActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Credentials Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
