
export interface SMSRequest {
  recipients: string[];
  message: string;
  senderId?: string;
  campaignId?: string;
}

export interface MspaceMessage {
  messageId: string;
  recipient: string;
  status: number;
  statusDescription: string;
}

export interface MspaceResponse {
  message: MspaceMessage[];
}

export interface SendResult {
  recipient: string;
  success: boolean;
  messageId?: string;
  message: string;
  error?: string;
}
