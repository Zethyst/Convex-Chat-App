"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Conversation } from "@/lib/types";
import ConversationListItem from "./ConversationListItem";
import UserPicker from "./UserPicker";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationListProps {
  selectedConvId: Id<"conversations"> | null;
  onSelectConversation: (convId: Id<"conversations">) => void;
  currentUserId: string;
}

export default function ConversationList({
  selectedConvId,
  onSelectConversation,
  currentUserId,
}: ConversationListProps) {
  const { user } = useUser();
  console.log("user", user);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  
  // Use Convex query for real-time conversations
  const conversations = useQuery(api.conversations.list) || [];
  const isLoading = conversations === undefined;
  const createConversation = useMutation(api.conversations.create);

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateConversation = async (otherParticipantClerkId: string) => {
    try {
      const conversationId = await createConversation({
        otherParticipantClerkId,
      });
      onSelectConversation(conversationId);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation. Please try again.");
    }
  };

  return (
    <aside className="w-full lg:w-[350px] border-r border-slate-100 flex flex-col bg-slate-50/50">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.imageUrl ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=you"}
              alt="You"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "User"}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Online
            </span>
          </div>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      {/* New Chat & Search */}
      <div className="p-4 space-y-4">
        <button
          onClick={() => setIsUserPickerOpen(true)}
          className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span>New Chat</span>
        </button>

        <div className="relative group">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400 text-sm">Loading conversations...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400 text-sm">No conversations found</div>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConvId === (conversation.id as Id<"conversations">)}
              onClick={() => onSelectConversation(conversation.id as Id<"conversations">)}
            />
          ))
        )}
      </div>

      {/* User Picker Modal */}
      <UserPicker
        isOpen={isUserPickerOpen}
        onClose={() => setIsUserPickerOpen(false)}
        onSelectUser={handleCreateConversation}
      />
    </aside>
  );
}