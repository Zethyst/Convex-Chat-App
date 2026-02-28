"use client";

import { Message, User } from "@/lib/types";
import { formatMessageTime } from "@/lib/utils";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  senderAvatar?: string;
  currentUserId: string;
  onDelete: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🤔"];

export default function MessageBubble({
  message,
  isSender,
  senderAvatar,
  currentUserId,
  onDelete,
  onReact,
}: MessageBubbleProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(message.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReact = async (emoji: string) => {
    try {
      await onReact(message.id, emoji);
      setShowReactions(false);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  if (message.isDeleted) {
    return (
      <div
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}
      >
        <div className="bg-slate-100 text-slate-400 p-4 rounded-2xl italic text-sm border border-dashed border-slate-200 max-w-[80%]">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4 group`}
    >
      {!isSender && senderAvatar && (
        <img
          src={senderAvatar}
          alt="sender"
          className="w-8 h-8 rounded-full mt-1 mr-3"
        />
      )}

      <div className="max-w-[80%]">
        <div
          className={`${
            isSender
              ? "bg-slate-900 text-white message-bubble-mine"
              : "bg-white border border-slate-200 text-slate-700 message-bubble-theirs"
          } p-4 rounded-2xl shadow-sm text-sm leading-relaxed`}
        >
          {message.content}
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div
            className={`flex gap-1 mt-[-8px] ${
              isSender ? "mr-2 justify-end" : "ml-2"
            }`}
          >
            {message.reactions.map((reaction) => (
              <div
                key={reaction.emoji}
                className="bg-white border border-slate-200 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm cursor-pointer hover:bg-slate-50"
                onClick={() =>
                  handleReact(reaction.emoji.split(" ")[0] || reaction.emoji)
                }
              >
                <span className="text-xs">{reaction.emoji}</span>
                <span className="text-[10px] font-bold text-slate-600">
                  {reaction.userIds.length}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp & Actions */}
        <div
          className={`flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          {isSender && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}

          <span className="text-[10px] text-slate-400 font-medium">
            {formatMessageTime(message.timestamp)}
          </span>

          {!isSender && (
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Reactions Popup */}
        {showReactions && (
          <div className="flex gap-1 mt-2 bg-white border border-slate-100 rounded-full px-2 py-1 shadow-lg">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}