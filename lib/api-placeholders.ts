import { User, Conversation, Message, TypingIndicator } from "./types";

// ============ AUTH FUNCTIONS ============

// TODO: Replace with Clerk authentication
export const getCurrentUser = async (): Promise<User> => ({
  id: "mock-user-1",
  name: "Alex Rivers",
  email: "alex@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
  isOnline: true,
});

// TODO: Replace with Clerk signIn
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  console.log("TODO: Sign in with Clerk:", email);
  return {
    user: await getCurrentUser(),
    token: "mock-jwt-token",
  };
};

// TODO: Replace with Clerk signUp
export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: User; token: string }> => {
  console.log("TODO: Sign up with Clerk:", email, name);
  return {
    user: { id: "new-user", name, email, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, isOnline: true },
    token: "mock-jwt-token",
  };
};

// TODO: Replace with Clerk signOut
export const signOut = async (): Promise<void> => {
  console.log("TODO: Sign out with Clerk");
};

// ============ USER FUNCTIONS ============

// TODO: Replace with Convex query - getAllUsers
export const getAllUsers = async (): Promise<User[]> => [
  {
    id: "user-2",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    isOnline: true,
  },
  {
    id: "user-3",
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    isOnline: false,
  },
  {
    id: "user-4",
    name: "Carol White",
    email: "carol@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    isOnline: true,
  },
  {
    id: "user-5",
    name: "David Lee",
    email: "david@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    isOnline: false,
  },
];

// ============ CONVERSATION FUNCTIONS ============

// TODO: Replace with Convex query - getConversations
export const getConversations = async (userId: string): Promise<Conversation[]> => [
  {
    id: "conv-1",
    participantIds: ["mock-user-1", "user-2"],
    participantName: "Alice Johnson",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    participantOnline: true,
    lastMessage: "typing...",
    lastMessageTime: Date.now() - 5000,
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participantIds: ["mock-user-1", "user-3"],
    participantName: "Bob Smith",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    participantOnline: false,
    lastMessage: "Did you check the latest design update?",
    lastMessageTime: Date.now() - 86400000,
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participantIds: ["mock-user-1", "user-4"],
    participantName: "Carol White",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    participantOnline: true,
    lastMessage: "The meeting is postponed until tomorrow.",
    lastMessageTime: Date.now() - 259200000,
    unreadCount: 0,
  },
];

// TODO: Replace with Convex query - getMessages
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  console.log("TODO: Fetch messages from Convex:", conversationId);
  return [
    {
      id: "msg-1",
      conversationId,
      senderId: "user-2",
      content: "Hey! Have you had a chance to look at the new frontend components for Tars Chat?",
      timestamp: Date.now() - 180000,
      isDeleted: false,
      reactions: [{ emoji: "👍", userIds: ["mock-user-1"] }],
    },
    {
      id: "msg-2",
      conversationId,
      senderId: "mock-user-1",
      content: "Just finished the message bubble layouts. Looking super clean with the Satoshi font. What do you think about the reactions?",
      timestamp: Date.now() - 120000,
      isDeleted: false,
      reactions: [{ emoji: "🔥", userIds: ["user-2"] }],
    },
    {
      id: "msg-3",
      conversationId,
      senderId: "mock-user-1",
      content: "This message was deleted",
      timestamp: Date.now() - 60000,
      isDeleted: true,
      reactions: [],
    },
  ];
};

// TODO: Replace with Convex mutation - sendMessage
export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  console.log("TODO: Send message to Convex:", conversationId, content);
  return {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: "mock-user-1",
    content,
    timestamp: Date.now(),
    isDeleted: false,
    reactions: [],
  };
};

// TODO: Replace with Convex mutation - deleteMessage
export const deleteMessage = async (messageId: string): Promise<void> => {
  console.log("TODO: Soft delete message in Convex:", messageId);
};

// TODO: Replace with Convex mutation - addReaction
export const addReaction = async (
  messageId: string,
  emoji: string
): Promise<void> => {
  console.log("TODO: Add reaction in Convex:", messageId, emoji);
};

// TODO: Replace with Convex realtime subscription - typing indicator
export const setTypingStatus = async (
  conversationId: string,
  isTyping: boolean
): Promise<void> => {
  console.log("TODO: Update typing status in Convex:", conversationId, isTyping);
};

// TODO: Replace with Convex mutation - markConversationRead
export const markConversationRead = async (conversationId: string): Promise<void> => {
  console.log("TODO: Mark conversation as read in Convex:", conversationId);
};

// TODO: Replace with Convex query - getTypingIndicators
export const getTypingIndicators = async (
  conversationId: string
): Promise<TypingIndicator[]> => {
  console.log("TODO: Get typing indicators from Convex:", conversationId);
  return [];
};