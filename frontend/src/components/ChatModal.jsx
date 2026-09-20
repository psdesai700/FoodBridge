import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function ChatModal({ donationId, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (donationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll chat messages
      return () => clearInterval(interval);
    }
  }, [donationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/chat/donation/${donationId}`, config);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/chat/donation/${donationId}`, { text }, config);
      setMessages([...messages, data]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Coordination Thread</h3>
              <p className="text-[10px] text-slate-400">Matched Restaurant ↔ NGO ↔ Volunteer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No messages yet. Send a message to coordinate pickup!</p>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user._id;
              return (
                <div key={m._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">{m.senderName}</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-[9px]">{m.senderRole}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      isMe
                        ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type coordination message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
