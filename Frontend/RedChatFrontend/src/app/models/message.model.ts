export interface Message {
    Id?: string;
    senderId: string;
    content: string;
    sentAt: Date;
    receiverId: string;
  }