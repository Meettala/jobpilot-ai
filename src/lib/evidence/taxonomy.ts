/**
 * Shared taxonomy for CV evidence and job-requirement extraction.
 * Keep variants specific enough to avoid accidental substring matches.
 */

export const SKILL_TAXONOMY: Record<string, string[]> = {
  Python: ["python"],
  SQL: ["sql", "postgresql", "mysql"],
  "Machine Learning": ["machine learning", "ml model", "scikit-learn", "sklearn"],
  "Deep Learning": ["deep learning", "neural network", "pytorch", "tensorflow"],
  NLP: ["nlp", "natural language processing"],
  "LLM APIs": ["openai api", "anthropic api", "claude api", "gpt-4", "llm api"],
  RAG: ["rag", "retrieval augmented generation", "retrieval-augmented"],
  "Prompt Engineering": ["prompt engineering", "prompt design"],
  Pandas: ["pandas"],
  "Data Visualization": ["tableau", "power bi", "matplotlib", "data visualization"],
  "Cloud (AWS)": ["aws", "amazon web services"],
  "Cloud (GCP)": ["gcp", "google cloud"],
  "Cloud (Azure)": ["azure"],
  Docker: ["docker"],
  Kubernetes: ["kubernetes", "k8s"],
  "CI/CD": ["ci/cd", "continuous integration"],
  Git: ["git", "github", "version control"],
  "REST APIs": ["rest api", "restful"],
  "FastAPI/Flask": ["fastapi", "flask"],
  "Next.js/React": ["next.js", "react", "nextjs"],
  TypeScript: ["typescript"],
  Statistics: ["statistics", "statistical modeling", "a/b testing"],
  "Data Engineering": ["etl", "data pipeline", "airflow"],
  "Model Evaluation": ["model evaluation", "cross-validation", "precision", "recall"],
  Agile: ["agile", "scrum"],

  Communication: ["communication", "communicated", "presented", "stakeholder"],
  Teamwork: ["team player", "teamwork", "worked with a team", "collaborated"],
  Reliability: ["reliable", "dependable"],
  Punctuality: ["punctual", "timekeeping", "on time"],
  "Fast Learning": ["fast learner", "quick learner", "learn quickly", "learned quickly"],
  "Attention to Detail": ["attention to detail", "detail-focused", "detail oriented", "detail-oriented"],
  "Flexible Hours": ["flexible hours", "flexible approach to working hours", "unsociable hours", "night shifts", "weekend shifts"],
  "Manual Handling": ["manual handling", "heavy lifting", "physically demanding"],
  "Loading and Unloading": ["loading and unloading", "load and unload", "unloading trucks", "loading trucks"],
  "Event Setup": ["event setup", "event set-up", "event crew", "setting up events", "dismantling events"],
  Rigging: ["rigging", "de-rigging", "derigging"],
  "AV Equipment": ["av equipment", "audio visual equipment", "sound equipment"],
  "Lighting and Power Installation": ["lighting installation", "power installation", "lighting, power and av installation"],
  "Stage and Set Construction": ["building and dismantling set", "building stages", "dismantling stages", "scenery and stages", "stage construction"],
  "Working at Height": ["working at height", "work at height"],
  Forklift: ["forklift", "counterbalance", "telescopic handler", "rough terrain"],
  "Scissor Lift/Cherry Picker": ["scissor lift", "cherry picker"],
  PASMA: ["pasma"],
  CSCS: ["cscs"],
  "SPA Card": ["spa card"],
};

export function findSkillMentions(text: string): { skill: string; evidence: string }[] {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9+./#& -]/g, " ")} `;
  const found: { skill: string; evidence: string }[] = [];

  for (const [skill, variants] of Object.entries(SKILL_TAXONOMY)) {
    for (const variant of variants) {
      if (normalized.includes(variant)) {
        found.push({ skill, evidence: variant });
        break;
      }
    }
  }

  return found;
}
