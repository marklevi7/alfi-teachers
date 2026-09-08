import { useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchRounded from '@mui/icons-material/SearchRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import { FREDOKA } from '../theme';
import { Pill, PILL_TEXT, DifficultyPill } from './Pills';
import { EmptyState } from './EmptyState';
import {
  QUESTION_LIBRARY, QUESTION_TAGS, UNITS, type LibraryQuestion, type Difficulty,
} from './mockData';

// One shared style for the small meta text in a card, same as the student app's META.
const META = { fontSize: (t: import('@mui/material/styles').Theme) => t.typography.body2.fontSize, fontWeight: 400, color: 'text.secondary' } as const;

type UsedFilter = 'all' | 'fresh' | 'used';
const USED_FILTERS: { key: UsedFilter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'fresh', label: 'לא בשימוש' },
  { key: 'used', label: 'כבר בשימוש' },
];
const DIFFICULTIES: Difficulty[] = ['קל', 'בינוני', 'קשה'];

const uniq = (arr: string[]) => Array.from(new Set(arr));

/* ---------- one question in the library ---------- */

function LibraryCard({ q, selected, disabled, onSelect }: {
  q: LibraryQuestion; selected: boolean; disabled: boolean; onSelect: () => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: (t) => selected ? alpha(t.palette.primary.main, 0.06) : 'background.paper',
        opacity: disabled ? 0.6 : 1,
        transition: (t) => t.transitions.create(['box-shadow', 'border-color', 'background-color']),
        ...(selected && { boxShadow: 4 }),
        '&:hover': disabled ? {} : { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <CardActionArea onClick={onSelect} disabled={disabled} sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* the tick is the whole selection state — no checkbox competing with it */}
          <Box sx={{ width: 28, flexShrink: 0, pt: 0.25 }}>
            {selected && <CheckCircleRounded sx={{ color: 'primary.main' }} />}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="div"
              sx={{ whiteSpace: 'pre-line', textAlign: 'start', lineHeight: (t) => t.typography.button.lineHeight }}
            >
              {q.prompt}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <DifficultyPill level={q.difficulty} />
              {/* a question that already went out says so, and says where */}
              {q.usedIn.length > 0 && (
                <Pill>
                  <HistoryRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography component="span" sx={{ ...PILL_TEXT, color: 'text.secondary' }}>
                    כבר בשימוש · {q.usedIn.join(', ')}
                  </Typography>
                </Pill>
              )}
              {disabled && (
                <Typography sx={{ ...META, fontWeight: 700, color: 'primary.dark' }}>כבר במשימה</Typography>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Typography sx={META}>{q.unit} · {q.topic} · {q.subTopic}</Typography>
              {q.tags.length > 0 && <Typography sx={META}>{q.tags.map((t) => `#${t}`).join('  ')}</Typography>}
            </Stack>
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

/* ---------- the library ---------- */

/**
 * The pool a task is built from. Deliberately standalone: it takes the prompts already in
 * play and hands back the one that was picked, so any screen that needs to add a question —
 * a scheduled task today, the build form later — can mount it as-is.
 */
export function QuestionLibrary({ inUse = [], onPick, onClose }: {
  /** prompts already on the task; they show as "כבר במשימה" and cannot be picked twice */
  inUse?: string[];
  onPick: (q: LibraryQuestion) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));
  const [q, setQ] = useState('');
  const [used, setUsed] = useState<UsedFilter>('all');
  const [unit, setUnit] = useState('');
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [picked, setPicked] = useState<LibraryQuestion | null>(null);

  const TOPICS = useMemo(() => uniq(QUESTION_LIBRARY.map((x) => x.topic)), []);
  const SUBTOPICS = useMemo(() => uniq(QUESTION_LIBRARY.map((x) => x.subTopic)), []);

  const shown = useMemo(
    () => QUESTION_LIBRARY.filter((x) =>
      (!q || x.prompt.includes(q.trim())) &&
      (used === 'all' || (used === 'used' ? x.usedIn.length > 0 : x.usedIn.length === 0)) &&
      (!unit || x.unit === unit) &&
      (!topic || x.topic === topic) &&
      (!subTopic || x.subTopic === subTopic) &&
      (!difficulty || x.difficulty === difficulty) &&
      // several tags can be on at once; a question matches if it carries any of them
      (tags.length === 0 || x.tags.some((t) => tags.includes(t)))
    ),
    [q, used, unit, topic, subTopic, difficulty, tags],
  );

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={phone}
      maxWidth="lg"
      fullWidth
      // the box never resizes as the list filters down
      PaperProps={{ sx: { borderRadius: phone ? 0 : 4, height: phone ? '100%' : 'min(860px, 92vh)' } }}
    >
      <DialogTitle component="div" sx={{ pb: 1, position: 'relative' }}>
        <Box sx={{ paddingInlineEnd: 5 }}>
          <Typography variant="h5" sx={{ ...FREDOKA, fontWeight: 600 }}>מאגר השאלות</Typography>
          <Typography variant="body2" color="text.secondary">
            {shown.length} מתוך {QUESTION_LIBRARY.length} שאלות · בחרי שאלה אחת כדי להוסיף אותה
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="סגירה" sx={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Same filter block as the screens behind it: one outlined card, a single
            bottom-aligned row that wraps when it runs out of width. */}
        <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="חיפוש בטקסט השאלה"
                inputProps={{ 'aria-label': 'חיפוש בטקסט השאלה' }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment>) }}
                sx={{ flex: 1, minWidth: 220 }}
              />
              <ToggleButtonGroup
                size="small"
                exclusive
                value={used}
                onChange={(_, v) => v && setUsed(v)}
                sx={{ height: 40, '& .MuiToggleButton-root': { fontWeight: 700, px: 2 } }}
              >
                {USED_FILTERS.map((f) => <ToggleButton key={f.key} value={f.key}>{f.label}</ToggleButton>)}
              </ToggleButtonGroup>
              <TextField select size="small" label="יחידה" value={unit} onChange={(e) => setUnit(e.target.value)} sx={{ width: 130 }}>
                <MenuItem value="">כל היחידות</MenuItem>
                {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="נושא" value={topic} onChange={(e) => setTopic(e.target.value)} sx={{ flex: 1, minWidth: 160 }}>
                <MenuItem value="">כל הנושאים</MenuItem>
                {TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="תת נושא" value={subTopic} onChange={(e) => setSubTopic(e.target.value)} sx={{ flex: 1, minWidth: 160 }}>
                <MenuItem value="">הכל</MenuItem>
                {SUBTOPICS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="רמה" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 130 }}>
                <MenuItem value="">כל הרמות</MenuItem>
                {DIFFICULTIES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
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
                sx={{ flex: 1, minWidth: 160 }}
              >
                {QUESTION_TAGS.map((t) => (
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
          <EmptyState
            icon={<HelpOutlineRounded />}
            title="לא נמצאו שאלות"
            body="נסי לשנות את הסינון — ייתכן שאין שאלות שעונות על כל התנאים."
          />
        ) : (
          <Stack spacing={2}>
            {shown.map((x) => (
              <LibraryCard
                key={x.id}
                q={x}
                selected={picked?.id === x.id}
                disabled={inUse.includes(x.prompt)}
                onSelect={() => setPicked(picked?.id === x.id ? null : x)}
              />
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="contained"
          disabled={!picked}
          onClick={() => picked && onPick(picked)}
          sx={{ fontWeight: 800 }}
        >
          הוספת השאלה
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} sx={{ fontWeight: 800 }}>ביטול</Button>
      </DialogActions>
    </Dialog>
  );
}
