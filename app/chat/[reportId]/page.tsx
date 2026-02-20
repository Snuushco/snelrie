"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Shield, Send, Loader2, ArrowLeft, MessageCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { reportId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportName, setReportName] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check report access
    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/rie/${reportId}`);
        if (!res.ok) {
          setAccessError("Rapport niet gevonden");
          setPageLoading(false);
          return;
        }
        const data = await res.json();
        if (data.tier !== "ENTERPRISE") {
          setAccessError("AI Expert Chat is alleen beschikbaar voor Enterprise klanten.");
          setPageLoading(false);
          return;
        }
        if (!data.hasPaid) {
          setAccessError("Betaling is vereist om de AI Expert Chat te gebruiken.");
          setPageLoading(false);
          return;
        }
        setReportName(data.bedrijfsnaam);
        setPageLoading(false);
      } catch {
        setAccessError("Er ging iets mis bij het laden.");
        setPageLoading(false);
      }
    };
    checkAccess();
  }, [reportId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Er ging iets mis");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages([
                  ...newMessages,
                  { role: "assistant", content: assistantContent },
                ]);
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      }

      if (!assistantContent) {
        setMessages(newMessages);
        setError("Geen antwoord ontvangen van de AI.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Toegang geweigerd</h2>
          <p className="text-gray-600 mb-4">{accessError}</p>
          <Link
            href={`/scan/resultaat/${reportId}`}
            className="text-brand-600 font-medium hover:underline"
          >
            Terug naar rapport
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/scan/resultaat/${reportId}`}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-600" />
              <span className="font-bold text-sm">
                Snel<span className="text-brand-600">RIE</span>
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600 truncate max-w-[200px]">
            💬 Chat — {reportName}
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                AI Expert Chat
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Stel vragen over uw RI&E, risico's, maatregelen of
                Arbo-wetgeving. De AI kent uw volledige rapport.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  "Wat zijn mijn belangrijkste risico's?",
                  "Welke maatregelen hebben de hoogste prioriteit?",
                  "Wat zegt de Arbowet over mijn situatie?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:border-brand-300 hover:text-brand-600 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-br-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && msg.content === "" && loading && (
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="text-center">
              <p className="text-sm text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
                {error}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Stel een vraag over uw RI&E..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
