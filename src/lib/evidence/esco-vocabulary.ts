/**
 * Shared ESCO vocabulary.
 *
 * This replaces the hand-written `SKILL_TAXONOMY`, which held about fifty
 * AI/ML terms plus a handful of event-crew entries added to patch a specific
 * scoring bug. That taxonomy could not describe an occupation nobody had
 * thought of, so any claim to match any CV against any job was false.
 *
 * The artefact in `data/esco-vocabulary.json.gz` covers every field of work:
 * 2,909 occupations across all ten ISCO-08 major groups, 12,549 skills, and
 * the occupation-to-skill relationships between them.
 *
 * Two properties of ESCO matter most to the matching pipeline:
 *
 *   * Skills are split into *essential* and *optional* per occupation, which
 *     supplies the mandatory-versus-preferred weighting the matching roadmap
 *     requires, from the classification rather than from our own guesswork.
 *   * Every concept carries alternative labels, so "ML", "machine learning"
 *     and "Machine Learning" resolve to one concept without a synonym table
 *     maintained by hand.
 *
 * Licensing: the artefact is CC BY 4.0, not MIT. See ATTRIBUTION.md. The
 * attribution must remain visible to end users, so `vocabularyAttribution()`
 * exists to be rendered rather than merely stored.
 */

import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";

export type EscoSkill = {
  uri: string;
  preferredLabel: string;
  alternativeLabels: string[];
  skillType: string | null;
  /** Present when the label fetch failed permanently; synonyms are absent. */
  enrichmentFailed?: boolean;
};

export type EscoOccupation = {
  uri: string;
  preferredLabel: string;
  alternativeLabels: string[];
  /** The ISCO unit group, e.g. "Plumbers and pipe fitters". */
  iscoGroup: string;
  /**
   * Path from the ISCO major group down to the unit group. Distance within
   * this hierarchy is what distinguishes "different specialism" from
   * "entirely different line of work" when detecting occupational mismatch.
   */
  iscoPath: string[];
  essentialSkills: string[];
  optionalSkills: string[];
};

export type EscoVocabulary = {
  source: string;
  sourceUrl: string;
  licence: string;
  attribution: string;
  scopeNote: string;
  counts: { occupations: number; skills: number; iscoMajorGroups: number };
  occupations: Record<string, EscoOccupation>;
  skills: Record<string, EscoSkill>;
};

const ARTEFACT_PATH = path.join(process.cwd(), "data", "esco-vocabulary.json.gz");

let cached: EscoVocabulary | null = null;
let labelIndex: Map<string, string[]> | null = null;

/** Loaded once and memoised; the artefact is ~4 MB compressed. */
export function loadVocabulary(): EscoVocabulary {
  if (cached) return cached;
  const raw = gunzipSync(readFileSync(ARTEFACT_PATH)).toString("utf8");
  cached = JSON.parse(raw) as EscoVocabulary;
  return cached;
}

/**
 * Attribution text that must be shown to users, not merely kept in a file.
 * CC BY 4.0 obliges the notice to travel with the data into the product.
 */
export function vocabularyAttribution(): string {
  return loadVocabulary().attribution;
}

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9+.#/ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Maps every normalised surface form — preferred labels and alternatives, for
 * both skills and occupations — onto the concept URIs that use it.
 *
 * A surface form can legitimately map to several concepts, so the index
 * returns all of them rather than silently picking one. Disambiguation is the
 * caller's problem and needs the surrounding context to do properly.
 */
export function buildLabelIndex(): Map<string, string[]> {
  if (labelIndex) return labelIndex;

  const vocabulary = loadVocabulary();
  const index = new Map<string, string[]>();

  const add = (label: string, uri: string) => {
    const key = normalizeLabel(label);
    if (key.length < 2) return;
    const existing = index.get(key);
    if (existing) {
      if (!existing.includes(uri)) existing.push(uri);
    } else {
      index.set(key, [uri]);
    }
  };

  for (const concept of Object.values(vocabulary.skills)) {
    add(concept.preferredLabel, concept.uri);
    for (const alternative of concept.alternativeLabels) add(alternative, concept.uri);
  }
  for (const occupation of Object.values(vocabulary.occupations)) {
    add(occupation.preferredLabel, occupation.uri);
    for (const alternative of occupation.alternativeLabels) add(alternative, occupation.uri);
  }

  labelIndex = index;
  return index;
}

/** Exact surface-form lookup. Returns every concept using that form. */
export function lookupLabel(label: string): string[] {
  return buildLabelIndex().get(normalizeLabel(label)) ?? [];
}

/**
 * Whether two occupations sit in different ISCO major groups.
 *
 * This is the principled replacement for the heuristic that previously let a
 * Data Analyst CV score highly against an Event Crew vacancy: those are
 * Professionals and Elementary occupations respectively, which is a fact
 * about the classification rather than a rule we invented.
 */
export function isOccupationalMismatch(
  firstUri: string,
  secondUri: string,
): boolean {
  const vocabulary = loadVocabulary();
  const first = vocabulary.occupations[firstUri];
  const second = vocabulary.occupations[secondUri];
  if (!first || !second) return false;
  if (first.iscoPath.length === 0 || second.iscoPath.length === 0) return false;
  return first.iscoPath[0] !== second.iscoPath[0];
}
