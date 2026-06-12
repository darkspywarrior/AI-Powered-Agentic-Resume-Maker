/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CareerEnhancement, RecommendedProject, InterviewQuestion } from "../types";
import { GraduationCap, Award, Briefcase, BookOpen, ChevronDown, ChevronUp, CheckCircle, HelpCircle } from "lucide-react";

interface CareerEnhancementViewProps {
  enhancement: CareerEnhancement | null;
  onGenerate: () => Promise<void>;
  isLoading: boolean;
  hasResume: boolean;
}

export default function CareerEnhancementView({
  enhancement,
  onGenerate,
  isLoading,
  hasResume,
}: CareerEnhancementViewProps) {
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);

  const toggleQuestion = (idx: number) => {
    if (expandedQuestionIdx === idx) {
      setExpandedQuestionIdx(null);
    } else {
      setExpandedQuestionIdx(idx);
    }
  };

  return (
    <div className="space-y-6" id="career-enhancement-view">
      {/* Parameters Trigger Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <h3 className="font-display font-semibold text-slate-800">Agentic Career Mentorship</h3>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-semibold">Mentor Core Active</span>
        </div>

        <div className="p-6 text-center space-y-4 max-w-2xl mx-auto py-10">
          <p className="text-slate-600 text-sm leading-relaxed">
            Generate customized portfolio improvements, certification targets, interactive project templates, and mock behavioral or technical interview questions. All suggestions are custom synthesized for your exact experience gap and target profile.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !hasResume}
            className="px-6 py-2.5 bg-gray-900 text-white font-serif italic text-sm rounded-lg hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center space-x-2"
            id="btn-trigger-mentorship"
          >
            {isLoading ? (
              <>
                <BookOpen className="h-4 w-4 animate-spin" />
                <span>Mentorship agent synthesizing response...</span>
              </>
            ) : (
              <>
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Simulate Advisory Planning</span>
              </>
            )}
          </button>
        </div>
      </div>

      {enhancement && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="enhancement-cards-container">
          {/* Main Left Column (Projects & Interview Prep - 2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            {/* Recommended Project Blueprints */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="projects-enhancement">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-150 flex items-center space-x-2">
                <Briefcase className="h-4.5 w-4.5 text-indigo-600" />
                <h4 className="font-serif italic text-base text-slate-800">Custom Targeted Portfolio Blueprints</h4>
              </div>
              <div className="p-5 divide-y divide-slate-100">
                {enhancement.recommendedProjects && enhancement.recommendedProjects.length > 0 ? (
                  enhancement.recommendedProjects.map((project, idx) => (
                    <div key={idx} className={`py-4 ${idx === 0 ? "pt-0" : ""} ${idx === enhancement.recommendedProjects.length - 1 ? "pb-0" : ""}`}>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <h5 className="font-serif italic text-lg text-slate-850">{project.title}</h5>
                          <div className="flex flex-wrap gap-1">
                            {project.keyTechnologies.map((tech, tIdx) => (
                              <span key={tIdx} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[9px] rounded font-semibold">{tech}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{project.description}</p>
                        
                        {/* Impact on Resume formatting recommendation */}
                        <div className="mt-2.5 p-3 rounded-lg border border-indigo-100 bg-indigo-50/10 text-xs">
                          <p className="font-semibold text-indigo-950 flex items-center space-x-1 mb-1">
                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full inline-block"></span>
                            <span>Resume Action-Statement Draft:</span>
                          </p>
                          <p className="italic text-slate-600 leading-normal">"{project.impactOnResume}"</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">No project recommendations generated yet.</p>
                )}
              </div>
            </div>

            {/* Custom Interview Prep */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="interview-prep-enhancement">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-150 flex items-center space-x-2">
                <HelpCircle className="h-4.5 w-4.5 text-indigo-600" />
                <h4 className="font-serif italic text-base text-slate-800">Target Mock STAR Interview Preparation</h4>
              </div>
              <div className="p-5 divide-y divide-slate-100">
                {enhancement.interviewPrepQuestions && enhancement.interviewPrepQuestions.length > 0 ? (
                  enhancement.interviewPrepQuestions.map((q, idx) => (
                    <div key={idx} className={`py-4 ${idx === 0 ? "pt-0" : ""} ${idx === enhancement.interviewPrepQuestions.length - 1 ? "pb-0" : ""}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleQuestion(idx)}>
                          <div className="space-y-1 pr-4">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Verifying: {q.skillTested}</span>
                            <h5 className="font-serif italic text-base text-slate-800 leading-snug">{q.question}</h5>
                          </div>
                          <button type="button" className="text-slate-400 hover:text-slate-650 shrink-0 select-none">
                            {expandedQuestionIdx === idx ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>

                        {expandedQuestionIdx === idx && (
                          <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl space-y-2 entry-animation">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">Suggested STAR Interview Response</p>
                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{q.sampleAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">No interview preparation scenarios generated yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar for Certifications & Portfolio tips - 1/3 width) */}
          <div className="space-y-6">
            {/* Certifications Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="certs-enhancement">
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-150 flex items-center space-x-2">
                <Award className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-display font-bold text-slate-800 tracking-wider uppercase">Missing Certifications Target</h4>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">Highly respected certifications to plug credentials gaps on ATS scans:</p>
                {enhancement.recommendedCertifications && enhancement.recommendedCertifications.length > 0 ? (
                  <ul className="space-y-2">
                    {enhancement.recommendedCertifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-800 font-medium">{cert}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No certifications identified.</p>
                )}
              </div>
            </div>

            {/* Portfolio Checklist tips */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="portfolio-enhancement">
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-150 flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-display font-bold text-slate-800 tracking-wider uppercase">Strategic Showcase Enhancements</h4>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-400">Apply these key content upgrades to Git repositories, personal links, and profiles:</p>
                {enhancement.portfolioImprovements && enhancement.portfolioImprovements.length > 0 ? (
                  <ul className="space-y-2">
                    {enhancement.portfolioImprovements.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-indigo-650 font-mono text-xs font-bold shrink-0">#{idx + 1}</span>
                        <span className="text-xs text-slate-700 leading-normal">{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No portfolio targets determined.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
