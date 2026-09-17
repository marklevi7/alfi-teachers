import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import { FREDOKA } from '../theme';
import { EmptyState } from './EmptyState';
import { QuestionPickCard } from './QuestionPickCard';
import { QuestionPreviewDialog } from './QuestionPreviewDialog';
import {
  QUESTION_LIBRARY, type LibraryQuestion, type Difficulty,
} from './mockData';

type UsedFilter = 'all' | 'fresh' | 'used';
const USED_FILTERS: { key: UsedFilter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'fresh', label: 'לא בשימוש' },
  { key: 'used', label: 'כבר בשימוש' },
];
const DIFFICULTIES: Difficulty[] = ['קל', 'בינוני', 'קשה'];

const uniq = (arr: string[]) => Array.from(new Set(arr));

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
  // נושא → יחידה → תת נושא → תגיות: each list is what is left after the one before it
  const [topic, setTopic] = useState('');
  const [unit, setUnit] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [picked, setPicked] = useState<LibraryQuestion | null>(null);
  // a question opened to be read in full, with its answer
  const [reading, setReading] = useState<LibraryQuestion | null>(null);

  const TOPICS = useMemo(() => uniq(QUESTION_LIBRARY.map((x) => x.topic)), []);
  const UNITS_OF = useMemo(
    () => uniq(QUESTION_LIBRARY.filter((x) => !topic || x.topic === topic).map((x) => x.subTopic)),
    [topic],
  );
  const SECTIONS_OF = useMemo(
    () => uniq(QUESTION_LIBRARY
      .filter((x) => (!topic || x.topic === topic) && (!unit || x.subTopic === unit))
      .map((x) => x.section)),
    [topic, unit],
  );
  // only tags that still exist further down the cascade are worth offering
  const TAGS_OF = useMemo(
    () => uniq(QUESTION_LIBRARY
      .filter((x) => (!topic || x.topic === topic) && (!unit || x.subTopic === unit)
        && (sections.length === 0 || sections.includes(x.section)))
      .flatMap((x) => x.tags)),
    [topic, unit, sections],
  );

  const shown = useMemo(
    () => QUESTION_LIBRARY.filter((x) =>
      (!q || x.prompt.includes(q.trim())) &&
      (used === 'all' || (used === 'used' ? x.usedIn.length > 0 : x.usedIn.length === 0)) &&
      (!topic || x.topic === topic) &&
      (!unit || x.subTopic === unit) &&
      (sections.length === 0 || sections.includes(x.section)) &&
      (!difficulty || x.difficulty === difficulty) &&
      // several tags can be on at once; a question matches if it carries any of them
      (tags.length === 0 || x.tags.some((t) => tags.includes(t)))
    ),
    [q, used, topic, unit, sections, difficulty, tags],
  );

  // a step back up the cascade drops what was chosen below it
  const pickTopic = (next: string) => { setTopic(next); setUnit(''); setSections([]); setTags([]); };
  const pickUnit = (next: string) => { setUnit(next); setSections([]); setTags([]); };
  const pickSections = (next: string[]) => { setSections(next); setTags([]); };

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
            <Stack spacing={2}>
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
              <TextField select size="small" label="רמה" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ width: 130 }}>
                <MenuItem value="">כל הרמות</MenuItem>
                {DIFFICULTIES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Stack>

            {/* one line, each field narrowing the next: נושא → יחידה → תת נושא → תגיות */}
            <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
              <TextField select size="small" label="נושא" value={topic} onChange={(e) => pickTopic(e.target.value)} sx={{ flex: 1, minWidth: 160 }}>
                <MenuItem value="">כל הנושאים</MenuItem>
                {TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              {/* in order: a יחידה lives under a נושא, a תת נושא under a יחידה, tags under those */}
              <TextField select size="small" label="יחידה" value={unit} onChange={(e) => pickUnit(e.target.value)} disabled={!topic} sx={{ flex: 1, minWidth: 160 }}>
                <MenuItem value="">כל היחידות</MenuItem>
                {UNITS_OF.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
              <TextField
                select
                size="small"
                label="תת נושא"
                disabled={!unit}
                value={sections}
                onChange={(e) => pickSections(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as unknown as string[]))}
                SelectProps={{
                  multiple: true,
                  displayEmpty: true,
                  renderValue: (v) => {
                    const picked2 = v as string[];
                    if (picked2.length === 0) return 'כל תתי הנושאים';
                    return picked2.length === 1 ? picked2[0] : `${picked2.length} תתי נושא נבחרו`;
                  },
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 160 }}
              >
                {SECTIONS_OF.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    <Checkbox checked={sections.includes(sec)} />
                    <ListItemText primary={sec} />
                  </MenuItem>
                ))}
              </TextField>
              {/* more than one tag can be on at a time */}
              <TextField
                select
                size="small"
                label="תגיות"
                disabled={sections.length === 0}
                value={tags}
                onChange={(e) => setTags(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as unknown as string[]))}
                SelectProps={{
                  multiple: true,
                  displayEmpty: true,
                  renderValue: (v) => {
                    const picked2 = v as string[];
                    if (picked2.length === 0) return 'כל התגיות';
                    return picked2.length === 1 ? picked2[0] : `${picked2.length} תגיות נבחרו`;
                  },
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 160 }}
              >
                {TAGS_OF.map((t) => (
                  <MenuItem key={t} value={t}>
                    <Checkbox checked={tags.includes(t)} />
                    <ListItemText primary={t} />
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
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
              <QuestionPickCard
                key={x.id}
                q={x}
                selected={picked?.id === x.id}
                // one question is added at a time, so ticking one unticks the one before it
                onToggle={() => setPicked(picked?.id === x.id ? null : x)}
                onOpen={() => setReading(x)}
                disabled={inUse.includes(x.prompt)}
                disabledNote="כבר במשימה"
              />
            ))}
          </Stack>
        )}
      </DialogContent>

      {reading && <QuestionPreviewDialog q={reading} onClose={() => setReading(null)} />}

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
