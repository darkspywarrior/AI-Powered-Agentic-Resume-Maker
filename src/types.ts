/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OptimizationStyle {
  BALANCED = "balanced",
  AGGRESSIVE = "aggressive",
  CONSERVATIVE = "conservative",
}

export interface ResumeInput {
  text: string;
  fileName?: string;
  fileType?: string; // 'pdf' | 'docx' | 'image' | 'text'
  base64Data?: string; // for server-side processing
}

export interface SupportDocInput {
  text: string;
  name?: string;
}

export interface JobDescriptionInput {
  text: string;
  title?: string;
  company?: string;
}

export interface SkillGap {
  skill: string;
  priority: "High" | "Medium" | "Low";
  details: string;
}

export interface CompatibilityCheck {
  check: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export interface ATSReport {
  score: number;
  analysisString: string;
  keywordsMatched: string[];
  keywordsMissing: string[];
  skillGaps: SkillGap[];
  compatibilityChecks: CompatibilityCheck[];
}

export interface OptimizedSection {
  id: string;
  title: string;
  original: string;
  optimized: string;
  improvementNotes: string;
}

export interface OptimizedResume {
  fullText: string;
  sections: OptimizedSection[];
}

export interface RecommendedProject {
  title: string;
  description: string;
  keyTechnologies: string[];
  impactOnResume: string;
}

export interface InterviewQuestion {
  question: string;
  sampleAnswer: string;
  skillTested: string;
}

export interface CareerEnhancement {
  missingSkills: string[];
  recommendedProjects: RecommendedProject[];
  recommendedCertifications: string[];
  portfolioImprovements: string[];
  interviewPrepQuestions: InterviewQuestion[];
}

export interface ResumeVersion {
  id: string;
  name: string;
  timestamp: string;
  resumeText: string;
  atsScore?: number;
  jobDescription: string;
  careerInfo?: string;
  atsReport?: ATSReport | null;
  optimizedResume?: OptimizedResume | null;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactLinkedIn?: string;
  contactGitHub?: string;
}
