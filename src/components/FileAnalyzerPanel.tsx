import React, { useState, useRef } from "react";
import { AppLanguage, Translation, FileAnalysis } from "../types";
import { Upload, FileText, Image, FileCode, Film, Music, File, Check, Copy, RefreshCw, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

interface FileAnalyzerPanelProps {
  language: AppLanguage;
  t: Translation;
  apiConnected: boolean;
  onShowNotification: (message: string, type: "success" | "error") => void;
}

export default function FileAnalyzerPanel({ language, t, apiConnected, onShowNotification }: FileAnalyzerPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FileAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Format bytes to human readable string
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Get icon depending on file mimeType
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-10 w-10 text-emerald-500" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("javascript")) {
      return <FileCode className="h-10 w-10 text-amber-500" />;
    } else if (mimeType.startsWith("audio/")) {
      return <Music className="h-10 w-10 text-cyan-500" />;
    } else if (mimeType.startsWith("video/")) {
      return <Film className="h-10 w-10 text-indigo-500" />;
    }
    return <File className="h-10 w-10 text-gray-500" />;
  };

  // Handle file selection
  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.size > 20 * 1024 * 1024) {
      onShowNotification(
        language === "ar"
          ? "الملف كبير جداً. الحد الأقصى للحجم هو 20 ميجابايت."
          : "File is too large. Maximum allowed size is 20MB.",
        "error"
      );
      return;
    }

    setFile(selectedFile);
    setAnalysisResult(null); // Reset previous analysis

    // Generate preview if it's an image
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Trigger analysis
  const handleAnalyzeFile = async () => {
    if (!file) {
      onShowNotification(t.noFileSelected, "error");
      return;
    }

    setIsAnalyzing(true);
    const analysisPrompt = prompt.trim() || (language === "ar" ? "حلل هذا الملف بالتفصيل واشرح محتواه." : "Analyze this file in detail and explain its contents.");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", analysisPrompt);

      const response = await fetch("/api/analyze-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("HTTP Error " + response.status);
      }

      const data = await response.json();

      setAnalysisResult({
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size,
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prompt: analysisPrompt,
      });

      onShowNotification(
        language === "ar" ? "اكتمل تحليل الملف بنجاح!" : "File analyzed successfully!",
        "success"
      );
    } catch (error: any) {
      console.error("Analysis Error:", error);
      onShowNotification(t.apiError, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy analysis results to clipboard
  const handleCopyResults = async () => {
    if (!analysisResult) return;
    try {
      await navigator.clipboard.writeText(analysisResult.content);
      setCopied(true);
      onShowNotification(t.copySuccess, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFilePreview(null);
    setPrompt("");
    setAnalysisResult(null);
  };

  // Prompt suggestions depending on file type
  const getPromptSuggestions = () => {
    if (!file) return [];
    const mime = file.type;

    if (mime.startsWith("image/")) {
      return language === "ar"
        ? [
            "اشرح ما تراه في هذه الصورة بالتفصيل.",
            "استخرج أي نصوص مكتوبة داخل هذه الصورة.",
            "ما هي الألوان والمزاج العام المهيمن في هذه الصورة؟",
          ]
        : [
            "Describe what you see in this image in detail.",
            "Extract any text present inside this image.",
            "What is the mood and primary color palette of this image?",
          ];
    } else if (mime === "application/pdf") {
      return language === "ar"
        ? [
            "قم بتلخيص هذا المستند في 5 نقاط رئيسية.",
            "استخرج المواضيع والقرارات الكبرى في هذا الملف.",
            "ما هي الكلمات المفتاحية الأكثر تكراراً وأهميتها؟",
          ]
        : [
            "Summarize this document in 5 key takeaways.",
            "Extract the main decisions or goals stated in this PDF.",
            "What are the most significant keywords in this file?",
          ];
    } else if (mime.startsWith("audio/")) {
      return language === "ar"
        ? [
            "قم بكتابة نص الكلام المنطوق في هذا الملف الصوتي (تفريع).",
            "لخص موضوع التسجيل الصوتي والنقاط الأساسية.",
          ]
        : [
            "Transcribe the audio speech into text.",
            "Provide a summary of the spoken audio and main topics.",
          ];
    } else if (mime.startsWith("video/")) {
      return language === "ar"
        ? [
            "صف الأحداث البصرية والسمعية في هذا الفيديو.",
            "قم بتحليل سيناريو الفيديو والمواضيع المعروضة.",
          ]
        : [
            "Describe the visual and auditory events in this video.",
            "Analyze the timeline and key themes of this video.",
          ];
    }
    // General fallback
    return language === "ar"
      ? ["قم بتحليل هذا الملف وشرح محتواه بالتفصيل.", "لخص هذا الملف بأقصر شكل ممكن."]
      : ["Analyze this file and explain its content in detail.", "Summarize this file as concisely as possible."];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* File Configuration Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-800">{t.fileDetails}</h2>
          </div>
          {file && (
            <button
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-100 transition-all font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              {language === "ar" ? "البدء من جديد" : "Reset"}
            </button>
          )}
        </div>

        {/* Upload Drop Zone */}
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleBrowseFiles}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
                : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*,application/pdf,text/*,audio/*,video/*"
            />
            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 mb-3 text-indigo-600">
              <Upload className="h-6 w-6 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {dragActive ? t.uploadDragActive : t.uploadTitle}
            </p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-sm">
              {t.uploadSubtitle}
            </p>
          </div>
        ) : (
          /* File Preview / Details */
          <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50 space-y-4">
            <div className="flex items-center gap-4">
              {filePreview ? (
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-xs bg-white">
                  <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 shadow-xs">
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded-md font-medium">{file.type || "unknown"}</span>
                  <span className="font-mono">{formatBytes(file.size)}</span>
                </div>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                {t.quickPromptsTitle}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getPromptSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(suggestion)}
                    className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-600 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.promptLabel}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                language === "ar"
                  ? "مثال: اكتب تحليلاً شاملاً للملف واستخلص أهم خمسة أفكار..."
                  : "e.g., Provide a detailed summary and highlight five main ideas..."
              }
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-400 bg-white min-h-[80px]"
            />
          </div>

          <button
            onClick={handleAnalyzeFile}
            disabled={!file || isAnalyzing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t.analyzingState}</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>{t.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-800">{t.analysisResultTitle}</h2>
          </div>
          {analysisResult && (
            <button
              onClick={handleCopyResults}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 font-medium transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t.copySuccess : t.copyBtn}</span>
            </button>
          )}
        </div>

        {/* Output content area */}
        <div className="flex-1 overflow-y-auto select-text">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-4 h-full"
              >
                {/* Visual loading waves */}
                <div className="flex items-end gap-1.5 h-10 mb-2">
                  <div className="w-2 bg-indigo-500 rounded-full animate-pulse h-10" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 bg-indigo-500 rounded-full animate-pulse h-6" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 bg-indigo-500 rounded-full animate-pulse h-8" style={{ animationDelay: "300ms" }} />
                  <div className="w-2 bg-indigo-500 rounded-full animate-pulse h-5" style={{ animationDelay: "450ms" }} />
                  <div className="w-2 bg-indigo-500 rounded-full animate-pulse h-9" style={{ animationDelay: "600ms" }} />
                </div>
                <p className="text-sm font-semibold text-gray-500">{t.analyzingState}</p>
                <p className="text-xs text-gray-400 max-w-xs">{language === "ar" ? "تقوم نماذج Gemini بقراءة وفك تشفير الملف حالياً لتقديم أفضل تحليل." : "Gemini models are processing and parsing your uploaded file to deliver structured insights."}</p>
              </motion.div>
            ) : analysisResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Micro Metadata Card */}
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-wrap gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">{t.fileNameLabel}</span>
                    <span className="font-medium text-gray-700">{analysisResult.fileName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">{t.fileTypeLabel}</span>
                    <span className="font-medium text-gray-700">{analysisResult.mimeType}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">{t.fileSizeLabel}</span>
                    <span className="font-medium text-gray-700 font-mono">{formatBytes(analysisResult.size)}</span>
                  </div>
                </div>

                {/* Analysis Content Markdown */}
                <div className="markdown-body prose prose-sm max-w-none text-gray-800 leading-relaxed bg-white rounded-xl">
                  <Markdown>{analysisResult.content}</Markdown>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 h-full">
                <HelpCircle className="h-12 w-12 text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-500">
                  {language === "ar" ? "لا توجد نتائج تحليل حالياً." : "No analysis results to display."}
                </p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  {language === "ar" ? "ارفع ملفاً واضغط على زر تحليل لبدء استخراج البيانات والمحتوى بذكاء." : "Upload a file and click analyze to start generating intelligent multi-modal content insights."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
