import { describe, expect, it } from "vitest";
import {
  buildLabelIndex, isOccupationalMismatch, loadVocabulary, lookupLabel, vocabularyAttribution,
} from "@/lib/evidence/esco-vocabulary";

describe("ESCO vocabulary", () => {
  it("covers every field of work, not just IT", () => {
    const v = loadVocabulary();
    expect(v.counts.iscoMajorGroups).toBe(10);
    expect(v.counts.occupations).toBeGreaterThan(2500);
    const groups = new Set(Object.values(v.occupations).map((o) => o.iscoPath[0]));
    expect(groups.size).toBe(10);
  });

  it("carries attribution that can be shown to users", () => {
    expect(vocabularyAttribution()).toContain("ESCO");
    expect(vocabularyAttribution()).toContain("CC BY 4.0");
  });

  it("resolves non-IT occupations that the old taxonomy could not", () => {
    const v = loadVocabulary();
    const labels = Object.values(v.occupations).map((o) => o.preferredLabel);
    for (const trade of ["plumber", "chef", "hairdresser", "midwife"]) {
      expect(labels, `${trade} missing`).toContain(trade);
    }
  });

  it("indexes synonyms so surface forms resolve to concepts", () => {
    expect(buildLabelIndex().size).toBeGreaterThan(50000);
    expect(lookupLabel("gas fitter").length).toBeGreaterThan(0);
    expect(lookupLabel("Gas Fitter").length).toBeGreaterThan(0);
  });

  it("detects occupational mismatch across ISCO major groups", () => {
    const v = loadVocabulary();
    const find = (n: string) => Object.values(v.occupations).find((o) => o.preferredLabel === n)!;
    const analyst = find("data analyst");
    const plumber = find("plumber");
    expect(isOccupationalMismatch(analyst.uri, plumber.uri)).toBe(true);
    expect(isOccupationalMismatch(analyst.uri, analyst.uri)).toBe(false);
  });
});
