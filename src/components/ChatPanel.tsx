import React, { useState, useRef, useEffect } from "react";
import { Message, AppLanguage, Translation } from "../types";
import { Send, Trash2, Bot, User, Copy, Check, Settings, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

interface ChatPanelProps {
  language: AppLanguage;
  t: Translation;
  apiConnected: boolean;
  onShowNotification: (message: string, type: "success" | "error") => void;
}

export default function ChatPanel({ language, t, apiConnected, onShowNotification }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        language === "ar"
          ? "مرحباً! أنا مساعدك الذكي المدعوم بنموذج Gemini 3.5-Flash. كيف يمكنني مساعدتك اليوم؟"
          : "Hello! I am your AI assistant powered by Gemini 3.5-Flash. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle Quick Prompt selection
  const handleQuickPrompt = (promptText: string) => {
    if (isGenerating) return;
    setInputValue(promptText);
  };

  // Copy message to clipboard
  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onShowNotification(t.copySuccess, "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const promptToSend = inputValue;
    setInputValue("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Include current chat history including the new user message
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: systemInstruction.trim() || undefined,
          temperature: temperature,
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      onShowNotification(t.apiError, "error");

      // Add system error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content:
            language === "ar"
              ? "عذراً، حدث خطأ أثناء محاولة الحصول على رد من الخادم. يرجى التحقق من تشغيل الخادم وتعيين مفتاح API الخاص بك."
              : "Sorry, an error occurred while generating a response from the server. Please verify the backend is running and the API key is set.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content:
          language === "ar"
            ? "تم إعادة تعيين الدردشة. كيف يمكنني مساعدتك الآن؟"
            : "Chat reset. How can I help you now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Quick prompt presets
  const quickPrompts =
    language === "ar"
      ? [
          "اشرح لي أساسيات الذكاء الاصطناعي ببساطة.",
          "اكتب لي بريدًا إلكترونيًا رسميًا للاعتذار عن الغياب.",
          "كيف يمكنني تحسين جودة نومي اليومية؟",
          "أعطني فكرة مبتكرة لبرمجة تطبيق مفيد.",
        ]
      : [
          "Explain quantum computing in simple terms.",
          "Write a professional email asking for a meeting.",
          "What are 5 healthy habits for better productivity?",
          "Give me an innovative idea for a web application.",
        ];

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Settings Panel Toggle Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/70">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700">{t.chatTab}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${
              showSettings ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-gray-200"
            }`}
            title={t.systemInstructionLabel}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={t.clearChat}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-100 bg-gray-50/30 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {t.systemInstructionLabel}
                </label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder={t.systemInstructionPlaceholder}
                  className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:outline-hidden bg-white min-h-[50px] resize-y"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-gray-600">
                  {language === "ar" ? "درجة التنوع والاستجابة (Temperature):" : "Creativity (Temperature):"} {temperature}
                </span>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-32 accent-indigo-600"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? (language === "ar" ? "mr-auto flex-row-reverse" : "ml-auto flex-row-reverse") : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold border ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-indigo-600" />}
              </div>

              {/* Message Content Container */}
              <div className="flex flex-col gap-1">
                <div
                  className={`relative p-3.5 rounded-2xl shadow-2xs text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-xs"
                  }`}
                >
                  {/* Markdown content */}
                  <div className="markdown-body select-text prose prose-sm max-w-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>

                  {/* Copy Button */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="absolute bottom-2 left-2 opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded-md bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-200 transition-all duration-200"
                      style={{ transform: "translateY(120%)", position: "absolute" }} /* Keep visible on hover */
                    >
                      {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}

                  {/* Inline micro copy button always available on mobile or when hovering message */}
                  <div className="flex justify-end mt-1.5 pt-1.5 border-t border-indigo-500/20 text-[10px] text-indigo-200">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className={`inline-flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity ${
                        msg.role === "user" ? "text-white" : "text-gray-400 hover:text-indigo-600"
                      }`}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>{t.copySuccess}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{t.copyBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <span className="text-[10px] text-gray-400 px-1 self-end">
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Assistant Generating State */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 border border-gray-200">
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-tl-xs shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Helper */}
      {messages.length === 1 && !isGenerating && (
        <div className="px-4 py-3 bg-slate-50/50 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            {t.quickPromptsTitle}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(promptText)}
                className="text-left text-xs p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all truncate"
                style={{ direction: language === "ar" ? "rtl" : "ltr" }}
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Footer */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.placeholderText}
            disabled={isGenerating}
            className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium text-sm shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <span>{t.sendBtn}</span>
            <Send className={`h-4 w-4 ${language === "ar" ? "rotate-180" : ""}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
