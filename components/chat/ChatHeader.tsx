"use client";

import { Conversation } from "@/lib/types";

interface ChatHeaderProps {
  conversation: Conversation | null;
  onBack?: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {

  if (!conversation) {
    return (
      <header className="h-20 border-b border-slate-100 px-4 lg:px-8 flex items-center justify-center sticky top-0 bg-white/80 backdrop-blur-md">
        <p className="text-slate-400">Select a conversation</p>
      </header>
    );
  }

  return (
    <header className="h-20 border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
            aria-label="Back to conversations"
          >
            <svg className="w-6 h-6 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <img
          src={conversation.participantAvatar}
          alt={conversation.participantName}
          className="w-11 h-11 rounded-full shadow-sm"
        />
        <div className="flex flex-col">
          <h2 className="font-bold text-lg leading-tight">
            {conversation.participantName}
          </h2>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                conversation.participantOnline ? "bg-green-500" : "bg-slate-300"
              }`}
            />
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              {conversation.participantOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}