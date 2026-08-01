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
  Pandas: ["Describe a data-cleaning challenge you've solved with pandas."],
  "Cloud (AWS)": ["What AWS services have you used in production, and what would you do differently next time?"],
  Docker: ["How do you structure a Dockerfile for a Python or Node service you'd actually deploy?"],
  "Manual Handling": ["How would you lift, carry and move heavy equipment safely as part of a crew?"],
  "Loading and Unloading": ["What steps would you take to unload a truck quickly without damaging equipment or creating a safety risk?"],
  Rigging: ["What checks should be completed before assisting with rigging or de-rigging equipment?"],
  "AV Equipment": ["How would you handle unfamiliar lighting, sound or AV equipment while following instructions safely?"],
  "Working at Height": ["What would you do before carrying out work at height or using access equipment?"],
};

const GENERAL_BEHAVIOURAL_QUESTIONS = [
  "Tell me about a time a project didn't go as planned. What did you do?",
  "Describe a disagreement you had with a teammate and how it was resolved.",
  "What's a piece of feedback that changed how you work?",
  "Tell me about a time you had to learn something quickly to finish a task.",
];

const EVENT_CREW_BEHAVIOURAL_QUESTIONS = [
  "Tell me about a time you had to be reliable and punctual for an important shift or deadline.",
  "Describe a situation where you worked as part of a team under time pressure.",
  "How would you respond if a crew leader changed your task at short notice?",
  "Tell me about a time you learned a practical process or safety rule quickly.",
];

const GENERAL_EMPLOYER_QUESTIONS = [
  "What does success look like in this role after the first 90 days?",
  "What are the most important responsibilities during a typical shift?",
  "How is performance reviewed and feedback provided?",
  "What training is available for someone joining the team?",
];

const EVENT_CREW_EMPLOYER_QUESTIONS = [
  "What does a typical event-crew shift involve from arrival to finish?",
  "Which safety and equipment-training courses are provided to new crew members?",
  "How much notice is normally given for evening, weekend or unsociable-hour shifts?",
  "Which licences or qualifications most increase progression and earning potential?",
];

export function generateInterviewQuestions(job: JobRequirements): InterviewQuestions {
  const allSkills = [...job.requiredSkills, ...job.preferredSkills];
  const eventCrewRole = isEventCrewRole(job);

  const technical = allSkills
    .flatMap((skill) => TECHNICAL_QUESTION_BANK[skill] ?? [])
    .slice(0, 6);

  if (technical.length === 0) {
    technical.push(
      eventCrewRole
        ? "How would you prepare for a physically demanding shift with changing tasks and safety instructions?"
        : "Walk me through a project or work example most relevant to this role, end to end.",
    );
  }

  const roleSpecific = eventCrewRole
    ? [
        "Why do you want to work as an Event Crew Member, and how would you adapt to irregular working hours?",
        "What would you do if you were unsure how to move or assemble a piece of equipment safely?",
      ]
    : job.jobTitle
      ? [`What in your background makes you a fit for a ${job.jobTitle} role specifically?`]
      : [];

  return {
    technical,
    behavioural: (eventCrewRole
      ? EVENT_CREW_BEHAVIOURAL_QUESTIONS
      : GENERAL_BEHAVIOURAL_QUESTIONS
    ).slice(0, 4),
    roleSpecific,
    toAskEmployer: (eventCrewRole
      ? EVENT_CREW_EMPLOYER_QUESTIONS
      : GENERAL_EMPLOYER_QUESTIONS
    ).slice(0, 4),
  };
}

function isEventCrewRole(job: JobRequirements): boolean {
  const title = job.jobTitle.toLowerCase();
  const eventSkills = new Set([
    "Event Setup",
    "Loading and Unloading",
    "Rigging",
    "AV Equipment",
    "Stage and Set Construction",
  ]);

  return title.includes("event crew") ||
    [...job.requiredSkills, ...job.preferredSkills].some((skill) => eventSkills.has(skill));
}
