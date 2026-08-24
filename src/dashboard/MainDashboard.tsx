import { Fragment } from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import PieChartRounded from '@mui/icons-material/PieChartRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import GridViewRounded from '@mui/icons-material/GridViewRounded';
import { FREDOKA } from '../theme';
import {
  RECENT_PRACTICES, WEEKLY_ACTIVITY, AT_RISK_STUDENTS, INACTIVE_STUDENTS, TOPIC_MASTERY,
  CLASS_LABEL, masteryColor, type FlaggedStudent,
} from './mockData';

// Same "hero stat card" pattern the student dashboard uses (Dashboard.tsx): default
// elevation, no `variant`, borderRadius 4, theme.shadows[8].
const heroCardSx = { borderRadius: 2, boxShadow: (t: Theme) => t.shadows[8], height: '100%' } as const;

// One horizontal bar: a full-width track with the fill growing from the inline start
// (right, in RTL), and the value pinned after it.
type BarColor = string | ((t: Theme) => string);

function MetricBar({
  value, barColor, height, showValue = true,
}: { value: number; barColor: BarColor; height: number; showValue?: boolean }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 1, alignItems: 'center' }}>
      {/* no track behind the bar — the fill alone carries the value */}
      <Box
        className="bar"
        sx={{
          width: `${value}%`, height, borderRadius: 0.5, bgcolor: barColor,
          transition: (t) => t.transitions.create('opacity'),
        }}
      />
      {/* the value column keeps its width either way, so both bars stay the same length */}
      <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 30, textAlign: 'end' }}>
        {showValue ? value : ''}
      </Typography>
    </Box>
  );
}

// submission % is the secondary metric, so it stays a pale tint of the token
const SCORE_COLOR: BarColor = 'primary.main';
const SUBMISSION_COLOR: BarColor = (t: Theme) => alpha(t.palette.info.main, 0.28);
const PRACTICE_LEGEND: { label: string; barColor: BarColor }[] = [
  { label: 'ציון ממוצע', barColor: SCORE_COLOR },
  { label: 'אחוז הגשה', barColor: SUBMISSION_COLOR },
];

// Sideways bars so each practice name gets a full row and never truncates.
function RecentPracticesCard() {
  return (
    <Card sx={heroCardSx}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-start" sx={{ mb: 1.5 }}>
          <ShowChartRounded sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600 }}>
            תרגולים אחרונים
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          {RECENT_PRACTICES.map((p, i) => (
            <Box
              key={i}
              // pending: a per-practice review screen to land on
              sx={{ cursor: 'pointer', '&:hover .bar': { opacity: 0.8 } }}
              role="img"
              aria-label={`${p.title}, ציון ממוצע ${p.avgScore}, ${p.submissionRate}% הגשה`}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                {p.title}
              </Typography>
              <Stack spacing={0}>
                <MetricBar value={p.avgScore} barColor={SCORE_COLOR} height={14} />
                <MetricBar value={p.submissionRate} barColor={SUBMISSION_COLOR} height={7} showValue={false} />
              </Stack>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
          {PRACTICE_LEGEND.map((l) => (
            <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: l.barColor }} />
              <Typography variant="caption" color="text.secondary">{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActivityPieCard() {
  const { active, inactive } = WEEKLY_ACTIVITY;
  const total = active + inactive;
  const activePct = (active / total) * 360;

  return (
    <Card sx={heroCardSx}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-start" sx={{ mb: 3 }}>
          <PieChartRounded sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600 }}>
            סטטוס פעילות בשבוע האחרון
          </Typography>
        </Stack>

        <Stack sx={{ flexGrow: 1 }} alignItems="center" justifyContent="center" spacing={2}>
          <Box
            sx={{
              width: 190, height: 190, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              background: (t) => `conic-gradient(${t.palette.primary.main} 0deg ${activePct}deg, ${alpha(t.palette.text.primary, 0.15)} ${activePct}deg 360deg)`,
            }}
            // clicking the inactive slice goes to מצב התלמידים
          >
            <Box sx={{ width: 142, height: 142, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontWeight: 800 }}>{total}</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">{active} פעילים</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: (t) => alpha(t.palette.text.primary, 0.25) }} />
              <Typography variant="body2" color="text.secondary">{inactive} לא פעילים</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
          תלמיד פעיל אם ענה על שאלה בשבוע האחרון
        </Typography>
      </CardContent>
    </Card>
  );
}

function StudentListPanel({
  students, title, subtitle, columnLabel, valueSuffix, color,
}: {
  students: FlaggedStudent[]; title: string; subtitle: string; columnLabel: string; valueSuffix: string;
  color: 'error' | 'warning';
}) {
  const Icon = color === 'error' ? WarningAmberRounded : AccessTimeRounded;
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        {/* icon, then title+subtitle beside it — same card-header shape as the student
            app's Dashboard cards (icon/Avatar first in DOM, Typography second) */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: (t) => alpha(t.palette[color].main, 0.12), color: `${color}.main`, flexShrink: 0 }}>
            <Icon />
          </Avatar>
          <Stack alignItems="flex-start" spacing={0.25}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
              <Box sx={{
                minWidth: 22, height: 22, px: 0.75, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: (t) => alpha(t.palette[color].main, 0.12), color: `${color}.dark`,
              }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{students.length}</Typography>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {/* one grid for the header + every row, so the value column lands in the exact
            same x-position on every line — a real table, not floating text */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 1.5, rowGap: 1.5, alignItems: 'center' }}>
          <Box />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {columnLabel}
          </Typography>
          {students.map((s) => (
            <Fragment key={s.name}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: `${color}.dark`, textAlign: 'end' }}>
                {s.value}{valueSuffix}
              </Typography>
            </Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function MasteryHeatmap() {
  const LEGEND: { label: string; color: 'error' | 'warning' | 'info' | 'success' }[] = [
    { label: 'זקוק לשיפור', color: 'error' },
    { label: 'בסדר', color: 'warning' },
    { label: 'טוב', color: 'info' },
    { label: 'מצוין', color: 'success' },
  ];
  return (
    <Card sx={heroCardSx}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-start" sx={{ mb: 3 }}>
          <GridViewRounded sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600 }}>
            מפת שליטה — {CLASS_LABEL}, מתמטיקה
          </Typography>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          {TOPIC_MASTERY.map((t) => {
            const color = masteryColor(t.score);
            return (
              <Box
                key={t.topic}
                sx={{
                  borderRadius: 3, p: 2.5, minHeight: 96, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 0.5,
                  bgcolor: (th) => alpha(th.palette[color].main, 0.14),
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: `${color}.dark` }}>{t.topic}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: `${color}.dark` }}>{t.score}%</Typography>
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 3 }}>
          {LEGEND.map((l) => (
            <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: `${l.color}.main` }} />
              <Typography variant="caption" color="text.secondary">{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// The internal content of מסך ראשי — everything below the greeting/create-buttons header.
// Replaces the old "תרגולים שנשלחו" card list per the 23 Aug kickoff call. Mid-semester
// demo state per Mark: every card carries realistic numbers from ./mockData, the single
// source of truth other screens should reuse too.
export function MainDashboard() {
  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <RecentPracticesCard />
        <ActivityPieCard />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <StudentListPanel
          students={AT_RISK_STUDENTS}
          title="תלמידים בסיכון"
          subtitle="ממוצע מתחת ל-60"
          columnLabel="ממוצע במבחנים"
          valueSuffix="%"
          color="error"
        />
        <StudentListPanel
          students={INACTIVE_STUDENTS}
          title="תלמידים לא פעילים"
          subtitle="לא נכנסו מעל 5 ימים"
          columnLabel="לא נכנסו כבר"
          valueSuffix=" ימים"
          color="warning"
        />
      </Box>

      <MasteryHeatmap />
    </Stack>
  );
}
