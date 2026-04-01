"use client";

import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatBubble({ message }: { message: Message }) {
  const isGojo = message.role === "assistant";

  return (
    <div
      className={`chat-bubble flex ${isGojo ? "justify-start" : "justify-end"} gap-2`}
    >
      {/* Gojo avatar */}
      {isGojo && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
          <Image src="/gojo-avatar.svg" alt="Gojo" width={32} height={32} />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isGojo
            ? "bg-white/10 text-white rounded-bl-md"
            : "bg-gradient-to-r from-gojo-blue to-gojo-purple text-white rounded-br-md"
        }`}
      >
        {/* Render newlines */}
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-1 ${
            isGojo ? "text-white/30" : "text-white/50"
          }`}
        >
          {message.timestamp.toLocaleTimeString("en-SG", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Max avatar */}
      {!isGojo && (
        <div className="w-8 h-8 rounded-full bg-gojo-purple/30 flex items-center justify-center text-sm flex-shrink-0 mt-1">
          ⭐
        </div>
      )}
    </div>
  );
}
