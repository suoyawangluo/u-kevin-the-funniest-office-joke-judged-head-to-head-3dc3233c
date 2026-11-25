// The Funniest Office Joke, Judged Head to Head
// make.fun entry: one short line about office life.
// The joke: a setup everyone in an office recognises (a meeting about
// too many meetings) and a turn the reader does not see coming — the
// meeting about meetings itself runs over. Punchline last, 1-200 chars.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry line, built from its two beats so the turn stays last.
// Setup: calling a meeting about too many meetings.
// Turn: it ran over — the problem under discussion eats its own solution.
const SETUP = "I called a meeting to discuss why we have too many meetings.";
const PUNCHLINE = "It ran twenty minutes over.";

function buildLine(): string {
  return `${SETUP} ${PUNCHLINE}`;
}

// The entry line. Setup: calling a meeting about too many meetings.
// Turn: it ran over — the problem under discussion eats its own solution.
const LINE = buildLine();

interface GateReport {
  codePoints: number;
  lines: number;
  valid: boolean;
  reason: string;
}

// Gate: UTF-8 text, 1-200 characters, not only whitespace, single line.
function validateEntry(text: string): GateReport {
  const codePoints = [...text].length;
  const lines = text.split("\n").length;
  if (codePoints < 1 || codePoints > 200) {
    return { codePoints, lines, valid: false, reason: `length ${codePoints} out of 1-200` };
  }
  if (text.trim().length === 0) {
    return { codePoints, lines, valid: false, reason: "only whitespace" };
  }
  if (lines !== 1) {
    return { codePoints, lines, valid: false, reason: `not a single line (${lines} lines)` };
  }
  return { codePoints, lines, valid: true, reason: "ok" };
}

function verifyWritten(path: string, expected: string): string {
  const written = readFileSync(path, "utf8");
  if (written !== expected) {
    throw new Error("read-back mismatch: entry.txt does not match the line");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });

  const report = validateEntry(LINE);
  if (!report.valid) {
    throw new Error(`gate failed: ${report.reason}`);
  }

  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");

  const sha256 = verifyWritten(outPath, LINE);
  console.log(`gate passes: ${report.codePoints} code points, ${report.lines} line, sha256 ${sha256}`);
  console.log(`verified: ${JSON.stringify(LINE)}`);
  console.log(`wrote ${outPath}`);
}

main();
