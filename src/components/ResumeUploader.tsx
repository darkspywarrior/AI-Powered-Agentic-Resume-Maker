/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, File, AlertCircle, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";
import { 
  googleSignInForDrive, 
  getCachedAccessToken, 
  listDriveFiles, 
  downloadDriveFile, 
  googleSignOut,
  initDriveAuth,
  DriveFile 
} from "../lib/drive";

interface ResumeUploaderProps {
  onResumeParsed: (text: string, fileName?: string) => void;
  onLoadingStateChange: (isLoading: boolean) => void;
}

export default function ResumeUploader({ onResumeParsed, onLoadingStateChange }: ResumeUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");

  // Google Drive states
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setDriveToken(token);
        setDriveUser(user);
      },
      () => {
        setDriveToken(null);
        setDriveUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleOpenDrivePicker = async () => {
    let currentToken = driveToken || getCachedAccessToken();
    if (!currentToken) {
      try {
        const res = await googleSignInForDrive();
        if (res) {
          currentToken = res.accessToken;
          setDriveToken(res.accessToken);
          setDriveUser(res.user);
        }
      } catch (err: any) {
        setError("Sign in and authorization failed to connect Google Drive.");
        return;
      }
    }

    if (currentToken) {
      setDriveLoading(true);
      setShowDrivePicker(true);
      setError(null);
      try {
        const files = await listDriveFiles(currentToken);
        setDriveFiles(files);
      } catch (err: any) {
        console.error(err);
        setError("Failed to retrieve file directory list from your Google Drive storage.");
      } finally {
        setDriveLoading(false);
      }
    }
  };

  const handleSelectDriveFile = async (fileId: string) => {
    const currentToken = driveToken || getCachedAccessToken();
    if (!currentToken) return;

    setShowDrivePicker(false);
    setIsParsing(true);
    onLoadingStateChange(true);
    setError(null);
    setFeedback("Downloading chosen file from Google Drive storage...");

    try {
      const { blob, name, mimeType } = await downloadDriveFile(currentToken, fileId);

      if (mimeType === "text/plain" || name.endsWith(".txt")) {
        const text = await blob.text();
        setFileName(name);
        onResumeParsed(text, name);
        setFeedback("Successfully downloaded and imported plain-text resume from Google Drive!");
        setIsParsing(false);
        onLoadingStateChange(false);
      } else {
        // Must be PDF or image
        setFeedback("AI Agent parsing layout and performing OCR on Google Drive document...");
        const reader = new FileReader();
        reader.onload = () => {
          const resultString = reader.result as string;
          const base64Parts = resultString.split(",")[1];
          if (base64Parts) {
            startParsing(base64Parts, mimeType || "application/pdf", name);
          } else {
            setError("Could not parse downloaded Drive file bytes.");
            setIsParsing(false);
            onLoadingStateChange(false);
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred during Google Drive download/parsing: " + err.message);
      setIsParsing(false);
      onLoadingStateChange(false);
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startParsing = async (base64Data: string, fileType: string, name: string) => {
    setIsParsing(true);
    onLoadingStateChange(true);
    setError(null);
    setFeedback("AI Agent parsing layout and performing OCR on document...");

    try {
      const response = await fetch("/api/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data, fileType, fileName: name }),
      });

      if (!response.ok) {
        throw new Error("Server failed to parse the document using Gemini API. Please make sure the backend is active.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setFeedback("Resume parsed successfully!");
      setFileName(name);
      onResumeParsed(data.text, name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while parsing. Try copy-pasting your text directly.");
    } finally {
      setIsParsing(false);
      onLoadingStateChange(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;
    setError(null);
    setFeedback(null);

    const validTypes = [
      "application/pdf",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];

    const isDocx = file.name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    
    if (isDocx) {
      setError(
        "For Microsoft Word (.docx) files, we highly recommend copying and pasting the text directly below, or converting the document to PDF before uploading to achieve accurate ATS formatting parsing."
      );
      return;
    }

    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      setError("Unsupported file format. Please upload PDF, PNG, JPG, WEBP, or TXT formats.");
      return;
    }

    const reader = new FileReader();

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileName(file.name);
        onResumeParsed(text, file.name);
        setFeedback("Text file read successfully!");
      };
      reader.readAsText(file);
    } else {
      // PDF or Image -> Convert to Base64 and send to server for Gemini OCR/Parsing
      reader.onload = () => {
        const resultString = reader.result as string;
        const base64Parts = resultString.split(",")[1];
        if (base64Parts) {
          startParsing(base64Parts, file.type || "application/pdf", file.name);
        } else {
          setError("Failed to read file buffer. Please try another file.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setError("Please paste your resume text before submitting.");
      return;
    }
    setError(null);
    setFeedback("Resume text loaded from manual input!");
    setFileName("Pasted Resume Content");
    onResumeParsed(pastedText, "Pasted Content");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden" id="uploader-container">
      {/* Header tab/indicator */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 border-r border-transparent pr-2">
          <Upload className="h-5 w-5 text-gray-500 animate-pulse" />
          <h3 className="font-display font-semibold text-gray-800">Resume Source Input</h3>
        </div>
        <div className="flex items-center space-x-2">
          {driveUser ? (
            <div className={`flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-xs text-emerald-800 font-medium shrink-0 animate-fade-in`} id="gdrive-indicator">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="truncate max-w-[80px] sm:max-w-[140px]">GDrive Connected ({driveUser.displayName || "Google User"})</span>
              <button 
                type="button"
                onClick={googleSignOut}
                className="text-[10px] text-red-650 hover:underline border-l border-emerald-200 pl-2 font-mono font-bold shrink-0 ml-1 cursor-pointer"
                id="gdrive-signout-btn"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">Input Agent ready</span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Upload Box */}
        <div 
          id="resume-dropzone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] ${
            dragActive 
              ? "border-emerald-500 bg-emerald-50/20" 
              : "border-gray-300 hover:border-gray-400 bg-gray-50/30 hover:bg-gray-50/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
            onChange={handleInputChange}
            disabled={isParsing}
            id="resume-file-input"
          />

          {isParsing ? (
            <div className="flex flex-col items-center space-y-3">
              <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-sm font-medium text-gray-700">Analyzing layout structure & performing OCR...</p>
              <p className="text-xs text-gray-400">Powered by server-side Gemini Vision OCR</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-emerald-50 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 shrink-0">{fileName}</p>
              <p className="text-xs text-emerald-600 font-medium">Ready for optimization analysis. Click or drop to replace.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-emerald-600 outline-hidden font-semibold">Click to upload</span> or drag & drop files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports elegant structural PDF, image screenshots (PNG/JPG), webp or TXT files
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Google Drive Import trigger */}
        <div className="flex justify-center pt-1 pb-2">
          <button
            type="button"
            onClick={handleOpenDrivePicker}
            disabled={isParsing}
            className="px-4 py-2 bg-slate-55 border border-slate-200 text-slate-700 hover:text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/50 font-bold rounded-lg flex items-center gap-2 text-xs transition active:scale-95 cursor-pointer shadow-2xs select-none"
            id="gdrive-import-btn"
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 shrink-0" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" className="text-emerald-600" />
            </svg>
            <span>Import Resume from Google Drive</span>
          </button>
        </div>

        {/* Messaging Feedback */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-700 text-sm" id="upload-error">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-red-900">Parsing Notice</p>
              <p className="text-red-700 text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {feedback && !error && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center space-x-2.5 text-emerald-800 text-sm" id="upload-feedback">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium text-emerald-900 leading-snug">{feedback}</span>
          </div>
        )}

        {/* OR Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-gray-400 font-semibold tracking-wider">OR PASTE DIRECTLY</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Text Input area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 font-display tracking-wide uppercase">Paste Resume Raw Content</label>
          <textarea
            className="w-full h-44 p-3 border border-gray-200 rounded-lg text-sm font-sans focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
            placeholder="Paste your existing resume content here... Structure is automatically sorted by the ATS parser agent."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={isParsing}
            id="resume-paste-area"
          />
          <button
            type="button"
            onClick={handlePasteSubmit}
            disabled={isParsing || !pastedText.trim()}
            className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
            id="btn-process-pasted"
          >
            Load Paste Data
          </button>
        </div>

        {/* Support guide footer */}
        <div className="pt-2 flex items-center space-x-1.5 text-xs text-gray-400">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Need help? Uploaded images run standard Gemini API optical recognition algorithms automatically.</span>
        </div>
      </div>

      {/* Google Drive Directory Selection Modal */}
      {showDrivePicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" id="gdrive-picker-modal">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[80vh] animate-fade-in">
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-serif italic font-bold text-slate-800 text-md">Import from Google Drive</h4>
                  <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wide">Browsing User Storage</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDrivePicker(false)}
                className="text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {driveLoading ? (
                <div className="flex flex-col items-center py-16 justify-center text-slate-500 space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                  <p className="text-xs font-mono font-medium text-slate-600">Retrieving drive directories...</p>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  No relevant file archives (PDF, TXT, or names containing "resume" / "cv") found.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[9px] text-slate-400 font-mono font-bold tracking-wider mb-2">RELEVANT WORKSPACE CANDIDATES:</p>
                  <div className="space-y-2">
                    {driveFiles.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => handleSelectDriveFile(file.id)}
                        className="w-full text-left p-3 bg-white border border-slate-150 hover:border-emerald-400 hover:bg-emerald-50/20 rounded-xl flex items-center justify-between transition cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition">
                            <File className={`h-4.5 w-4.5 ${file.mimeType.includes("pdf") ? "text-red-500" : "text-emerald-600"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-900">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Modified: {new Date(file.modifiedTime).toLocaleDateString()} {file.size ? `• ${(parseInt(file.size) / 1024).toFixed(0)} KB` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono font-bold bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded transition shrink-0 text-slate-500">Pick</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDrivePicker(false)}
                className="px-4 py-2 border border-slate-250 bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
