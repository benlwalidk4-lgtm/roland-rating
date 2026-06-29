import { useState, useEffect } from "react";
import { AppLanguage } from "./types";
import { translations } from "./translations";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import FileAnalyzerPanel from "./components/FileAnalyzerPanel";
import RolandRatingPanel from "./components/RolandRatingPanel";
import { MessageSquare, Upload, Award, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>("ar");
  const [activeTab, setActiveTab] = useState<"chat" | "file" | "roland">("roland");
  const [apiConnected, setApiConnected] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const t = translations[language];

  // Dynamically set HTML lang, dir, and page title on language change
  useEffect(() => {
    document.documentElement.lang = language;
    document.dir = language === "ar" ? "rtl" : "ltr";
    document.title = t.title;
  }, [language, t.title]);

  // Check API server connection health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }
      } catch (err) {
        console.error("Health check failed:", err);
        setApiConnected(false);
      }
    };

    checkHealth();
    // Check health every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Show customized toast notification
  const handleShowNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* App Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        t={t}
        apiConnected={apiConnected}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Connection Warning if server offline */}
        {!apiConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm shadow-xs"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <span className="font-bold">
                {language === "ar" ? "تنبيه:" : "Notice:"}
              </span>{" "}
              {t.apiError}
            </div>
          </motion.div>
        )}

        {/* Workspace Tab Switcher */}
        <div className="flex justify-center">
          <div className="relative inline-flex rounded-xl bg-gray-200/60 p-1 border border-gray-200/30">
            {/* Sliding background */}
            <div className="relative flex">
              <button
                onClick={() => setActiveTab("roland")}
                className={`relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "roland" ? "text-indigo-600 bg-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Award className="h-4 w-4" />
                {t.rolandTab}
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "chat" ? "text-indigo-600 bg-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                {t.chatTab}
              </button>
              <button
                onClick={() => setActiveTab("file")}
                className={`relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "file" ? "text-indigo-600 bg-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Upload className="h-4 w-4" />
                {t.fileTab}
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspaces Transition View */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "roland" ? (
              <motion.div
                key="roland-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <RolandRatingPanel
                  language={language}
                  t={t}
                  apiConnected={apiConnected}
                  onShowNotification={handleShowNotification}
                />
              </motion.div>
            ) : activeTab === "chat" ? (
              <motion.div
                key="chat-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <ChatPanel
                  language={language}
                  t={t}
                  apiConnected={apiConnected}
                  onShowNotification={handleShowNotification}
                />
              </motion.div>
            ) : (
              <motion.div
                key="file-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <FileAnalyzerPanel
                  language={language}
                  t={t}
                  apiConnected={apiConnected}
                  onShowNotification={handleShowNotification}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global Toast Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 inset-x-6 mx-auto max-w-sm z-50 flex items-center justify-between p-4 rounded-xl shadow-lg border bg-white"
            style={{
              borderColor: notification.type === "success" ? "#bbf7d0" : "#fecaca",
            }}
          >
            <div className="flex items-center gap-3">
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              )}
              <span className="text-xs font-semibold text-gray-700">
                {notification.message}
              </span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Humble Footer */}
      <footer className="py-6 mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-tight">
            &copy; {new Date().getFullYear()} {t.title}. {language === "ar" ? "مدعوم بنموذج الذكاء الاصطناعي الأحدث من Google" : "Powered by Google's state-of-the-art AI models."}
          </p>
        </div>
      </footer>
    </div>
  );
}
