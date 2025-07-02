"use client";

import { useState } from "react";

export function Chat({ id, initialMessages = [] }: { id: string; initialMessages?: { role: string; content: string }[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // Here you could call an API to persist/send the message
  };

  return (
    <div className="mt-8 bg-neutral-900 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="mb-4 font-bold text-white">Chat about this video</div>
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.role === "user" ? "text-blue-300" : "text-gray-300"}`}>
            <span className="font-semibold">{msg.role === "user" ? "You" : "AI"}:</span> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded bg-neutral-800 text-white px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-[#e5ff00] text-black px-4 py-2 rounded font-bold"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
} 