export interface Message {
  id: string;
  planId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string; // ISO
  type: 'text' | 'system'; // system: "X se unió", "Plan confirmado"
  senderAvatarUrl?: string;
}

export interface SendMessagePayload {
  planId: string;
  content: string;
}

export interface ReportUserPayload {
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  messageId?: string;
}
