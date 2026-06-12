/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { BookOpen, ExternalLink, GraduationCap, Download, Layers, Sparkles, CheckCircle2, Check, User, Briefcase, FileCode } from "lucide-react";

interface TemplatesFinderProps {
  selectedTemplate: "classic" | "modern" | "tech";
  onSelectTemplate: (template: "classic" | "modern" | "tech") => void;
}

export default function TemplatesFinder({ selectedTemplate, onSelectTemplate }: TemplatesFinderProps) {
  const templates = [
    {
      id: "classic" as const,
      name: "Executive Classic",
      tagline: "Standard Ivy League Layout",
      fonts: "Georgia / Serif",
      badge: "Highest Approval Rate",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Timeless single-column design using traditional serif typefaces and deep-toned horizontal section rule delimiters. Preferred by investment banks, consultancies, and executive recruiters.",
      preview: {
        header: "text-serif italic border-b border-slate-900 pb-1 mt-1 text-slate-800",
        fontStyle: "font-serif",
        decor: "border-b border-slate-800 pb-0.5",
        avatarType: <User className="h-5 w-5 text-amber-600" />
      }
    },
    {
      id: "modern" as const,
      name: "Modern Professional",
      tagline: "Tech & Corporate Optimal",
      fonts: "System UI Sans",
      badge: "Most Popular",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
      description: "Clean modern sans-serif typography with generous line height, customized primary indigo accents, and compact margins. Exceptionally legible for fast-moving startups and tech firms.",
      preview: {
        header: "text-sans border-b border-indigo-100 pb-1 mt-1 text-slate-800",
        fontStyle: "font-sans",
        decor: "border-b border-indigo-500 pb-0.5",
        avatarType: <Briefcase className="h-5 w-5 text-indigo-600" />
      }
    },
    {
      id: "tech" as const,
      name: "Minimalist Code Stack",
      tagline: "Monospace Developer Blueprint",
      fonts: "Fira Code / Mono",
      badge: "Engineer Preferred",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-250",
      description: "Fidelity-led text-centric monospace syntax structure. Leverages commenting systems, double dashed margins, and code block indents. Highly parsed by tech recruiters and engineering screeners.",
      preview: {
        header: "text-mono font-bold border-b-2 border-dashed border-slate-350 pb-1 mt-1 text-slate-800",
        fontStyle: "font-mono",
        decor: "border-b-2 border-dashed border-slate-400 pb-0.5",
        avatarType: <FileCode className="h-5 w-5 text-emerald-600" />
      }
    }
  ];

  const resourceCategories = [
    {
      title: "Ivy League Standard ATS Templates",
      description: "Direct reference links to clean, single-column templates historically recognized for perfect parsing compliance.",
      items: [
        {
          name: "Harvard Career Services Templates (Docx / PDF)",
          link: "https://www.google.com/search?q=harvard+career+services+resume+templates+docx",
          tip: "Extremely simple, single-column, classic Times New Roman or Garamond styling with distinct text dividers."
        },
        {
          name: "Yale Undergraduate & Graduate Resume Blueprints",
          link: "https://www.google.com/search?q=yale+career+center+resume+templates+pdf",
          tip: "Designed strictly for chronologically stacked work experience, ideal for freshers and career entry."
        }
      ]
    },
    {
      title: "LaTeX & Overleaf Developer Sources",
      description: "High-level technical layouts configured in LaTeX code, preferred by FAANG recruiters.",
      items: [
        {
          name: "Overleaf Clean ATS Resume Template",
          link: "https://www.overleaf.com/gallery/tagged/cv",
          tip: "Allows compile to vector-text. Search for 'Jake's Resume' or 'Simple CV' on Overleaf. Highly parseable."
        },
        {
          name: "Awesome-CV Template Layout",
          link: "https://github.com/posquit0/Awesome-CV",
          tip: "Open-source developer-favorite GitHub template. Compile dynamically into single-page PDF formats."
        }
      ]
    },
    {
      title: "Modern Online Resume Builders",
      description: "Automated standard templates that respect nested grids instead of floating side columns.",
      items: [
        {
          name: "FlowCV Builder (Free Single Export)",
          link: "https://flowcv.com/",
          tip: "Modern, high-contrast layouts. Keep layout set to chronological single-column to secure ATS points."
        },
        {
          name: "Creddle ATS-Validating CV Engine",
          link: "https://creddle.io/",
          tip: "Specialized in auto-stacking formatting structures so screeners do not miss your work history."
        }
      ]
    }
  ];

  const scoreFactors = [
    {
      metric: "Baseline Parsing (Score ~30)",
      description: "Missing 12+ industry hard-skill keywords. Core impact bullet points lack STAR structure metrics, and layouts use complex multi-column floating boxes or icons that crash parser read limits.",
      color: "bg-red-50 text-red-800 border-red-200"
    },
    {
      metric: "Tailored Suite (Score ~90+)",
      description: "AI optimization injects active synonyms matching the targeted Job Description perfectly. Rephrases experience points with quantifiable metrics (e.g., 'scaled performance by 40%'), and establishes clear headings standard parsers read in sequence.",
      color: "bg-emerald-50 text-emerald-800 border-emerald-250"
    }
  ];

  return (
    <div className="space-y-10" id="templates-finder">
      {/* Dynamic Visual Structural Selector */}
      <div className="space-y-4">
        <div>
          <span className="px-2 py-0.5 bg-indigo-150 text-indigo-800 font-mono text-[9px] font-bold rounded">LIVE SYSTEM STYLING</span>
          <h3 className="font-serif italic text-2xl text-slate-800 mt-1.5">ATS-Optimized Formatting Structures</h3>
          <p className="text-xs text-slate-400">Selecting a layout structure below immediately formats your tailored, edited section content into PDF/Print models in Tab 3.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <div 
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.id)}
                className={`bg-white border text-left cursor-pointer transition-all rounded-2xl overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? "border-indigo-650 ring-2 ring-indigo-650 ring-offset-2 shadow-md bg-indigo-50/5" 
                    : "border-slate-200 hover:border-slate-350 hover:shadow-xs group"
                }`}
                id={`vis-gallery-${tpl.id}`}
              >
                {/* Visual miniature template representation */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col justify-between select-none relative h-48">
                  <div className="flex justify-between items-center bg-transparent z-10">
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-wide border rounded-full ${tpl.badgeColor}`}>
                      {tpl.badge}
                    </span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? "bg-indigo-600 text-white" : "border border-slate-350 bg-white text-transparent"
                    }`}>
                      <Check className="h-3 w-3" />
                    </span>
                  </div>

                  {/* Micro simulated paper layout */}
                  <div className={`flex-1 mt-4 p-3 bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden ${tpl.preview.fontStyle}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 rounded-md bg-slate-100">{tpl.preview.avatarType}</div>
                      <div>
                        <div className="w-16 h-2 bg-slate-800 rounded-xs"></div>
                        <div className="w-10 h-1 bg-slate-400 rounded-xs mt-1"></div>
                      </div>
                    </div>
                    {/* Simulated Body Stack */}
                    <div className="space-y-1.5 pt-1">
                      <div className={`${tpl.preview.decor} flex justify-between`}>
                        <div className="w-24 h-1.5 bg-indigo-650 rounded-xs"></div>
                      </div>
                      <div className="space-y-1 pl-1">
                        <div className="flex gap-1 items-center">
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <div className="w-28 h-1 bg-slate-350 rounded-xs"></div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <div className="w-36 h-1 bg-slate-350 rounded-xs"></div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <div className="w-20 h-1 bg-slate-300 rounded-xs"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="font-serif font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{tpl.name}</span>
                    </h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{tpl.tagline} • ({tpl.fonts})</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[72px]">
                    {tpl.description}
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(tpl.id);
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 text-white shadow-xs" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Active Structuring Target</span>
                        </>
                      ) : (
                        <span>Activate Layout</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual walkthrough showing how Score changes from 30 to 90 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold rounded">ATS SCIENCE DEEP DIVE</span>
            <h3 className="font-serif italic text-2xl text-slate-800">Understanding ATS Score Changes</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              An ATS does not grade your intelligence; it calculates <strong>keyword alignment, structural parsing integrity, and section stack readability</strong>. Here is how identical resumes can jump from 30 to 90 in score:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scoreFactors.map((factor, idx) => (
              <div key={idx} className={`p-5 rounded-xl border ${factor.color} space-y-2`}>
                <h4 className="font-semibold text-sm font-display flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-red-500" : "bg-emerald-500"}`}></span>
                  <span>{factor.metric}</span>
                </h4>
                <p className="text-xs leading-relaxed opacity-90">{factor.description}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-xs text-slate-650 flex items-start gap-2.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-805">Fresher Specific Optimization Tips:</span>
              <p className="text-slate-500 leading-relaxed">
                As a developer fresher, standard layout parsers will read your <strong>Education & Project Portfolios</strong> first. Avoid decorative sidebars, floating skills circular gauges, or profile headshots. Standard ATS software reads PDF text Left-to-Right; floating text blocks will blend into a confusing sequence, causing your score to crash to 30. Use clean, linear stacked templates listed below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates & External Sources Grid */}
      <div className="space-y-4">
        <div>
          <h4 className="font-serif italic text-xl text-slate-800">Standard ATS Template References & Sources</h4>
          <p className="text-xs text-slate-400">Locating pristine layouts designed to guarantee layout parsing success.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resourceCategories.map((category, catIdx) => (
            <div key={catIdx} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between" id={`resource-cat-${catIdx}`}>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h5 className="font-serif italic text-base text-indigo-950 font-semibold">{category.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-normal">{category.description}</p>
                </div>

                <div className="space-y-3 pt-2">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs text-slate-850 font-semibold font-sans leading-snug">{item.name}</span>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-850 shrink-0 select-none inline-flex items-center"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">"{item.tip}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

