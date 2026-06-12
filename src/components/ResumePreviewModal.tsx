/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Printer, Download, Eye, ZoomIn, ZoomOut, FileText, CheckCircle } from "lucide-react";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: { title: string; content: string }[];
  initialTemplate?: "classic" | "modern" | "tech";
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactLinkedIn?: string;
  contactGitHub?: string;
  onDownload: (template: "classic" | "modern" | "tech") => void;
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  sections,
  initialTemplate = "classic",
  contactName = "Jane Doe",
  contactPhone = "+1-555-019-2834",
  contactEmail = "jane.doe@professional.com",
  contactLinkedIn = "https://www.linkedin.com/in/janedoe",
  contactGitHub = "https://github.com/janedoe",
  onDownload,
}: ResumePreviewModalProps) {
  const [template, setTemplate] = useState<"classic" | "modern" | "tech">(initialTemplate);
  const [zoomScale, setZoomScale] = useState<number>(0.75); // Scaled-down default for perfect fitting
  const [srcDoc, setSrcDoc] = useState<string>("");

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate, isOpen]);

  useEffect(() => {
    // Generate identical styles to the actual download
    let styleRules = "";
    if (template === "classic") {
      styleRules = `
        body {
          font-family: "Georgia", "Times New Roman", Times, serif;
          color: #111827;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 32px;
          line-height: 1.5;
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
          margin-bottom: 12px;
          color: #111827;
          margin-top: 20px;
        }
        .section-content {
          white-space: pre-wrap;
          color: #1f2937;
          font-size: 12.5px;
          margin-bottom: 20px;
        }
      `;
    } else if (template === "modern") {
      styleRules = `
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 32px;
          line-height: 1.5;
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
          margin-bottom: 10px;
          margin-top: 20px;
        }
        .section-content {
          white-space: pre-wrap;
          color: #334155;
          font-size: 12px;
          margin-bottom: 20px;
        }
      `;
    } else {
      styleRules = `
        body {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          color: #0f172a;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 32px;
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
          margin-bottom: 12px;
          color: #0f172a;
          margin-top: 20px;
        }
        .section-content {
          white-space: pre-wrap;
          color: #1e293b;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-size: 11px;
          margin-bottom: 20px;
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
    if (template === "classic") {
      headerHtml = `
        <div class="resume-header" style="text-align: center; border-bottom: 2.5px double #111827; padding-bottom: 14px; margin-bottom: 24px;">
          <h1 style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 26px; font-weight: normal; margin: 0 0 6px 0; color: #111827; text-transform: uppercase; letter-spacing: 0.08em;">${finalName}</h1>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #4b5563; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px 12px; line-height: 1.4; font-weight: 500;">
            <span>📞 ${finalPhone}</span>
            <span>•</span>
            <span>✉️ ${finalEmail}</span>
            <span>•</span>
            <span>🔗 LinkedIn</span>
            <span>•</span>
            <span>🐙 GitHub</span>
          </div>
        </div>
      `;
    } else if (template === "modern") {
      headerHtml = `
        <div class="resume-header" style="border-left: 5px solid #4f46e5; padding-left: 16px; margin-bottom: 24px;">
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 800; margin: 0 0 4px 0; color: #0f172a; letter-spacing: -0.02em;">${finalName}</h1>
          <div style="font-family: -apple-system, sans-serif; font-size: 11px; color: #475569; display: flex; flex-wrap: wrap; gap: 4px 14px; font-weight: 500;">
            <span>📱 ${finalPhone}</span>
            <span>✉️ ${finalEmail}</span>
            <span>🔗 LinkedIn</span>
            <span>💻 GitHub</span>
          </div>
        </div>
      `;
    } else {
      headerHtml = `
        <div class="resume-header" style="border: 1px dashed #94a3b8; padding: 14px; margin-bottom: 24px; background-color: #f8fafc;">
          <div style="font-size: 9px; color: #64748b; font-family: monospace; margin-bottom: 4px;">// ATS MANDATORY CANDIDATE SPECIFICATION</div>
          <h1 style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 20px; font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">&gt; ${finalName.toUpperCase()}</h1>
          <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #334155; line-height: 1.5;">
            <div><span style="color: #64748b;">phone:</span> "${finalPhone}"</div>
            <div><span style="color: #64748b;">email:</span> "${finalEmail}"</div>
            <div><span style="color: #64748b;">linkedin:</span> "${finalLinkedIn}"</div>
            <div><span style="color: #64748b;">github:</span> "${finalGitHub}"</div>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview</title>
          <style>
            ${styleRules}
            .section {
              margin-bottom: 18px;
            }
          </style>
        </head>
        <body>
          <div id="resume-document">
            ${headerHtml}
            ${sections.map(seg => `
              <div class="section">
                <div class="section-title">${template === "tech" ? `// ${seg.title}` : seg.title}</div>
                <div class="section-content">${seg.content}</div>
              </div>
            `).join("")}
          </div>
        </body>
      </html>
    `;
    setSrcDoc(htmlContent);
  }, [isOpen, template, sections, contactName, contactPhone, contactEmail, contactLinkedIn, contactGitHub]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-10" id="resume-preview-modal-overlay">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col h-[85vh] animate-fade-in"
        id="resume-preview-modal-container"
      >
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg text-slate-900 font-semibold leading-snug">
                Scaled PDF Preview Snapshot
              </h3>
              <p className="text-[10px] font-mono tracking-wide uppercase text-slate-400">
                Interactive Layout Blueprint
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            id="btn-close-preview-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Template Style Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setTemplate("classic")}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition select-none ${
                template === "classic"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Classic (Serif)
            </button>
            <button
              type="button"
              onClick={() => setTemplate("modern")}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition select-none ${
                template === "modern"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Modern (Indigo)
            </button>
            <button
              type="button"
              onClick={() => setTemplate("tech")}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition select-none ${
                template === "tech"
                  ? "bg-slate-900 text-slate-50 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tech (CmdLine)
            </button>
          </div>

          {/* Scale / Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomScale(s => Math.max(0.5, s - 0.05))}
              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 font-bold min-w-[48px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale(s => Math.min(1.2, s + 0.05))}
              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(0.75)}
              className="px-2 py-1 text-[10px] text-slate-405 border border-slate-200 rounded font-semibold text-slate-500 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Content Preview Frame Area */}
        <div className="flex-1 bg-slate-100 p-6 overflow-auto flex justify-center items-start" id="preview-frame-workspace">
          <div 
            className="bg-white shadow-lg border border-slate-300 rounded-xs transition-transform duration-150 origin-top overflow-hidden"
            style={{ 
              transform: `scale(${zoomScale})`, 
              width: "780px", 
              height: "1050px",
              minWidth: "780px"
            }}
          >
            <iframe
              srcDoc={srcDoc}
              title="Resume Snap Draft Preview"
              className="w-full h-full border-0 bg-white"
              id="resume-live-preview-iframe"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-150 px-6 py-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-b-2xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>High-fidelity print styles are preserved perfectly within final exports.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-250 bg-white rounded-lg transition hover:bg-slate-50 cursor-pointer"
            >
              Back to Audit
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload(template);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              id="btn-confirm-pdf-download"
            >
              <Download className="h-4 w-4" />
              <span>Download Optimized Snapshot (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
