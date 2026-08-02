#!/usr/bin/env python3
"""
Build the shared ESCO vocabulary artefact by traversing the full ISCO-08
hierarchy.

Both JobPilot AI (TypeScript) and the Job Market Skill Analyzer (Python)
originally carried their own hand-written skill taxonomies of a few dozen
AI/ML entries. Neither could describe an occupation its author had not thought
of, which made any claim to match "any CV against any job" false.

An earlier version of this script searched ESCO for a seeded list of
occupation terms. That was rejected: it covered only the sectors someone
remembered to list, and ESCO's search returns the most *specific* concept
match, so the seed "mechanical engineer" resolved to "paper engineer".

This version instead walks the ISCO-08 classification from its ten major
groups down to every occupation ESCO defines. There are no seeds and no
search, so coverage is complete by construction and cannot silently drift.
Completeness is asserted rather than assumed: see verify_completeness().

Licensing: ESCO content is CC BY 4.0, which is NOT the MIT licence the
repositories use. The artefact ships with attribution that must survive into
anything built on it. See ATTRIBUTION.md.

Scope honesty: ESCO is a European classification. It covers every field of
work, but EU/UK job titles and qualifications are its native vocabulary. US
credentials map less cleanly; an official ESCO-O*NET crosswalk exists if that
becomes necessary.

Usage:
    python build_esco_vocabulary.py --out esco-vocabulary.json.gz
    python build_esco_vocabulary.py --out out.json.gz --skip-skill-labels
"""

from __future__ import annotations

import argparse
import gzip
import json
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

ESCO_API = "https://ec.europa.eu/esco/api"
USER_AGENT = "jobpilot-esco-vocabulary-builder/2.0 (+https://github.com/Meettala)"
ISCO_MAJOR_GROUPS = [f"http://data.europa.eu/esco/isco/C{n}" for n in range(10)]
MAX_WORKERS = 6
REQUEST_PAUSE = 0.05
_print_lock = threading.Lock()


def log(message: str) -> None:
    with _print_lock:
        print(message, flush=True)


def fetch(url: str, retries: int = 3) -> dict[str, Any] | None:
    for attempt in range(retries):
        try:
            request = Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
            with urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode("utf-8"))
            time.sleep(REQUEST_PAUSE)
            return payload
        except Exception:
            if attempt == retries - 1:
                return None
            time.sleep(0.5 * (attempt + 2))
    return None


def get_concept(uri: str) -> dict[str, Any] | None:
    return fetch(f"{ESCO_API}/resource/concept?uri={quote(uri, safe='')}&language=en")


def get_occupation(uri: str) -> dict[str, Any] | None:
    return fetch(f"{ESCO_API}/resource/occupation?uri={quote(uri, safe='')}&language=en")


def get_skill(uri: str) -> dict[str, Any] | None:
    return fetch(f"{ESCO_API}/resource/skill?uri={quote(uri, safe='')}&language=en")


def english_labels(node: dict[str, Any]) -> list[str]:
    alt = node.get("alternativeLabel") or {}
    return [str(label).strip() for label in (alt.get("en") or []) if str(label).strip()]


def walk_isco() -> dict[str, dict[str, Any]]:
    occupations: dict[str, dict[str, Any]] = {}
    seen_groups: set[str] = set()
    frontier: list[tuple[str, list[str]]] = [(uri, []) for uri in ISCO_MAJOR_GROUPS]
    while frontier:
        log(f"  ISCO level: expanding {len(frontier)} groups")
        next_frontier: list[tuple[str, list[str]]] = []
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {pool.submit(get_concept, uri): (uri, path) for uri, path in frontier}
            for future in as_completed(futures):
                uri, path = futures[future]
                payload = future.result()
                if not payload:
                    log(f"    ! failed to expand group {uri}")
                    continue
                title = payload.get("title", "")
                group_path = [*path, title]
                links = payload.get("_links", {})
                for child in links.get("narrowerConcept", []) or []:
                    child_uri = child.get("uri")
                    if child_uri and child_uri not in seen_groups:
                        seen_groups.add(child_uri)
                        next_frontier.append((child_uri, group_path))
                for occupation in links.get("narrowerOccupation", []) or []:
                    occupation_uri = occupation.get("uri")
                    if occupation_uri and occupation_uri not in occupations:
                        occupations[occupation_uri] = {"iscoPath": group_path, "iscoGroup": title}
        frontier = next_frontier
    return occupations


def harvest_occupations(discovered: dict[str, dict[str, Any]]) -> tuple[dict[str, Any], dict[str, Any], list[str]]:
    occupations: dict[str, Any] = {}
    skills: dict[str, Any] = {}
    errors: list[str] = []
    lock = threading.Lock()
    done = 0

    def handle(uri: str) -> None:
        nonlocal done
        payload = get_occupation(uri)
        with lock:
            done += 1
            if not payload:
                errors.append(f"occupation fetch failed: {uri}")
                return
            meta = discovered[uri]
            links = payload.get("_links", {})
            record: dict[str, Any] = {
                "uri": uri,
                "preferredLabel": payload.get("title", ""),
                "alternativeLabels": english_labels(payload),
                "iscoGroup": meta["iscoGroup"],
                "iscoPath": meta["iscoPath"],
                "essentialSkills": [],
                "optionalSkills": [],
            }
            for relation, key in (("hasEssentialSkill", "essentialSkills"), ("hasOptionalSkill", "optionalSkills")):
                for entry in links.get(relation, []) or []:
                    skill_uri = entry.get("uri")
                    if not skill_uri:
                        continue
                    record[key].append(skill_uri)
                    if skill_uri not in skills:
                        skills[skill_uri] = {
                            "uri": skill_uri,
                            "preferredLabel": entry.get("title", ""),
                            "alternativeLabels": [],
                            "skillType": entry.get("skillType"),
                        }
            record["_children"] = [child.get("uri") for child in (links.get("narrowerOccupation", []) or []) if child.get("uri")]
            occupations[uri] = record

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(handle, uri) for uri in discovered]
        for future in as_completed(futures):
            future.result()
    return occupations, skills, errors


def enrich_skill_labels(skills: dict[str, Any], errors: list[str], deadline: float | None = None, checkpoint: str | None = None, occupations: dict[str, Any] | None = None, queue: dict[str, Any] | None = None, batch_size: int = 400) -> bool:
    lock = threading.Lock()

    def handle(uri: str) -> None:
        payload = get_skill(uri)
        with lock:
            if not payload:
                errors.append(f"skill fetch failed: {uri}")
                skills[uri]["enriched"] = True
                skills[uri]["enrichmentFailed"] = True
                return
            skills[uri]["alternativeLabels"] = english_labels(payload)
            skills[uri]["enriched"] = True
            if payload.get("title"):
                skills[uri]["preferredLabel"] = payload["title"]

    while True:
        pending = [uri for uri, skill in skills.items() if not skill.get("enriched")]
        if not pending:
            return True
        if deadline is not None and time.time() >= deadline:
            log(f"    {len(pending)} skills still unenriched")
            return False
        batch = pending[:batch_size]
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = [pool.submit(handle, uri) for uri in batch]
            for future in as_completed(futures):
                future.result()
        if checkpoint is not None:
            save_checkpoint(checkpoint, occupations or {}, skills, errors, queue or {})
        remaining = sum(1 for skill in skills.values() if not skill.get("enriched"))
        log(f"    enriched {len(skills) - remaining}/{len(skills)}")


def save_checkpoint(path: str, occupations: dict[str, Any], skills: dict[str, Any], errors: list[str], queue: dict[str, Any]) -> None:
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump({"occupations": occupations, "skills": skills, "errors": errors, "queue": queue}, handle)
    os.replace(tmp, path)


def harvest_incremental(queue: dict[str, dict[str, Any]], occupations: dict[str, Any], skills: dict[str, Any], errors: list[str], deadline: float | None, checkpoint: str, batch_size: int = 150) -> bool:
    while queue:
        if deadline is not None and time.time() >= deadline:
            save_checkpoint(checkpoint, occupations, skills, errors, queue)
            return False
        batch_uris = list(queue)[:batch_size]
        batch = {uri: queue.pop(uri) for uri in batch_uris}
        harvested, batch_skills, batch_errors = harvest_occupations(batch)
        occupations.update(harvested)
        for uri, skill in batch_skills.items():
            skills.setdefault(uri, skill)
        errors.extend(batch_errors)
        for record in harvested.values():
            for child_uri in record.pop("_children", []):
                if child_uri not in occupations and child_uri not in queue:
                    queue[child_uri] = {"iscoGroup": record["iscoGroup"], "iscoPath": record["iscoPath"]}
        save_checkpoint(checkpoint, occupations, skills, errors, queue)
        log(f"    harvested {len(occupations)}, queued {len(queue)}, skills {len(skills)}")
    return True


def verify_completeness(vocabulary: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    occupations = vocabulary["occupations"]
    groups = {o["iscoPath"][0] for o in occupations.values() if o["iscoPath"]}
    if len(groups) < 10:
        problems.append(f"expected occupations under all 10 ISCO major groups, found {len(groups)}")
    if len(occupations) < 2500:
        problems.append(f"expected roughly 3,000 ESCO occupations, harvested {len(occupations)}")
    without_skills = [o for o in occupations.values() if not o["essentialSkills"]]
    if len(without_skills) > len(occupations) * 0.2:
        problems.append(f"{len(without_skills)} of {len(occupations)} occupations have no essential skills")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="esco-vocabulary.json.gz")
    parser.add_argument("--skip-skill-labels", action="store_true")
    parser.add_argument("--max-seconds", type=int, default=0)
    parser.add_argument("--checkpoint", default="esco-checkpoint.json")
    args = parser.parse_args()
    started = time.time()
    deadline = started + args.max_seconds if args.max_seconds else None
    occupations: dict[str, Any] = {}
    skills: dict[str, Any] = {}
    errors: list[str] = []
    queue: dict[str, dict[str, Any]] = {}
    if os.path.exists(args.checkpoint):
        log(f"Resuming from checkpoint {args.checkpoint}")
        with open(args.checkpoint, encoding="utf-8") as handle:
            saved = json.load(handle)
        occupations = saved["occupations"]
        skills = saved["skills"]
        errors = saved.get("errors", [])
        queue = saved.get("queue", {})
    else:
        log("Walking the ISCO-08 hierarchy")
        queue = walk_isco()
    complete = harvest_incremental(queue, occupations, skills, errors, deadline, args.checkpoint)
    if not complete:
        return 2
    if not args.skip_skill_labels:
        enriched = enrich_skill_labels(skills, errors, deadline, args.checkpoint, occupations, queue)
        if not enriched:
            return 2
    vocabulary = {
        "source": "ESCO — European Skills, Competences, Qualifications and Occupations",
        "sourceUrl": "https://esco.ec.europa.eu/",
        "licence": "CC BY 4.0",
        "attribution": "Contains information from ESCO (European Skills, Competences, Qualifications and Occupations), © European Union, licensed under CC BY 4.0. ESCO's skill hierarchy is partly derived from O*NET (US Department of Labor) and the Government of Canada Skills and Knowledge Checklist, both also CC BY 4.0.",
        "generatedBy": "tools/build_esco_vocabulary.py",
        "method": "full ISCO-08 hierarchy traversal from all ten major groups",
        "scopeNote": "Covers every field of work in ESCO. ESCO is a European classification, so EU and UK job titles and qualifications are its native vocabulary; US-specific credentials map less cleanly.",
        "counts": {
            "occupations": len(occupations),
            "skills": len(skills),
            "iscoMajorGroups": len({o["iscoPath"][0] for o in occupations.values() if o["iscoPath"]}),
        },
        "occupations": occupations,
        "skills": skills,
        "harvestErrors": errors,
    }
    problems = verify_completeness(vocabulary)
    vocabulary["completenessProblems"] = problems
    payload = json.dumps(vocabulary, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    if args.out.endswith(".gz"):
        with gzip.open(args.out, "wt", encoding="utf-8") as handle:
            handle.write(payload)
    else:
        with open(args.out, "w", encoding="utf-8") as handle:
            handle.write(payload)
    if problems:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
