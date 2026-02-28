"use client";

import { Conversation } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: ConversationListItemProps) {
  // Force re-render every minute to update relative time display
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all text-left ${
        isSelected
          ? "bg-white shadow-sm border border-slate-100"
          : "hover:bg-slate-100/50 border border-transparent"
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={conversation.participantAvatar}
          alt={conversation.participantName}
          className={`w-12 h-12 rounded-full ${
            !conversation.participantOnline ? "opacity-60" : ""
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
            conversation.participantOnline ? "bg-green-500" : "bg-slate-300"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-bold truncate">
            {conversation.participantName}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-xs truncate ${
              conversation.unreadCount > 0
                ? "text-slate-900 font-semibold"
                : "text-slate-500"
            }`}
          >
            {conversation.lastMessage}
          </p>

          {conversation.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center flex-shrink-0 ml-2">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}