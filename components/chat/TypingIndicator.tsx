export default function TypingIndicator() {
    return (
      <div className="flex items-center gap-2 py-2 animate-pulse">
        <div className="flex gap-1.5 px-3 py-2 bg-slate-100 rounded-full">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          is typing...
        </span>
      </div>
    );
  }