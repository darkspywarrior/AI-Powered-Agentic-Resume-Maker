/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { OptimizedResume, OptimizationStyle } from "../types";
import { Sparkles, Copy, Check, ArrowRight, CornerDownRight, RotateCcw, Download, Printer, FileText } from "lucide-react";

interface OptimizationSandboxProps {
  optimized: OptimizedResume | null;
  onOptimize: (style: OptimizationStyle, instructions: string) => Promise<void>;
  isOptimizing: boolean;
  originalText: string;
  selectedTemplate: "classic" | "modern" | "tech";
  onSelectTemplate: (template: "classic" | "modern" | "tech") => void;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactLinkedIn: string;
  contactGitHub: string;
}

export default function OptimizationSandbox({
  optimized,
  onOptimize,
  isOptimizing,
  originalText,
  selectedTemplate,
  onSelectTemplate,
  contactName,
  contactPhone,
  contactEmail,
  contactLinkedIn,
  contactGitHub,
}: OptimizationSandboxProps) {
  const [style, setStyle] = useState<OptimizationStyle>(OptimizationStyle.BALANCED);
  const [directives, setDirectives] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [editableSections, setEditableSections] = useState<Record<string, string>>({});

  const handleCopySection = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyFull = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleSectionTextChange = (id: string, newText: string) => {
    setEditableSections((prev) => ({
      ...prev,
      [id]: newText,
    }));
  };

  const getFullEditableText = () => {
    if (!optimized) return "";
    // Reconstruct full text based on edits, otherwise use the compiled fullText
    return optimized.sections.map(sec => {
      const currentVal = editableSections[sec.id] !== undefined ? editableSections[sec.id] : sec.optimized;
      return `=== ${sec.title.toUpperCase()} ===\n${currentVal}`;
    }).join("\n\n");
  };

  // Beautiful styled print preview layout
  const downloadStyledHTMLResume = () => {
    if (!optimized) return;
    const segments = optimized.sections.map(sec => {
      const currentVal = editableSections[sec.id] !== undefined ? editableSections[sec.id] : sec.optimized;
      return {
        title: sec.title.toUpperCase(),
        content: currentVal,
      };
    });

    let styleRules = "";
    if (selectedTemplate === "classic") {
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
    } else if (selectedTemplate === "modern") {
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

    // Build the aesthetic resume header strictly conforming to requirements
    const finalName = contactName || "Jane Doe";
    const finalPhone = contactPhone || "+1-555-019-2834";
    const finalEmail = contactEmail || "jane.doe@professional.com";
    const finalLinkedIn = contactLinkedIn || "https://www.linkedin.com/in/janedoe";
    const finalGitHub = contactGitHub || "https://github.com/janedoe";

    let headerHtml = "";
    if (selectedTemplate === "classic") {
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
    } else if (selectedTemplate === "modern") {
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
          <title>Optimized Tailored Resume — ${selectedTemplate.toUpperCase()}</title>
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
            <span><strong>Resume Print Dashboard (${selectedTemplate.toUpperCase()} Style):</strong> Press the print button and select <strong>Save as PDF</strong> inside your printer settings.</span>
            <button class="btn-action" onclick="window.print()">Print to PDF</button>
          </div>

          <div id="resume-document">
            ${headerHtml}
            ${segments.map(seg => `
              <div class="section">
                <div class="section-title">${selectedTemplate === "tech" ? `// ${seg.title}` : seg.title}</div>
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
    a.download = `Tailored_Resume_${selectedTemplate}_style.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTextResume = () => {
    const text = getFullEditableText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Optimized_Tailored_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMarkdownResume = () => {
    if (!optimized) return;
    const text = optimized.sections.map(sec => {
      const currentVal = editableSections[sec.id] !== undefined ? editableSections[sec.id] : sec.optimized;
      return `## ${sec.title.toUpperCase()}\n\n${currentVal}`;
    }).join("\n\n");

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Optimized_Tailored_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="optimization-sandbox">
      {/* Parameters & Launcher Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="font-display font-semibold text-slate-800">Agentic Optimization Tuning</h3>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-semibold">Tuning System Active</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Styles Cards */}
            <div 
              onClick={() => setStyle(OptimizationStyle.CONSERVATIVE)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                style === OptimizationStyle.CONSERVATIVE 
                  ? "border-indigo-650 bg-indigo-50/20" 
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Light Touch</span>
                {style === OptimizationStyle.CONSERVATIVE && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
              </div>
              <h4 className="font-serif italic text-lg text-slate-800">Conservative</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Retains 85%+ original phrasing. Refines terminology and formatting structure for keyword alignment.
              </p>
            </div>

            <div 
              onClick={() => setStyle(OptimizationStyle.BALANCED)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                style === OptimizationStyle.BALANCED 
                  ? "border-indigo-600 bg-indigo-50/20" 
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">ATS Standard</span>
                {style === OptimizationStyle.BALANCED && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
              </div>
              <h4 className="font-serif italic text-lg text-slate-800">Balanced Match</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Rewrites experience bullet points to integrate missing skills and highlight key metrics.
              </p>
            </div>

            <div 
              onClick={() => setStyle(OptimizationStyle.AGGRESSIVE)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                style === OptimizationStyle.AGGRESSIVE 
                  ? "border-indigo-600 bg-indigo-50/20" 
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">High Impact</span>
                {style === OptimizationStyle.AGGRESSIVE && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
              </div>
              <h4 className="font-serif italic text-lg text-slate-800">Aggressive STAR</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Full-scale structural overhaul. Converts bullets into action-driven STAR components.
              </p>
            </div>
          </div>

          {/* Custom user instructions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 font-display tracking-wide uppercase">Custom Agent Directives (Optional)</label>
              <span className="text-[10px] text-slate-450 font-mono">Steer optimization focus</span>
            </div>
            <textarea
              className="w-full h-20 p-3 border border-slate-200 rounded-lg text-sm font-sans focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-slate-50/20"
              placeholder="e.g. 'Align strongly with front-end React specifications' or 'Emphasize leadership and team-building metrics rather than raw code volume.'"
              value={directives}
              onChange={(e) => setDirectives(e.target.value)}
              disabled={isOptimizing}
              id="custom-sandbox-directives"
            />
          </div>

          {/* Build actions */}
          <button
            type="button"
            onClick={() => onOptimize(style, directives)}
            disabled={isOptimizing || !originalText}
            className="w-full font-serif italic py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            id="btn-optimize-resume-action"
          >
            {isOptimizing ? (
              <>
                <RotateCcw className="h-5 w-5 animate-spin" />
                <span>AI Agents tailoring sections meticulously...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-indigo-200" />
                <span>Begin Agentic Optimization Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Workspace: Original vs Tailored Diff */}
      {optimized && (
        <div className="space-y-6" id="optimized-output-results">
          {/* Main output header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-900 text-white rounded-xl">
            <div className="space-y-1 mb-4 sm:mb-0">
              <span className="px-2 py-0.5 bg-indigo-500 text-white font-mono text-[9px] font-bold rounded">AI TAILORED SUITE</span>
              <h4 className="text-lg font-serif italic">Optimized Resume Dashboard</h4>
              <p className="text-xs text-slate-400">Review section modifications, refine outputs and export compliant formats</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopyFull(getFullEditableText())}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center space-x-2 transition cursor-pointer select-none"
            >
              {copiedFull ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Full Resume Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Complete Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Premium Resume Downloader Tool Bar with Template Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs" id="blueprints-config-dashboard">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 font-bold">1. Select Layout Style Blueprint</span>
              <h5 className="font-serif italic text-base text-slate-800">Customize Resume Export Formatting Design</h5>
              <p className="text-xs text-slate-400">All blueprints adhere to ATS standards by following Left-to-Right linear structures that prevent parsing engine crashes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => onSelectTemplate("classic")}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all bg-white ${
                  selectedTemplate === "classic" 
                    ? "border-indigo-650 ring-1 ring-indigo-650 shadow-sm" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
                id="template-classic-choice"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Times / Georgia</span>
                  {selectedTemplate === "classic" ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-300"></span>
                  )}
                </div>
                <h6 className="font-serif italic font-semibold text-slate-800 text-sm">Classic Ivy League</h6>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Traditional serif typography with robust section borders. Excellent compliance rate.
                </p>
              </div>

              <div 
                onClick={() => onSelectTemplate("modern")}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all bg-white ${
                  selectedTemplate === "modern" 
                    ? "border-indigo-600 ring-1 ring-indigo-600 shadow-sm" 
                    : "border-slate-200 hover:border-slate-350"
                }`}
                id="template-modern-choice"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">System UI Sans</span>
                  {selectedTemplate === "modern" ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-300"></span>
                  )}
                </div>
                <h6 className="font-sans font-semibold text-slate-800 text-sm">Modern Tech Minimal</h6>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Clean startup-style sans-serif details with soft grey delimiters and high density.
                </p>
              </div>

              <div 
                onClick={() => onSelectTemplate("tech")}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all bg-white ${
                  selectedTemplate === "tech" 
                    ? "border-indigo-600 ring-1 ring-indigo-600 shadow-sm" 
                    : "border-slate-200 hover:border-slate-350"
                }`}
                id="template-tech-choice"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Technical Monospace</span>
                  {selectedTemplate === "tech" ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-300"></span>
                  )}
                </div>
                <h6 className="font-mono font-bold text-slate-800 text-xs">Developer Stack Code</h6>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Pre-configured code block frames and comments ideal for programmers and data analysts.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-650 font-bold">2. Trigger File Downloader</span>
                <p className="text-xs text-slate-500">Pick format and initiate compile:</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={downloadStyledHTMLResume}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer select-none"
                  id="btn-download-html-resume"
                >
                  <Printer className="h-4 w-4" />
                  <span>Download PDF Document ({selectedTemplate === "classic" ? "Classic" : selectedTemplate === "modern" ? "Modern" : "Tech"})</span>
                </button>
                <button
                  type="button"
                  onClick={downloadTextResume}
                  className="px-4 py-2 bg-white text-slate-755 border border-slate-250 hover:bg-slate-50 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer select-none"
                  id="btn-download-txt-resume"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Text Only (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={downloadMarkdownResume}
                  className="px-4 py-2 bg-white text-slate-755 border border-slate-250 hover:bg-slate-50 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer select-none"
                  id="btn-download-md-resume"
                >
                  <Download className="h-4 w-4 text-slate-400" />
                  <span>Markdown (.md)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Diff Accordion */}
          <div className="space-y-4">
            {optimized.sections.map((section) => {
              const currentValue = editableSections[section.id] !== undefined ? editableSections[section.id] : section.optimized;
              const hasNotes = !!section.improvementNotes;
              
              return (
                <div 
                  key={section.id} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-350 transition-all"
                  id={`section-editor-${section.id}`}
                >
                  {/* Header */}
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Section Analysis</span>
                      <h5 className="font-serif italic text-base text-slate-800">{section.title}</h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySection(section.id, currentValue)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-mono border border-slate-200 rounded bg-white inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      {copiedSection === section.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Tailored</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-150">
                    {/* Left Column: Original Text */}
                    <div className="p-5 bg-slate-50/20">
                      <div className="flex items-center space-x-1 mb-2">
                        <CornerDownRight className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Original Input</span>
                      </div>
                      <p className="text-xs text-slate-500 whitespace-pre-wrap font-sans leading-relaxed line-clamp-10 overflow-y-auto max-h-[160px]">
                        {section.original || "(Empty section)"}
                      </p>
                    </div>

                    {/* Right Column: Optimized Variable Input (Interactive Editor) */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Tailored & Improved</span>
                        <span className="text-[9px] text-slate-400">(Editable Editor)</span>
                      </div>
                      <textarea
                        className="w-full p-3 border border-slate-200 rounded-lg text-xs leading-relaxed font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white h-44"
                        value={currentValue}
                        onChange={(e) => handleSectionTextChange(section.id, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Agent Rationale notes footer */}
                  {hasNotes && (
                    <div className="px-5 py-3 bg-indigo-50/15 border-t border-slate-150 text-[11px] text-slate-600 leading-normal flex items-start space-x-2">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">Rationale</span>
                      <span>{section.improvementNotes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
