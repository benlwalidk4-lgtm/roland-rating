import { AppLanguage, Translation } from "../types";
import { Globe, Cpu } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: Translation;
  apiConnected: boolean;
}

export default function Header({ language, setLanguage, t, apiConnected }: HeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white shadow-xs">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 id="app-title" className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
            <span className={`h-2.5 w-2.5 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {apiConnected ? (language === 'ar' ? 'متصل بالخادم' : 'Server Online') : (language === 'ar' ? 'غير متصل بالخادم' : 'Server Offline')}
          </div>

          {/* Language Switcher */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setLanguage("ar")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                language === "ar"
                  ? "bg-white text-indigo-600 shadow-xs border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              {t.arabicLabel}
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                language === "en"
                  ? "bg-white text-indigo-600 shadow-xs border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              {t.englishLabel}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
