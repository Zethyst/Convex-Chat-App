"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import PresenceUpdater from "@/components/PresenceUpdater";
import { Conversation } from "@/lib/types";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPage() {
  const { user } = useUser();
  const [selectedConvId, setSelectedConvId] = useState<Id<"conversations"> | null>(null);
  
  // Get all conversations
  const conversations = useQuery(api.conversations.list) || [];
  console.log(conversations);
  // Find selected conversation
  const selectedConversation: Conversation | null = selectedConvId
    ? conversations.find((c) => c.id === selectedConvId) || null
    : null;

  if (!user) return null;

  return (
    <>
      <PresenceUpdater />
      <div className="flex h-screen w-full bg-white text-slate-900 overflow-hidden">
        {/* Conversation List - visible by default on mobile, always visible on desktop */}
        <div className={`
          ${selectedConvId ? 'hidden lg:flex' : 'flex'}
          w-full lg:w-auto
        `}>
          <ConversationList
            selectedConvId={selectedConvId}
            onSelectConversation={setSelectedConvId}
            currentUserId={user.id}
          />
        </div>
        
        {/* Chat Window - hidden on mobile until conversation selected, always visible on desktop */}
        <div className={`
          ${selectedConvId ? 'flex' : 'hidden lg:flex'}
          w-full lg:w-auto lg:flex-1
        `}>
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={user.id}
            onBack={() => setSelectedConvId(null)}
          />
        </div>
      </div>
    </>
  );
}
