import { useState, useRef, type ReactNode } from 'react';
import { lighten, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { AlfiAvatar } from '../components/AlfiAvatar';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import { blue, deepPurple } from '@mui/material/colors';
import { FREDOKA } from '../theme';
import { ScoreDot, statusBorder } from './ScoreDot';
import { KindIcon } from './KindIcon';
import { PageHeader, TaskTitle } from './PageHeader';
import { QNumber } from './QNumber';
import { LabeledPill, DifficultyPill } from './Pills';
import { ClampedText } from './ClampedText';
import { EmptyState } from './EmptyState';
import {
  CLASS_SIZE, ASSESSMENT_REVIEWS, ASSESSMENT_QUESTIONS, blankAssessment, blankQuestions,
  type StudentResult, type ReviewQuestion, type QuestionAnswer, type AnswerTurn,
} from './mockData';

// The header is sticky for vertical scroll, so it must be fully opaque or rows show
// through it — the same solid mix מצב תלמידים uses.
const HEADER_BG = (t: Theme) => lighten(t.palette.primary.main, 0.94);

const RESULT_LABEL: Record<StudentResult['status'], string> = {
  pass: 'עובר',
  partial: 'הגיש חלקית',
  fail: 'לא עובר',
  none: 'לא הגיש',
};

// worst first when sorting by status, so whoever needs attention rises to the top
const STATUS_RANK: Record<StudentResult['status'], number> = { none: 0, fail: 1, partial: 2, pass: 3 };

type SortKey = 'name' | 'score' | 'status';
// Every column starts at the inline start (the RIGHT, in RTL) — header and cells alike, so
// the alignment is plain to see. No align="right" either: stylis-plugin-rtl mirrors
// text-align, which would push the header to the far side of its own column. Inherited
// alignment is already RTL-correct.
const SORT_COLUMNS: { key: SortKey; label: string; width?: number }[] = [
  { key: 'name', label: 'שם תלמיד' },
  { key: 'score', label: 'ציון', width: 100 },
  { key: 'status', label: 'סטטוס', width: 140 },
];

// a student who did not hand in has no score, so they sort below every real grade
const compareBy = (key: SortKey, a: StudentResult, b: StudentResult) => {
  if (key === 'name') return a.name.localeCompare(b.name, 'he');
  if (key === 'status') return STATUS_RANK[a.status] - STATUS_RANK[b.status];
  return (a.score ?? -1) - (b.score ?? -1);
};

// the student app's GradePill, saying which grade it is — a dash until anything is measured
function AveragePill({ value }: { value: number | null }) {
  return <LabeledPill label="ציון ממוצע" value={value ?? '—'} />;
}

// One headline number. Same card-header shape as the dashboard's bottom panels: the
// rounded icon tile first in the DOM (right, in RTL), the text beside it.
// One tone per tile, so four headline numbers never read as one block. No 'success' here
// on purpose: the shared theme's success is teal, and green in this app means `primary`.
type TileTone = 'primary' | 'info' | 'purple' | 'warning' | 'error';
const TILE_COLOR: Record<TileTone, (t: Theme) => string> = {
  primary: (t) => t.palette.primary.main,
  info: (t) => t.palette.info.main,
  purple: () => deepPurple[500],
  warning: (t) => t.palette.warning.main,
  error: (t) => t.palette.error.main,
};

function StatTile({ icon, value, label, color }: {
  icon: ReactNode; value: string; label: string; color: TileTone;
}) {
  const tone = TILE_COLOR[color];
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: (t) => alpha(tone(t), 0.12), color: tone, flexShrink: 0 }}>
            {icon}
          </Avatar>
          <Stack alignItems="flex-start" spacing={0.25}>
            <Typography variant="h5" sx={{ ...FREDOKA, fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{label}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    // padding, not margin: the page Stack owns the gap between children, so padding is
    // what actually doubles the air above a new section
    <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600, color: 'text.secondary', pt: 3 }}>
      {children}
    </Typography>
  );
}

const cardSx = { borderRadius: 2, height: '100%' } as const;

/* ---------- ניתוח תרגול: how the class split, and how each question went ---------- */

type Slice = { label: string; value: number; color: (t: Theme) => string };

// Drawn as real arcs rather than one conic-gradient, so every slice is an element of its
// own that can carry a tooltip. Geometry matches the dashboard donut: 180 across, 24 thick.
const DONUT_R = 78;
const DONUT_STROKE = 24;
const DONUT_C = 2 * Math.PI * DONUT_R;
const DONUT_VIEWBOX = 180;

/**
 * One arc of the donut. Every arc is the same full circle as far as the DOM is concerned,
 * so a tooltip anchored to the element itself would land in the same spot for all four.
 * The popper is anchored to a point instead — the middle of this arc — worked out from the
 * circle's own on-screen box, so it follows the sector wherever the card sits.
 */
function DonutSlice({ slice, total, start, len }: { slice: Slice; total: number; start: number; len: number }) {
  const theme = useTheme();
  const ref = useRef<SVGCircleElement | null>(null);
  const midAngle = ((start + len / 2) / DONUT_C) * 2 * Math.PI;
  const anchor = {
    getBoundingClientRect: () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return new DOMRect(0, 0, 0, 0);
      const scale = r.width / DONUT_VIEWBOX;
      const x = r.left + r.width / 2 + DONUT_R * scale * Math.sin(midAngle);
      const y = r.top + r.height / 2 - DONUT_R * scale * Math.cos(midAngle);
      return new DOMRect(x, y, 0, 0);
    },
  };
  return (
    <Tooltip
      title={`${slice.label}: ${slice.value} (${Math.round((slice.value / total) * 100)}%)`}
      placement="top"
      arrow
      PopperProps={{ anchorEl: anchor }}
    >
      <circle
        ref={ref}
        cx={90}
        cy={90}
        r={DONUT_R}
        fill="none"
        strokeWidth={DONUT_STROKE}
        stroke={slice.color(theme)}
        strokeDasharray={`${len} ${DONUT_C - len}`}
        strokeDashoffset={-start}
      />
    </Tooltip>
  );
}

function ClassStatusCard({ slices, total }: { slices: Slice[]; total: number }) {
  let offset = 0;
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent>
        <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600, mb: 2 }}>סטטוס כיתה</Typography>
        <Stack alignItems="center" spacing={2}>
          <Box sx={{ position: 'relative', width: 180, height: 180 }}>
            <Box component="svg" viewBox="0 0 180 180" sx={{ width: 180, height: 180 }}>
              {/* start at twelve o'clock and run clockwise, like the dashboard donut */}
              <g transform="rotate(-90 90 90)">
                {slices.map((s) => {
                  const len = (s.value / total) * DONUT_C;
                  const start = offset;
                  offset += len;
                  return <DonutSlice key={s.label} slice={s} total={total} start={start} len={len} />;
                })}
              </g>
            </Box>
            {/* the hole: text only, never in the way of a slice's hover */}
            <Box
              sx={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              }}
            >
              <Typography variant="h5" sx={{ ...FREDOKA, fontWeight: 800, lineHeight: 1.1 }}>{total}</Typography>
              <Typography variant="caption" color="text.secondary">תלמידים</Typography>
            </Box>
          </Box>
          {/* one grid so every count and percentage lines up down the column */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', columnGap: 1, rowGap: 1, alignItems: 'center', width: '100%' }}>
            {slices.map((s) => (
              <Box key={s.label} sx={{ display: 'contents' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {s.value} ({Math.round((s.value / total) * 100)}%)
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const GRID_LINES = [100, 75, 50, 25, 0];
// the pass mark, drawn across the plot as a dashed rule
const PASS_MARK = 60;

function QuestionChartCard({ questions, empty }: { questions: ReviewQuestion[]; empty: boolean }) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent>
        <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600, mb: 2 }}>ביצועים לפי שאלה</Typography>
        {empty ? (
          <EmptyState
            dense
            icon={<TrendingUpRounded />}
            title="אין עדיין ביצועים להצגה"
            body="ברגע שתלמיד ראשון יגיש, כאן יופיע הציון הממוצע ואחוז ההגשה של כל שאלה."
          />
        ) : (
        <>
        {/* y labels first in the DOM so they land on the right, where an RTL axis belongs */}
        <Stack direction="row" spacing={1}>
          <Stack justifyContent="space-between" sx={{ height: 200, pb: 3 }}>
            {GRID_LINES.map((g) => (
              <Typography key={g} variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{g}</Typography>
            ))}
          </Stack>
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            {/* the whole plot area, gridlines and pass mark — all of it under the bars */}
            <Box sx={{ position: 'absolute', insetInline: 0, top: 0, bottom: 24 }}>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {GRID_LINES.map((g) => (
                  <Box key={g} sx={{ borderTop: 1, borderColor: 'divider' }} />
                ))}
              </Box>
              <Box
                aria-hidden
                sx={{
                  position: 'absolute', insetInline: 0, bottom: `${PASS_MARK}%`,
                  borderTop: '2px dashed', borderColor: 'primary.main',
                }}
              />
            </Box>
            {/* positioned, so the bars paint over the rules behind them */}
            <Stack direction="row" spacing={2} justifyContent="space-around" sx={{ height: 200, position: 'relative' }}>
              {questions.map((q, i) => (
                <Stack key={i} alignItems="center" sx={{ flex: 1, height: '100%' }}>
                  <Stack direction="row" spacing={0.5} alignItems="flex-end" justifyContent="center" sx={{ flexGrow: 1, width: '100%' }}>
                    {/* the question's own average, then — half as wide, as on the dashboard —
                        how much of the class handed it in. Both name themselves on hover,
                        the same way the dashboard's bars do. */}
                    <Tooltip title={`שאלה ${i + 1} · ציון ממוצע: ${q.avgScore}`} placement="top" arrow>
                      {/* one colour for every average — the dashed 60 rule is what says
                          whether a question cleared the bar, not the bar's own colour */}
                      <Box sx={{ width: 18, height: `${q.avgScore}%`, borderRadius: '4px 4px 0 0', bgcolor: 'info.main' }} />
                    </Tooltip>
                    <Tooltip title={`שאלה ${i + 1} · אחוז הגשה: ${q.submissionRate}%`} placement="top" arrow>
                      <Box sx={{ width: 9, height: `${q.submissionRate}%`, borderRadius: '4px 4px 0 0', bgcolor: (t) => alpha(t.palette.info.main, 0.28) }} />
                    </Tooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ height: 24, pt: 0.5 }}>{i + 1}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">מספר שאלה</Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
          {[
            // the pass mark is a rule, not a bar, so its key is drawn as one
            { label: 'ממוצע 60', color: 'primary.main', dashed: true },
            // the bar is the question's average; the dashed rule above says whether it passed
            { label: 'ציון ממוצע', color: 'info.main' },
            { label: 'אחוז הגשה', color: (t: Theme) => alpha(t.palette.info.main, 0.28) },
          ].map((l) => (
            <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
              {l.dashed
                ? <Box sx={{ width: 18, borderTop: '2px dashed', borderColor: l.color }} />
                : <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: l.color }} />}
              <Typography variant="caption" color="text.secondary">{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
        </>
        )}
      </CardContent>
    </Card>
  );
}

// A tinted note listing whatever stood out — or saying plainly that nothing did.
// however many stand out, the note opens as a note — the rest is one click away, and the
// full list is always the table at the bottom
const ANOMALY_LIMIT = 5;

function AnomalyCard({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  // both notes are דגלים אדומים: same red flag, same light red card
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, ANOMALY_LIMIT);
  const rest = items.length - shown.length;
  return (
    <Card
      variant="outlined"
      sx={{
        ...cardSx,
        bgcolor: (t) => alpha(t.palette.error.main, 0.06),
        borderColor: (t) => alpha(t.palette.error.main, 0.3),
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <FlagRounded sx={{ color: 'error.main' }} />
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        </Stack>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, px: 2, py: 1.5 }}>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{empty}</Typography>
          ) : (
            <Stack spacing={0.75} alignItems="flex-start">
              {shown.map((t) => (
                <Typography key={t} variant="body2">{t}</Typography>
              ))}
              {(rest > 0 || expanded) && (
                <Button
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{ mx: -1 }}
                  endIcon={
                    <ExpandMoreRounded
                      sx={{
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        transition: (t) => t.transitions.create('transform'),
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                      }}
                    />
                  }
                >
                  {expanded ? 'הצג פחות' : `ראה עוד (${rest})`}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/* ---------- שאלות התרגול: the student app's question card, opened in place ---------- */

function QuestionCard({ q, index, open, onOpen }: { q: ReviewQuestion; index: number; open: boolean; onOpen: () => void }) {
  // nothing handed in yet means nothing measured: no difficulty, no average
  const measured = q.answers.length > 0;
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3, borderColor: 'divider',
        transition: (t) => t.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {/* the whole card is the button, exactly as in the student app's question list */}
      <CardActionArea onClick={onOpen} sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <QNumber index={index} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="div"
              sx={{
                color: 'text.primary', textAlign: 'start', whiteSpace: 'pre-line',
                lineHeight: (t) => t.typography.button.lineHeight,
                // a long question shows its first two lines here; the popup has all of it
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {q.prompt}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              {measured && <DifficultyPill level={q.difficulty} />}
              <Typography variant="body2" color="text.secondary">הגשה {q.submissionRate}%</Typography>
              <Typography variant="body2" color="text.secondary">{q.answers.length} תשובות</Typography>
            </Stack>
          </Box>
          {/* The card's far end (its LEFT, in RTL): the grade at the top, the way in at the
              bottom — level with the meta line across from it. */}
          <Stack
            spacing={1.5}
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ flexShrink: 0, alignSelf: 'stretch' }}
          >
            <AveragePill value={measured ? q.avgScore : null} />
            {/* chevron points down while the answers are closed and flips up while their
                popup is open, so the card always says which state it is in */}
            <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: 'primary.main' }}>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>ראה עוד</Typography>
              <ExpandMoreRounded
                sx={{
                  fontSize: 20,
                  transform: open ? 'rotate(180deg)' : 'none',
                  transition: (t) => t.transitions.create('transform'),
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

/* ---------- the popup: one question, its answers, and any one of them in full ---------- */

/** a sent answer, numbered line by line — copied from the student app (SummaryDialog.tsx) */
function NumberedAnswer({ text }: { text: string }) {
  const lines = text.split('\n').filter((l, i, arr) => l.trim() !== '' || i < arr.length - 1);
  return (
    <Stack spacing={0.25}>
      {lines.map((line, i) => (
        <Stack key={i} direction="row" spacing={1.25} alignItems="baseline">
          <Typography
            component="span"
            variant="caption"
            // same step number the student sees in their own bubble (SummaryDialog.tsx)
            sx={{ minWidth: 16, textAlign: 'center', flexShrink: 0, color: blue[800], fontWeight: 700, fontFeatureSettings: '"tnum","lnum"' }}
          >
            {i + 1}
          </Typography>
          <Typography component="span" variant="body2" sx={{ textAlign: 'start', whiteSpace: 'pre-wrap' }}>{line || ' '}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

/** one line of the replayed conversation — the student on the right, Alfi on the left */
function Turn({ turn }: { turn: AnswerTurn }) {
  const mine = turn.from === 'student';
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent={mine ? 'flex-start' : 'flex-end'}>
      <Box
        sx={{
          maxWidth: '85%', px: 2, py: 1.25, borderRadius: 3,
          // the student app's two voices, unchanged: the student in blue, Alfi on grey
          ...(mine
            ? { bgcolor: blue[50], color: 'text.primary', borderStartStartRadius: 4 }
            : { bgcolor: 'grey.100', borderStartEndRadius: 4 }),
        }}
      >
        {mine ? (
          <NumberedAnswer text={turn.text} />
        ) : (
          <Stack direction="row" spacing={0.75} alignItems="flex-start">
            {turn.tone === 'ok' && <CheckCircleTwoToneIcon sx={{ color: 'primary.main' }} />}
            {turn.tone === 'hint' && <ErrorOutlineRoundedIcon sx={{ color: 'warning.dark', mt: 0.25 }} />}
            <Typography variant="body2" sx={{ textAlign: 'start', fontWeight: turn.tone === 'ok' ? 800 : 400 }}>{turn.text}</Typography>
          </Stack>
        )}
      </Box>
      {/* RTL: Alfi answers from the far end, after his bubble — the student app's own order */}
      {!mine && <AlfiAvatar pose />}
    </Stack>
  );
}

/** the answer card in the list: the student app's summary card, with a preview that fades out */
function AnswerCard({ a, onOpen }: { a: QuestionAnswer; onOpen: () => void }) {
  return (
    <Paper
      component="button"
      variant="outlined"
      onClick={onOpen}
      sx={{
        display: 'block', width: '100%', textAlign: 'start', font: 'inherit', color: 'inherit',
        cursor: 'pointer', borderRadius: 3, p: 2,
        transition: (t) => t.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.name}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <LabeledPill label="ציון" value={a.score} />
      </Stack>
      <ClampedText
        text={a.text}
        textSx={{
          fontSize: (t) => t.typography.body2.fontSize,
          lineHeight: (t) => t.typography.body2.lineHeight,
          color: 'text.secondary',
        }}
      />
      <Stack direction="row" alignItems="center" sx={{ height: 22, mt: 1 }}>
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, marginInlineStart: 'auto' }}>
          ראה עוד
        </Typography>
      </Stack>
    </Paper>
  );
}

// Same frame as the student app's צפה בסיכום dialog (SummaryDialog.tsx): fixed height so
// the box never resizes, a corner X on the list, a back arrow inside one answer, dividers
// on the body, one button at the bottom.
function QuestionDialog({ q, index, onClose }: { q: ReviewQuestion; index: number; onClose: () => void }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));
  const [openA, setOpenA] = useState<number | null>(null);
  const open = openA === null ? null : q.answers[openA];

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={phone}
      // same width as the student app's צפה בסיכום dialog
      maxWidth="md"
      fullWidth
      // the box never resizes — one answer opens over the list, inside the same frame
      PaperProps={{ sx: { borderRadius: phone ? 0 : 4, height: phone ? '100%' : 'min(820px, 92vh)' } }}
    >
      <DialogTitle component="div" sx={{ pb: 1, position: 'relative' }}>
        {/* room kept clear for the corner close button, so a long question never runs under it */}
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ paddingInlineEnd: open ? 0 : 5 }}>
          {/* inside an answer there is only a way back; the list closes from the far side */}
          {open ? (
            <>
              <Box sx={{ height: 24, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <IconButton onClick={() => setOpenA(null)} aria-label="חזרה לרשימת התשובות" sx={{ my: -1 }}>
                  <ArrowForwardRounded />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{open.name}</Typography>
                <Typography variant="body2" color="text.secondary">הפתרון המלא לשאלה {index + 1}</Typography>
              </Box>
              <LabeledPill label="ציון" value={open.score} />
            </>
          ) : (
            <>
              <QNumber index={index} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* The question in full — nothing is cut here, that is what the popup is for.
                    Type is the student app's own open-question setting (TaskDetail.tsx): h6 at
                    regular weight, line height 2.1. */}
                <Typography
                  component="div"
                  variant="h6"
                  sx={{ fontWeight: 400, lineHeight: 2.1, textAlign: 'start', whiteSpace: 'pre-line' }}
                >
                  {q.prompt}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  {q.answers.length > 0 && <DifficultyPill level={q.difficulty} />}
                  <Typography variant="body2" color="text.secondary">הגשה {q.submissionRate}%</Typography>
                </Stack>
              </Box>
              <AveragePill value={q.answers.length > 0 ? q.avgScore : null} />
            </>
          )}
        </Stack>
        {!open && (
          <IconButton
            onClick={onClose}
            aria-label="סגירה"
            sx={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}
          >
            <CloseRounded />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {open ? (
          /* one student, everything that happened in this question */
          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.9, textAlign: 'start', whiteSpace: 'pre-line' }}>{q.prompt}</Typography>
            </Paper>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              הפתרון של {open.name} — כל השיחה
            </Typography>
            <Stack spacing={1.5}>
              {open.turns.map((t, i) => <Turn key={i} turn={t} />)}
            </Stack>
          </Stack>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              תשובות תלמידים ({q.answers.length})
            </Typography>
            {q.answers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">אין תשובות להצגה</Typography>
            ) : (
              <Stack spacing={2}>
                {q.answers.map((a, i) => (
                  <AnswerCard key={a.name} a={a} onOpen={() => setOpenA(i)} />
                ))}
              </Stack>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// סקירת הערכה — the drill-in behind every row of תרגולים אחרונים: how the class did on
// one assessment, question by question, with the full grade table at the bottom.
// 'blank' is the state right after the assessment goes out, before anyone answers.
export type ReviewVariant = 'full' | 'blank';

export function AssessmentReview({ index, variant = 'full', backLabel = 'חזרה למסך הראשי', onBack }: {
  index: number; variant?: ReviewVariant; backLabel?: string; onBack: () => void;
}) {
  const blank = variant === 'blank';
  const a = blank ? blankAssessment(ASSESSMENT_REVIEWS[index]) : ASSESSMENT_REVIEWS[index];
  const questions = blank ? blankQuestions(ASSESSMENT_QUESTIONS[index]) : ASSESSMENT_QUESTIONS[index];
  const [openQ, setOpenQ] = useState<number | null>(null);
  // the grade table opens in roster order; any header flips to that column, ascending first
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sortOn = (key: SortKey) => {
    if (key === sortKey) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); return; }
    setSortKey(key);
    setSortDir('asc');
  };

  const sortedResults = sortKey === null
    ? a.results
    : [...a.results].sort((x, y) => (sortDir === 'asc' ? 1 : -1) * compareBy(sortKey, x, y));

  const failed = a.submitted - a.passed - a.partial;
  const notSubmitted = CLASS_SIZE - a.submitted;
  const hardQuestions = questions.filter((q) => q.answers.length > 0 && q.difficulty === 'קשה');
  // a score that sits far outside the pack is worth a second look, either way
  const outliers = a.results.filter((r) => r.score !== null && (r.score >= 90 || r.score < 60));

  return (
    <Stack spacing={3}>
      <PageHeader back={{ label: backLabel, onClick: onBack }} title={`סקירת ${a.kind}`} />

      {/* which assessment this is. The completion count has its own card below, so the line
          under the name says only when it went out */}
      <TaskTitle icon={<KindIcon kind={a.kind} />} name={a.title} meta={`נשלח בתאריך ${a.sentOn}`} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {/* a plain count of what was sent — neither good news nor bad, so it wears info blue */}
        <StatTile icon={<AssignmentRounded />} value={String(questions.length)} label={`שאלות ב${a.kind}`} color="info" />
        <StatTile icon={<WarningAmberRounded />} value={String(hardQuestions.length)} label="שאלות קשות" color="error" />
        <StatTile icon={<GroupsRounded />} value={`${a.submitted}/${CLASS_SIZE}`} label="תלמידים השלימו" color="purple" />
        <StatTile icon={<TrendingUpRounded />} value={blank ? '—' : String(a.avgScore)} label="ממוצע כיתה" color="primary" />
      </Box>

      <SectionTitle>ניתוח {a.kind}</SectionTitle>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <QuestionChartCard questions={questions} empty={blank} />
        <ClassStatusCard
          total={CLASS_SIZE}
          // the same four states, in the same colours, as the dots in the table below
          slices={[
            { label: 'עובר', value: a.passed, color: (t) => statusBorder(t, 'pass') },
            { label: 'הגיש חלקית', value: a.partial, color: (t) => statusBorder(t, 'partial') },
            { label: 'לא עובר', value: failed, color: (t) => statusBorder(t, 'fail') },
            { label: 'לא הגיש', value: notSubmitted, color: (t) => statusBorder(t, 'none') },
          ]}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <AnomalyCard
          title="דגלים אדומים ברמת תלמיד"
          items={outliers.map((r) => `${r.name} — ${r.score}`)}
          empty="אין תלמידים עם ציון מעל 90 או מתחת ל-60"
        />
        <AnomalyCard
          title="דגלים אדומים ברמת שאלה"
          items={hardQuestions.map((q) => `שאלה ${questions.indexOf(q) + 1} — ממוצע ${q.avgScore}`)}
          empty='אין שאלות שעמדו בהגדרת "קשה" (ממוצע מתחת ל-60)'
        />
      </Box>

      <SectionTitle>שאלות ה{a.kind}</SectionTitle>
      {/* full page width; clicking one opens its answers in a popup */}
      <Stack spacing={2}>
        {questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} open={openQ === i} onOpen={() => setOpenQ(i)} />
        ))}
      </Stack>
      {openQ !== null && (
        <QuestionDialog q={questions[openQ]} index={openQ} onClose={() => setOpenQ(null)} />
      )}

      <SectionTitle>ציוני התלמידים</SectionTitle>
      {/* Card clips with overflow:hidden by default, which would kill the sticky header */}
      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'visible' }}>
        <TableContainer sx={{ overflow: 'visible' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {SORT_COLUMNS.map((c) => (
                  <TableCell
                    key={c.key}
                    sortDirection={sortKey === c.key ? sortDir : false}
                    sx={{ width: c.width, fontWeight: 700, bgcolor: HEADER_BG }}
                  >
                    <TableSortLabel
                      active={sortKey === c.key}
                      direction={sortKey === c.key ? sortDir : 'asc'}
                      onClick={() => sortOn(c.key)}
                    >
                      {c.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedResults.map((r) => (
                <TableRow key={r.name} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                  {/* ScoreDot centres itself with auto margins; here the column starts at
                      the inline start, so those are cleared */}
                  <TableCell sx={{ '& > *': { mx: 0 } }}>
                    <ScoreDot score={r.score} status={r.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{RESULT_LABEL[r.status]}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
