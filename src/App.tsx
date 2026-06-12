/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import ResumeUploader from "./components/ResumeUploader";
import AtsResultView from "./components/AtsResultView";
import OptimizationSandbox from "./components/OptimizationSandbox";
import CareerEnhancementView from "./components/CareerEnhancementView";
import VersionHistory from "./components/VersionHistory";
import TemplatesFinder from "./components/TemplatesFinder";
import { ATSReport, OptimizedResume, CareerEnhancement, OptimizationStyle, ResumeVersion } from "./types";
import { 
  FileText, 
  Sparkles, 
  Settings2, 
  GraduationCap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  MapPin, 
  Compass, 
  BadgeHelp,
  ArrowRight,
  Terminal,
  Clock,
  BookOpen
} from "lucide-react";

export default function App() {
  // Input states
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [supportingDocs, setSupportingDocs] = useState<string>("");
  const [careerInfo, setCareerInfo] = useState<string>("");

  // Required ATS Contact Headers Credentials State
  const [contactName, setContactName] = useState<string>(() => localStorage.getItem("resume_contact_name") || "Jane Doe");
  const [contactPhone, setContactPhone] = useState<string>(() => localStorage.getItem("resume_contact_phone") || "+1-555-019-2834");
  const [contactEmail, setContactEmail] = useState<string>(() => localStorage.getItem("resume_contact_email") || "jane.doe@professional.com");
  const [contactLinkedIn, setContactLinkedIn] = useState<string>(() => localStorage.getItem("resume_contact_linkedin") || "https://www.linkedin.com/in/janedoe");
  const [contactGitHub, setContactGitHub] = useState<string>(() => localStorage.getItem("resume_contact_github") || "https://github.com/janedoe");

  // Sync contact details to localStorage
  useEffect(() => {
    localStorage.setItem("resume_contact_name", contactName);
  }, [contactName]);
  useEffect(() => {
    localStorage.setItem("resume_contact_phone", contactPhone);
  }, [contactPhone]);
  useEffect(() => {
    localStorage.setItem("resume_contact_email", contactEmail);
  }, [contactEmail]);
  useEffect(() => {
    localStorage.setItem("resume_contact_linkedin", contactLinkedIn);
  }, [contactLinkedIn]);
  useEffect(() => {
    localStorage.setItem("resume_contact_github", contactGitHub);
  }, [contactGitHub]);

  // UI state
  const [activeTab, setActiveTab] = useState<"inputs" | "ats" | "optimize" | "career" | "templates">("inputs");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isMentoring, setIsMentoring] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "modern" | "tech">("classic");

  // Computed data state
  const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [careerEnhancement, setCareerEnhancement] = useState<CareerEnhancement | null>(null);
  const [runDurationMs, setRunDurationMs] = useState<number | null>(null);

  // Versions History State
  const [versions, setVersions] = useState<ResumeVersion[]>([]);

  // Load versions from localStorage on client-side mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("resume_optimizer_snapshots");
      if (stored) {
        setVersions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load versions state:", e);
    }
  }, []);

  // Extraction function to find contact details via regex patterns
  const extractContactDetails = (text: string) => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})/i;
    const emailMatch = text.match(emailRegex);
    
    const phoneRegex = /((?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
    const phoneMatch = text.match(phoneRegex);
    
    const linkedinRegex = /((?:linkedin\.com\/in\/[a-zA-Z0-9._%+-]+))/i;
    const linkedinMatch = text.match(linkedinRegex);
    
    const githubRegex = /((?:github\.com\/[a-zA-Z0-9._%+-]+))/i;
    const githubMatch = text.match(githubRegex);
    
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    let parsedName = "";
    for (const line of lines) {
      if (line.length > 2 && line.length < 45 && !line.includes("@") && !line.includes("/") && !line.includes(":") && !line.match(/^[0-9+()-\s]+$/)) {
        parsedName = line;
        break;
      }
    }

    return {
      name: parsedName || undefined,
      email: emailMatch ? emailMatch[1].trim() : undefined,
      phone: phoneMatch ? phoneMatch[0].trim() : undefined,
      linkedin: linkedinMatch ? `https://${linkedinMatch[1].trim()}` : undefined,
      github: githubMatch ? `https://${githubMatch[1].trim()}` : undefined
    };
  };

  const handleSaveVersion = (name: string) => {
    const uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const newVersion: ResumeVersion = {
      id: uuid,
      name,
      timestamp: new Date().toISOString(),
      resumeText,
      jobDescription,
      careerInfo,
      atsReport,
      optimizedResume,
      atsScore: atsReport?.score || 0,
      contactName,
      contactPhone,
      contactEmail,
      contactLinkedIn,
      contactGitHub,
    };

    const updated = [newVersion, ...versions];
    setVersions(updated);
    localStorage.setItem("resume_optimizer_snapshots", JSON.stringify(updated));
  };

  const handleRestoreVersion = (ver: ResumeVersion) => {
    setResumeText(ver.resumeText || "");
    setJobDescription(ver.jobDescription || "");
    if (ver.careerInfo !== undefined) {
      setCareerInfo(ver.careerInfo);
    }
    setAtsReport(ver.atsReport || null);
    setOptimizedResume(ver.optimizedResume || null);

    // Restore snapshots contact headers matching the saved version state
    if (ver.contactName) setContactName(ver.contactName);
    if (ver.contactPhone) setContactPhone(ver.contactPhone);
    if (ver.contactEmail) setContactEmail(ver.contactEmail);
    if (ver.contactLinkedIn) setContactLinkedIn(ver.contactLinkedIn);
    if (ver.contactGitHub) setContactGitHub(ver.contactGitHub);

    // Contextually navigate based on content presence inside restored snapshot
    if (ver.optimizedResume) {
      setActiveTab("optimize");
    } else if (ver.atsReport) {
      setActiveTab("ats");
    } else {
      setActiveTab("inputs");
    }
    setApiError(null);
  };

  const handleDeleteVersion = (id: string) => {
    const updated = versions.filter((v) => v.id !== id);
    setVersions(updated);
    localStorage.setItem("resume_optimizer_snapshots", JSON.stringify(updated));
  };

  // Auto-progress helper
  const handleResumeParsed = (text: string, fileName?: string) => {
    setResumeText(text);
    if (fileName) {
      setResumeFileName(fileName);
    }
    setApiError(null);

    // Auto-parse layout contact headers
    const extracted = extractContactDetails(text);
    if (extracted.name) setContactName(extracted.name);
    if (extracted.email) setContactEmail(extracted.email);
    if (extracted.phone) setContactPhone(extracted.phone);
    if (extracted.linkedin) setContactLinkedIn(extracted.linkedin);
    if (extracted.github) setContactGitHub(extracted.github);
  };

  // 1. Run ATS intelligence scan
  const handleAtsScan = async () => {
    if (!resumeText.trim()) {
      setApiError("Please upload or paste your resume text first under the setup phase.");
      return;
    }
    if (!jobDescription.trim()) {
      setApiError("A target Job Description is strictly required to perform keyword integration and gap detection analysis.");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    const startTime = Date.now();

    try {
      const docsArray = supportingDocs.trim() ? [supportingDocs.trim()] : [];
      const response = await fetch("/api/generate-ats-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          supportingDocs: docsArray,
          careerInfo,
        }),
      });

      if (!response.ok) {
        throw new Error("Local backend query failed. Please verify the Gemini API key configuration under Secrets.");
      }

      const report: ATSReport = await response.json();
      if ((report as any).error) {
        throw new Error((report as any).error);
      }

      setAtsReport(report);
      setRunDurationMs(Date.now() - startTime);
      setActiveTab("ats");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred during ATS report creation.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Perform section optimizing
  const handleOptimize = async (style: OptimizationStyle, instructions: string) => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setApiError("Configure both your resume and target job description before launching optimization.");
      return;
    }

    setIsOptimizing(true);
    setApiError(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          style,
          additionalInstructions: instructions,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to optimize resume sections. Check server setup.");
      }

      const result: OptimizedResume = await response.json();
      if ((result as any).error) {
        throw new Error((result as any).error);
      }

      setOptimizedResume(result);
      setRunDurationMs(Date.now() - startTime);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred during agentic optimization.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // 3. Generate carrier recommendation suite
  const handleGenerateCareerAdvisory = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setApiError("Configure both your resume and job description to extract skill gap certifications.");
      return;
    }

    setIsMentoring(true);
    setApiError(null);
    const startTime = Date.now();

    try {
      const missing = atsReport ? atsReport.keywordsMissing : [];
      const response = await fetch("/api/generate-career-enhancements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          missingSkills: missing,
        }),
      });

      if (!response.ok) {
        throw new Error("Career advice compilation failed.");
      }

      const result: CareerEnhancement = await response.json();
      if ((result as any).error) {
        throw new Error((result as any).error);
      }

      setCareerEnhancement(result);
      setRunDurationMs(Date.now() - startTime);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred while compiling career gaps.");
    } finally {
      setIsMentoring(false);
    }
  };

  // Navigation tab styling helper
  const tabButtonClass = (target: typeof activeTab) => {
    const isSelected = activeTab === target;
    return `flex items-center space-x-2 pb-3 pt-2 text-xs font-mono uppercase tracking-wider border-b-2 font-bold cursor-pointer transition-all ${
      isSelected 
        ? "border-indigo-650 text-indigo-750 font-extrabold" 
        : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50/50" id="editorial-main-frame">
      {/* 
        LEFT COLUMN: HOOK & METRICS & INTRO 
        Matches the custom 'Editorial Aesthetic' requested in specification
      */}
      <div className="lg:w-5/12 xl:w-4/12 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col justify-between lg:sticky lg:top-0 lg:h-screen p-8 md:p-12 overflow-y-auto">
        <div className="space-y-12">
          {/* Tag brief */}
          <div>
            <p className="uppercase tracking-[0.2em] text-[10px] font-bold text-indigo-600 mb-6">Agentic ATS Spec-Brief</p>
            <h1 className="text-4xl xl:text-5xl font-light leading-[1.1] tracking-tight text-slate-900 font-display">
              AI-Powered <br/>
              <span className="italic font-serif font-medium text-indigo-650">Agentic</span> <br/>
              Resume <br/>
              Optimizer.
            </h1>
            <p className="text-sm xl:text-base text-slate-500 leading-relaxed mt-6 max-w-sm">
              Transform any draft or resume into a custom tailored, ATS-compliant application using server-side Gemini Multi-Agent reasoning flows. Optimize keyword density, rewrite metrics using STAR formulas, and clear structural layout gaps.
            </p>
          </div>

          {/* Quick Technical Architecture overview */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Technical Architecture</h5>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-150 p-3 rounded-lg bg-slate-50/50 space-y-1">
                <p className="text-[9px] uppercase font-bold text-slate-450">Platform</p>
                <p className="font-semibold text-slate-850">TypeScript SPA</p>
              </div>
              <div className="border border-slate-150 p-3 rounded-lg bg-slate-50/50 space-y-1">
                <p className="text-[9px] uppercase font-bold text-slate-450">AI Models</p>
                <p className="font-semibold text-slate-850">Gemini 3.5 Flash</p>
              </div>
              <div className="border border-slate-150 p-3 rounded-lg bg-slate-50/50 space-y-1 col-span-2">
                <p className="text-[9px] uppercase font-bold text-slate-450">Methodology</p>
                <p className="font-semibold text-slate-850">Layout OCR + Multi-Agent Optimization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Performance KPI widgets */}
        <div className="pt-8 mt-10 lg:mt-0 border-t border-slate-150 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-405 mb-1.5">Live ATS Score</p>
              <p className="text-3xl font-light text-slate-850">
                {atsReport ? (
                  <>
                    <span className="font-bold text-indigo-750">{atsReport.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </>
                ) : (
                  <span className="text-slate-300 text-2xl font-mono">N/A</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-405 mb-1.5">Parsing Speed</p>
              <p className="text-3xl font-light text-indigo-600 flex items-center">
                {runDurationMs ? (
                  <span className="font-semibold">{(runDurationMs / 1000).toFixed(2)}s</span>
                ) : (
                  <span className="text-slate-350 text-2xl">~2.4s</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-4 items-center overflow-hidden text-[10px] text-indigo-600 font-bold uppercase whitespace-nowrap tracking-widest leading-none">
            <span>ATS Goals:</span>
            <marquee scrollamount="2" className="text-slate-400 font-normal normal-case tracking-normal">
              Continuous Improvement • 100% Compliant Format Structure • Zero Credential Fabrication • Clean Typography Layout
            </marquee>
          </div>
        </div>
      </div>

      {/* 
        RIGHT COLUMN: CORE WORKSPACE APPLICATION
      */}
      <div className="flex-1 max-w-5xl p-6 md:p-12 space-y-8 flex flex-col justify-start">
        {/* Global Action Header Messages */}
        {apiError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start space-x-3 text-sm animate-fade-in" id="global-error-card">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold">System Warning</h5>
              <p className="text-xs leading-relaxed">{apiError}</p>
            </div>
          </div>
        )}

        {/* Workspace Navigation Tabs - Editorial Style */}
        <div className="border-b border-slate-200" id="main-nav-tabs">
          <div className="flex space-x-6 overflow-x-auto min-h-[44px]">
            <button 
              onClick={() => setActiveTab("inputs")}
              className={tabButtonClass("inputs")}
              id="tab-inputs"
            >
              <FileText className="h-4 w-4" />
              <span>1. Setup Resume & JD</span>
            </button>
            <button 
              onClick={() => {
                if (!atsReport) {
                  setApiError("Run the ATS scan on Step 1 to populate this report.");
                  return;
                }
                setActiveTab("ats");
              }}
              className={tabButtonClass("ats")}
              id="tab-ats"
            >
              <Settings2 className="h-4 w-4" />
              <span>2. Diagnostics Scan</span>
              {atsReport && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-indigo-100 text-indigo-800 font-bold rounded-full">
                  {atsReport.score}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                if (!resumeText) {
                  setApiError("Paste or upload resume inputs to enable sandbox workspace.");
                  return;
                }
                setActiveTab("optimize");
              }}
              className={tabButtonClass("optimize")}
              id="tab-optimize"
            >
              <Sparkles className="h-4 w-4" />
              <span>3. Agentic Optimizer</span>
            </button>
            <button 
              onClick={() => {
                if (!resumeText) {
                  setApiError("Resume document required to access career advisor module.");
                  return;
                }
                setActiveTab("career");
              }}
              className={tabButtonClass("career")}
              id="tab-career"
            >
              <GraduationCap className="h-4 w-4" />
              <span>4. Career Accelerator</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab("templates");
              }}
              className={tabButtonClass("templates")}
              id="tab-templates"
            >
              <BookOpen className="h-4 w-4" />
              <span>5. Templates & ATS Guide</span>
            </button>
          </div>
        </div>

        {/* ACTIVE MODULE CONTAINER */}
        <div className="space-y-6">
          {activeTab === "inputs" && (
            <div className="space-y-8 animate-fade-in">
              {/* Mandatory ATS Contact Credentials Card - Always Included in PDF Exports */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4" id="ats-contact-credentials-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Required Header Credentials</p>
                    <h4 className="font-serif italic text-lg text-slate-900">Mandatory Candidate ATS Headers</h4>
                  </div>
                  <span className="self-start md:self-auto px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded-md uppercase border border-emerald-100">
                    Always Appended on Export
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  These 5 key fields are parsed automatically from pasted resumes or files. You can customize them directly below to guarantee high-integrity printing at the top of PDF layouts.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1-555-019-2834"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Professional Email</label>
                    <input
                      type="email"
                      placeholder="jane.doe@professional.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/janedoe"
                      value={contactLinkedIn}
                      onChange={(e) => setContactLinkedIn(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">GitHub URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/janedoe"
                      value={contactGitHub}
                      onChange={(e) => setContactGitHub(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" id="inputs-workspace">
                {/* Left Input: Resume Uploader tool */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif italic text-lg text-slate-800 mb-1">Resume Source Input</h4>
                    <p className="text-xs text-slate-400">Provide your existing candidate information using uploads, vision scans, or manual formatting pastes.</p>
                  </div>
                  
                  <ResumeUploader 
                    onResumeParsed={handleResumeParsed}
                    onLoadingStateChange={setIsLoading}
                  />

                  {resumeText && (
                    <div className="p-4 bg-indigo-50/10 border border-indigo-100 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-indigo-950 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Raw Text Cached ({resumeText.length} characters)</span>
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-3 leading-normal font-mono">
                        {resumeText}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Input: Target Specifications (Job Desc) */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif italic text-lg text-slate-800 mb-1">Target Job Description Specifications</h4>
                    <p className="text-xs text-slate-400">Pasting target job requirements is strictly requested for keywords scans and compatibility matches.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 font-display uppercase tracking-wider">Paste Job Description Text</label>
                      <textarea
                        className="w-full h-80 p-3.5 border border-slate-200 rounded-lg text-xs font-sans focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 outline-hidden bg-slate-50/10"
                        placeholder="Paste complete copy of key bullet points, technologies, duties, experience levels, and role metrics from the hiring post here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        id="job-desc-input-area"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Supporting Qualifications & Notes (Optional)</span>
                        <input
                          type="text"
                          placeholder="e.g. 'I want to highlight my AWS solutions architect training which is not on my resume.'"
                          value={careerInfo}
                          onChange={(e) => setCareerInfo(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-sans outline-hidden bg-slate-50/10"
                          id="optional-career-info"
                        />
                      </div>
                    </div>

                    {/* Run Launcher Action button */}
                    <button
                      type="button"
                      onClick={handleAtsScan}
                      disabled={isLoading || !resumeText.trim() || !jobDescription.trim()}
                      className="w-full py-3 bg-slate-900 text-white font-serif italic text-base rounded-lg hover:bg-slate-800 transition flex items-center justify-center space-x-2 disabled:opacity-40 select-none"
                      id="btn-trigger-ats-scan"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                          <span>Evaluating ATS and keyword maps...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 text-emerald-450" />
                          <span>Run Full ATS Intelligence Audit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Version History & Snapshotting Module */}
              <div className="pt-4">
                <VersionHistory 
                  versions={versions}
                  onSaveVersion={handleSaveVersion}
                  onRestoreVersion={handleRestoreVersion}
                  onDeleteVersion={handleDeleteVersion}
                  selectedTemplate={selectedTemplate}
                  contactName={contactName}
                  contactPhone={contactPhone}
                  contactEmail={contactEmail}
                  contactLinkedIn={contactLinkedIn}
                  contactGitHub={contactGitHub}
                />
              </div>
            </div>
          )}

          {activeTab === "ats" && atsReport && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h4 className="font-serif italic text-xl text-slate-800">ATS Assessment Diagnostic Summary</h4>
                  <p className="text-xs text-slate-400">Critical compatibility scorecards, missing keywords, and layout flags parsed below.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("optimize")}
                  className="mt-3 sm:mt-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-2"
                >
                  <span>Build Optimized Sections</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <AtsResultView 
                report={atsReport} 
                onNavigateToOptimization={() => setActiveTab("optimize")}
                resumeText={resumeText}
                jobDescription={jobDescription}
                optimizedResume={optimizedResume}
                selectedTemplate={selectedTemplate}
                contactName={contactName}
                contactPhone={contactPhone}
                contactEmail={contactEmail}
                contactLinkedIn={contactLinkedIn}
                contactGitHub={contactGitHub}
              />
            </div>
          )}

          {activeTab === "optimize" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-serif italic text-xl text-slate-800">Agentic Resume Optimizing Builder</h4>
                <p className="text-xs text-slate-400">Configure parameters to customize, rewrite, or expand specific segments of your credentials.</p>
              </div>

              <OptimizationSandbox 
                optimized={optimizedResume}
                onOptimize={handleOptimize}
                isOptimizing={isOptimizing}
                originalText={resumeText}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                contactName={contactName}
                contactPhone={contactPhone}
                contactEmail={contactEmail}
                contactLinkedIn={contactLinkedIn}
                contactGitHub={contactGitHub}
              />
            </div>
          )}

          {activeTab === "career" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-serif italic text-xl text-slate-800">Career Acceleration & Mentorship Center</h4>
                <p className="text-xs text-slate-400 font-mono">Simulate a high-impact mock prep and structured experience gaps advisory blueprint.</p>
              </div>

              <CareerEnhancementView 
                enhancement={careerEnhancement}
                onGenerate={handleGenerateCareerAdvisory}
                isLoading={isMentoring}
                hasResume={!!resumeText}
              />
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6 animate-fade-in">
              <TemplatesFinder 
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
