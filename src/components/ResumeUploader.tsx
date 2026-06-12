/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, FileText, File, AlertCircle, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";

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
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-gray-500" />
          <h3 className="font-display font-semibold text-gray-800">Resume Source Input</h3>
        </div>
        <span className="text-xs text-gray-500 font-mono">Input Agent ready</span>
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
            className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
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
    </div>
  );
}
