// Shared mid-semester demo dataset for כיתה י'1 — invented at Mark's explicit request
// ("make up all data as you want, but it needs to be realistic, shared amongst other
// screens"). Every screen that needs class/student numbers should import from here
// instead of inventing its own, so the numbers stay consistent app-wide.

export const CLASS_LABEL = "כיתה י'1";
export const CLASS_SIZE = 26;

export type RecentPractice = { title: string; avgScore: number; submissionRate: number };
export const RECENT_PRACTICES: RecentPractice[] = [
  { title: 'קדם אנליזה - פולינום', avgScore: 58, submissionRate: 65 },
  { title: 'מרחק בין נקודות', avgScore: 69, submissionRate: 77 },
  { title: 'גאומטריה בדיקה', avgScore: 61, submissionRate: 88 },
  { title: 'אנליטית 2', avgScore: 74, submissionRate: 92 },
  { title: 'גרף', avgScore: 82, submissionRate: 100 },
];

export const WEEKLY_ACTIVITY = { active: 19, inactive: 7 };

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

export type MasteryTopic = { topic: string; score: number };
// error <60, warning 60-74, info 75-89, success 90-100 — same semantic tiers as the
// legend (זקוק לשיפור / בסדר / טוב / מצוין), mapped onto MUI's 4 status colors.
export const TOPIC_MASTERY: MasteryTopic[] = [
  { topic: 'גיאומטריה אנליטית', score: 91 },
  { topic: 'גרפים', score: 95 },
  { topic: 'אנליזה', score: 78 },
  { topic: 'מרחק בין נקודות', score: 85 },
  { topic: 'טריגונומטריה', score: 73 },
  { topic: 'הסתברות', score: 68 },
  { topic: 'גאומטריה', score: 55 },
  { topic: 'פולינומים', score: 50 },
];

export function masteryColor(score: number): 'error' | 'warning' | 'info' | 'success' {
  if (score < 60) return 'error';
  if (score < 75) return 'warning';
  if (score < 90) return 'info';
  return 'success';
}

export function masteryLabel(score: number): string {
  const color = masteryColor(score);
  return color === 'error' ? 'זקוק לשיפור' : color === 'warning' ? 'בסדר' : color === 'info' ? 'טוב' : 'מצוין';
}
