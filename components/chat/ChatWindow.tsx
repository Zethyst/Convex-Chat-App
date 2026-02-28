"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Message, Conversation } from "@/lib/types";
import { Id } from "@/convex/_generated/dataModel";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
  onBack?: () => void;
}

export default function ChatWindow({
  conversation,
  currentUserId,
  onBack,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const isAutoScrollingRef = useRef(false);

  // Real-time messages subscription - automatically updates when new messages arrive
  const messages = useQuery(
    api.messages.list,
    conversation ? { conversationId: conversation.id as Id<"conversations"> } : "skip"
  ) || [];

  // Real-time typing indicators
  const typingIndicators = useQuery(
    api.typing.getTyping,
    conversation ? { conversationId: conversation.id as Id<"conversations"> } : "skip"
  ) || [];

  const isTyping = typingIndicators.some((t) => t.isTyping && t.userId !== currentUserId);
  const isLoading = messages === undefined;

  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const addReaction = useMutation(api.messages.addReaction);
  const markAsRead = useMutation(api.conversations.markAsRead);

  const scrollToBottom = () => {
    isAutoScrollingRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      isAutoScrollingRef.current = false;
      setIsScrolledUp(false);
      setHasNewMessages(false);
    }, 500);
  };

  // Check if user is scrolled up (returns boolean)
  const checkIfScrolledUp = () => {
    if (!messagesContainerRef.current) return false;
    
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 150; // 150px threshold
    
    return !isAtBottom;
  };

  // Update scroll state
  const updateScrollState = () => {
    if (isAutoScrollingRef.current) return;
    
    const scrolledUp = checkIfScrolledUp();
    setIsScrolledUp(scrolledUp);
    
    // If user scrolls back to bottom, clear new messages flag
    if (!scrolledUp) {
      setHasNewMessages(false);
    }
  };

  // Detect new messages and check scroll position
  useEffect(() => {
    if (messages.length > previousMessageCount && previousMessageCount > 0) {
      // New message arrived (not initial load)
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Double RAF ensures DOM has fully updated
          // Skip if we're auto-scrolling
          if (isAutoScrollingRef.current) {
            // If auto-scrolling, user is at bottom, so clear flags
            setIsScrolledUp(false);
            setHasNewMessages(false);
            return;
          }
          
          // Check scroll position directly
          const scrolledUp = checkIfScrolledUp();
          
          // Update both states together
          setIsScrolledUp(scrolledUp);
          
          // If user is scrolled up, show new messages button
          // Otherwise, clear the flag
          setHasNewMessages(scrolledUp);
        });
      });
    }
    setPreviousMessageCount(messages.length);
  }, [messages.length, previousMessageCount]);

  // Auto-scroll to bottom only if user is at bottom (or initial load)
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 150;
    
    // Only auto-scroll if user is at bottom or it's the initial load
    if (isAtBottom || previousMessageCount === 0) {
      isAutoScrollingRef.current = true;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          isAutoScrollingRef.current = false;
          setIsScrolledUp(false);
          setHasNewMessages(false);
        }, 500);
      }, 100);
    } else {
      // User is scrolled up, don't auto-scroll
      // But we still need to update the scroll state
      setIsScrolledUp(true);
    }
  }, [messages, previousMessageCount]);

  // Add scroll listener and check initial position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check initial scroll position
    updateScrollState();

    container.addEventListener("scroll", updateScrollState);
    return () => {
      container.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  // Mark conversation as read when viewing
  useEffect(() => {
    if (conversation) {
      markAsRead({ conversationId: conversation.id as Id<"conversations"> }).catch(
        (err) => console.error("Failed to mark as read:", err)
      );
    }
  }, [conversation, markAsRead]);

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;
    try {
      await sendMessage({
        conversationId: conversation.id as Id<"conversations">,
        content,
      });
      // Auto-scroll to bottom when user sends a message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage({ messageId: messageId as Id<"messages"> });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await addReaction({
        messageId: messageId as Id<"messages">,
        emoji,
      });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  if (!conversation) {
    return (
      <main className="flex-1 flex flex-col relative bg-white">
        <ChatHeader conversation={null} onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Select a conversation to start messaging</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col relative bg-white w-full">
      <ChatHeader conversation={conversation} onBack={onBack} />

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-8 space-y-4 bg-[#FAFAFA]/50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-slate-400 mb-2">No messages yet</div>
              <div className="text-sm text-slate-500">
                Start the conversation with {conversation.participantName}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSender={message.senderId === currentUserId}
                senderAvatar={
                  message.senderId !== currentUserId
                    ? conversation.participantAvatar
                    : undefined
                }
                currentUserId={currentUserId}
                onDelete={handleDeleteMessage}
                onReact={handleReact}
              />
            ))}

            {isTyping && (
              <TypingIndicator />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {isScrolledUp && hasNewMessages && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-28 right-4 lg:right-8 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition-all z-20"
          aria-label="Scroll to latest message"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
          <span>New messages</span>
        </button>
      )}

      <MessageInput 
        onSend={handleSendMessage} 
        isLoading={isLoading}
        conversationId={conversation?.id as Id<"conversations"> | undefined}
      />
    </main>
  );
}