/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeVersion } from "../types";
import { History, Save, Trash2, Check, Download, ArrowUpRight, FolderOpen, AlertCircle, FileArchive } from "lucide-react";
import JSZip from "jszip";

interface VersionHistoryProps {
  versions: ResumeVersion[];
  onSaveVersion: (name: string) => void;
  onRestoreVersion: (version: ResumeVersion) => void;
  onDeleteVersion: (id: string) => void;
  selectedTemplate?: "classic" | "modern" | "tech";
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactLinkedIn: string;
  contactGitHub: string;
}

export default function VersionHistory({
  versions,
  onSaveVersion,
  onRestoreVersion,
  onDeleteVersion,
  selectedTemplate = "classic",
  contactName,
  contactPhone,
  contactEmail,
  contactLinkedIn,
  contactGitHub,
}: VersionHistoryProps) {
  const [newVersionName, setNewVersionName] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;
    
    onSaveVersion(newVersionName.trim());
    setNewVersionName("");
    setSuccessMsg("Workspace state saved successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const getSnapshotHTML = (ver: ResumeVersion) => {
    // 1. Resolve segments structures
    let segments: { title: string; content: string }[] = [];

    if (ver.optimizedResume && ver.optimizedResume.sections && ver.optimizedResume.sections.length > 0) {
      segments = ver.optimizedResume.sections.map(sec => ({
        title: sec.title.toUpperCase(),
        content: sec.optimized,
      }));
    } else {
      // Fallback parser: Analyze raw resumeText
      const text = ver.resumeText || "";
      const matches = [...text.matchAll(/===\s*([A-Za-z0-9\s&|-]+)\s*===/gi)];
      if (matches.length > 0) {
        const splitPoints = matches.map(m => m.index as number);
        for (let i = 0; i < matches.length; i++) {
          const title = matches[i][1].trim();
          const start = splitPoints[i] + matches[i][0].length;
          const end = i + 1 < matches.length ? splitPoints[i+1] : text.length;
          segments.push({
            title: title.toUpperCase(),
            content: text.slice(start, end).trim(),
          });
        }
      } else {
        // Simple lines scanning
        const commonHeaders = [
          "SUMMARY",
          "PROFESSIONAL EXPERIENCE",
          "WORK EXPERIENCE",
          "EXPERIENCE",
          "EDUCATION",
          "PROJECTS",
          "TECHNICAL PROJECTS",
          "SKILLS",
          "TECHNICAL SKILLS",
          "CERTIFICATIONS",
          "PUBLICATIONS",
          "AWARDS",
        ];
        const lines = text.split(/\r?\n/);
        let currentTitle = "RESUME DETAILS";
        let currentLines: string[] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          const cleanLine = trimmed.replace(/^[#*-:=+\s]+|[#*-:=+\s]+$/g, "").trim().toUpperCase();
          if (cleanLine && (commonHeaders.includes(cleanLine) || (trimmed.startsWith("##") && trimmed.length < 40))) {
            if (currentLines.length > 0 || currentTitle !== "RESUME DETAILS") {
              segments.push({
                title: currentTitle,
                content: currentLines.join("\n").trim(),
              });
            }
            currentTitle = cleanLine || trimmed.replace(/^##\s*/, "").toUpperCase();
            currentLines = [];
          } else {
            currentLines.push(line);
          }
        }
        if (currentLines.length > 0 || segments.length === 0) {
          segments.push({
            title: currentTitle,
            content: currentLines.join("\n").trim(),
          });
        }
      }
    }

    // 2. Resolve layouts templates to use
    const templateToUse = selectedTemplate || "classic";
    let styleRules = "";
    if (templateToUse === "classic") {
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
          border-bottom: 2px solid #111827;
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
    } else if (templateToUse === "modern") {
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

    // Capture snapshot values or fall back to current form values 
    const finalName = ver.contactName || contactName || "Jane Doe";
    const finalPhone = ver.contactPhone || contactPhone || "+1-555-019-2834";
    const finalEmail = ver.contactEmail || contactEmail || "jane.doe@professional.com";
    const finalLinkedIn = ver.contactLinkedIn || contactLinkedIn || "https://www.linkedin.com/in/janedoe";
    const finalGitHub = ver.contactGitHub || contactGitHub || "https://github.com/janedoe";

    // Build the aesthetic resume header
    let headerHtml = "";
    if (templateToUse === "classic") {
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
    } else if (templateToUse === "modern") {
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
          <title>${ver.name} — ${templateToUse.toUpperCase()}</title>
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
              background: #10b981;
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
              background: #059669;
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
            <span><strong>Snapshot Print Dashboard (${templateToUse.toUpperCase()} Style):</strong> ${ver.name} (ATS Score: ${ver.atsScore || "N/A"}). Select <strong>Save as PDF</strong> as printer target.</span>
            <button class="btn-action" onclick="window.print()">Print Snapshot PDF</button>
          </div>

          <div id="resume-document">
            ${headerHtml}
            ${segments.map(seg => `
              <div class="section">
                <div class="section-title">${templateToUse === "tech" ? `// ${seg.title}` : seg.title}</div>
                <div class="section-content">${seg.content}</div>
              </div>
            `).join("")}
          </div>
        </body>
      </html>
    `;

    return htmlContent;
  };

  const downloadSnapshotAsPDF = (ver: ResumeVersion) => {
    const htmlContent = getSnapshotHTML(ver);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Snapshot_${ver.name.replace(/\s+/g, "_")}_${selectedTemplate || "classic"}_style.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleSelectAll = () => {
    if (selectedVersionIds.length === versions.length) {
      setSelectedVersionIds([]);
    } else {
      setSelectedVersionIds(versions.map(v => v.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedVersionIds(prev =>
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const handleBatchExport = async () => {
    if (selectedVersionIds.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      const readmeContent = `ATS Secure Pass - Batch Snapshot Resume Export
===================================================
Thank you for using our Resume Builder & Optimizer!

This archive contains ${selectedVersionIds.length} of your saved resume snapshots.

To view or print any template:
1. Open the .html file in any modern web browser (Edge, Chrome, Safari, Firefox).
2. Click the "Print Snapshot PDF" button at the top of the page.
3. In the Print Dialog, set your Destination printer to "Save as PDF".
4. Ensure Background graphics are turned ON (optional, recommended for modern/colored headers).
5. Save the high-fidelity PDF directly to your device.

Generated: ${new Date().toLocaleString()}
`;
      zip.file("README.txt", readmeContent);

      selectedVersionIds.forEach(id => {
        const ver = versions.find(v => v.id === id);
        if (ver) {
          const htmlContent = getSnapshotHTML(ver);
          const sanitizedTitle = ver.name.replace(/[^a-z0-9_ -]/gi, "").replace(/\s+/g, "_");
          const templateToUse = selectedTemplate || "classic";
          const filename = `Snapshot_${sanitizedTitle}_${templateToUse}_style.html`;
          zip.file(filename, htmlContent);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume_Snapshots_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMsg(`Successfully exported ${selectedVersionIds.length} snapshots to ZIP!`);
      setTimeout(() => setSuccessMsg(null), 3500);
      setSelectedVersionIds([]);
    } catch (err) {
      console.error("Batch export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="version-history-module">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-indigo-600" />
          <h3 className="font-display font-semibold text-slate-800">Version Snapshots & History</h3>
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">{versions.length} versions stored</span>
      </div>

      <div className="p-6 space-y-6">
        {/* Save/Snapshot trigger form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 font-display uppercase tracking-wider block">
              Snapshot Active Workspace
            </label>
            <p className="text-[11px] text-slate-400 leading-normal">
              Capture your uploaded resume text, job specs, ATS ratings, and tailored AI suggestions.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 'Software Engineer - v1 Baseline'"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-sans outline-hidden bg-slate-50/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              maxLength={50}
              id="txt-snapshot-name"
            />
            <button
              type="submit"
              disabled={!newVersionName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
              id="btn-save-snapshot"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Snapshot</span>
            </button>
          </div>
          {successMsg && (
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 animate-fade-in" id="snapshot-success">
              <Check className="h-3.5 w-3.5" />
              <span>{successMsg}</span>
            </p>
          )}
        </form>

           <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-700 font-display uppercase tracking-wide">
              Stored App Snapshots ({versions.length})
            </h4>
            {versions.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={versions.length > 0 && selectedVersionIds.length === versions.length}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedVersionIds.length > 0 && selectedVersionIds.length < versions.length;
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  className="h-3.5 w-3.5 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  id="chk-select-all"
                />
                <span className="font-mono text-[10px] uppercase font-bold">Select All</span>
              </label>
            )}
          </div>
          
          {versions.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
              <History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No versions saved yet. Name and capture your progress to resume earlier edits anytime.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1 border border-slate-150 rounded-xl bg-slate-50/10">
                {versions.map((ver) => {
                  const isSelected = selectedVersionIds.includes(ver.id);
                  return (
                    <div 
                      key={ver.id} 
                      className={`p-4 flex items-center justify-between gap-4 hover:bg-white transition ${isSelected ? "bg-indigo-50/30" : ""}`} 
                      id={`snapshot-item-${ver.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ver.id)}
                          className="h-4 w-4 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                          id={`chk-select-${ver.id}`}
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-serif italic text-sm text-slate-800 truncate font-semibold">
                              {ver.name}
                            </h5>
                            {ver.atsScore !== undefined && ver.atsScore > 0 && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                                ATS Score: {ver.atsScore}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(ver.timestamp).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadSnapshotAsPDF(ver)}
                          title="Download snapshot resume as PDF"
                          className="p-1 px-2.5 text-emerald-700 hover:text-emerald-900 font-mono text-[10px] font-bold border border-emerald-200 rounded bg-emerald-50/20 hover:bg-emerald-50 inline-flex items-center gap-1 cursor-pointer transition select-none"
                          id={`btn-download-snapshot-${ver.id}`}
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestoreVersion(ver)}
                          title="Load snapshot workspace"
                          className="p-1 px-2.5 text-slate-700 hover:text-indigo-600 font-mono text-[10px] font-bold border border-slate-200 rounded bg-white hover:border-indigo-200 hover:bg-indigo-50/10 inline-flex items-center gap-1 cursor-pointer transition select-none"
                        >
                          <FolderOpen className="h-3 w-3" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteVersion(ver.id)}
                          title="Delete version"
                          className="p-1.5 text-slate-400 hover:text-red-650 border border-transparent hover:border-red-100 rounded hover:bg-red-50/20 cursor-pointer transition select-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedVersionIds.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl animate-fade-in" id="batch-export-panel">
                  <div className="flex items-center gap-2">
                    <FileArchive className="h-5 w-5 text-indigo-600 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-indigo-900">Batch Export Selection</p>
                      <p className="text-[10px] text-indigo-600 font-medium">
                        {selectedVersionIds.length} of {versions.length} resume snapshots staged for packing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedVersionIds([])}
                      className="w-full sm:w-auto px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-slate-500 hover:text-slate-800 transition cursor-pointer select-none border border-slate-200 bg-white rounded-lg"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchExport}
                      disabled={isExporting}
                      className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50 select-none cursor-pointer"
                      id="btn-batch-export-zip"
                    >
                      {isExporting ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Zipping...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>ZIP Pack ({selectedVersionIds.length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
