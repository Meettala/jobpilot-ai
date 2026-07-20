import { buildEvidenceBank, type EvidenceItem } from "./evidence/extract-cv";
import { extractJobRequirements, type JobRequirements } from "./evidence/extract-jd";
import { matchEvidenceToJob, type MatchResult } from "./scoring/match";
import { draftCoverLetter, type CoverLetterResult } from "./ai/cover-letter";
import { generateInterviewQuestions, type InterviewQuestions } from "./scoring/interview";
import { generateLinkedInSuggestions, type LinkedInSuggestions } from "./scoring/linkedin";

export type AnalysisResult = {
  evidence: EvidenceItem[];
  job: JobRequirements;
  match: MatchResult;
  coverLetter: CoverLetterResult;
  interviewQuestions: InterviewQuestions;
  linkedin: LinkedInSuggestions;
};

export async function runAnalysis(cvText: string, jdText: string): Promise<AnalysisResult> {
  const evidence = buildEvidenceBank(cvText);
  const job = extractJobRequirements(jdText);
  const match = matchEvidenceToJob(evidence, job);
  const coverLetter = await draftCoverLetter(evidence, job, match);
  const interviewQuestions = generateInterviewQuestions(job);
  const linkedin = generateLinkedInSuggestions(evidence, match, job.jobTitle);

  return { evidence, job, match, coverLetter, interviewQuestions, linkedin };
}
