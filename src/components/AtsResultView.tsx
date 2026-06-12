/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ATSReport, SkillGap, CompatibilityCheck, OptimizedResume } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, Search, HelpCircle, ArrowRight, Printer, Download, FileText, Eye } from "lucide-react";
import ResumeHeatmap from "./ResumeHeatmap";
import ResumePreviewModal from "./ResumePreviewModal";

interface AtsResultViewProps {
  report: ATSReport;
  onNavigateToOptimization: () => void;
  resumeText?: string;
  jobDescription?: string;
  optimizedResume: OptimizedResume | null;
  selectedTemplate?: "classic" | "modern" | "tech";
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactLinkedIn?: string;
  contactGitHub?: string;
}

export default function AtsResultView({ 
  report, 
  onNavigateToOptimization,
  resumeText = "",
  jobDescription = "",
  optimizedResume,
  selectedTemplate = "classic",
  contactName = "",
  contactPhone = "",
  contactEmail = "",
  contactLinkedIn = "",
  contactGitHub = ""
}: AtsResultViewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-500 bg-amber-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const getStatusIcon = (status: "pass" | "fail" | "warn") => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case "warn":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
    }
  };

  const getStatusBadge = (status: "pass" | "fail" | "warn") => {
    switch (status) {
      case "pass":
        return <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">Compatible</span>;
      case "fail":
        return <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-md">Critical Repair</span>;
      case "warn":
        return <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-md">Warning</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-sm">High Priority</span>;
      case "medium":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-sm">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-sm">Low Priority</span>;
    }
  };

  // Generate self-contained beautiful printable document
  const downloadPrintableHTMLReport = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATS Fit-Score Diagnostic Report</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1e293b;
              max-width: 800px;
              margin: 40px auto;
              padding: 24px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 32px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .score-box {
              background: #f0fdf4;
              border: 2px solid #22c55e;
              color: #15803d;
              border-radius: 50%;
              width: 90px;
              height: 90px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .score-num { font-size: 28px; }
            .score-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0; }
            .subtitle { font-size: 12px; color: #64748b; font-family: monospace; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: bold; border-left: 4px solid #4f46e5; padding-left: 12px; margin-bottom: 16px; color: #334155; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #fafafa; margin-bottom: 12px; }
            .tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; margin: 4px; }
            .tag-missing { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
            .tag-matched { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            @media print {
              body { margin: 10px; padding: 0; }
              .no-print { display: none; }
            }
            .btn-print {
              background: #0f172a;
              color: white;
              border: none;
              padding: 10px 18px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">ATS INTEGRATION DIAGNOSTIC</h1>
              <p class="subtitle">AUTOMATED AGENT AUDIT REPORT — GENERATED ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="score-box">
              <span class="score-num">${report.score}</span>
              <span class="score-lbl">Score</span>
            </div>
          </div>

          <div class="section no-print" style="margin-bottom: 24px; text-align: right;">
            <button class="btn-print" onclick="window.print()">Print or Save as PDF</button>
          </div>

          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="card" style="font-size: 14px; leading-height: 1.6;">
              ${report.analysisString}
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Missing Keywords (${report.keywordsMissing.length})</div>
              ${report.keywordsMissing.map(k => `<span class="tag tag-missing">${k}</span>`).join("")}
            </div>
            <div class="section">
              <div class="section-title">Matched Keywords (${report.keywordsMatched.length})</div>
              ${report.keywordsMatched.map(k => `<span class="tag tag-matched">${k}</span>`).join("")}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Compatibility Checklist</div>
            ${report.compatibilityChecks.map(c => `
              <div class="card" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
                <div>
                  <strong style="font-size: 13px;">${c.check}</strong>
                  <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">${c.message}</p>
                </div>
                <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${c.status === "pass" ? "#166534" : c.status === "fail" ? "#991b1b" : "#854d0e"}">
                  ${c.status}
                </span>
              </div>
            `).join("")}
          </div>

          <div class="section">
            <div class="section-title">Skill Gaps Analyzed</div>
            <div class="grid">
              ${report.skillGaps.map(g => `
                <div class="card" style="margin-bottom: 4px;">
                  <strong style="font-size: 12px;">${g.skill} (${g.priority} Priority)</strong>
                  <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0;">${g.details}</p>
                </div>
              `).join("")}
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ATS_Audit_Report_Score_${report.score}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadOptimizedAsPDF = (overrideTemplate?: "classic" | "modern" | "tech") => {
    if (!optimizedResume) return;

    const activeTemplate = overrideTemplate || selectedTemplate;

    const segments = optimizedResume.sections.map(sec => ({
      title: sec.title.toUpperCase(),
      content: sec.optimized,
    }));

    let styleRules = "";
    if (activeTemplate === "classic") {
      styleRules = `
        body {
          font-family: "Georgia", "Times New Roman", Times, serif;
          color: #111827;
          max-width: 840px;
          margin: 40px auto;
          padding: 0 48px;
          line-height: 1.6;
          font-size: 13px;
          background-color: #ffffff;
        }
        .section-title {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1.5px solid #111827;
          padding-bottom: 4px;
          margin-bottom: 14px;
          color: #111827;
        }
        .section-content {
          white-space: pre-wrap;
          color: #1f2937;
          font-size: 12.5px;
          margin-bottom: 28px;
        }
      `;
    } else if (activeTemplate === "modern") {
      styleRules = `
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          max-width: 840px;
          margin: 40px auto;
          padding: 0 48px;
          line-height: 1.55;
          font-size: 12.5px;
          background-color: #ffffff;
        }
        .section-title {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 3px;
          margin-bottom: 12px;
        }
        .section-content {
          white-space: pre-wrap;
          color: #334155;
          font-size: 12px;
          margin-bottom: 24px;
        }
      `;
    } else {
      styleRules = `
        body {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          color: #0f172a;
          max-width: 840px;
          margin: 40px auto;
          padding: 0 48px;
          line-height: 1.45;
          font-size: 11.5px;
          background-color: #ffffff;
        }
        .section-title {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 2px dashed #94a3b8;
          padding-bottom: 6px;
          margin-bottom: 14px;
          color: #0f172a;
        }
        .section-content {
          white-space: pre-wrap;
          color: #1e293b;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-size: 11px;
          margin-bottom: 24px;
          padding-left: 12px;
          border-left: 2.5px solid #dedede;
        }
      `;
    }

    const finalName = contactName || "Jane Doe";
    const finalPhone = contactPhone || "+1-555-019-2834";
    const finalEmail = contactEmail || "jane.doe@professional.com";
    const finalLinkedIn = contactLinkedIn || "https://www.linkedin.com/in/janedoe";
    const finalGitHub = contactGitHub || "https://github.com/janedoe";

    let headerHtml = "";
    if (activeTemplate === "classic") {
      headerHtml = `
        <div class="resume-header" style="text-align: center; border-bottom: 2.5px double #111827; padding-bottom: 16px; margin-bottom: 32px;">
          <h1 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 28px; font-weight: normal; margin: 0 0 8px 0; color: #111827; text-transform: uppercase; letter-spacing: 0.08em;">${finalName}</h1>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #4b5563; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 14px; line-height: 1.4; font-weight: 500;">
            <span>📞 ${finalPhone}</span>
            <span>•</span>
            <span>✉️ <a href="mailto:${finalEmail}" style="color: #111827; text-decoration: none;">${finalEmail}</a></span>
            <span>•</span>
            <span>🔗 <a href="${finalLinkedIn}" target="_blank" style="color: #111827; text-decoration: none;">LinkedIn</a></span>
            <span>•</span>
            <span>🐙 <a href="${finalGitHub}" target="_blank" style="color: #111827; text-decoration: none;">GitHub</a></span>
          </div>
        </div>
      `;
    } else if (activeTemplate === "modern") {
      headerHtml = `
        <div class="resume-header" style="border-left: 5px solid #4f46e5; padding-left: 20px; margin-bottom: 32px;">
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 30px; font-weight: 800; margin: 0 0 6px 0; color: #0f172a; letter-spacing: -0.02em;">${finalName}</h1>
          <div style="font-family: -apple-system, sans-serif; font-size: 11px; color: #475569; display: flex; flex-wrap: wrap; gap: 4px 16px; font-weight: 500;">
            <span style="display: inline-flex; align-items: center; gap: 4px;">📱 ${finalPhone}</span>
            <span style="display: inline-flex; align-items: center; gap: 4px;">✉️ <a href="mailto:${finalEmail}" style="color: #4f46e5; text-decoration: none;">${finalEmail}</a></span>
            <span style="display: inline-flex; align-items: center; gap: 4px;">🔗 <a href="${finalLinkedIn}" target="_blank" style="color: #4f46e5; text-decoration: none;">LinkedIn</a></span>
            <span style="display: inline-flex; align-items: center; gap: 4px;">💻 <a href="${finalGitHub}" target="_blank" style="color: #4f46e5; text-decoration: none;">GitHub</a></span>
          </div>
        </div>
      `;
    } else {
      headerHtml = `
        <div class="resume-header" style="border: 1px dashed #94a3b8; padding: 18px; margin-bottom: 32px; background-color: #f8fafc;">
          <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 6px;">// ATS MANDATORY CANDIDATE SPECIFICATION</div>
          <h1 style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 22px; font-weight: bold; margin: 0 0 8px 0; color: #0f172a;">&gt; ${finalName.toUpperCase()}</h1>
          <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10.5px; color: #334155; line-height: 1.65;">
            <div><span style="color: #64748b;">phone:</span> "${finalPhone}"</div>
            <div><span style="color: #64748b;">email:</span> "<a href="mailto:${finalEmail}" style="color: #0f172a; text-decoration: underline;">${finalEmail}</a>"</div>
            <div><span style="color: #64748b;">linkedin:</span> "<a href="${finalLinkedIn}" target="_blank" style="color: #0f172a; text-decoration: underline;">${finalLinkedIn}</a>"</div>
            <div><span style="color: #64748b;">github:</span> "<a href="${finalGitHub}" target="_blank" style="color: #0f172a; text-decoration: underline;">${finalGitHub}</a>"</div>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Optimized Tailored Resume — ${activeTemplate.toUpperCase()}</title>
          <style>
            ${styleRules}
            .header-bar {
              background: #f8fafc;
              padding: 16px 24px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              margin-bottom: 36px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .header-bar span {
              font-size: 12px;
              color: #475569;
            }
            .btn-action {
              background: #4f46e5;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.15s ease;
            }
            .btn-action:hover {
              background: #4338ca;
            }
            .section {
              margin-bottom: 24px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
                background-color: #ffffff;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-bar no-print">
            <span><strong>Resume Print Dashboard (${activeTemplate.toUpperCase()} Style):</strong> Press the print button and select <strong>Save as PDF</strong> inside your printer settings.</span>
            <button class="btn-action" onclick="window.print()">Print to PDF</button>
          </div>

          <div id="resume-document">
            ${headerHtml}
            ${segments.map(seg => `
              <div class="section">
                <div class="section-title">${activeTemplate === "tech" ? `// ${seg.title}` : seg.title}</div>
                <div class="section-content">${seg.content}</div>
              </div>
            `).join("")}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tailored_Resume_Optimized_${activeTemplate}_style.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTextSummary = () => {
    let text = `====================================================\n`;
    text += `ATS COMPATIBILITY AUDIT REPORT\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Target Score Compatibility: ${report.score}/100\n`;
    text += `====================================================\n\n`;
    
    text += `EXECUTIVE SUMMARY:\n`;
    text += `${report.analysisString}\n\n`;
    
    text += `MISSING KEYWORDS (${report.keywordsMissing.length}):\n`;
    text += `${report.keywordsMissing.join(", ") || "None!"}\n\n`;
    
    text += `MATCHED KEYWORDS (${report.keywordsMatched.length}):\n`;
    text += `${report.keywordsMatched.join(", ") || "None!"}\n\n`;
    
    text += `COMPATIBILITY AUDIT CHECKS:\n`;
    report.compatibilityChecks.forEach(c => {
      text += `- [${c.status.toUpperCase()}] ${c.check}: ${c.message}\n`;
    });
    text += `\n`;
    
    text += `DETECTED SKILL GAPS:\n`;
    report.skillGaps.forEach(g => {
      text += `- ${g.skill} (${g.priority} priority): ${g.details}\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ATS_Audit_Report_Score_${report.score}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="ats-result-view">
      {/* Editorial Actions Header - Print/Download bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-100 hover:bg-slate-150/80 transition p-4 rounded-xl border border-slate-200">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-slate-500">EXPORTS WORKSPACE</span>
          <h4 className="text-xs font-serif font-semibold text-slate-800">Save Diagnostic Records</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {optimizedResume ? (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs select-none transition cursor-pointer"
              id="btn-export-optimized-pdf-top"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview & Export (PDF)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateToOptimization}
              className="px-3.5 py-1.5 bg-slate-200 text-slate-500 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 select-none transition cursor-pointer"
              title="Generate Optimized sections first to enable snapshot prints!"
              id="btn-export-optimized-pdf-top-disabled"
            >
              <Download className="h-3.5 w-3.5 opacity-60" />
              <span>Export Optimized Resume (PDF)</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">Draft first</span>
            </button>
          )}
          <button
            type="button"
            onClick={downloadPrintableHTMLReport}
            className="px-3 py-1.5 bg-white text-slate-800 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs select-none transition cursor-pointer"
            id="btn-download-pdf-report"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-600" />
            <span>Download Printable PDF Report</span>
          </button>
          <button
            type="button"
            onClick={downloadTextSummary}
            className="px-3 py-1.5 bg-white text-slate-700 border border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs select-none transition cursor-pointer"
            id="btn-download-txt-report"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Raw Audit Text</span>
          </button>
        </div>
      </div>
 
       {/* Dynamic Summary Card */}
       <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
         <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
           {/* Circular Score Gauge */}
           <div className="shrink-0 flex flex-col items-center justify-center">
             <div className={`relative h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${getScoreColor(report.score)}`}>
               <span className="text-3xl font-display font-extrabold">{report.score}</span>
               <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-85 mt-[-2px]">Score</span>
             </div>
             <div className="mt-3 text-center">
               <span className="text-xs font-mono font-semibold text-gray-500">ATS Rating</span>
             </div>
           </div>
 
           {/* Descriptive match analysis */}
           <div className="space-y-4 flex-1 text-center md:text-left">
             <div>
               <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-mono font-semibold">RECRIUTMENT AGENT REVIEW</span>
               <h2 className="text-xl font-display font-bold text-gray-900 mt-2">ATS Integration Diagnostic</h2>
             </div>
             <p className="text-sm text-gray-600 leading-relaxed">{report.analysisString}</p>
             <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
               <button
                 type="button"
                 onClick={onNavigateToOptimization}
                 className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-200 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
               >
                 <span>Jump to Agentic Optimization</span>
                 <ArrowRight className="h-3 w-3" />
               </button>

               {optimizedResume ? (
                 <button
                   type="button"
                   onClick={() => setIsPreviewOpen(true)}
                   className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer"
                   id="btn-export-pdf-prominent"
                 >
                   <Eye className="h-4 w-4" />
                   <span>Preview & Export Optimized Resume (PDF)</span>
                 </button>
               ) : (
                 <div className="text-slate-400 text-xs italic">
                   (Run <button onClick={onNavigateToOptimization} className="text-indigo-600 underline font-semibold hover:text-indigo-800">Optimizer</button> to unlock high-fidelity PDF exports)
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* Keywords Analysis (Matched vs Missing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing keywords block - Warning focus */}
        <div className="bg-white rounded-xl border border-rose-100 shadow-xs overflow-hidden" id="missing-keywords-card">
          <div className="border-b border-rose-50 bg-rose-50/40 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
              <span className="text-xs font-display font-bold text-gray-800 uppercase tracking-wider">Keywords Missing</span>
            </div>
            <span className="text-xs font-mono text-rose-600 font-semibold">{report.keywordsMissing.length} absent</span>
          </div>
          <div className="p-5">
            {report.keywordsMissing.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-4">Outstanding! Your resume hits all critical keyword tags perfectly.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Inject these exact words into your bullet points to bypass ATS automated filtering algorithms:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {report.keywordsMissing.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200/50 rounded-lg text-xs font-medium inline-flex items-center"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Matched keywords block */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-xs overflow-hidden" id="matched-keywords-card">
          <div className="border-b border-emerald-50 bg-emerald-50/40 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              <span className="text-xs font-display font-bold text-gray-800 uppercase tracking-wider">Matched Keywords</span>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold">{report.keywordsMatched.length} detected</span>
          </div>
          <div className="p-5">
            {report.keywordsMatched.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-4">No matching keywords found. Ensure the resume matches the core JD scope.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Strong correlation detected on these keywords, strengthening your profile relevancy:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {report.keywordsMatched.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-lg text-xs font-medium inline-flex items-center"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Resume Keyword Heatmap */}
      <ResumeHeatmap
        resumeText={resumeText}
        jobDescription={jobDescription}
        keywordsMatched={report.keywordsMatched}
        keywordsMissing={report.keywordsMissing}
      />

      {/* Compatibility Audits */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden" id="compatibility-audit-card">
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
          <h4 className="text-xs font-display font-bold text-gray-800 tracking-wider uppercase">ATS Compatibility & Format Audit</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {report.compatibilityChecks.map((item, idx) => (
            <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-gray-50/50 transition">
              {getStatusIcon(item.status)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-850">{item.check}</span>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Gaps Detail */}
      {report.skillGaps && report.skillGaps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden" id="skill-gap-highlights">
          <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
            <h4 className="text-xs font-display font-bold text-gray-800 tracking-wider uppercase">Detected Skill & Qualification Gaps</h4>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.skillGaps.map((gap, idx) => (
              <div key={idx} className="p-4 border border-gray-150 rounded-xl space-y-2 hover:border-gray-300 transition-colors bg-amber-50/10">
                <div className="flex items-start justify-between">
                  <h5 className="text-sm font-semibold text-gray-800 font-display">{gap.skill}</h5>
                  {getPriorityBadge(gap.priority)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{gap.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {optimizedResume && (
        <ResumePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          sections={optimizedResume.sections.map(sec => ({
            title: sec.title.toUpperCase(),
            content: sec.optimized,
          }))}
          initialTemplate={selectedTemplate}
          contactName={contactName}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          contactLinkedIn={contactLinkedIn}
          contactGitHub={contactGitHub}
          onDownload={(tpl) => downloadOptimizedAsPDF(tpl)}
        />
      )}
    </div>
  );
}
