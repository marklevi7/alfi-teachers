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
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import PieChartRounded from '@mui/icons-material/PieChartRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import { FREDOKA } from '../theme';
import { EmptyState } from './EmptyState';
import {
  RECENT_PRACTICES, WEEKLY_ACTIVITY, AT_RISK_STUDENTS, INACTIVE_STUDENTS,
  AT_RISK_MANY, INACTIVE_MANY, CLASS_SIZE, type FlaggedStudent,
} from './mockData';

// The dashboard's demo states, switched from the dev control bar:
// mid — a class mid-semester (the default), empty — a brand new class with nothing sent
// yet, many — a class where the two bottom cards are long lists.
export type MainVariant = 'mid' | 'empty' | 'many';

// Same "hero stat card" pattern the student dashboard uses (Dashboard.tsx): default
// elevation, no `variant`, borderRadius 4, theme.shadows[8].
const heroCardSx = { borderRadius: 2, boxShadow: (t: Theme) => t.shadows[8], height: '100%' } as const;

// One horizontal bar: a full-width track with the fill growing from the inline start
// (right, in RTL), and the value pinned after it.
type BarColor = string | ((t: Theme) => string);

function MetricBar({
  value, barColor, height, showValue = true, tooltip,
}: { value: number; barColor: BarColor; height: number; showValue?: boolean; tooltip?: string }) {
  // no track behind the bar — the fill alone carries the value
  const bar = (
    <Box
      className="bar"
      sx={{
        width: `${value}%`, height, borderRadius: 0.5, bgcolor: barColor,
        transition: (t) => t.transitions.create('opacity'),
      }}
    />
  );
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 1, alignItems: 'center' }}>
      {tooltip ? <Tooltip title={tooltip} placement="top" arrow>{bar}</Tooltip> : bar}
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
function RecentPracticesCard({ empty, onOpen }: { empty: boolean; onOpen: (i: number) => void }) {
  return (
    <Card sx={heroCardSx}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-start" sx={{ mb: 1.5 }}>
          <ShowChartRounded sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600 }}>
            תרגולים אחרונים
          </Typography>
        </Stack>

        {empty ? (
          <Stack sx={{ flexGrow: 1 }} justifyContent="center">
            <EmptyState
              dense
              icon={<ShowChartRounded />}
              title="עוד לא נשלחו תרגולים"
              body="אחרי שתשלחי לכיתה תרגול או מבחן, יופיעו כאן הציון הממוצע ואחוז ההגשה של כל אחד מהם."
            />
          </Stack>
        ) : (
          <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
            {RECENT_PRACTICES.map((p, i) => (
              // the whole row opens סקירת הערכה — same "the card is the button" pattern
              // the student app uses on its task cards (Practice.tsx)
              <ButtonBase
                key={i}
                onClick={() => onOpen(i)}
                aria-label={`סקירת הערכה: ${p.title}, ציון ממוצע ${p.avgScore}, ${p.submissionRate}% הגשה`}
                sx={{
                  display: 'block', width: '100%', textAlign: 'start',
                  borderRadius: 2, px: 1, mx: -1, py: 0.5,
                  transition: (t) => t.transitions.create('background-color'),
                  '&:hover': {
                    // twice MUI's hover weight (selectedOpacity, still a theme token) —
                    // the row is a link to another screen, so it has to read as one
                    bgcolor: (t) => alpha(t.palette.primary.main, t.palette.action.selectedOpacity),
                    '& .go': { opacity: 1 },
                  },
                  // the theme's blue keyboard ring does the rest
                  '&.Mui-focusVisible .go': { opacity: 1 },
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              >
                {/* date leads on the inline start (right), name follows, and the drill-in
                    chevron sits at the far inline end (left) */}
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: -0.25 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.15, flexShrink: 0 }}>
                    {p.sentOn}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.15 }}>
                    {p.title}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  {/* points left = drill in. No dir-icon: it is already the RTL direction. */}
                  <ChevronLeftRounded
                    className="go"
                    sx={{
                      fontSize: 18, color: 'primary.main', opacity: 0, alignSelf: 'center',
                      transition: (t) => t.transitions.create('opacity'),
                    }}
                  />
                </Stack>
                <Stack spacing={0}>
                  <MetricBar value={p.avgScore} barColor={SCORE_COLOR} height={14} tooltip={`ציון ממוצע: ${p.avgScore}`} />
                  <MetricBar
                    value={p.submissionRate}
                    barColor={SUBMISSION_COLOR}
                    height={7}
                    showValue={false}
                    tooltip={`אחוז הגשה: ${p.submissionRate}%`}
                  />
                </Stack>
              </ButtonBase>
            ))}
          </Stack>
        )}

        {/* nothing to explain when there are no bars yet */}
        {!empty && (
        <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
          {PRACTICE_LEGEND.map((l) => (
            <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: l.barColor }} />
              <Typography variant="caption" color="text.secondary">{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityPieCard({ empty }: { empty: boolean }) {
  const { active, inactive } = WEEKLY_ACTIVITY;
  const total = active + inactive;
  const activePct = (active / total) * 360;

  return (
    <Card sx={heroCardSx}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2 } }}>
        {/* same header line as תרגולים אחרונים beside it — identical padding, icon and type,
            so the two titles sit on one line across the pair. The definition of "active"
            hangs under the title, indented past the icon. */}
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PieChartRounded sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600 }}>
              סטטוס פעילות בשבוע האחרון
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            // icon (24) + the row's gap (12), so it starts where the title starts
            sx={{ display: 'block', marginInlineStart: 4.5 }}
          >
            תלמיד פעיל אם ענה על שאלה בשבוע האחרון
          </Typography>
        </Box>

        {empty ? (
          <Stack sx={{ flexGrow: 1 }} justifyContent="center">
            <EmptyState
              dense
              icon={<PieChartRounded />}
              title="אין עדיין נתוני פעילות"
              body={`הפעילות של ${CLASS_SIZE} התלמידים תיספר כאן ברגע שיענו על השאלה הראשונה שלהם.`}
            />
          </Stack>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StudentListPanel({
  students, title, subtitle, columnLabel, valueSuffix, color, emptyTitle, emptyBody,
}: {
  students: FlaggedStudent[]; title: string; subtitle: string; columnLabel: string; valueSuffix: string;
  color: 'error' | 'warning'; emptyTitle: string; emptyBody: string;
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
        {students.length === 0 ? (
          <EmptyState dense icon={<Icon />} title={emptyTitle} body={emptyBody} color={color} />
        ) : (
          // one grid for the header + every row, so the value column lands in the exact
          // same x-position on every line — a real table, not floating text. However long
          // the list gets, the card simply grows and the page scrolls.
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
        )}
      </CardContent>
    </Card>
  );
}

// The internal content of מסך ראשי — everything below the greeting/create-buttons header.
// Replaces the old "תרגולים שנשלחו" card list per the 23 Aug kickoff call. Mid-semester
// demo state per Mark: every card carries realistic numbers from ./mockData, the single
// source of truth other screens should reuse too.
export function MainDashboard({ variant = 'mid', onOpenAssessment }: { variant?: MainVariant; onOpenAssessment: (i: number) => void }) {
  const empty = variant === 'empty';
  const atRisk = empty ? [] : variant === 'many' ? AT_RISK_MANY : AT_RISK_STUDENTS;
  const inactive = empty ? [] : variant === 'many' ? INACTIVE_MANY : INACTIVE_STUDENTS;

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <RecentPracticesCard empty={empty} onOpen={onOpenAssessment} />
        <ActivityPieCard empty={empty} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <StudentListPanel
          students={atRisk}
          title="תלמידים בסיכון"
          subtitle="ממוצע מתחת ל-60"
          columnLabel="ממוצע במבחנים"
          valueSuffix="%"
          color="error"
          emptyTitle="אין תלמידים בסיכון"
          emptyBody="תלמיד שהממוצע שלו יורד מתחת ל-60 יופיע כאן, כדי שתוכלי להגיע אליו בזמן."
        />
        <StudentListPanel
          students={inactive}
          title="תלמידים לא פעילים"
          subtitle="לא נכנסו מעל 5 ימים"
          columnLabel="לא נכנסו כבר"
          valueSuffix=" ימים"
          color="warning"
          emptyTitle="כל התלמידים פעילים"
          emptyBody="תלמיד שלא נכנס לאלפי יותר מ-5 ימים יופיע כאן."
        />
      </Box>
    </Stack>
  );
}
