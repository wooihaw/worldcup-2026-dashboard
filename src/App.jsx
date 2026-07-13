import { useState, useEffect } from "react";

// Remaining fixtures for the 2026 FIFA World Cup (times in UTC).
// The dashboard computes which one is "next" from the current time,
// so it keeps working as matches are played.
const FIXTURES = [
  { round: "Quarter-final", a: { name: "Spain", flag: "🇪🇸" }, b: { name: "Belgium", flag: "🇧🇪" }, kickoff: "2026-07-10T19:00:00Z", venue: "SoFi Stadium", city: "Los Angeles" },
  { round: "Quarter-final", a: { name: "Norway", flag: "🇳🇴" }, b: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, kickoff: "2026-07-11T21:00:00Z", venue: "Hard Rock Stadium", city: "Miami" },
  { round: "Quarter-final", a: { name: "Argentina", flag: "🇦🇷" }, b: { name: "Switzerland", flag: "🇨🇭" }, kickoff: "2026-07-12T01:00:00Z", venue: "Arrowhead Stadium", city: "Kansas City" },
  { round: "Semi-final", a: { name: "France", flag: "🇫🇷" }, b: { name: "Spain", flag: "🇪🇸" }, kickoff: "2026-07-14T19:00:00Z", venue: "AT&T Stadium", city: "Arlington" },
  { round: "Semi-final", a: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, b: { name: "Argentina", flag: "🇦🇷" }, kickoff: "2026-07-15T19:00:00Z", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { round: "Final", a: { name: "TBD", flag: "⚽" }, b: { name: "TBD", flag: "⚽" }, kickoff: "2026-07-19T19:00:00Z", venue: "MetLife Stadium", city: "East Rutherford" },
];

const LIVE_MS = 115 * 60 * 1000; // treat a match as "live" for ~115 min after kickoff

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzShort = () => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch { return ""; }
};

const fmtTime = (iso, tz) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
const fmtDate = (iso, tz) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: tz });

function pickCurrent(now) {
  for (let i = 0; i < FIXTURES.length; i++) {
    const k = new Date(FIXTURES[i].kickoff).getTime();
    if (now < k + LIVE_MS) return { fixture: FIXTURES[i], live: now >= k, index: i };
  }
  return { fixture: null, live: false, index: -1 };
}

function Team({ team, align }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 0" }}>
      <span style={{ fontSize: "clamp(40px, 9vw, 68px)", lineHeight: 1 }}>{team.flag}</span>
      <span style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 600, letterSpacing: "0.02em",
        fontSize: "clamp(15px, 3.6vw, 22px)", color: "#EAF2E9", textAlign: "center",
        textTransform: "uppercase",
      }}>{team.name}</span>
    </div>
  );
}

function Unit({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 600,
        fontSize: "clamp(38px, 10vw, 68px)", lineHeight: 1, color: "#EAF2E9",
        fontVariantNumeric: "tabular-nums", textShadow: "0 0 22px rgba(244,183,64,0.35)",
        minWidth: "1.7ch", textAlign: "center",
      }}>{String(value).padStart(2, "0")}</div>
      <div style={{
        fontFamily: "Archivo, sans-serif", fontSize: 11, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(234,242,233,0.5)",
      }}>{label}</div>
    </div>
  );
}

const Sep = () => (
  <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 400, fontSize: "clamp(30px, 8vw, 54px)", color: "#C98A1E", lineHeight: 1, opacity: 0.7, alignSelf: "flex-start", marginTop: "0.05em" }}>:</div>
);

export default function WorldCupCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { fixture, live } = pickCurrent(now);
  const tz = tzShort();

  let d = 0, h = 0, m = 0, s = 0;
  if (fixture && !live) {
    let diff = Math.max(0, new Date(fixture.kickoff).getTime() - now);
    d = Math.floor(diff / 86400000); diff -= d * 86400000;
    h = Math.floor(diff / 3600000); diff -= h * 3600000;
    m = Math.floor(diff / 60000); diff -= m * 60000;
    s = Math.floor(diff / 1000);
  }

  const upcoming = FIXTURES.filter((f) => new Date(f.kickoff).getTime() + LIVE_MS > now).slice(fixture ? 1 : 0, 4);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Archivo:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    @media (prefers-reduced-motion: no-preference) {
      .live-dot { animation: pulse 1.2s ease-in-out infinite; }
    }
  `;

  return (
    <div style={{ minHeight: "100%", background: "#050F0C", display: "flex", justifyContent: "center", padding: "clamp(12px, 3vw, 32px)", fontFamily: "Archivo, sans-serif" }}>
      <style>{css}</style>
      <div style={{
        width: "100%", maxWidth: 620, borderRadius: 22, overflow: "hidden",
        position: "relative",
        background: "radial-gradient(120% 80% at 50% -10%, rgba(244,183,64,0.12), transparent 55%), linear-gradient(180deg, #0C2A22 0%, #071A16 100%)",
        border: "1px solid rgba(234,242,233,0.08)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        {/* pitch-line signature */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9 }}>
          <div style={{ position: "absolute", left: "50%", top: 96, bottom: 96, width: 1, background: "rgba(234,242,233,0.10)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: "clamp(180px, 46vw, 260px)", height: "clamp(180px, 46vw, 260px)", transform: "translate(-50%,-50%)", border: "1px solid rgba(234,242,233,0.09)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 7, height: 7, transform: "translate(-50%,-50%)", background: "rgba(234,242,233,0.18)", borderRadius: "50%" }} />
        </div>

        <div style={{ position: "relative", padding: "clamp(20px, 5vw, 34px)" }}>
          {/* eyebrow */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, letterSpacing: "0.14em", fontSize: 13, color: "#F4B740", textTransform: "uppercase" }}>
              World Cup 26 <span style={{ color: "rgba(234,242,233,0.4)", fontWeight: 400 }}>· USA · CAN · MEX</span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999,
              border: `1px solid ${live ? "rgba(242,84,75,0.5)" : "rgba(244,183,64,0.35)"}`,
              background: live ? "rgba(242,84,75,0.12)" : "rgba(244,183,64,0.08)",
              fontFamily: "Archivo, sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
              color: live ? "#F2544B" : "#F4B740", fontWeight: 600,
            }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: live ? "#F2544B" : "#F4B740" }} />
              {live ? "Live now" : "Counting down"}
            </div>
          </div>

          {fixture ? (
            <>
              <div style={{ textAlign: "center", marginTop: "clamp(14px, 4vw, 26px)", fontFamily: "Oswald, sans-serif", fontWeight: 500, letterSpacing: "0.28em", fontSize: 13, textTransform: "uppercase", color: "rgba(234,242,233,0.6)" }}>
                {fixture.round}
              </div>

              {/* matchup */}
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 3vw, 20px)", marginTop: 18 }}>
                <Team team={fixture.a} />
                <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(16px, 4vw, 22px)", color: "#C98A1E", letterSpacing: "0.05em" }}>VS</span>
                <Team team={fixture.b} />
              </div>

              {/* countdown or live */}
              <div style={{ marginTop: "clamp(22px, 6vw, 38px)" }}>
                {live ? (
                  <div style={{ textAlign: "center", fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: "clamp(26px, 7vw, 42px)", color: "#F2544B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Kicked off — in play
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "clamp(8px, 3vw, 18px)" }}>
                    <Unit value={d} label="Days" />
                    <Sep />
                    <Unit value={h} label="Hrs" />
                    <Sep />
                    <Unit value={m} label="Min" />
                    <Sep />
                    <Unit value={s} label="Sec" />
                  </div>
                )}
              </div>

              {/* meta */}
              <div style={{ textAlign: "center", marginTop: "clamp(20px, 5vw, 30px)", color: "rgba(234,242,233,0.82)", fontSize: 14, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, color: "#EAF2E9" }}>{fixture.venue} · {fixture.city}</div>
                <div style={{ color: "rgba(234,242,233,0.55)", fontSize: 13 }}>
                  {fmtDate(fixture.kickoff, TZ)}, {fmtTime(fixture.kickoff, TZ)} {tz}
                  {" · "}
                  {fmtTime(fixture.kickoff, "America/New_York")} ET
                </div>
              </div>

              {/* upcoming */}
              {upcoming.length > 0 && (
                <div style={{ marginTop: "clamp(22px, 5vw, 32px)", borderTop: "1px solid rgba(234,242,233,0.1)", paddingTop: 18 }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, letterSpacing: "0.2em", fontSize: 12, textTransform: "uppercase", color: "rgba(234,242,233,0.45)", marginBottom: 12 }}>
                    After that
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {upcoming.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? "1px solid rgba(234,242,233,0.06)" : "none" }}>
                        <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 12, color: "#F4B740", width: 58, flexShrink: 0, lineHeight: 1.3 }}>
                          {fmtDate(f.kickoff, TZ).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#EAF2E9", fontSize: 14, fontWeight: 500 }}>
                            {f.a.flag} {f.a.name} <span style={{ color: "rgba(234,242,233,0.4)" }}>v</span> {f.b.flag} {f.b.name}
                          </div>
                          <div style={{ color: "rgba(234,242,233,0.45)", fontSize: 12 }}>{f.round} · {f.city}</div>
                        </div>
                        <div style={{ color: "rgba(234,242,233,0.6)", fontSize: 12, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                          {fmtTime(f.kickoff, TZ)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#EAF2E9" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 24, textTransform: "uppercase" }}>The tournament is over</div>
              <div style={{ color: "rgba(234,242,233,0.5)", marginTop: 8 }}>See you at the 2030 World Cup.</div>
            </div>
          )}

          <div style={{ marginTop: 22, textAlign: "center", color: "rgba(234,242,233,0.32)", fontSize: 11 }}>
            Times shown in your local zone ({tz || TZ}). Semi-final and final opponents fill in as matches finish.
          </div>
        </div>
      </div>
    </div>
  );
}
