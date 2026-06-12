/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Search, Flame, ShieldAlert, Sparkles, HelpCircle, Check, Info, ZoomIn, Compass } from "lucide-react";

interface ResumeHeatmapProps {
  resumeText: string;
  jobDescription: string;
  keywordsMatched: string[];
  keywordsMissing: string[];
}

type HeatmapStyle = "thermal" | "matrix" | "aurora";

export default function ResumeHeatmap({
  resumeText,
  jobDescription,
  keywordsMatched,
  keywordsMissing,
}: ResumeHeatmapProps) {
  const [heatmapStyle, setHeatmapStyle] = useState<HeatmapStyle>("thermal");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTermHovered, setActiveTermHovered] = useState<{
    term: string;
    actualText: string;
    resumeCount: number;
    jdCount: number;
    relevanceScore: number;
    heatIndex: number; // 0 to 100
    actualDensity?: number;
    targetDensity?: number;
    densityVsTarget?: number;
  } | null>(null);

  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [clickedKeyword, setClickedKeyword] = useState<string | null>(null);

  // Helper function to escape special chars for regex replacement
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const resumeWordCount = useMemo(() => {
    if (!resumeText) return 1;
    const words = resumeText.trim().split(/\s+/).filter(Boolean).length;
    return words > 0 ? words : 1;
  }, [resumeText]);

  const jdWordCount = useMemo(() => {
    if (!jobDescription) return 1;
    const words = jobDescription.trim().split(/\s+/).filter(Boolean).length;
    return words > 0 ? words : 1;
  }, [jobDescription]);

  // Pre-calculate frequencies & metrics for keywords
  const keywordMetrics = useMemo(() => {
    const metrics: Record<
      string,
      {
        resumeCount: number;
        jdCount: number;
        relevanceScore: number;
        heatIndex: number;
        category: "high" | "medium" | "low";
        actualDensity: number;
        targetDensity: number;
        densityVsTarget: number;
      }
    > = {};

    keywordsMatched.forEach((kw) => {
      const escaped = escapeRegExp(kw);
      const resumeCount = (resumeText.match(new RegExp(escaped, "gi")) || []).length;
      const jdCount = (jobDescription.match(new RegExp(escaped, "gi")) || []).length;

      // Compute relevance score & heat points
      let relevanceScore = 50; // starts at baseline 50%
      if (jdCount >= 4) relevanceScore = 95;
      else if (jdCount >= 2) relevanceScore = 80;
      else if (jdCount === 1) relevanceScore = 65;

      // Adjust based on matched context
      let heatIndex = Math.min(100, relevanceScore + resumeCount * 2);

      let category: "high" | "medium" | "low" = "low";
      if (relevanceScore >= 90) category = "high";
      else if (relevanceScore >= 75) category = "medium";

      const actualDensity = (resumeCount / resumeWordCount) * 100;
      const targetDensity = (jdCount / jdWordCount) * 100;
      const densityVsTarget = targetDensity > 0 ? (actualDensity / targetDensity) * 100 : 100;

      metrics[kw.toLowerCase()] = {
        resumeCount,
        jdCount,
        relevanceScore,
        heatIndex,
        category,
        actualDensity,
        targetDensity,
        densityVsTarget,
      };
    });

    return metrics;
  }, [keywordsMatched, resumeText, jobDescription, resumeWordCount, jdWordCount]);

  // Compute non-overlapping match intervals in chronological order
  const nonOverlappingMatches = useMemo(() => {
    if (!resumeText || keywordsMatched.length === 0) return [];

    const allMatches: { start: number; end: number; term: string }[] = [];
    const lowerText = resumeText.toLowerCase();

    // Sort keywords by length descending to match longer keywords first
    const sortedKws = [...keywordsMatched].sort((a, b) => b.length - a.length);

    sortedKws.forEach((kw) => {
      if (!kw || kw.trim().length === 0) return;
      const lowerKw = kw.toLowerCase();
      let pos = lowerText.indexOf(lowerKw);
      while (pos !== -1) {
        allMatches.push({
          start: pos,
          end: pos + kw.length,
          term: kw,
        });
        pos = lowerText.indexOf(lowerKw, pos + 1);
      }
    });

    // Sort matches by start position, then by length descending
    allMatches.sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return (b.end - b.start) - (a.end - a.start);
    });

    // Filter out matches that overlap previously accepted ranges
    const accepted: typeof allMatches = [];
    allMatches.forEach((m) => {
      let overlap = false;
      for (const acc of accepted) {
        if (
          (m.start >= acc.start && m.start < acc.end) ||
          (m.end > acc.start && m.end <= acc.end) ||
          (m.start <= acc.start && m.end >= acc.end)
        ) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        accepted.push(m);
      }
    });

    // Final sorting for linear parsing
    accepted.sort((a, b) => a.start - b.start);
    return accepted;
  }, [resumeText, keywordsMatched]);

  // Filter matched keywords list by search query
  const filteredKeywordsList = useMemo(() => {
    return keywordsMatched.filter((kw) =>
      kw.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [keywordsMatched, searchQuery]);

  // Render styling classes depending on selected theme & heat signature
  const getHighlightStyle = (term: string, isHovered: boolean) => {
    const metric = keywordMetrics[term.toLowerCase()];
    const heat = metric ? metric.heatIndex : 50;

    if (heatmapStyle === "thermal") {
      // Orange-Red Flame palette
      if (isHovered) {
        return "bg-amber-500 text-white border-amber-600 ring-2 ring-orange-400 font-bold scale-105 shadow-md";
      }
      if (heat >= 90) {
        return "bg-rose-500/20 text-rose-800 border-rose-300 font-bold hover:bg-rose-500/30";
      }
      if (heat >= 75) {
        return "bg-amber-500/20 text-amber-800 border-amber-300 font-medium hover:bg-amber-500/30";
      }
      return "bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/20";
    } else if (heatmapStyle === "matrix") {
      // Emerald Green & Cyan Matrix theme
      if (isHovered) {
        return "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400 font-bold scale-105 shadow-md";
      }
      if (heat >= 90) {
        return "bg-emerald-500/20 text-emerald-900 border-emerald-400 font-bold hover:bg-emerald-500/30";
      }
      if (heat >= 75) {
        return "bg-teal-500/20 text-teal-800 border-teal-300 font-medium hover:bg-teal-500/30";
      }
      return "bg-cyan-500/10 text-cyan-800 border-cyan-200 hover:bg-cyan-500/20";
    } else {
      // Aurora: Violet & Blue Sparkles
      if (isHovered) {
        return "bg-violet-600 text-white border-violet-700 ring-2 ring-violet-400 font-bold scale-105 shadow-md";
      }
      if (heat >= 90) {
        return "bg-fuchsia-500/20 text-fuchsia-900 border-fuchsia-350 font-bold hover:bg-fuchsia-500/30";
      }
      if (heat >= 75) {
        return "bg-indigo-500/20 text-indigo-800 border-indigo-300 font-medium hover:bg-indigo-500/30";
      }
      return "bg-violet-500/10 text-violet-700 border-violet-200 hover:bg-violet-500/20";
    }
  };

  const handleMouseEnterTerm = (term: string, actualText: string) => {
    const metric = keywordMetrics[term.toLowerCase()];
    if (metric) {
      setActiveTermHovered({
        term,
        actualText,
        resumeCount: metric.resumeCount,
        jdCount: metric.jdCount,
        relevanceScore: metric.relevanceScore,
        heatIndex: metric.heatIndex,
        actualDensity: metric.actualDensity,
        targetDensity: metric.targetDensity,
        densityVsTarget: metric.densityVsTarget,
      });
    }
  };

  const handleMouseLeaveTerm = () => {
    setActiveTermHovered(null);
    setHoverPosition(null);
  };

  // Generate JSX tokens using interval matches
  const formattedResumeCanvas = useMemo(() => {
    if (!resumeText) {
      return <p className="text-gray-400 italic">No resume text loaded to paint heatmap.</p>;
    }
    if (nonOverlappingMatches.length === 0) {
      return <pre className="whitespace-pre-wrap text-slate-700 font-mono text-xs leading-relaxed">{resumeText}</pre>;
    }

    const segments: React.ReactNode[] = [];
    let lastIdx = 0;

    nonOverlappingMatches.forEach((match, index) => {
      // Plain text preceding match
      if (match.start > lastIdx) {
        segments.push(
          <span key={`text-${lastIdx}`} className="text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed">
            {resumeText.slice(lastIdx, match.start)}
          </span>
        );
      }

      // Heat-mapped keyword trigger
      const actualMatchedText = resumeText.slice(match.start, match.end);
      const isClicked = clickedKeyword === match.term.toLowerCase();
      
      segments.push(
        <span
          key={`match-${index}`}
          onMouseEnter={(e) => {
            handleMouseEnterTerm(match.term, actualMatchedText);
            setHoverPosition({ x: e.clientX, y: e.clientY });
          }}
          onMouseMove={(e) => {
            setHoverPosition({ x: e.clientX, y: e.clientY });
          }}
          onMouseLeave={handleMouseLeaveTerm}
          onClick={() => setClickedKeyword(match.term.toLowerCase())}
          className={`px-1 rounded-sm border inline-block transition-all duration-150 select-text cursor-pointer ${
            isClicked ? "ring-2 ring-indigo-650 ring-offset-1 font-extrabold scale-102" : ""
          } ${getHighlightStyle(match.term, isClicked)}`}
        >
          {actualMatchedText}
        </span>
      );

      lastIdx = match.end;
    });

    // Remaining trail of document
    if (lastIdx < resumeText.length) {
      segments.push(
        <span key={`text-end`} className="text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed">
          {resumeText.slice(lastIdx)}
        </span>
      );
    }

    return <div>{segments}</div>;
  }, [resumeText, nonOverlappingMatches, heatmapStyle, clickedKeyword, keywordMetrics]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs" id="resume-heatmap-module">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono text-[9px] font-bold rounded">VISUAL RECRUITER MODE</span>
          <h4 className="font-serif italic text-lg text-slate-800 mt-1.5 flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            <span>Interactive Keyword Heatmap Inspector</span>
          </h4>
          <p className="text-xs text-slate-400">
            Evaluating critical keyword density and alignment parsed directly on your original profile text.
          </p>
        </div>

        {/* Style Switches */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Heat Theme:</span>
          <div className="bg-slate-100 p-0.5 rounded-lg flex border border-slate-200">
            <button
              onClick={() => setHeatmapStyle("thermal")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                heatmapStyle === "thermal"
                  ? "bg-white text-rose-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 cursor-pointer"
              }`}
            >
              Thermal Flame
            </button>
            <button
              onClick={() => setHeatmapStyle("matrix")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                heatmapStyle === "matrix"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 cursor-pointer"
              }`}
            >
              Tech Matrix
            </button>
            <button
              onClick={() => setHeatmapStyle("aurora")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                heatmapStyle === "aurora"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 cursor-pointer"
              }`}
            >
              Aurora Glow
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Pane Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-150">
        
        {/* Left Side: Keywords Lists & Inspector Diagnostics */}
        <div className="xl:col-span-5 p-5 flex flex-col gap-5 justify-between">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search matched keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Keyword Density List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                <span>Matched Keyword Index ({filteredKeywordsList.length})</span>
                <span>Heat Signature</span>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-2 bg-slate-50/30">
                {filteredKeywordsList.length === 0 ? (
                  <p className="text-center py-4 text-xs italic text-slate-400">No search matches found.</p>
                ) : (
                  filteredKeywordsList.map((kw, idx) => {
                    const metric = keywordMetrics[kw.toLowerCase()];
                    const isClicked = clickedKeyword === kw.toLowerCase();
                    const score = metric ? metric.heatIndex : 50;

                    return (
                      <div
                        key={idx}
                        onClick={() => setClickedKeyword(kw.toLowerCase())}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition select-none ${
                          isClicked 
                            ? "bg-indigo-50 border border-indigo-200 font-bold" 
                            : "hover:bg-slate-100/85 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            score >= 90 ? "bg-rose-500" : score >= 75 ? "bg-amber-500" : "bg-emerald-500"
                          }`}></span>
                          <span className="text-xs text-slate-700 font-medium">{kw}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-400">
                            {metric ? `${metric.resumeCount}x Res | ${metric.jdCount}x JD` : ""}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            score >= 90 
                              ? "bg-rose-50 text-rose-700 border border-rose-100" 
                              : score >= 75
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {score}% Heat
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Missing Keywords Suggestion Drawer */}
            {keywordsMissing.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                  <span>Critical Missing Keyword Targets ({keywordsMissing.length})</span>
                </span>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-rose-50/20 border border-rose-100 rounded-lg">
                  {keywordsMissing.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white text-rose-800 border border-rose-200 rounded text-[10px] font-semibold"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Intelligence Inspector Card (Triggered by Hover or Click) */}
          <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 mt-4 relative overflow-hidden flex flex-col justify-between">
            {/* Ambient visual background glow */}
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 pointer-events-none">
              <Compass className="h-28 w-28 text-indigo-700 animate-spin-slow" />
            </div>

            {activeTermHovered || (clickedKeyword && keywordMetrics[clickedKeyword]) ? (
              <div className="space-y-3 z-10">
                {(() => {
                  const data = activeTermHovered || {
                    term: clickedKeyword!,
                    actualText: clickedKeyword!,
                    ...keywordMetrics[clickedKeyword!],
                  };

                  const densityRating = 
                    data.resumeCount === 1 
                      ? "Pristine Single-Instance Match" 
                      : data.resumeCount >= 5 
                      ? "Extremely High (Possible keyword stuffing)" 
                      : "Optimal Balanced Density";

                  return (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono uppercase bg-indigo-150 text-indigo-800 font-bold px-1.5 py-0.5 rounded">Keyword Inspect Stats</span>
                          <h5 className="font-serif italic text-base text-slate-800 mt-1 capitalize">"{data.term}"</h5>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          data.heatIndex >= 90 
                            ? "bg-rose-50 text-rose-800 border-rose-200" 
                            : data.heatIndex >= 75 
                            ? "bg-amber-50 text-amber-800 border-amber-200" 
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          Heat Score: {data.heatIndex}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                          <span className="text-[9px] font-mono text-slate-400 block">Occurrences in Resume</span>
                          <strong className="text-sm text-slate-800">{data.resumeCount}x</strong>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            Density: {data.actualDensity?.toFixed(3)}%
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                          <span className="text-[9px] font-mono text-slate-400 block">Occurrences in JD</span>
                          <strong className="text-sm text-slate-800">{data.jdCount}x</strong>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            Density: {data.targetDensity?.toFixed(3)}%
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-indigo-50/40 rounded-lg border border-indigo-100 text-xs mt-1">
                        <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                          <span className="text-slate-500">Target Density vs. Actual alignment ratio:</span>
                          <strong className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                            data.densityVsTarget && data.densityVsTarget < 75 
                              ? "text-rose-700 bg-rose-50" 
                              : data.densityVsTarget && data.densityVsTarget > 150 
                              ? "text-amber-700 bg-amber-50" 
                              : "text-emerald-700 bg-emerald-50"
                          }`}>
                            {data.densityVsTarget?.toFixed(1)}%
                          </strong>
                        </div>
                        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              data.densityVsTarget && data.densityVsTarget < 75
                                ? "bg-rose-500"
                                : data.densityVsTarget && data.densityVsTarget > 150
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, data.densityVsTarget || 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs">
                        <p className="flex items-start gap-1 text-slate-650 leading-relaxed">
                          <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Density Feedback:</strong> {densityRating}.
                          </span>
                        </p>
                        <p className="flex items-start gap-1 text-slate-650 leading-relaxed">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Relevance:</strong> Mapped at {data.relevanceScore}% value index relative to overall requirements.
                          </span>
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2 z-10 select-none">
                <Compass className="h-8 w-8 text-indigo-400 mx-auto" />
                <h6 className="font-semibold text-xs text-slate-700">Live Recruiter Diagnostic Inspector</h6>
                <p className="text-[11px] text-slate-400 leading-normal max-w-[240px] mx-auto">
                  Hover over any highlighted text in the resume canvas or click a keyword index to extract deep recruiter intelligence metrics.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: The Heatmapped Resume Canvas */}
        <div className="xl:col-span-7 p-5 bg-slate-50/50 flex flex-col justify-between">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Original Resume Heat Map Canvas</span>
              <span className="text-[10px] text-indigo-650 bg-indigo-50 font-mono font-bold px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                <ZoomIn className="h-3 w-3" />
                Interactive Zoom Map
              </span>
            </div>
          </div>
          {/* Paper document frame */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-2xs max-h-120 overflow-y-auto font-mono scroll-smooth relative select-text" id="resume-canvas-paper">
            {/* Simulated Watermark background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.015] rotate-12">
              <span className="text-7xl font-sans font-extrabold select-none">ATS SECURE PASS</span>
            </div>

            <div className="relative z-10">
              {formattedResumeCanvas}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-mono">
            <span>Scroll vertically to inspect complete layout</span>
            <span>Total parsed: {resumeText.length} characters</span>
          </div>
        </div>

      </div>

      {/* Interactive Keyword floating hover tooltip */}
      {hoverPosition && activeTermHovered && (
        <div
          className="fixed pointer-events-none z-55 bg-slate-900 border border-slate-750 text-white rounded-xl p-3 shadow-2xl flex flex-col gap-2 transition-opacity duration-150 text-left text-xs"
          style={{
            left: `${hoverPosition.x + 16 > (window?.innerWidth || 1000) - 300 ? hoverPosition.x - 300 : hoverPosition.x + 16}px`,
            top: `${hoverPosition.y + 16 > (window?.innerHeight || 800) - 180 ? hoverPosition.y - 170 : hoverPosition.y + 16}px`,
            maxWidth: "285px",
            minWidth: "250px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold tracking-widest">Heatmap stats</span>
              <h5 className="font-sans font-bold text-sm text-white capitalize select-none leading-none">
                "{activeTermHovered.term}"
              </h5>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              activeTermHovered.heatIndex >= 90
                ? "bg-rose-950/80 text-rose-300 border border-rose-900/50"
                : activeTermHovered.heatIndex >= 75
                ? "bg-amber-950/80 text-amber-300 border border-amber-900/50"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-900/50"
            }`}>
              {activeTermHovered.heatIndex}% Heat
            </span>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 block leading-tight">Resume Count</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-200">{activeTermHovered.resumeCount}x</span>
                <span className="text-[9px] font-mono text-slate-400">
                  ({activeTermHovered.actualDensity?.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 block leading-tight">JD Target Count</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-200">{activeTermHovered.jdCount}x</span>
                <span className="text-[9px] font-mono text-slate-400">
                  ({activeTermHovered.targetDensity?.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Density Comparison align ratio */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono select-none">
              <span className="text-slate-400">Density alignment:</span>
              <span className={`font-bold ${
                activeTermHovered.densityVsTarget && activeTermHovered.densityVsTarget < 75 
                  ? "text-rose-400" 
                  : activeTermHovered.densityVsTarget && activeTermHovered.densityVsTarget > 150 
                  ? "text-amber-400" 
                  : "text-emerald-400"
              }`}>
                {activeTermHovered.densityVsTarget?.toFixed(1)}%
              </span>
            </div>

            {/* Micro progress fill */}
            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-850">
              <div
                className={`h-full rounded-full transition-all duration-350 ${
                  activeTermHovered.densityVsTarget && activeTermHovered.densityVsTarget < 75
                    ? "bg-rose-500"
                    : activeTermHovered.densityVsTarget && activeTermHovered.densityVsTarget > 150
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, activeTermHovered.densityVsTarget || 100)}%` }}
              />
            </div>

            <p className="text-[9px] text-slate-400 leading-normal italic select-none mt-0.5">
              {(() => {
                const ratio = activeTermHovered.densityVsTarget || 100;
                if (ratio < 75) return "⚠️ Keyword density is below target.";
                if (ratio > 150) return "⚠️ Alert: Density matches keyword stuffing.";
                return "✨ Keyword density perfectly balanced.";
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
