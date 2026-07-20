import type { JobRequirements } from "../evidence/extract-jd";

export type InterviewQuestions = {
  technical: string[];
  behavioural: string[];
  roleSpecific: string[];
  toAskEmployer: string[];
};

const TECHNICAL_QUESTION_BANK: Record<string, string[]> = {
  Python: ["Walk me through a Python project where performance mattered — what did you optimize and how?"],
  SQL: ["Describe a complex SQL query you've written — what made it complex, and how did you validate it was correct?"],
  "Machine Learning": ["Tell me about a model you shipped. How did you choose the algorithm, and how did you evaluate it?"],
  "Deep Learning": ["What's a deep learning architecture decision you made, and what trade-off did it involve?"],
  NLP: ["How would you approach building a text classification system from scratch?"],
  "LLM APIs": ["How do you handle prompt injection or untrusted input when calling an LLM API in production?"],
  RAG: ["Walk me through how you'd design a retrieval-augmented system, including what happens when nothing relevant is found."],
  Pandas: ["Describe a data cleaning challenge you've solved with pandas."],
  "Cloud (AWS)": ["What AWS services have you used in production, and what would you do differently next time?"],
  Docker: ["How do you structure a Dockerfile for a Python or Node service you'd actually deploy?"],
};

const BEHAVIOURAL_QUESTIONS = [
  "Tell me about a time a project didn't go as planned. What did you do?",
  "Describe a disagreement you had with a teammate about a technical decision — how was it resolved?",
  "What's a piece of feedback that changed how you work?",
  "Tell me about a time you had to learn something quickly to finish a project.",
];

const EMPLOYER_QUESTIONS = [
  "What does success look like in this role after the first 90 days?",
  "What's the biggest technical challenge the team is facing right now?",
  "How does the team decide what to build vs. what to buy or use off-the-shelf?",
  "What does the review/feedback process look like for someone in this role?",
];

export function generateInterviewQuestions(job: JobRequirements): InterviewQuestions {
  const allSkills = [...job.requiredSkills, ...job.preferredSkills];
  const technical = allSkills
    .map((s) => TECHNICAL_QUESTION_BANK[s])
    .filter(Boolean)
    .flat()
    .slice(0, 6);

  if (technical.length === 0) {
    technical.push("Walk me through a project on your CV most relevant to this role, end to end.");
  }

  const roleSpecific = job.jobTitle
    ? [`What in your background makes you a fit for a ${job.jobTitle} role specifically, versus a more general engineering role?`]
    : [];

  return {
    technical,
    behavioural: BEHAVIOURAL_QUESTIONS.slice(0, 4),
    roleSpecific,
    toAskEmployer: EMPLOYER_QUESTIONS.slice(0, 4),
  };
}
