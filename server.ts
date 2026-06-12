/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limits for document handling (images/PDFs base64)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure server endpoints are structured properly
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * 1. Parse uploaded resume document (PDF / Image / DOCX / TXT) using Gemini OCR & layout parser
 */
app.post("/api/parse-document", async (req, res) => {
  try {
    const { base64Data, fileType, fileName } = req.body;

    if (!base64Data) {
      res.status(400).json({ error: "Missing document file data." });
      return;
    }

    const ai = getGemini();
    const typeLower = (fileType || "").toLowerCase();

    // Determine the MIME type
    let mimeType = "application/pdf";
    if (typeLower.includes("png")) mimeType = "image/png";
    else if (typeLower.includes("jpg") || typeLower.includes("jpeg")) mimeType = "image/jpeg";
    else if (typeLower.includes("webp")) mimeType = "image/webp";
    else if (typeLower.includes("pdf")) mimeType = "application/pdf";

    // Handle standard flat files quickly
    if (typeLower.includes("text") || typeLower.includes("txt")) {
      const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
      res.json({ text: decoded });
      return;
    }

    // DOCX raw text fallback or Gemini analysis
    let promptText = 
      "You are an expert ATS layout and parser agent. Extract all information from this resume document " +
      "accurately including Name, Contact Info, Professional Summary, Work Experience, Projects, Education, and Skills. " +
      "Preserve the exact wording where appropriate and present it in a readable plain-text format. " +
      "Do NOT include any introduction, explanations, or wrapper thoughts. Just return the extracted raw text directly.";

    // Call Gemini with document part
    const documentPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [documentPart, promptText],
    });

    res.json({ text: response.text || "Failed to extract text content." });
  } catch (error: any) {
    console.error("Document parsing error:", error);
    res.status(500).json({ error: error.message || "An error occurred while parsing the document." });
  }
});

/**
 * 2. Generate ATS Evaluation Report
 */
app.post("/api/generate-ats-report", async (req, res) => {
  try {
    const { resumeText, jobDescription, supportingDocs, careerInfo } = req.body;

    if (!resumeText || !jobDescription) {
      res.status(400).json({ error: "Missing resume content or job description." });
      return;
    }

    const ai = getGemini();

    const systemPrompt = 
      "You are a Senior ATS recruiter and resume parser agent. Analyze the provided resume against " +
      "the job description. Extract matching/missing technical and soft keywords, score the resume overall (0-100), " +
      "identify critical skill gaps, and provide compatibility checking parameters. Be highly realistic and analytical.";

    const contents = `
JOB DESCRIPTION:
${jobDescription}

RESUME TO EVALUATE:
${resumeText}

${careerInfo ? `ADDITIONAL CAREER INFO:\n${careerInfo}\n` : ""}
${supportingDocs && supportingDocs.length > 0 ? `SUPPORTING DOCUMENTS:\n${supportingDocs.join("\n")}\n` : ""}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "analysisString", "keywordsMatched", "keywordsMissing", "skillGaps", "compatibilityChecks"],
          properties: {
            score: { 
              type: Type.INTEGER, 
              description: "Overall ATS compatibility score from 0 to 100 based on standard matching systems." 
            },
            analysisString: { 
              type: Type.STRING, 
              description: "A professional and detailed recruitment executive summary of the resume's match." 
            },
            keywordsMatched: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Keywords found in both resume and job description (e.g. tools, technical terms, frameworks)."
            },
            keywordsMissing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Important keywords present in the job description but absent in the resume."
            },
            skillGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["skill", "priority", "details"],
                properties: {
                  skill: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "Must be 'High', 'Medium', or 'Low'." },
                  details: { type: Type.STRING, description: "Actionable description of the gap and why it is critical." }
                }
              },
              description: "List of critical hard/soft skill gaps detected."
            },
            compatibilityChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["check", "status", "message"],
                properties: {
                  check: { type: Type.STRING, description: "e.g., 'Contact Information', 'Quantifiable Metrics', 'Font/Formatting compatibility'." },
                  status: { type: Type.STRING, description: "Must be 'pass', 'fail', or 'warn'." },
                  message: { type: Type.STRING, description: "Advice, or error detail regarding this check." }
                }
              },
              description: "ATS format compatibility evaluation items."
            }
          }
        }
      }
    });

    const reportData = JSON.parse(response.text || "{}");
    res.json(reportData);
  } catch (error: any) {
    console.error("ATS report error:", error);
    res.status(500).json({ error: error.message || "Failed to generate ATS analysis." });
  }
});

/**
 * 3. Optimize Resume (Section-by-Section Tailoring)
 */
app.post("/api/optimize-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription, style, additionalInstructions } = req.body;

    if (!resumeText || !jobDescription) {
      res.status(400).json({ error: "Missing resume or job description info." });
      return;
    }

    const ai = getGemini();

    const systemPrompt = 
      "You are our dedicated multi-agent optimizer. Rewrite and tailor the resume text for the " +
      `job description using a custom style: '${style || "balanced"}'.\n` +
      "Guidelines:\n" +
      "- 'conservative': Keep 85% of original phrasing, focus strictly on phrasing layout alignments, fix formatting gaps, subtle wording swaps.\n" +
      "- 'balanced': Tailor verbs and highlight relevant achievements, weaving in matching skills naturally without fabrications.\n" +
      "- 'aggressive': Fully restructure experience lines using high-impact action verbs (STAR format), rewrite summaries, optimize bullet points for extreme keywords coverage.\n" +
      "Ensure you partition the tailored text into standard core resume sections with original vs tailored variations.";

    const contents = `
JOB DESCRIPTION:
${jobDescription}

RESUME TO TAILOR:
${resumeText}

STYLE SELECTION: ${style || "balanced"}
${additionalInstructions ? `ADDITIONAL USER REQUESTS:\n${additionalInstructions}` : ""}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["fullText", "sections"],
          properties: {
            fullText: { 
              type: Type.STRING, 
              description: "The complete, fully revised and tailored resume text designed for immediate copy-pasting." 
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "original", "optimized", "improvementNotes"],
                properties: {
                  id: { type: Type.STRING, description: "Unique snake-case id of section e.g. 'summary', 'experience', 'projects', 'skills', 'education'." },
                  title: { type: Type.STRING, description: "The human-readable title of the section (e.g., 'Work Experience')." },
                  original: { type: Type.STRING, description: "A summary or subset of the original candidate's section." },
                  optimized: { type: Type.STRING, description: "The revised portion optimized with keyword inclusion, better action verbs, and structure." },
                  improvementNotes: { type: Type.STRING, description: "Detailed explanation of exactly WHAT was improved (e.g. Added key terms X and Y, framed with outcome metrics)." }
                }
              },
              description: "Breakdown of major sections showing precise diff alignments."
            }
          }
        }
      }
    });

    const optimizedData = JSON.parse(response.text || "{}");
    res.json(optimizedData);
  } catch (error: any) {
    console.error("Optimization error:", error);
    res.status(500).json({ error: error.message || "Failed to tailor candidate resume." });
  }
});

/**
 * 4. Generate Career Enhancements & Recommendations
 */
app.post("/api/generate-career-enhancements", async (req, res) => {
  try {
    const { resumeText, jobDescription, missingSkills } = req.body;

    if (!resumeText || !jobDescription) {
      res.status(400).json({ error: "Missing required resume and job specifications." });
      return;
    }

    const ai = getGemini();

    const systemPrompt = 
      "You are an objective Career Consultant and technical mentor agent. Provide actionable recommenations " +
      "to plug skill gaps, build projects, outline certifications, suggest portfolio additions, and create " +
      "custom interview Q&A mock prep scenarios derived specifically from the target job profile and resume gaps.";

    const contents = `
JOB DESCRIPTION:
${jobDescription}

RESUME TO EVALUATE:
${resumeText}

MISSING KEYWORDS/SKILLS ENGINES DETECTED:
${JSON.stringify(missingSkills || [])}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["missingSkills", "recommendedProjects", "recommendedCertifications", "portfolioImprovements", "interviewPrepQuestions"],
          properties: {
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A summary list of target skills mapped for this action plan."
            },
            recommendedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "keyTechnologies", "impactOnResume"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Detailed guide on what to build to prove mastery in the missing skills." },
                  keyTechnologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  impactOnResume: { type: Type.STRING, description: "How to write this project on the resume to gain reciprocity with ATS scoring scanners." }
                }
              },
              description: "Practical project recommendations to plug gaps."
            },
            recommendedCertifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Highly recognized real-world certifications that increase compliance (e.g. AWS Certified Dev, PMP, Scrum)."
            },
            portfolioImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable items to refine Git, portfolio websites, or LinkedIn layouts."
            },
            interviewPrepQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "sampleAnswer", "skillTested"],
                properties: {
                  question: { type: Type.STRING, description: "Realistic situational or technical interview prompt targeting the core gaps." },
                  sampleAnswer: { type: Type.STRING, description: "STAR format excellent mock target reply." },
                  skillTested: { type: Type.STRING, description: "Name of the target skill this verifies." }
                }
              },
              description: "Custom key mock interview Q&As tailored specifically for this application."
            }
          }
        }
      }
    });

    const recommendations = JSON.parse(response.text || "{}");
    res.json(recommendations);
  } catch (error: any) {
    console.error("Career recommendation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate recommendations." });
  }
});

// Configure Vite middleware / Serve static files based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on port ${PORT}`);
  });
}

startServer();
