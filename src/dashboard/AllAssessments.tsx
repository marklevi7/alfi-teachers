import { useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import { yellow } from '@mui/material/colors';
import { KindIcon } from './KindIcon';
import { PageHeader } from './PageHeader';
import { LabeledPill } from './Pills';
import { EmptyState } from './EmptyState';
import { ConfirmDeleteDialog } from './ConfirmDialog';
import {
  CLASS_SIZE, sectionsOfAssessment,
  type ClassAssessment, type AssessmentState,
} from './mockData';

// 'empty' is a brand new class: nothing sent, nothing queued.
export type AllAssessmentsVariant = 'mid' | 'empty';

type StateFilter = 'all' | AssessmentState;
const STATE_FILTERS: { key: StateFilter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'open', label: 'פתוחים' },
  { key: 'scheduled', label: 'מתוזמנים' },
  { key: 'ended', label: 'הסתיימו' },
];

// One shared style for the small meta text in a card, same as the student app's META.
const META = { fontSize: (t: Theme) => t.typography.body2.fontSize, fontWeight: 400, color: 'text.secondary' } as const;

const uniq = (arr: string[]) => Array.from(new Set(arr));

/* ---------- one row on the timeline ---------- */

function StateTag({ state }: { state: AssessmentState }) {
  if (state === 'ended') return null;
  const scheduled = state === 'scheduled';
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, marginInlineStart: 1, verticalAlign: 'middle' }}
    >
      <Box
        component="span"
        sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: scheduled ? 'grey.500' : 'primary.main' }}
      />
      <Box
        component="span"
        sx={{
          fontSize: (t: Theme) => t.typography.body2.fontSize, fontWeight: 700,
          color: scheduled ? 'text.secondary' : 'primary.dark',
        }}
      >
        {scheduled ? 'מתוזמן' : 'פתוח'}
      </Box>
    </Box>
  );
}

// How much of the class handed in: red under 30%, yellow to 70%, green above it.
function CompletionBar({ submitted }: { submitted: number }) {
  const pct = Math.round((submitted / CLASS_SIZE) * 100);
  const color = pct < 30 ? 'error.main' : pct < 70 ? yellow[700] : 'primary.main';
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
      <Typography sx={META}>אחוז הגשה</Typography>
      <Box sx={{ width: 100, height: 8, borderRadius: 1, bgcolor: (t) => alpha(t.palette.text.primary, 0.08) }}>
        <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 1, bgcolor: color }} />
      </Box>
      <Typography sx={{ ...META, fontWeight: 700, color: 'text.primary', fontFeatureSettings: '"tnum","lnum"' }}>
        {pct}%
      </Typography>
    </Stack>
  );
}

function AssessmentRow({ a, highlight = false, onOpen, onEdit, onDelete }: {
  a: ClassAssessment;
  /** just sent or just saved — worth a glance before it becomes another row */
  highlight?: boolean;
  onOpen: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const queued = a.state === 'scheduled';
  const curriculum = [a.topic, a.subTopic, sectionsOfAssessment(a).join(', ')].filter(Boolean).join(' · ');
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        // a task that has not opened yet is greyed back — it is not results, it is a plan
        bgcolor: (t) => queued ? alpha(t.palette.text.primary, 0.02) : 'background.paper',
        transition: (t) => t.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        // the row that just arrived says so: three slow pulses, then it settles into the list
        ...(highlight && {
          '@keyframes arrived': {
            '0%, 100%': { backgroundColor: 'transparent', borderColor: 'divider' },
            '50%': {
              backgroundColor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
              borderColor: 'primary.main',
            },
          },
          animation: 'arrived 1s ease-in-out 3',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }),
      }}
    >
      <Stack direction="row" alignItems="stretch">
        <CardActionArea onClick={onOpen} sx={{ flex: 1, minWidth: 0, px: 3, py: 2.5 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: queued ? 0.6 : 1 }}>
              {/* how far along it is, read off the tile: queued is neutral, open is an outline,
                  ended is the filled green of the student app */}
              <KindIcon kind={a.kind} tone={queued ? 'muted' : a.state === 'open' ? 'outlined' : 'filled'} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ minHeight: 32 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1.2, color: queued ? 'text.secondary' : 'text.primary' }}
                >
                  {a.title}
                  <StateTag state={a.state} />
                </Typography>
                {/* grades show for a תרגול too, not only for a בוחן */}
                {a.avgScore !== null && <LabeledPill label="ציון ממוצע" value={a.avgScore} />}
                <Box sx={{ flexGrow: 1 }} />
                {/* each state says the hour that matters: when it will open, when it opened,
                    and — once it is over — when it closed */}
                <Typography sx={{ ...META, whiteSpace: 'nowrap' }}>
                  {a.state === 'ended'
                    ? `נסגר ב־${a.opensOn}${a.closesAt ? ` בשעה ${a.closesAt}` : ''}`
                    : `${queued ? 'ייפתח ב־' : 'נפתח ב־'}${a.opensOn}${a.opensAt ? ` בשעה ${a.opensAt}` : ''}`}
                </Typography>
              </Stack>

              {/* one line, always: the bar holds its slot and the curriculum text gives way */}
              <Stack direction="row" alignItems="center" sx={{ mt: 1.5, columnGap: 3 }}>
                {/* נושא · יחידה · תת נושא — the same three levels the filters walk */}
                <Tooltip title={curriculum} placement="top-start" arrow>
                  <Typography sx={{ ...META, flex: 1, minWidth: 0 }} noWrap>
                    {curriculum}
                  </Typography>
                </Tooltip>
                {/* the bar says everything the count said, so it takes the count's slot.
                    A task that has not opened has nothing to complete yet. */}
                {queued
                  ? <Typography sx={META}>טרם נשלח</Typography>
                  : <CompletionBar submitted={a.submitted} />}
              </Stack>

            </Box>
          </Stack>
        </CardActionArea>

        {/* Actions sit at the card's inline end (its LEFT, in RTL), outside the click target.
            Only a queued task has any: once it is with the class, and once it is over, it
            stands as it was sent — and the column goes away entirely rather than leaving a
            blank strip the hover cannot reach. */}
        {queued && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1.5, flexShrink: 0 }}>
            <Tooltip title="עריכת המשימה" placement="top" arrow>
              <IconButton onClick={onEdit} aria-label={`עריכה: ${a.title}`}>
                <EditRounded />
              </IconButton>
            </Tooltip>
            <Tooltip title="מחיקת משימה מתוזמנת" placement="top" arrow>
              <IconButton onClick={onDelete} aria-label={`מחיקה: ${a.title}`} sx={{ color: 'error.main' }}>
                <DeleteOutlineRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

/* ---------- the screen ---------- */

// כל ההערכות — every task the class was given and every one still queued, on one timeline.
// Same shape as the student app's תמונת מצב (History.tsx): filters on top, a vertical rail
// down the inline start with a dot per row.
export function AllAssessments({ variant = 'mid', items: all, onItemsChange, onDeleted, highlightId, onOpenReview, onEditTask }: {
  variant?: AllAssessmentsVariant;
  items: ClassAssessment[];
  onItemsChange: (next: ClassAssessment[]) => void;
  /** the task the teacher just sent or saved, so the list can point at it */
  highlightId?: string | null;
  /** the app says so out loud — this screen only reports what it did */
  onDeleted?: (task: ClassAssessment) => void;
  onOpenReview: (reviewIndex: number) => void;
  onEditTask: (id: string) => void;
}) {
  // the list lives in App so a delete survives leaving the screen and coming back
  const items = variant === 'empty' ? [] : all;
  const [state, setState] = useState<StateFilter>('all');
  const [unit, setUnit] = useState('');
  const [topic, setTopic] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  // nothing is deleted until the teacher confirms it in the dialog
  const [confirmDelete, setConfirmDelete] = useState<ClassAssessment | null>(null);

  // the same three levels the question bank is filed under: נושא → יחידה → תת נושא, each
  // list narrowed by the one before it
  const TOPICS = useMemo(() => uniq(items.map((i) => i.topic)), [items]);
  const UNITS_OF = useMemo(
    () => uniq(items.filter((i) => !topic || i.topic === topic).map((i) => i.subTopic)),
    [items, topic],
  );
  const SECTIONS_OF = useMemo(
    () => uniq(items
      .filter((i) => (!topic || i.topic === topic) && (!unit || i.subTopic === unit))
      .flatMap((i) => sectionsOfAssessment(i))),
    [items, topic, unit],
  );

  const shown = useMemo(
    () => items.filter((a) =>
      (state === 'all' || a.state === state) &&
      (!topic || a.topic === topic) &&
      (!unit || a.subTopic === unit) &&
      // a task matches a תת נושא if any of its questions sit under it
      (sections.length === 0 || sectionsOfAssessment(a).some((sec) => sections.includes(sec))) &&
      true
    ),
    [items, state, topic, unit, sections],
  );

  // a step back up the cascade drops what was chosen below it
  const pickTopic = (next: string) => { setTopic(next); setUnit(''); setSections([]); };
  const pickUnit = (next: string) => { setUnit(next); setSections([]); };

  const remove = (id: string) => onItemsChange(items.filter((a) => a.id !== id));

  return (
    <Stack spacing={3}>
      <PageHeader
        title="כל ההערכות"
        subtitle="כל התרגולים והבחנים של הכיתה — מה שרץ עכשיו, מה שכבר הסתיים ומה שמתוזמן קדימה"
      />

      {/* Same filter block as מצב תלמידים: one outlined card, everything on a single
          bottom-aligned row that wraps when it runs out of width. */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={state}
              onChange={(_, v) => v && setState(v)}
              sx={{ height: 40, alignSelf: 'flex-start', '& .MuiToggleButton-root': { fontWeight: 700, px: 2 } }}
            >
              {STATE_FILTERS.map((f) => (
                <ToggleButton key={f.key} value={f.key}>{f.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* the three levels stay on one line together — they are one choice, made in steps */}
            <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
            <TextField select size="small" label="נושא" value={topic} onChange={(e) => pickTopic(e.target.value)} sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="">כל הנושאים</MenuItem>
              {TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            {/* the hierarchy is walked in order: a יחידה only exists under a נושא */}
            <TextField select size="small" label="יחידה" value={unit} onChange={(e) => pickUnit(e.target.value)} disabled={!topic} sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="">כל היחידות</MenuItem>
              {UNITS_OF.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            {/* several תתי נושא at once, as in בניית מבחן */}
            <TextField
              select
              size="small"
              label="תת נושא"
              disabled={!unit}
              value={sections}
              onChange={(e) => setSections(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as unknown as string[]))}
              SelectProps={{
                multiple: true,
                displayEmpty: true,
                renderValue: (v) => {
                  const picked = v as string[];
                  if (picked.length === 0) return 'כל תתי הנושאים';
                  return picked.length === 1 ? picked[0] : `${picked.length} תתי נושא נבחרו`;
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 170 }}
            >
              {SECTIONS_OF.map((sec) => (
                <MenuItem key={sec} value={sec}>
                  <Checkbox checked={sections.includes(sec)} />
                  <ListItemText primary={sec} />
                </MenuItem>
              ))}
            </TextField>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {shown.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <EmptyState
            icon={<AssignmentTurnedInRounded />}
            title={items.length === 0 ? 'עוד לא נשלחו הערכות' : 'לא נמצאו תוצאות'}
            body={items.length === 0
              ? 'כל תרגול או מבחן שתשלחי לכיתה יופיע כאן, יחד עם מה שתזמנת קדימה.'
              : 'נסי לשנות את הסינון — ייתכן שאין משימות שעונות על כל התנאים.'}
          />
        </Card>
      ) : (
        /* timeline: every row hangs on a rail down the inline start — the RIGHT, in RTL.
           Dot = state: hollow grey queued, ring open, filled with a check once closed. */
        <Box sx={{ position: 'relative', paddingInlineStart: 4.5 }}>
          <Box sx={{ position: 'absolute', insetInlineStart: '11px', top: 14, bottom: 14, width: 2, bgcolor: 'divider', borderRadius: 1 }} />
          <Stack spacing={1.5}>
            {shown.map((a) => (
              <Box key={a.id} sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute', insetInlineStart: '-36px', top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: '50%', zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'background.paper',
                    ...(a.state === 'ended' && { bgcolor: 'primary.main' }),
                    ...(a.state === 'open' && { border: 2, borderColor: 'primary.main' }),
                  }}
                >
                  {a.state === 'ended' && <CheckRounded sx={{ fontSize: 16, color: 'common.white' }} />}
                  {/* the clock IS the dot: it fills the slot, with no ring drawn around it */}
                  {a.state === 'scheduled' && <ScheduleRounded sx={{ fontSize: 24, color: 'grey.500' }} />}
                </Box>
                <AssessmentRow
                  a={a}
                  highlight={a.id === highlightId}
                  // a queued task opens its form; one that already went out opens its review
                  onOpen={() => (a.state === 'scheduled' ? onEditTask(a.id) : onOpenReview(a.reviewIndex))}
                  onEdit={() => onEditTask(a.id)}
                  onDelete={() => setConfirmDelete(a)}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {confirmDelete && (
        <ConfirmDeleteDialog
          title={`למחוק את ${confirmDelete.kind === 'בוחן' ? 'הבוחן' : 'התרגול'}?`}
          body={`"${confirmDelete.title}" יימחק על כל שאלותיו ולא ניתן יהיה לשחזר אותו. המשימה לא תישלח לתלמידים.`}
          confirmLabel="מחיקה"
          onConfirm={() => { remove(confirmDelete.id); onDeleted?.(confirmDelete); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </Stack>
  );
}
