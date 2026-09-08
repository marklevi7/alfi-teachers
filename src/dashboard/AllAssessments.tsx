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
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import { FREDOKA } from '../theme';
import { KindIcon } from './KindIcon';
import { EmptyState } from './EmptyState';
import {
  CLASS_SIZE, UNITS, ASSESSMENT_TAGS,
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

// One pill, taken from the student app (Practice.tsx GradePill): white with a hairline.
const PILL = {
  height: 28, px: 1.25, borderRadius: 1.5, flexShrink: 0,
  display: 'inline-flex', alignItems: 'center', gap: 0.75,
  bgcolor: 'background.paper', border: 1, borderColor: 'grey.400',
} as const;
const PILL_TEXT = { fontSize: (t: Theme) => t.typography.body2.fontSize, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' } as const;

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

function AssessmentRow({ a, onOpen, onDuplicate, onDelete }: {
  a: ClassAssessment; onOpen: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const queued = a.state === 'scheduled';
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
      }}
    >
      <Stack direction="row" alignItems="stretch">
        <CardActionArea onClick={onOpen} sx={{ flex: 1, minWidth: 0, px: 3, py: 2.5 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: queued ? 0.6 : 1 }}>
              <KindIcon kind={a.kind} />
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
                {a.avgScore !== null && (
                  <Box sx={PILL}>
                    <Typography component="span" sx={{ ...PILL_TEXT, color: 'text.secondary' }}>ציון ממוצע:</Typography>
                    <Typography component="span" sx={{ ...PILL_TEXT, color: 'text.primary', fontFeatureSettings: '"tnum","lnum"' }}>{a.avgScore}</Typography>
                  </Box>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Typography sx={{ ...META, whiteSpace: 'nowrap' }}>
                  {queued ? 'ייפתח ב־' : 'נפתח ב־'}{a.opensOn}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5, columnGap: 3, rowGap: 1 }}>
                <Typography sx={META}>{a.unit} · {a.topic} · {a.subTopic}</Typography>
                {a.tags.length > 0 && (
                  <Typography sx={META}>{a.tags.map((t) => `#${t}`).join('  ')}</Typography>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Typography sx={META}>
                  {queued ? 'טרם נשלח' : `${a.submitted}/${CLASS_SIZE} הגישו`}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardActionArea>

        {/* actions sit at the card's inline end (its LEFT, in RTL), outside the click target */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1.5, flexShrink: 0 }}>
          <Tooltip title="שכפול משימה" placement="top" arrow>
            <IconButton onClick={onDuplicate} aria-label={`שכפול: ${a.title}`}>
              <ContentCopyRounded />
            </IconButton>
          </Tooltip>
          {/* only a task that has not opened can still be called off */}
          {queued && (
            <Tooltip title="מחיקת משימה מתוזמנת" placement="top" arrow>
              <IconButton onClick={onDelete} aria-label={`מחיקה: ${a.title}`} sx={{ color: 'error.main' }}>
                <DeleteOutlineRounded />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

/* ---------- the screen ---------- */

// כל ההערכות — every task the class was given and every one still queued, on one timeline.
// Same shape as the student app's תמונת מצב (History.tsx): filters on top, a vertical rail
// down the inline start with a dot per row.
export function AllAssessments({ variant = 'mid', items: all, onItemsChange, onOpenReview, onOpenScheduled }: {
  variant?: AllAssessmentsVariant;
  items: ClassAssessment[];
  onItemsChange: (next: ClassAssessment[]) => void;
  onOpenReview: (reviewIndex: number) => void;
  onOpenScheduled: (id: string) => void;
}) {
  // the list lives in App so a delete survives leaving the screen and coming back
  const items = variant === 'empty' ? [] : all;
  const [state, setState] = useState<StateFilter>('all');
  const [unit, setUnit] = useState('');
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const TOPICS = useMemo(() => uniq(items.map((i) => i.topic)), [items]);
  const SUBTOPICS = useMemo(() => uniq(items.map((i) => i.subTopic)), [items]);

  const shown = useMemo(
    () => items.filter((a) =>
      (state === 'all' || a.state === state) &&
      (!unit || a.unit === unit) &&
      (!topic || a.topic === topic) &&
      (!subTopic || a.subTopic === subTopic) &&
      // several tags can be picked at once; a task matches if it carries any of them
      (tags.length === 0 || a.tags.some((t) => tags.includes(t)))
    ),
    [items, state, unit, topic, subTopic, tags],
  );

  const duplicate = (a: ClassAssessment) => {
    const copy: ClassAssessment = {
      ...a,
      id: `${a.id}-copy-${Date.now()}`,
      title: `${a.title} (עותק)`,
      state: 'scheduled',
      submitted: 0,
      avgScore: null,
    };
    // the copy has not been sent, so it joins the queue at the top of the list
    onItemsChange([copy, ...items]);
  };
  const remove = (id: string) => onItemsChange(items.filter((a) => a.id !== id));

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h3" sx={{ ...FREDOKA, fontWeight: 600 }}>
          כל ההערכות
        </Typography>
        <Typography color="text.secondary">
          כל התרגולים והבחנים של הכיתה — מה שרץ עכשיו, מה שכבר הסתיים ומה שמתוזמן קדימה
        </Typography>
      </Stack>

      {/* Same filter block as מצב תלמידים: one outlined card, everything on a single
          bottom-aligned row that wraps when it runs out of width. */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={state}
              onChange={(_, v) => v && setState(v)}
              sx={{ height: 40, '& .MuiToggleButton-root': { fontWeight: 700, px: 2 } }}
            >
              {STATE_FILTERS.map((f) => (
                <ToggleButton key={f.key} value={f.key}>{f.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField select size="small" label="יחידה" value={unit} onChange={(e) => setUnit(e.target.value)} sx={{ width: 140 }}>
              <MenuItem value="">כל היחידות</MenuItem>
              {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="נושא" value={topic} onChange={(e) => setTopic(e.target.value)} sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="">כל הנושאים</MenuItem>
              {TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="תת נושא" value={subTopic} onChange={(e) => setSubTopic(e.target.value)} sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="">הכל</MenuItem>
              {SUBTOPICS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            {/* more than one tag can be on at a time */}
            <TextField
              select
              size="small"
              label="תגיות"
              value={tags}
              onChange={(e) => setTags(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as unknown as string[]))}
              SelectProps={{ multiple: true, displayEmpty: true, renderValue: (v) => (v as string[]).length ? (v as string[]).join(', ') : 'כל התגיות' }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 170 }}
            >
              {ASSESSMENT_TAGS.map((t) => (
                <MenuItem key={t} value={t}>
                  <Checkbox checked={tags.includes(t)} />
                  <ListItemText primary={t} />
                </MenuItem>
              ))}
            </TextField>
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
                    ...(a.state === 'scheduled' && { border: 2, borderColor: 'grey.400' }),
                  }}
                >
                  {a.state === 'ended' && <CheckRounded sx={{ fontSize: 16, color: 'common.white' }} />}
                  {a.state === 'scheduled' && <ScheduleRounded sx={{ fontSize: 14, color: 'grey.500' }} />}
                </Box>
                <AssessmentRow
                  a={a}
                  // a queued task opens its form; one that already went out opens its review
                  onOpen={() => (a.state === 'scheduled' ? onOpenScheduled(a.id) : onOpenReview(a.reviewIndex))}
                  onDuplicate={() => duplicate(a)}
                  onDelete={() => remove(a.id)}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

    </Stack>
  );
}
