// Fetches the current FIFA World Cup 2026 semifinal/final results from ESPN's
// free public scoreboard API (no key, no signup, no cost) and writes the
// result to public/fixtures.json. The dashboard (src/App.jsx) fetches that
// same-origin file at runtime, so it never has to call ESPN directly from
// the visitor's browser.
//
// Run manually with:   node scripts/update-fixtures.mjs
// Run automatically by: .github/workflows/update-fixtures.yml (on a schedule)

import { writeFile, readFile } from "node:fs/promises";

const OUTPUT_PATH = new URL("../public/fixtures.json", import.meta.url);

// "fifa.world" is ESPN's undocumented-but-stable league slug for the World Cup.
// The date range just needs to cover the knockout rounds we care about.
const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260701-20260722&limit=100";

// The parts of the bracket that never change, regardless of results:
// kickoff time, venue, and city are fixed by FIFA's schedule. Only the
// team names need to be resolved live once each semifinal is decided.
const BASE_FIXTURES = [
  { round: "Semi-final", teamA: "France", teamB: "Spain", kickoffUTC: "2026-07-14T19:00:00Z", venue: "AT&T Stadium", city: "Arlington" },
  { round: "Semi-final", teamA: "England", teamB: "Argentina", kickoffUTC: "2026-07-15T19:00:00Z", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { round: "Final", teamA: "TBD", teamB: "TBD", kickoffUTC: "2026-07-19T19:00:00Z", venue: "MetLife Stadium", city: "East Rutherford" },
];

function findEvent(events, nameA, nameB) {
  return events.find((ev) => {
    const names = (ev.competitions?.[0]?.competitors || []).map(
      (c) => c.team?.displayName || c.team?.name || ""
    );
    return names.some((n) => n.includes(nameA)) && names.some((n) => n.includes(nameB));
  });
}

function winnerOf(event) {
  const comp = event?.competitions?.[0];
  if (!comp?.status?.type?.completed) return null;
  const winner = (comp.competitors || []).find((c) => c.winner === true);
  return winner?.team?.displayName || winner?.team?.name || null;
}

async function main() {
  console.log("Fetching latest World Cup results from ESPN...");

  const response = await fetch(ESPN_SCOREBOARD_URL);
  if (!response.ok) {
    throw new Error(`ESPN API error ${response.status}`);
  }
  const data = await response.json();
  const events = data.events || [];

  const semiFinal1Winner = winnerOf(findEvent(events, "France", "Spain"));
  const semiFinal2Winner = winnerOf(findEvent(events, "England", "Argentina"));

  const fixtures = BASE_FIXTURES.map((f) => ({ ...f }));
  const finalRow = fixtures.find((f) => f.round === "Final");
  if (finalRow) {
    if (semiFinal1Winner) finalRow.teamA = semiFinal1Winner;
    if (semiFinal2Winner) finalRow.teamB = semiFinal2Winner;
  }

  const payload = { generatedAt: new Date().toISOString(), fixtures };

  // Compare against existing file so we don't create no-op commits.
  let existing = null;
  try {
    existing = JSON.parse(await readFile(OUTPUT_PATH, "utf-8"));
  } catch {
    // no existing file yet, that's fine
  }
  const changed = JSON.stringify(existing?.fixtures) !== JSON.stringify(payload.fixtures);

  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  console.log(changed ? "fixtures.json updated with new data." : "fixtures.json unchanged (no new results yet).");

  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, { flag: "a" });
  }
}

main().catch((err) => {
  console.error("Failed to update fixtures, leaving existing file untouched:", err.message);
  process.exit(1);
});
