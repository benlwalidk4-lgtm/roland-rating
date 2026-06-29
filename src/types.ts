export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
}

export interface FileAnalysis {
  fileName: string;
  mimeType: string;
  size: number;
  content: string;
  timestamp: string;
  prompt: string;
}

export type AppLanguage = "ar" | "en";

export interface RolandRating {
  "OVERALL HARMONY": number;
  "FRONT HARMONY": number;
  "SIDE HARMONY": number;
  "MISC FEAT": number;
  "SEX APPEAL": number;
  "DIMORPHISM": number;
  "ANGULARITY": number;
  "TOTAL": number;
  "ACCEPTED RANGE": string;
  TIER: string;
  COLOR: string;
}

export interface Translation {
  title: string;
  subtitle: string;
  chatTab: string;
  fileTab: string;
  rolandTab: string;
  rolandTitle: string;
  rolandSubtitle: string;
  frontImageLabel: string;
  sideImageLabel: string;
  rateBtn: string;
  ratingState: string;
  resultsTitle: string;
  metricsLabel: string;
  tierLabel: string;
  rangeLabel: string;
  placeholderText: string;
  sendBtn: string;
  clearChat: string;
  uploadTitle: string;
  uploadSubtitle: string;
  uploadDragActive: string;
  promptLabel: string;
  analyzeBtn: string;
  analyzingState: string;
  analysisResultTitle: string;
  fileDetails: string;
  fileNameLabel: string;
  fileTypeLabel: string;
  fileSizeLabel: string;
  systemInstructionLabel: string;
  chatPlaceholder: string;
  apiError: string;
  noFileSelected: string;
  emptyHistory: string;
  quickPromptsTitle: string;
  arabicLabel: string;
  englishLabel: string;
  supportedFormats: string;
  copySuccess: string;
  copyBtn: string;
  systemInstructionPlaceholder: string;
}
