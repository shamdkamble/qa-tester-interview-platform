/**
 * BugHunt QA — Fresher Intern Grading Engine
 *
 * Design goals:
 * - Reward finding high-impact defects more than cosmetic ones
 * - Fair for freshers (not all 17 bugs required)
 * - Not free points: need real matches + decent quiz
 * - Score from MASTER bug severity (not self-reported severity)
 */

/** Points awarded when a unique intentional bug is correctly mapped */
export const SEVERITY_POINTS = {
  Critical: 5,
  High: 4,
  Medium: 2,
  Low: 1
};

/**
 * Display tiers (3 buckets for interviewers):
 * Critical = Critical + High master bugs
 * Mid      = Medium
 * Low      = Low
 */
export function toDisplayTier(masterSeverity) {
  if (masterSeverity === 'Critical' || masterSeverity === 'High') return 'Critical';
  if (masterSeverity === 'Medium') return 'Mid';
  return 'Low';
}

export const TIER_LABELS = {
  Critical: 'Critical',
  Mid: 'Mid',
  Low: 'Low'
};

/** Max participation credit for unmatched "Other" reports (well written) */
const OTHER_BONUS_CAP = 3;
const OTHER_BONUS_EACH = 1;

/** Composite mix — practical hunt dominates for intern role */
export const WEIGHTS = {
  bugHunt: 0.75,
  quiz: 0.25
};

/**
 * Compute full assessment score.
 * @param {object} opts
 * @param {Array} opts.reportedBugs - candidate defect reports
 * @param {Array} opts.masterBugs - currently active intentional bugs
 * @param {{ score: number, total: number }} opts.quizScore
 */
export function computeAssessmentScore({ reportedBugs = [], masterBugs = [], quizScore = { score: 0, total: 8 } }) {
  const activeMaster = masterBugs || [];
  const reports = reportedBugs || [];

  // Max points if every active intentional bug is found once
  let maxBugPoints = 0;
  const masterById = new Map();
  activeMaster.forEach((b) => {
    masterById.set(b.id, b);
    maxBugPoints += SEVERITY_POINTS[b.severity] ?? 1;
  });
  maxBugPoints = Math.max(maxBugPoints, 1);

  // Unique matches only (duplicate maps don't stack)
  const matchedIds = new Set();
  const matchedDetails = [];

  reports.forEach((rb) => {
    if (!rb.bugId || rb.bugId === 'other') return;
    if (matchedIds.has(rb.bugId)) return;
    const master = masterById.get(rb.bugId);
    if (!master) return;

    matchedIds.add(rb.bugId);
    const basePts = SEVERITY_POINTS[master.severity] ?? 1;

    // Light quality factor: incomplete write-ups earn less (freshers still get most credit)
    const quality = reportQualityFactor(rb);
    const earned = +(basePts * quality).toFixed(2);

    matchedDetails.push({
      bugId: master.id,
      featureArea: master.featureArea,
      title: master.title,
      masterSeverity: master.severity,
      displayTier: toDisplayTier(master.severity),
      basePoints: basePts,
      quality,
      earnedPoints: earned,
      candidateSeverity: rb.severity,
      reportTitle: rb.title
    });
  });

  const rawMatchedPoints = matchedDetails.reduce((s, d) => s + d.earnedPoints, 0);

  // Small bonus for thoughtful custom findings (does not replace intentional coverage)
  const otherReports = reports.filter((r) => r.bugId === 'other' || !r.bugId);
  let otherBonus = 0;
  otherReports.forEach((r) => {
    if (otherBonus >= OTHER_BONUS_CAP) return;
    if (reportQualityFactor(r) >= 0.85) {
      otherBonus = Math.min(OTHER_BONUS_CAP, otherBonus + OTHER_BONUS_EACH);
    }
  });

  const earnedBugPoints = Math.min(maxBugPoints, rawMatchedPoints + otherBonus);
  const bugHuntPct = Math.min(100, Math.round((earnedBugPoints / maxBugPoints) * 100));

  const quizCorrect = quizScore?.score || 0;
  const quizTotal = quizScore?.total || 8;
  const quizPct = Math.round((quizCorrect / Math.max(quizTotal, 1)) * 100);

  const composite = Math.round(bugHuntPct * WEIGHTS.bugHunt + quizPct * WEIGHTS.quiz);

  // Tier breakdown (unique matched intentional bugs)
  const tierCounts = { Critical: 0, Mid: 0, Low: 0 };
  const tierPoints = { Critical: 0, Mid: 0, Low: 0 };
  const tierAvailable = { Critical: 0, Mid: 0, Low: 0 };

  activeMaster.forEach((b) => {
    const tier = toDisplayTier(b.severity);
    tierAvailable[tier] += 1;
  });
  matchedDetails.forEach((d) => {
    tierCounts[d.displayTier] += 1;
    tierPoints[d.displayTier] += d.earnedPoints;
  });

  const gradeInfo = gradeFromComposite(composite, {
    criticalFound: tierCounts.Critical,
    quizCorrect,
    quizTotal,
    uniqueMatched: matchedIds.size,
    totalActive: activeMaster.length
  });

  return {
    // Array so scoring survives localStorage JSON (Set does not serialize)
    matchedIds: [...matchedIds],
    matchedDetails,
    uniqueMatched: matchedIds.size,
    totalActive: activeMaster.length,
    maxBugPoints,
    earnedBugPoints: +earnedBugPoints.toFixed(2),
    otherBonus,
    bugHuntPct,
    quizCorrect,
    quizTotal,
    quizPct,
    composite,
    tierCounts,
    tierPoints,
    tierAvailable,
    grade: gradeInfo.grade,
    badgeClass: gradeInfo.badgeClass,
    recommendation: gradeInfo.recommendation,
    hireSignal: gradeInfo.hireSignal,
    summary: gradeInfo.summary
  };
}

function reportQualityFactor(report) {
  const steps = (report.stepsToReproduce || '').trim().length;
  const expected = (report.expectedBehavior || '').trim().length;
  const actual = (report.actualBehavior || '').trim().length;
  const title = (report.title || '').trim().length;

  // Bare-minimum form still passes; thin reports lose a little
  let factor = 1;
  if (title < 8) factor -= 0.1;
  if (steps < 20) factor -= 0.15;
  if (expected < 10) factor -= 0.1;
  if (actual < 10) factor -= 0.1;
  return Math.max(0.55, Math.min(1, factor));
}

/**
 * Fresher-friendly bands — not fail-everyone, not free A.
 *
 * Typical solid intern: ~2–3 Critical-tier + few Mid + quiz ~4–5 → composite ~50–65 → B/A
 * Strong: many Critical + quiz 6+ → A / S
 */
function gradeFromComposite(composite, ctx) {
  const { criticalFound, quizCorrect, uniqueMatched } = ctx;

  // Exceptional: strong weighted score + impact findings + theory
  if (composite >= 72 && criticalFound >= 2 && quizCorrect >= 5) {
    return {
      grade: 'S — Exceptional',
      badgeClass: 'badge-low',
      recommendation: 'HIGHLY RECOMMENDED — TOP INTERN CANDIDATE',
      hireSignal: 'strong_hire',
      summary: 'Excellent practical hunting of high-impact defects with solid theory foundations.'
    };
  }

  if (composite >= 58) {
    return {
      grade: 'A — Strong',
      badgeClass: 'badge-brand',
      recommendation: 'RECOMMENDED FOR QA INTERNSHIP',
      hireSignal: 'hire',
      summary: 'Strong fresher profile — good coverage of meaningful defects and acceptable theory.'
    };
  }

  if (composite >= 45) {
    return {
      grade: 'B — Promising',
      badgeClass: 'badge-high',
      recommendation: 'RECOMMENDED FOR SECOND ROUND',
      hireSignal: 'lean_hire',
      summary: 'Promising intern potential. Solid base; coach on deeper critical-path testing.'
    };
  }

  if (composite >= 32) {
    return {
      grade: 'C — Developing',
      badgeClass: 'badge-medium',
      recommendation: 'BORDERLINE — COACHING REQUIRED',
      hireSignal: 'hold',
      summary: 'Some testing instinct shown, but impact coverage and/or theory need clear improvement.'
    };
  }

  // Soft floor: if they found at least something meaningful, slightly kinder wording
  if (uniqueMatched >= 2 || criticalFound >= 1) {
    return {
      grade: 'D — Below Bar',
      badgeClass: 'badge-critical',
      recommendation: 'NOT READY FOR THIS COHORT',
      hireSignal: 'no_hire',
      summary: 'Limited findings relative to the sandbox. May re-assess after fundamentals practice.'
    };
  }

  return {
    grade: 'D — Below Bar',
    badgeClass: 'badge-critical',
    recommendation: 'DOES NOT MEET QA INTERN BAR',
    hireSignal: 'no_hire',
    summary: 'Insufficient defect discovery and theory performance for an intern bar.'
  };
}
