// Shared mid-semester demo dataset for כיתה י'1 — invented at Mark's explicit request
// ("make up all data as you want, but it needs to be realistic, shared amongst other
// screens"). Every screen that needs class/student numbers should import from here
// instead of inventing its own, so the numbers stay consistent app-wide.

import type { Kind } from './KindIcon';

export const CLASS_LABEL = "כיתה י'1";
export const CLASS_SIZE = 30;

// dates line up with the last five columns of STATUS_DATES below, so the dashboard and the
// מצב תלמידים table describe the same assessments
export type RecentPractice = { title: string; sentOn: string; kind: Kind; avgScore: number; submissionRate: number };
export const RECENT_PRACTICES: RecentPractice[] = [
  { title: 'קדם אנליזה - פולינום', sentOn: '19/08/26', kind: 'תרגול', avgScore: 58, submissionRate: 65 },
  { title: 'מרחק בין נקודות', sentOn: '22/08/26', kind: 'תרגול', avgScore: 69, submissionRate: 77 },
  { title: 'גאומטריה בדיקה', sentOn: '24/08/26', kind: 'בוחן', avgScore: 61, submissionRate: 88 },
  { title: 'אנליטית 2', sentOn: '25/08/26', kind: 'תרגול', avgScore: 74, submissionRate: 92 },
  { title: 'גרף', sentOn: '26/08/26', kind: 'תרגול', avgScore: 82, submissionRate: 100 },
];

export const WEEKLY_ACTIVITY = { active: 22, inactive: 8 };

// value is bare — the repeated phrase (what the value means) lives once in the panel's
// column header now, not on every row.
export type FlaggedStudent = { name: string; value: number };
export const AT_RISK_STUDENTS: FlaggedStudent[] = [
  { name: 'נועה לוי', value: 52 },
  { name: 'איתי פרץ', value: 48 },
  { name: 'שירה מזרחי', value: 55 },
];

export const INACTIVE_STUDENTS: FlaggedStudent[] = [
  { name: 'תמר בן דוד', value: 12 },
  { name: 'מאיה גולן', value: 9 },
  { name: 'יונתן שפירא', value: 5 },
  { name: 'דניאל אברהם', value: 6 },
];

/* ---------- מצב תלמידים: one row per student, one column per assessment date ---------- */

// עובר / לא עובר / הגיש חלקית / לא הגיש
export type CellStatus = 'pass' | 'fail' | 'partial' | 'none';
export type StatusCell = { score: number | null; status: CellStatus };
export type StudentStatusRow = { name: string; cells: StatusCell[] };

// Every column of the table is one assessment: when it went out and whether it was a
// תרגול or a בוחן. The last five line up with RECENT_PRACTICES above, kind included.
export type Assessment = { date: string; kind: Kind; title: string };
export const STATUS_ASSESSMENTS: Assessment[] = [
  { date: '28/07', kind: 'תרגול', title: 'משוואות ריבועיות' },
  { date: '02/08', kind: 'תרגול', title: 'פרבולה - נקודות חיתוך' },
  { date: '05/08', kind: 'בוחן', title: 'בוחן פתיחה - אלגברה' },
  { date: '08/08', kind: 'תרגול', title: 'סדרות חשבוניות' },
  { date: '12/08', kind: 'תרגול', title: 'סדרות הנדסיות' },
  { date: '16/08', kind: 'בוחן', title: 'בוחן אמצע - סדרות' },
  { date: '17/08', kind: 'תרגול', title: 'טריגונומטריה במשולש ישר זווית' },
  { date: '19/08', kind: 'תרגול', title: 'קדם אנליזה - פולינום' },
  { date: '22/08', kind: 'תרגול', title: 'מרחק בין נקודות' },
  { date: '24/08', kind: 'בוחן', title: 'גאומטריה בדיקה' },
  { date: '25/08', kind: 'תרגול', title: 'אנליטית 2' },
  { date: '26/08', kind: 'תרגול', title: 'גרף' },
];

export const STATUS_DATES = STATUS_ASSESSMENTS.map((a) => a.date);

// The first 7 names are the ones the dashboard already calls out, so their rows have to
// tell the same story: 1-3 are the at-risk students (low scores), 4-7 are the inactive
// ones (mostly לא הגיש). The rest fill the class out to CLASS_SIZE.
const ROSTER: { name: string; ability: number; missRate: number }[] = [
  { name: 'נועה לוי', ability: 0.52, missRate: 0.08 },
  { name: 'איתי פרץ', ability: 0.48, missRate: 0.10 },
  { name: 'שירה מזרחי', ability: 0.55, missRate: 0.08 },
  { name: 'תמר בן דוד', ability: 0.62, missRate: 0.65 },
  { name: 'מאיה גולן', ability: 0.58, missRate: 0.55 },
  { name: 'יונתן שפירא', ability: 0.71, missRate: 0.45 },
  { name: 'דניאל אברהם', ability: 0.66, missRate: 0.50 },
  { name: 'אורי כהן', ability: 0.88, missRate: 0.04 },
  { name: 'יעל פרידמן', ability: 0.91, missRate: 0.02 },
  { name: 'עומר שמש', ability: 0.74, missRate: 0.08 },
  { name: 'רוני אלון', ability: 0.69, missRate: 0.12 },
  { name: 'ליאור בר', ability: 0.83, missRate: 0.06 },
  { name: 'אדם נחום', ability: 0.57, missRate: 0.15 },
  { name: 'גיא רוזן', ability: 0.78, missRate: 0.05 },
  { name: 'הילה סגל', ability: 0.94, missRate: 0.02 },
  { name: 'אביב טל', ability: 0.64, missRate: 0.18 },
  { name: 'שקד ברק', ability: 0.72, missRate: 0.10 },
  { name: 'נדב אשכנזי', ability: 0.61, missRate: 0.20 },
  { name: 'מיכל דרור', ability: 0.86, missRate: 0.03 },
  { name: 'אלון חן', ability: 0.53, missRate: 0.22 },
  { name: 'עידו קפלן', ability: 0.76, missRate: 0.07 },
  { name: 'ספיר אזולאי', ability: 0.89, missRate: 0.04 },
  { name: 'יובל מור', ability: 0.67, missRate: 0.14 },
  { name: 'ניר שגב', ability: 0.59, missRate: 0.16 },
  { name: 'טל אביטל', ability: 0.81, missRate: 0.06 },
  { name: 'רותם לביא', ability: 0.73, missRate: 0.09 },
  { name: 'אמיר גל', ability: 0.63, missRate: 0.13 },
  { name: 'שירן אוחיון', ability: 0.85, missRate: 0.05 },
  { name: 'ליהי ברקת', ability: 0.70, missRate: 0.11 },
  { name: 'איתן צור', ability: 0.56, missRate: 0.19 },
];

// Deterministic pseudo-random so the demo data never shuffles between reloads — the same
// screen goes to Figma, to a screenshot, and to a review meeting looking identical.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const STUDENT_STATUS: StudentStatusRow[] = ROSTER.map((student, i) => {
  const rand = seeded(i * 7919 + 13);
  const cells = STATUS_DATES.map<StatusCell>(() => {
    if (rand() < student.missRate) return { score: null, status: 'none' };
    if (rand() < 0.1) return { score: clamp(30 + rand() * 40), status: 'partial' };
    const score = clamp(student.ability * 100 + (rand() - 0.5) * 28);
    return { score, status: score >= 60 ? 'pass' : 'fail' };
  });
  return { name: student.name, cells };
});

export const STATUS_LEGEND: { label: string; status: CellStatus }[] = [
  { label: 'עובר', status: 'pass' },
  { label: 'לא עובר', status: 'fail' },
  { label: 'הגיש חלקית', status: 'partial' },
  { label: 'לא הגיש', status: 'none' },
];

/* ---------- "many students" demo state for the dashboard's bottom cards ---------- */

// Derived from the same roster rather than hand-listed, so the long lists tell the same
// story as the table: whoever is actually failing / actually missing shows up here.
const rowAverage = (row: StudentStatusRow) => {
  const scores = row.cells.filter((c) => c.score !== null).map((c) => c.score as number);
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
};

export const AT_RISK_MANY: FlaggedStudent[] = STUDENT_STATUS
  .map((row) => ({ name: row.name, value: rowAverage(row) }))
  .filter((s) => s.value > 0 && s.value < 60)
  .sort((a, b) => a.value - b.value);

// The "many" snapshot is a different week of the same class: a stretch where a lot of
// students went quiet. Who is away, and for how long, comes straight off each student's
// miss rate rather than being typed in one by one.
export const INACTIVE_MANY: FlaggedStudent[] = ROSTER
  .map((s) => ({ name: s.name, value: Math.round(5 + s.missRate * 20) }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 9);

/* ---------- סקירת הערכה: the per-assessment drill-in reached from the dashboard ---------- */

// the same four states the מצב תלמידים table uses — עובר / הגיש חלקית / לא עובר / לא הגיש
export type StudentResult = { name: string; score: number | null; status: CellStatus };
export type AssessmentReviewData = RecentPractice & {
  submitted: number;
  passed: number;
  partial: number;
  results: StudentResult[];
};

// One practice's class results, generated so they add up to exactly the headline numbers
// the dashboard already shows: `submitted` students hand in, and their scores average to
// `avgScore`. Whoever misses most in the table is who misses this one too.
function buildResults(p: RecentPractice, seed: number): AssessmentReviewData {
  const submitted = Math.round((p.submissionRate * CLASS_SIZE) / 100);
  const missing = CLASS_SIZE - submitted;
  const skipped = new Set(
    ROSTER.map((s, i) => ({ i, missRate: s.missRate }))
      .sort((a, b) => b.missRate - a.missRate || a.i - b.i)
      .slice(0, missing)
      .map((o) => o.i),
  );

  const rand = seeded(seed);
  const idx = ROSTER.map((_, i) => i).filter((i) => !skipped.has(i));
  const scores = idx.map((i) => clamp(ROSTER[i].ability * 100 + (rand() - 0.5) * 24));

  // shift the whole set onto the headline average, then hand out whatever is left over
  // one point at a time so the mean lands exactly on avgScore
  const shift = p.avgScore - scores.reduce((a, b) => a + b, 0) / scores.length;
  for (let i = 0; i < scores.length; i += 1) scores[i] = clamp(scores[i] + shift);
  let diff = p.avgScore * scores.length - scores.reduce((a, b) => a + b, 0);
  for (let i = 0; diff !== 0; i = (i + 1) % scores.length) {
    if (diff > 0 && scores[i] < 100) { scores[i] += 1; diff -= 1; } else if (diff < 0 && scores[i] > 0) { scores[i] -= 1; diff += 1; }
  }

  const byIdx = new Map(idx.map((i, k) => [i, scores[k]]));

  // a few of the weaker submissions stopped part-way: there is a score, but the work is
  // unfinished, so they read as הגיש חלקית rather than as a plain fail
  const prand = seeded(seed + 977);
  const partialSet = new Set<number>();
  for (const i of idx) {
    if ((byIdx.get(i) as number) < 70 && prand() < 0.18) partialSet.add(i);
  }

  const results = ROSTER.map<StudentResult>((s, i) => {
    if (!byIdx.has(i)) return { name: s.name, score: null, status: 'none' };
    const score = byIdx.get(i) as number;
    const status: CellStatus = partialSet.has(i) ? 'partial' : score >= 60 ? 'pass' : 'fail';
    return { name: s.name, score, status };
  });

  return {
    ...p,
    submitted,
    passed: results.filter((r) => r.status === 'pass').length,
    partial: results.filter((r) => r.status === 'partial').length,
    results,
  };
}

export const ASSESSMENT_REVIEWS: AssessmentReviewData[] =
  RECENT_PRACTICES.map((p, i) => buildResults(p, i * 104729 + 7));

/* ---------- the questions inside one assessment, for the סקירת הערכה drill-in ---------- */

// prompt / answers are written out; every number below is derived from the assessment the
// question belongs to, so a question can never disagree with its own headline card.
// `avg` pins a question's class average when the demo needs a specific one; without it the
// average is derived from the assessment it belongs to.
type QuestionSeed = { prompt: string; right: string; wrong: string; avg?: number };

// one line of the replayed conversation, same shape as the student app's summary turns
export type AnswerTurn = { from: 'student' | 'alfi'; text: string; tone?: 'ok' | 'hint' };
export type QuestionAnswer = { name: string; score: number; text: string; correct: boolean; turns: AnswerTurn[] };
export type Difficulty = 'קל' | 'בינוני' | 'קשה';
export type ReviewQuestion = {
  prompt: string;
  difficulty: Difficulty;
  avgScore: number;
  submissionRate: number;
  answers: QuestionAnswer[];
};

const QUESTION_BANK: Record<string, QuestionSeed[]> = {
  'קדם אנליזה - פולינום': [
    {
      // the warm-up of the practice: almost everyone got it, so its bar clears the 60 line
      prompt: 'גזור את הפונקציה f(x) = 4x³ − 2x + 7.',
      avg: 85,
      right: "גוזרים איבר איבר לפי חוק החזקה:\n(4x³)′ = 12x²\n(−2x)′ = −2\nהמספר החופשי 7 נגזר לאפס\nלכן f′(x) = 12x² − 2",
      wrong: "f′(x) = 12x² − 2 + 7\nהשארתי את המספר החופשי בנגזרת",
    },
    {
      prompt: 'נתונה הפונקציה f(x) = x³ − 6x² + 9x + 2.\nא. מצא את נקודות הקיצון של הפונקציה.\nב. קבע את סוג כל נקודת קיצון.',
      right: "נגזור: f′(x) = 3x² − 12x + 9\nנשווה לאפס: 3x² − 12x + 9 = 0 ⟵ x² − 4x + 3 = 0\nלפי נוסחת השורשים: x = 1, x = 3\nנציב: f(1) = 1 − 6 + 9 + 2 = 6\nf(3) = 27 − 54 + 27 + 2 = 2\nהנגזרת חיובית לפני x = 1 ושלילית אחריה ⟵ (1, 6) מקסימום\nהנגזרת שלילית לפני x = 3 וחיובית אחריה ⟵ (3, 2) מינימום",
      wrong: "נגזור: f′(x) = 3x² − 12x + 9\nהשורשים הם x = 1 ו-x = 3\nהצבתי וקיבלתי f(1) = 6 ו-f(3) = 2\nכתבתי ששניהם מינימום כי שניהם יצאו חיוביים",
    },
    {
      prompt: 'לפניכם גרף של פונקציה f(x) המוגדרת לכל x.\nא. מצא את ערכי x שבהם f′(x) = 0.\nב. מצא את התחום שבו f′(x) > 0.\nג. מצא את התחום שבו f′(x) < 0.',
      right: 'א. הנגזרת מתאפסת בנקודות הקיצון של הגרף, כלומר ב-x = −2 וב-x = 2\nב. הפונקציה עולה משמאל ל-x = −2 ומימין ל-x = 2,\nולכן f′(x) > 0 עבור x < −2 וגם עבור x > 2\nג. בין שתי הנקודות הפונקציה יורדת,\nולכן f′(x) < 0 עבור −2 < x < 2',
      wrong: 'א. הנגזרת מתאפסת ב-x = −2 וב-x = 2\nב. הפונקציה עולה בין −2 ל-2\nג. לא הספקתי לסמן את התחום השלישי',
    },
    {
      prompt: 'גזור את הפונקציות הבאות:\nא. y = −4x⁵ + 6x³ − x\nב. y = x⁶/2 − 3x⁴ + 5x² − 9',
      right: "א. גוזרים איבר איבר לפי חוק החזקה:\n(−4x⁵)′ = −20x⁴, (6x³)′ = 18x², (−x)′ = −1\nלכן y′ = −20x⁴ + 18x² − 1\nב. (x⁶/2)′ = 3x⁵, (−3x⁴)′ = −12x³, (5x²)′ = 10x\nהמספר החופשי −9 נגזר לאפס\nלכן y′ = 3x⁵ − 12x³ + 10x",
      wrong: "א. y′ = −20x⁴ + 18x² − 1\nב. y′ = 3x⁵ − 12x³ + 10x − 9\nהשארתי את המספר החופשי בנגזרת",
    },
  ],
  'מרחק בין נקודות': [
    {
      prompt: 'נתונות הנקודות A(2, 5) ו-B(−3, 1). חשב את המרחק AB.',
      right: 'נשתמש בנוסחת המרחק בין שתי נקודות:\nAB = √((x₂−x₁)² + (y₂−y₁)²)\nהפרש ה-x: 2 − (−3) = 5\nהפרש ה-y: 5 − 1 = 4\nAB = √(25 + 16) = √41 ≈ 6.4',
      wrong: 'AB = √(5² − 4²)\nAB = √9 = 3\nחיסרתי במקום לחבר',
    },
    {
      prompt: 'נתונות הנקודות P(0, −4) ו-Q(6, 4). מצא את אמצע הקטע PQ ואת אורכו.',
      right: 'אמצע הקטע: ((0+6)/2, (−4+4)/2) = (3, 0)\nהאורך לפי נוסחת המרחק:\nהפרש ה-x: 6, הפרש ה-y: 8\nPQ = √(36 + 64) = √100 = 10',
      wrong: 'אמצע הקטע: (3, 0)\nהאורך: 6 + 8 = 14\nחיברתי את ההפרשים במקום להשתמש בנוסחה',
    },
    {
      prompt: 'הנקודות A(1, 2), B(5, 2), C(5, 7) הן קודקודי משולש.\nהוכח שהמשולש ישר זווית וחשב את שטחו.',
      right: 'ל-A ול-B אותו y, לכן AB מקביל לציר ה-x\nל-B ול-C אותו x, לכן BC מקביל לציר ה-y\nשני הישרים מאונכים, ולכן הזווית ב-B ישרה\nAB = 5 − 1 = 4, BC = 7 − 2 = 5\nשטח משולש ישר זווית: S = 4·5/2 = 10',
      wrong: 'AB = 4, BC = 5, AC = 6.4\nהזווית ב-B ישרה\nS = 4·5 = 20\nשכחתי לחלק בשתיים',
    },
    {
      prompt: 'מצא את הנקודה על ציר ה-x שמרחקה מ-A(3, 4) שווה ל-5.',
      right: 'נקודה על ציר ה-x היא מהצורה (x, 0)\nלפי נוסחת המרחק: (x−3)² + (0−4)² = 5²\n(x−3)² + 16 = 25\n(x−3)² = 9 ⟵ x − 3 = ±3\nx = 0 או x = 6, כלומר (0, 0) ו-(6, 0)',
      wrong: '(x−3)² + 4² = 5\n(x−3)² = −11\nלא הצלחתי להמשיך מכאן',
    },
  ],
  'גאומטריה בדיקה': [
    {
      prompt: 'במשולש ABC נתון AB = AC.\nהוכח שזוויות הבסיס שוות.',
      right: 'נוריד את התיכון AD לבסיס BC\nבמשולשים ABD ו-ACD:\nAB = AC (נתון)\nBD = DC (AD תיכון)\nAD צלע משותפת\nלכן המשולשים חופפים לפי צ.צ.צ\nמכאן ∠B = ∠C כזוויות מתאימות במשולשים חופפים',
      wrong: 'המשולש שווה שוקיים\nולכן הזוויות שוות\nלא הוספתי הוכחה',
    },
    {
      prompt: 'במקבילית ABCD האלכסונים נחתכים בנקודה M.\nהוכח ש-AM = MC.',
      right: 'AB ∥ DC כי במקבילית הצלעות הנגדיות מקבילות\n∠BAM = ∠DCM כזוויות מתחלפות\n∠ABM = ∠CDM כזוויות מתחלפות\nAB = DC כי במקבילית הצלעות הנגדיות שוות\nלכן המשולשים ABM ו-CDM חופפים לפי ז.צ.ז\nמכאן AM = MC',
      wrong: 'האלכסונים במקבילית שווים\nולכן AM = MC\nהשתמשתי בתכונה של מלבן ולא של מקבילית',
    },
    {
      prompt: 'נתון מעגל שרדיוסו 6 ס״מ.\nחשב את אורך הקשת המתאימה לזווית מרכזית של 60°.',
      right: 'היקף המעגל: 2πr = 2π·6 = 12π\nהקשת היא החלק היחסי של ההיקף לפי הזווית:\n60/360 = 1/6\nאורך הקשת = 12π · 1/6 = 2π\n2π ≈ 6.28 ס״מ',
      wrong: 'הקשת = 60/360 · 6 = 1 ס״מ\nהכפלתי ברדיוס במקום בהיקף',
    },
    {
      prompt: 'בטרפז ישר זווית ABCD נתון AB ∥ DC, AB = 10, DC = 6, והאנך AD = 4.\nחשב את שטח הטרפז.',
      right: 'שטח טרפז: S = (סכום הבסיסים) · הגובה / 2\nהבסיסים הם AB = 10 ו-DC = 6\nהגובה הוא האנך AD = 4\nS = (10 + 6)·4/2\nS = 16·4/2 = 32',
      wrong: 'S = 10·6/2 = 30\nהכפלתי את שני הבסיסים במקום לחבר אותם',
    },
  ],
  'אנליטית 2': [
    {
      prompt: 'מצא את משוואת הישר העובר דרך A(1, 3) ו-B(5, 11).',
      right: 'שיפוע: m = (y₂−y₁)/(x₂−x₁) = (11−3)/(5−1)\nm = 8/4 = 2\nנציב בנוסחת הישר דרך נקודה:\ny − 3 = 2(x − 1)\ny − 3 = 2x − 2\ny = 2x + 1',
      wrong: 'm = (11−3)/(5−1) = 2\ny = 2x + 3\nהצבתי את ה-y של הנקודה במקום לחשב את החותך',
    },
    {
      prompt: 'נתון הישר y = 2x − 7.\nמצא את משוואת הישר המקביל לו העובר דרך (0, 4).',
      right: 'ישרים מקבילים ⟵ אותו שיפוע\nהשיפוע של הישר הנתון הוא m = 2\nהנקודה (0, 4) נמצאת על ציר ה-y, ולכן היא החותך\nb = 4\nמשוואת הישר: y = 2x + 4',
      wrong: 'y = −0.5x + 4\nלקחתי שיפוע מאונך במקום מקביל',
    },
    {
      prompt: 'מצא את נקודת החיתוך של הישרים y = 3x − 1 ו-y = −x + 7.',
      right: 'בנקודת החיתוך ערכי ה-y שווים:\n3x − 1 = −x + 7\n3x + x = 7 + 1\n4x = 8 ⟵ x = 2\nנציב באחד הישרים: y = 3·2 − 1 = 5\nנקודת החיתוך היא (2, 5)',
      wrong: '3x − 1 = −x + 7\n2x = 8\nx = 4\nהעברתי את ה-x לא נכון',
    },
    {
      prompt: 'נתון הישר 2x + 3y = 12.\nמצא את שיפועו ואת נקודות החיתוך עם הצירים.',
      right: 'נבודד את y: 3y = −2x + 12\ny = −(2/3)x + 4\nהשיפוע הוא m = −2/3\nחיתוך עם ציר y: נציב x = 0 ⟵ (0, 4)\nחיתוך עם ציר x: נציב y = 0 ⟵ 2x = 12 ⟵ (6, 0)',
      wrong: 'm = 2/3\nחיתוכים: (0, 12) ו-(6, 0)\nשכחתי את הסימן ולא חילקתי ב-3',
    },
  ],
  'גרף': [
    {
      prompt: 'שרטט את גרף הפונקציה y = x² − 4x + 3\nוסמן את נקודות החיתוך עם הצירים.',
      right: 'חיתוך עם ציר x: x² − 4x + 3 = 0\n(x−1)(x−3) = 0 ⟵ (1, 0) ו-(3, 0)\nחיתוך עם ציר y: נציב x = 0 ⟵ (0, 3)\nקודקוד: x = −b/2a = 4/2 = 2\ny = 4 − 8 + 3 = −1 ⟵ הקודקוד הוא (2, −1)\nהפרבולה פתוחה כלפי מעלה כי a > 0',
      wrong: 'חיתוך עם ציר x: (1, 0) ו-(3, 0)\nקודקוד: (2, 1)\nטעיתי בסימן של ה-y בקודקוד',
    },
    {
      prompt: 'לפניכם גרף של פונקציה.\nקבע באילו תחומים הפונקציה עולה ובאילו יורדת.',
      right: 'נקודות הקיצון בגרף הן ב-x = −1 וב-x = 3\nמשמאל ל-x = −1 הגרף מטפס ⟵ עולה\nבין −1 ל-3 הגרף יורד\nמימין ל-x = 3 הגרף מטפס שוב ⟵ עולה\nלסיכום: עולה עבור x < −1 וגם x > 3, יורדת עבור −1 < x < 3',
      wrong: 'עולה עבור x > 0\nיורדת עבור x < 0\nהסתכלתי רק על הצד הימני של הגרף',
    },
    {
      prompt: 'נתונה הפונקציה y = 1/x.\nתאר את האסימפטוטות שלה.',
      right: 'תחום ההגדרה הוא כל x חוץ מ-0\nכאשר x שואף ל-0 הערך שואף לאינסוף,\nולכן x = 0 אסימפטוטה אנכית\nכאשר x שואף לאינסוף הערך שואף ל-0,\nולכן y = 0 אסימפטוטה אופקית',
      wrong: 'אסימפטוטה אנכית y = 0\nהחלפתי בין הצירים',
    },
    {
      prompt: 'התאם בין כל גרף לפונקציה המתאימה לו\nוהסבר את בחירתך.',
      right: 'הפרבולה מתאימה לפונקציה הריבועית,\nכי יש לה קודקוד אחד ושתי נקודות חיתוך עם ציר x\nהישר מתאים לפונקציה הלינארית, כי הוא בעל שיפוע קבוע\nההיפרבולה מתאימה ל-1/x, כי יש לה שתי אסימפטוטות\nוהיא לא מוגדרת ב-x = 0',
      wrong: 'התאמתי לפי הצורה של כל גרף\nלא הוספתי הסבר',
    },
  ],
};

// Alfi's coaching lines are deliberately general — the same three the student app keeps in
// ALFI_REPLIES. What makes a conversation specific is the student's own work in it.
const ALFI_HINTS = [
  'התחלה טובה. חסר השלב האחרון — חזור לנתונים ובדוק מה עוד אפשר להסיק מהם.',
  'כיוון נכון! נסה לפרק את הפתרון לשלבים קטנים ולכתוב כל שלב בשורה משלו.',
  'כמעט. עבור שוב על החישוב האחרון — משהו שם לא מסתדר עם מה שכתבת קודם.',
];
const ALFI_OK = 'יפה מאוד — הפתרון נכון ומסודר.';
const ALFI_FIXED = 'בדיוק. עכשיו התשובה מלאה.';

// The whole exchange behind one answer: what the student wrote, what Alfi said back, and —
// when the student came back for another go — the corrected answer that closed it.
function buildTurns(text: string, right: string, score: number, i: number): AnswerTurn[] {
  const turns: AnswerTurn[] = [{ from: 'student', text }];
  if (score >= 60) {
    turns.push({ from: 'alfi', text: ALFI_OK, tone: 'ok' });
    return turns;
  }
  turns.push({ from: 'alfi', text: ALFI_HINTS[i % ALFI_HINTS.length], tone: 'hint' });
  // a student who was close tried again; one who was far off left it there
  if (score >= 40) {
    turns.push({ from: 'student', text: right });
    turns.push({ from: 'alfi', text: ALFI_FIXED, tone: 'ok' });
  }
  return turns;
}

const difficultyOf = (avg: number): Difficulty =>
  (avg < 55 ? 'קשה' : avg < 70 ? 'בינוני' : 'קל');

// Students drop off towards the end of an assessment, and each question sits around the
// assessment's own average — so the per-question numbers always tell the same story as the
// four cards at the top of the screen.
function buildQuestions(a: AssessmentReviewData, seed: number): ReviewQuestion[] {
  const bank = QUESTION_BANK[a.title] ?? [];
  const rand = seeded(seed);
  const submitters = a.results.filter((r) => r.status !== 'none');
  return bank.map((q, i) => {
    const dropOff = a.submissionRate >= 100 ? 3 : 7;
    const submissionRate = Math.max(0, a.submissionRate - i * dropOff);
    // draw the wobble either way, so pinning one question's average does not shift the
    // random sequence — and every other question keeps the number it already had
    const drift = (rand() - 0.5) * 22;
    const avgScore = q.avg ?? clamp(a.avgScore + drift);
    const count = Math.round((submissionRate * CLASS_SIZE) / 100);
    // a student's mark on one question tracks their own level, moved by however much this
    // question sat above or below the assessment as a whole — so the answers actually
    // average out around the number on the card
    const shift = avgScore - a.avgScore;
    const answers = submitters.slice(0, count).map<QuestionAnswer>((r, k) => {
      const score = clamp((r.score as number) + shift + (rand() - 0.5) * 18);
      const text = score >= 60 ? q.right : q.wrong;
      return { name: r.name, score, text, correct: score >= 60, turns: buildTurns(text, q.right, score, k) };
    });
    return { prompt: q.prompt, difficulty: difficultyOf(avgScore), avgScore, submissionRate, answers };
  });
}

export const ASSESSMENT_QUESTIONS: ReviewQuestion[][] =
  ASSESSMENT_REVIEWS.map((a, i) => buildQuestions(a, i * 15485863 + 101));

/* ---------- the state right after an assessment goes out: sent, nobody answered yet ---------- */

export function blankAssessment(a: AssessmentReviewData): AssessmentReviewData {
  return {
    ...a,
    avgScore: 0,
    submissionRate: 0,
    submitted: 0,
    passed: 0,
    partial: 0,
    results: a.results.map((r) => ({ name: r.name, score: null, status: 'none' })),
  };
}

export function blankQuestions(questions: ReviewQuestion[]): ReviewQuestion[] {
  return questions.map((q) => ({ ...q, avgScore: 0, submissionRate: 0, answers: [] }));
}

/* ---------- כל ההערכות: everything the class was ever given, plus what is queued ---------- */

// 'scheduled' has not opened to the students yet, 'open' is running now, 'ended' is closed.
export type AssessmentState = 'scheduled' | 'open' | 'ended';

export type ClassAssessment = {
  id: string;
  title: string;
  kind: Kind;
  unit: string;
  topic: string;
  subTopic: string;
  tags: string[];
  opensOn: string;
  state: AssessmentState;
  // which סקירת הערכה this row drills into. Only the five newest have a question bank of
  // their own; the older ones borrow one so every row still opens a full review.
  reviewIndex: number;
  submitted: number;
  avgScore: number | null;
};

export const UNITS = ['5 יח"ל', '4 יח"ל'];
export const ASSESSMENT_TAGS = ['שיעורי בית', 'הכנה למבחן', 'חזרה', 'העשרה', 'תרגול כיתה'];

// title / unit / topic / subTopic / tags for each column of the מצב תלמידים table, in the
// same order — date and kind come from STATUS_ASSESSMENTS so the two screens agree.
const ASSESSMENT_META: { unit: string; topic: string; subTopic: string; tags: string[] }[] = [
  { unit: '5 יח"ל', topic: 'אלגברה', subTopic: 'משוואות ריבועיות', tags: ['שיעורי בית'] },
  { unit: '5 יח"ל', topic: 'אלגברה', subTopic: 'פרבולה', tags: ['שיעורי בית', 'חזרה'] },
  { unit: '5 יח"ל', topic: 'אלגברה', subTopic: 'משוואות ואי-שוויונות', tags: ['הכנה למבחן'] },
  { unit: '5 יח"ל', topic: 'סדרות', subTopic: 'סדרה חשבונית', tags: ['שיעורי בית'] },
  { unit: '5 יח"ל', topic: 'סדרות', subTopic: 'סדרה הנדסית', tags: ['שיעורי בית'] },
  { unit: '5 יח"ל', topic: 'סדרות', subTopic: 'סכום סדרה', tags: ['הכנה למבחן'] },
  { unit: '4 יח"ל', topic: 'טריגונומטריה', subTopic: 'משולש ישר זווית', tags: ['תרגול כיתה'] },
  { unit: '5 יח"ל', topic: 'אנליזה', subTopic: 'פולינום ונגזרות', tags: ['שיעורי בית', 'הכנה למבחן'] },
  { unit: '5 יח"ל', topic: 'גאומטריה אנליטית', subTopic: 'מרחק בין נקודות', tags: ['תרגול כיתה'] },
  { unit: '4 יח"ל', topic: 'גאומטריה', subTopic: 'מרובעים ומעגל', tags: ['הכנה למבחן'] },
  { unit: '5 יח"ל', topic: 'גאומטריה אנליטית', subTopic: 'משוואת הישר', tags: ['שיעורי בית'] },
  { unit: '5 יח"ל', topic: 'אנליזה', subTopic: 'חקירת פונקציה', tags: ['חזרה', 'העשרה'] },
];

// the demo is anchored on 26/08/26 — everything up to it has run, and three more are queued
const SCHEDULED: ClassAssessment[] = [
  {
    id: 's1', title: 'חקירת פונקציה רציונלית', kind: 'תרגול',
    unit: '5 יח"ל', topic: 'אנליזה', subTopic: 'חקירת פונקציה', tags: ['שיעורי בית'],
    opensOn: '30/08/26', state: 'scheduled', reviewIndex: 4, submitted: 0, avgScore: null,
  },
  {
    id: 's2', title: 'בוחן סיכום - אנליזה', kind: 'בוחן',
    unit: '5 יח"ל', topic: 'אנליזה', subTopic: 'פולינום ונגזרות', tags: ['הכנה למבחן'],
    opensOn: '02/09/26', state: 'scheduled', reviewIndex: 0, submitted: 0, avgScore: null,
  },
  {
    id: 's3', title: 'חזרה לקראת מתכונת', kind: 'תרגול',
    unit: '5 יח"ל', topic: 'חזרה כללית', subTopic: 'מעורב', tags: ['חזרה', 'הכנה למבחן'],
    opensOn: '06/09/26', state: 'scheduled', reviewIndex: 3, submitted: 0, avgScore: null,
  },
];

const yearly = (ddmm: string) => `${ddmm}/26`;

const PAST: ClassAssessment[] = STATUS_ASSESSMENTS.map((a, i) => {
  const meta = ASSESSMENT_META[i];
  // the five newest are the ones the dashboard already reports on — take their headline
  // numbers straight from there; the rest are counted off the מצב תלמידים column
  const recent = RECENT_PRACTICES.findIndex((p) => p.sentOn === yearly(a.date));
  const column = STUDENT_STATUS.map((row) => row.cells[i]);
  const handedIn = column.filter((c) => c.status !== 'none');
  const scores = handedIn.map((c) => c.score as number).filter((s) => s !== null);
  return {
    id: `a${i}`,
    title: a.title,
    kind: a.kind,
    unit: meta.unit,
    topic: meta.topic,
    subTopic: meta.subTopic,
    tags: meta.tags,
    opensOn: yearly(a.date),
    // the newest two are still taking submissions; everything older has closed
    state: i >= STATUS_ASSESSMENTS.length - 2 ? 'open' : 'ended',
    reviewIndex: recent >= 0 ? recent : i % RECENT_PRACTICES.length,
    submitted: recent >= 0 ? ASSESSMENT_REVIEWS[recent].submitted : handedIn.length,
    avgScore: recent >= 0
      ? ASSESSMENT_REVIEWS[recent].avgScore
      : Math.round(scores.reduce((x, y) => x + y, 0) / scores.length),
  };
});

// newest first, and anything still queued sits above everything that has already opened
export const CLASS_ASSESSMENTS: ClassAssessment[] = [...SCHEDULED].reverse().concat([...PAST].reverse());

/* ---------- the question library: the pool a task is built from ---------- */

export const QUESTION_TAGS = ['בגרות', 'חובה', 'העשרה', 'הוכחה', 'שאלה קצרה'];

export type LibraryQuestion = {
  id: string;
  prompt: string;
  difficulty: Difficulty;
  unit: string;
  topic: string;
  subTopic: string;
  tags: string[];
  // which assessments this question already went out in — empty means never used
  usedIn: string[];
};

// Everything the class has already been asked, carried over from the assessments it ran in,
// so "used before" is a fact rather than a flag someone has to maintain.
const USED: LibraryQuestion[] = RECENT_PRACTICES.flatMap((p, pi) => {
  const metaIndex = STATUS_ASSESSMENTS.findIndex((a) => `${a.date}/26` === p.sentOn);
  const meta = ASSESSMENT_META[metaIndex];
  return ASSESSMENT_QUESTIONS[pi].map((q, qi) => ({
    id: `u${pi}-${qi}`,
    prompt: q.prompt,
    difficulty: q.difficulty,
    unit: meta.unit,
    topic: meta.topic,
    subTopic: meta.subTopic,
    tags: [QUESTION_TAGS[(pi + qi) % QUESTION_TAGS.length]],
    usedIn: [p.title],
  }));
});

// Written and never sent — what a teacher browses for when she wants something new.
const FRESH: LibraryQuestion[] = [
  {
    id: 'n1', prompt: 'נתונה הפונקציה f(x) = x⁴ − 8x² + 7.\nא. מצא את נקודות הקיצון.\nב. קבע את סוג כל נקודת קיצון.',
    difficulty: 'קשה', unit: '5 יח"ל', topic: 'אנליזה', subTopic: 'פולינום ונגזרות', tags: ['בגרות'], usedIn: [],
  },
  {
    id: 'n2', prompt: 'גזור את הפונקציה f(x) = (2x + 1)(x − 3).',
    difficulty: 'קל', unit: '5 יח"ל', topic: 'אנליזה', subTopic: 'פולינום ונגזרות', tags: ['שאלה קצרה', 'חובה'], usedIn: [],
  },
  {
    id: 'n3', prompt: 'נתונות הנקודות A(−2, 1), B(4, 9).\nמצא את אורך הקטע AB ואת אמצעו.',
    difficulty: 'קל', unit: '5 יח"ל', topic: 'גאומטריה אנליטית', subTopic: 'מרחק בין נקודות', tags: ['חובה'], usedIn: [],
  },
  {
    id: 'n4', prompt: 'מצא את משוואת המעגל שמרכזו (2, −1) ורדיוסו 5.\nבדוק אם הנקודה (5, 3) נמצאת עליו.',
    difficulty: 'בינוני', unit: '5 יח"ל', topic: 'גאומטריה אנליטית', subTopic: 'מעגל', tags: ['בגרות'], usedIn: [],
  },
  {
    id: 'n5', prompt: 'הוכח שסכום הזוויות במשולש שווה ל-180°.',
    difficulty: 'בינוני', unit: '4 יח"ל', topic: 'גאומטריה', subTopic: 'משולשים', tags: ['הוכחה'], usedIn: [],
  },
  {
    id: 'n6', prompt: 'במקבילית ABCD נתון ∠A = 70°.\nחשב את שאר הזוויות ונמק.',
    difficulty: 'קל', unit: '4 יח"ל', topic: 'גאומטריה', subTopic: 'מרובעים ומעגל', tags: ['שאלה קצרה'], usedIn: [],
  },
  {
    id: 'n7', prompt: 'סדרה חשבונית: a₁ = 4 והפרשה 3.\nמצא את האיבר ה-20 ואת סכום 20 האיברים הראשונים.',
    difficulty: 'בינוני', unit: '5 יח"ל', topic: 'סדרות', subTopic: 'סדרה חשבונית', tags: ['חובה'], usedIn: [],
  },
  {
    id: 'n8', prompt: 'בסדרה הנדסית a₁ = 3 ומנתה 2.\nמצא את סכום 8 האיברים הראשונים.',
    difficulty: 'בינוני', unit: '5 יח"ל', topic: 'סדרות', subTopic: 'סדרה הנדסית', tags: ['בגרות'], usedIn: [],
  },
  {
    id: 'n9', prompt: 'במשולש ישר זווית הניצבים הם 6 ו-8.\nחשב את היתר ואת הזווית שמול הניצב הקטן.',
    difficulty: 'קל', unit: '4 יח"ל', topic: 'טריגונומטריה', subTopic: 'משולש ישר זווית', tags: ['חובה', 'שאלה קצרה'], usedIn: [],
  },
  {
    id: 'n10', prompt: 'הוכח כי בכל מעגל, זווית היקפית שווה למחצית הזווית המרכזית הנשענת על אותה קשת.',
    difficulty: 'קשה', unit: '5 יח"ל', topic: 'גאומטריה', subTopic: 'מרובעים ומעגל', tags: ['הוכחה', 'העשרה'], usedIn: [],
  },
];

export const QUESTION_LIBRARY: LibraryQuestion[] = [...FRESH, ...USED];
