/**
 * Skill taxonomy shared between CV evidence extraction and job requirement
 * extraction. Same zero-dependency approach as the Job Market Skill
 * Analyzer (Project 2) — works with no API key, and both extraction
 * paths can be layered with an optional LLM pass once a key is set (see
 * lib/ai/extract.ts).
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
  Communication: ["communication", "stakeholder", "presented", "collaborated"],
};

export function findSkillMentions(text: string): { skill: string; evidence: string }[] {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9+./#& ]/g, " ")} `;
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
