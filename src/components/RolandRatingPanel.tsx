import React, { useState, useRef } from "react";
import { AppLanguage, Translation, RolandRating } from "../types";
import { Upload, Image as ImageIcon, Check, RefreshCw, User, HelpCircle, Shield, Award, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RolandRatingPanelProps {
  language: AppLanguage;
  t: Translation;
  apiConnected: boolean;
  onShowNotification: (message: string, type: "success" | "error") => void;
}

export default function RolandRatingPanel({ language, t, apiConnected, onShowNotification }: RolandRatingPanelProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [ratingResult, setRatingResult] = useState<RolandRating | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  // File handling for Front Profile
  const handleFrontFileChange = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      onShowNotification(
        language === "ar" ? "الملف كبير جداً. الحد الأقصى للحجم هو 20 ميجابايت." : "File is too large. Max 20MB allowed.",
        "error"
      );
      return;
    }
    setFrontFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFrontPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setRatingResult(null);
  };

  // File handling for Side Profile
  const handleSideFileChange = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      onShowNotification(
        language === "ar" ? "الملف كبير جداً. الحد الأقصى للحجم هو 20 ميجابايت." : "File is too large. Max 20MB allowed.",
        "error"
      );
      return;
    }
    setSideFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSidePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setRatingResult(null);
  };

  const handleStartRating = async () => {
    if (!frontFile || !sideFile) {
      onShowNotification(
        language === "ar" ? "يرجى رفع كل من الصورة الأمامية والجانبية أولاً." : "Please upload both front and side profile images.",
        "error"
      );
      return;
    }

    setIsRating(true);
    try {
      const formData = new FormData();
      formData.append("front", frontFile);
      formData.append("side", sideFile);

      const response = await fetch("/api/rate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      setRatingResult(data);
      onShowNotification(
        language === "ar" ? "اكتمل تحليل ملامح الوجه بنجاح!" : "Facial analysis completed successfully!",
        "success"
      );
    } catch (error: any) {
      console.error("Rating error:", error);
      onShowNotification(t.apiError, "error");
    } finally {
      setIsRating(false);
    }
  };

  const handleReset = () => {
    setFrontFile(null);
    setSideFile(null);
    setFrontPreview(null);
    setSidePreview(null);
    setRatingResult(null);
  };

  // Scientific details of Roland Rating Metrics
  const getMetricExplanation = (key: string) => {
    const explanations: Record<string, Record<"ar" | "en", { title: string; desc: string }>> = {
      "OVERALL HARMONY": {
        ar: { title: "التناسق الإجمالي", desc: "المتوسط الموزون لتناسق الوجه الكلي من الزاويتين الأمامية والجانبية." },
        en: { title: "Overall Harmony", desc: "Weighted average of full facial harmony from both front and side profile viewpoints." },
      },
      "FRONT HARMONY": {
        ar: { title: "التناسق الأمامي", desc: "نسبة الأثلاث الوجهية الثلاثة، تماثل خطوط المنتصف، وعرض العظام وعمل زاوية العين." },
        en: { title: "Front Harmony", desc: "Facial thirds proportions, midline alignment, canthal tilt, and golden ratio symmetry." },
      },
      "SIDE HARMONY": {
        ar: { title: "التناسق الجانبي", desc: "زاوية الفك السفلي (Gonial)، بروز الفك العلوي والذقن والخط البصري العمودي." },
        en: { title: "Side Harmony", desc: "Gonial angle, maxilla projection, chin projection, and orbital vector alignment." },
      },
      "MISC FEAT": {
        ar: { title: "الملامح المتنوعة", desc: "نقاء ونعومة البشرة، خط الشعر، حيوية الابتسامة وعيوب منطقة العين." },
        en: { title: "Misc Features", desc: "Skin quality, hair density, teeth alignment, smile dynamics, and under-eye area health." },
      },
      "SEX APPEAL": {
        ar: { title: "الجاذبية الجنسية", desc: "الملامح ثنائية الشكل الأكثر جاذبية مثل سمك الشفاه، كثافة الحواجب وطول الرموش." },
        en: { title: "Sex Appeal", desc: "Dimorphic features highly appealing including lip fullness, eyebrow density, and eyelash display." },
      },
      "DIMORPHISM": {
        ar: { title: "ثنائية الشكل الجنسي", desc: "بروز وقوة الهيكل العظمي الذكوري أو النعومة والمنحنيات الأنثوية الجذابة." },
        en: { title: "Dimorphism", desc: "Masculinity of bone structure (brow ridge, deep-set eyes) or feminine soft contours." },
      },
      "ANGULARITY": {
        ar: { title: "الحدة والبروز العظمي", desc: "تحديد الفك، نسبة الدهون في الوجه وبروز عظام الخد وتجويف الخدين." },
        en: { title: "Angularity", desc: "Jawline definition, facial lean dryness, hollow cheeks, and prominent cheekbone contours." },
      },
    };
    return explanations[key]?.[language] || { title: key, desc: "" };
  };

  // Get Tier Description
  const getTierDescription = (tier: string) => {
    const descriptions: Record<string, Record<"ar" | "en", string>> = {
      Sub5: {
        ar: "ملامح وجه غير متماثلة أو تفتقر إلى التوازن الهيكلي الأساسي.",
        en: "Facial proportions are asymmetrical or lack basic structural harmony.",
      },
      Normie: {
        ar: "ملامح طبيعية وشائعة تقع في المتوسط البشري المعتاد للتناسق.",
        en: "Standard, average facial proportions within the normal human range.",
      },
      HTN: {
        ar: "جاذبية عالية أعلى من المتوسط بفضل تماثل جيد وملامح واضحة.",
        en: "High-tier attractiveness with solid symmetry and pleasant defined features.",
      },
      Chadlite: {
        ar: "بنية عظمية قوية وتناسق ممتاز يتجاوز الغالبية العظمى.",
        en: "Strong bone structure and exceptional facial harmony exceeding most averages.",
      },
      Chad: {
        ar: "بنية وجه مثالية وقوية للغاية بمقاييس جمالية استثنائية ونادرة جداً.",
        en: "Extremely strong aesthetic structure with near-perfect scientific ratios.",
      },
      Gigachad: {
        ar: "مستوى خرافي من التحديد العظمي وتناسق مثالي شبه مستحيل.",
        en: "An elite tier of bone definition and absolute flawless visual symmetry.",
      },
      Adamlite: {
        ar: "أعلى مراتب التناسق البشري والنقاء الملامحي النادر للنمذجة المثالية.",
        en: "The absolute pinnacle of model-tier harmony and elite visual presentation.",
      },
      "True Adam": {
        ar: "الكمال المطلق لتناسق الوجه البشري كنسبة ذهبية حية مجسدة.",
        en: "The ultimate aesthetic perfection, representing the flawless human golden ratio.",
      },
    };
    return descriptions[tier]?.[language] || "";
  };

  return (
    <div className="space-y-6">
      {/* Informational Guidance Alert */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-3.5 text-indigo-900 shadow-3xs">
        <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-bold">{language === "ar" ? "خصوصية الصور وأمانك أولاً" : "Your Privacy & Image Security First"}</h3>
          <p className="text-xs text-indigo-700 leading-relaxed">
            {language === "ar"
              ? "يتم معالجة الصور مباشرة من خلال الذاكرة المؤقتة للخادم وتمريرها آمنياً لنموذج Gemini دون تخزينها بشكل دائم على أي أقراص أو قواعد بيانات."
              : "Images are processed exclusively in-memory and passed securely to Gemini. They are never written to permanent disk storage or saved in any database."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Upload & Control Area */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-800">{t.rolandTitle}</h2>
            </div>
            {(frontFile || sideFile) && (
              <button
                onClick={handleReset}
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 transition-all font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {language === "ar" ? "إعادة تعيين" : "Reset"}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            {t.rolandSubtitle}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Front Profile Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 text-center">{t.frontImageLabel}</label>
              {!frontPreview ? (
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/10 rounded-xl h-44 cursor-pointer text-center p-3 transition-all"
                >
                  <Upload className="h-5 w-5 text-gray-400 mb-2" />
                  <span className="text-[10px] font-semibold text-gray-600 leading-tight">
                    {language === "ar" ? "رفع الصورة الأمامية" : "Upload Front Profile"}
                  </span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-44 bg-slate-100 group">
                  <img src={frontPreview} alt="Front profile preview" className="w-full h-full object-cover" />
                  {/* Visual Face Grid Overlay Effect on hover */}
                  <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="border border-white/40 w-11/12 h-5/6 rounded-full border-dashed" />
                    <div className="absolute inset-x-0 top-1/2 border-t border-white/40 border-dashed" />
                  </div>
                  <button
                    onClick={() => {
                      setFrontFile(null);
                      setFrontPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/95 text-gray-500 hover:text-red-600 shadow-xs text-[10px] font-bold"
                  >
                    X
                  </button>
                </div>
              )}
              <input
                ref={frontInputRef}
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFrontFileChange(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Side Profile Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 text-center">{t.sideImageLabel}</label>
              {!sidePreview ? (
                <div
                  onClick={() => sideInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/10 rounded-xl h-44 cursor-pointer text-center p-3 transition-all"
                >
                  <Upload className="h-5 w-5 text-gray-400 mb-2" />
                  <span className="text-[10px] font-semibold text-gray-600 leading-tight">
                    {language === "ar" ? "رفع الصورة الجانبية" : "Upload Side Profile"}
                  </span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-44 bg-slate-100 group">
                  <img src={sidePreview} alt="Side profile preview" className="w-full h-full object-cover" />
                  {/* Visual Profile Angle Overlay Effect on hover */}
                  <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="border border-white/40 w-11/12 h-5/6 rounded-l-full border-dashed" />
                    <div className="absolute top-1/3 left-1/4 w-1/2 h-1/3 border-b border-l border-white/40 border-dashed" />
                  </div>
                  <button
                    onClick={() => {
                      setSideFile(null);
                      setSidePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/95 text-gray-500 hover:text-red-600 shadow-xs text-[10px] font-bold"
                  >
                    X
                  </button>
                </div>
              )}
              <input
                ref={sideInputRef}
                type="file"
                onChange={(e) => e.target.files?.[0] && handleSideFileChange(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-indigo-500" />
              {language === "ar" ? "شروط الحصول على تحليل دقيق:" : "For Accurate Scientific Evaluation:"}
            </h4>
            <ul className="list-disc list-inside text-[11px] text-gray-500 space-y-1">
              <li>{language === "ar" ? "استخدم إضاءة ممتازة ومباشرة بدون ظلال قوية." : "Use excellent direct lighting without harsh shadows."}</li>
              <li>{language === "ar" ? "حافظ على تعبيرات وجه طبيعية ومحايدة (بدون ابتسام)." : "Keep a neutral, flat facial expression (no smiling)."}</li>
              <li>{language === "ar" ? "تأكد من بقاء الكاميرا في مستوى ارتفاع العين تماماً." : "Ensure camera is strictly at eye-level height."}</li>
              <li>{language === "ar" ? "ارفع شعرك بعيداً لتكون ملامح الفك والجبين مكشوفة تماماً." : "Pull your hair back to reveal the jawline and forehead clearly."}</li>
            </ul>
          </div>

          <button
            onClick={handleStartRating}
            disabled={!frontFile || !sideFile || isRating}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            {isRating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t.ratingState}</span>
              </>
            ) : (
              <>
                <Award className="h-4 w-4" />
                <span>{t.rateBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Scan & Report Output Area */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm min-h-[500px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {isRating ? (
              /* Rating Scanner Animation Workspace */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6 flex-1"
              >
                {/* Visual holographic facial scanning grid */}
                <div className="relative h-28 w-56 bg-slate-50 border border-indigo-100 rounded-xl overflow-hidden flex items-center justify-around p-4 shadow-inner">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-70" />
                  
                  {/* Hologram Scanner Bar */}
                  <motion.div
                    animate={{ y: ["0%", "280%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-1 bg-indigo-500 shadow-[0_0_12px_#6366f1] z-10"
                  />

                  {/* Icon details */}
                  <div className="relative text-indigo-500 flex flex-col items-center">
                    <User className="h-10 w-10 opacity-40 animate-pulse" />
                    <span className="text-[8px] font-mono mt-1 font-bold text-indigo-400">FRONT_PROFILE</span>
                  </div>
                  <div className="relative text-indigo-500 flex flex-col items-center">
                    <User className="h-10 w-10 opacity-40 animate-pulse" style={{ transform: "scaleX(-1)" }} />
                    <span className="text-[8px] font-mono mt-1 font-bold text-indigo-400">SIDE_PROFILE</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                    {t.ratingState}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    {language === "ar"
                      ? "يقوم نموذج Gemini 2.5-Flash حالياً بتحديد المعالم التشريحية للوجه والتحقق من التماثل الثنائي وزوايا الفك السفلي."
                      : "Gemini 2.5-Flash is currently identifying key cranial landmarks, calculating bigonial widths, gonial angles, and symmetry."}
                  </p>
                </div>
              </motion.div>
            ) : ratingResult ? (
              /* Analysis Report Card Results */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 flex-1"
              >
                {/* Header of results */}
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">{t.resultsTitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {language === "ar" ? "نظام ريتينغ رولاند الموضوعي للجمال الوجهي" : "Objective facial metrics rating report"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">{t.rangeLabel}:</span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold font-mono rounded-lg text-xs">
                      {ratingResult["ACCEPTED RANGE"]}
                    </span>
                  </div>
                </div>

                {/* Main Aesthetic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50/50 p-4 border border-gray-100 rounded-2xl">
                  {/* Large radial score summary */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center py-2 space-y-2 border-b md:border-b-0 md:border-r border-gray-100">
                    <div
                      className="relative flex items-center justify-center h-28 w-28 rounded-full border-4 shadow-sm"
                      style={{ borderColor: ratingResult.COLOR }}
                    >
                      <div className="text-center">
                        <span className="text-3xl font-extrabold font-mono text-gray-800">
                          {ratingResult["TOTAL"]}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-semibold">/ 10</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: ratingResult.COLOR }}
                      >
                        {ratingResult.TIER}
                      </span>
                      <p className="text-[10px] text-gray-500 max-w-[180px] mx-auto leading-relaxed">
                        {getTierDescription(ratingResult.TIER)}
                      </p>
                    </div>
                  </div>

                  {/* Core parameters detail list */}
                  <div className="md:col-span-7 space-y-3.5">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t.metricsLabel}
                    </h4>
                    
                    {/* Progress bars */}
                    <div className="space-y-2.5">
                      {["OVERALL HARMONY", "FRONT HARMONY", "SIDE HARMONY", "MISC FEAT", "SEX APPEAL", "DIMORPHISM", "ANGULARITY"].map((metricKey) => {
                        const metricVal = ratingResult[metricKey as keyof RolandRating] as number;
                        const explanation = getMetricExplanation(metricKey);
                        return (
                          <div key={metricKey} className="space-y-1 group">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                {explanation.title}
                              </span>
                              <span className="font-bold font-mono text-gray-900">
                                {metricVal} <span className="text-[10px] text-gray-400">/10</span>
                              </span>
                            </div>
                            <div className="relative h-2 bg-gray-200/70 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metricVal * 10}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute left-0 top-0 h-full rounded-full"
                                style={{ backgroundColor: ratingResult.COLOR }}
                              />
                            </div>
                            <p className="text-[9px] text-gray-400 leading-normal">
                              {explanation.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Idle / Instructions visual screen */
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 flex-1">
                <HelpCircle className="h-12 w-12 text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-500">
                  {language === "ar" ? "بانتظار رفع الصور لبدء التقييم..." : "Awaiting images to start rating..."}
                </p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  {language === "ar"
                    ? "ارفع صورتك الأمامية والجانبية واضغط على زر بدء التقييم لبدء استخراج نسب الوجه."
                    : "Upload both front and side portrait images, then click start comprehensive rating."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
