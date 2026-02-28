export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    isOnline: boolean;
  }
  
  export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: number; // Unix ms
    isDeleted: boolean;
    reactions: Reaction[];
  }
  
  export interface Reaction {
    emoji: string;
    userIds: string[];
  }
  
  export interface Conversation {
    id: string;
    participantIds: string[];
    participantName: string;
    participantAvatar: string;
    participantOnline: boolean;
    lastMessage: string;
    lastMessageTime: number;
    unreadCount: number;
  }
  
  export interface TypingIndicator {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
  }