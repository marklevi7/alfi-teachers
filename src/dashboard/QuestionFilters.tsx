import { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { QUESTION_LIBRARY, type LibraryQuestion, type Difficulty } from './mockData';

/** whether the class has already met a question */
export type UsedFilter = 'all' | 'fresh' | 'used';

const USED_FILTERS: { key: UsedFilter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'fresh', label: 'לא בשימוש' },
  { key: 'used', label: 'כבר בשימוש' },
];
const DIFFICULTIES: Difficulty[] = ['קל', 'בינוני', 'קשה'];

/** everything the filter box asks about, in one value */
export type QuestionFilterState = {
  /** free text, matched against the question itself */
  q: string;
  used: UsedFilter;
  topic: string;
  /** the יחידה — a question's subTopic */
  unit: string;
  /** תתי נושא; several at once */
  sections: string[];
  tags: string[];
  difficulty: string;
};

export const NO_FILTERS: QuestionFilterState = {
  q: '', used: 'all', topic: '', unit: '', sections: [], tags: [], difficulty: '',
};

/** the one reading of the filter box — every screen that shows it answers the same way */
export function matchesFilters(x: LibraryQuestion, f: QuestionFilterState) {
  return (!f.q || x.prompt.includes(f.q.trim()))
    && (f.used === 'all' || (f.used === 'used' ? x.usedIn.length > 0 : x.usedIn.length === 0))
    && (!f.topic || x.topic === f.topic)
    && (!f.unit || x.subTopic === f.unit)
    && (f.sections.length === 0 || f.sections.includes(x.section))
    && (!f.difficulty || x.difficulty === f.difficulty)
    // several tags can be on at once; a question matches if it carries any of them
    && (f.tags.length === 0 || x.tags.some((t) => f.tags.includes(t)));
}

const uniq = (arr: string[]) => Array.from(new Set(arr));

/**
 * The filter box, in one place: מאגר השאלות and בניית מבחן show the same control, in the same
 * order, with the same words. Two lines — what the question is *to the class* on the first
 * (free text, whether it has been used, how hard), and where it sits in the curriculum on the
 * second, cascading right to left: נושא → יחידה → תת נושא → תגיות. Nothing to press; the list
 * behind it answers as each field changes.
 */
export function QuestionFilters({ value, onChange, search = true, usage = true, mb }: {
  value: QuestionFilterState;
  onChange: (next: QuestionFilterState) => void;
  /** off where there is nothing to search by text — a shelf of whole tests */
  search?: boolean;
  /** off where a history with the class means nothing, e.g. a ready-made test */
  usage?: boolean;
  /** the gap under the card, when the screen behind it does not space its own children */
  mb?: number;
}) {
  const f = value;
  // each list is what is left after the one before it, so a filter never returns nothing
  const topics = useMemo(() => uniq(QUESTION_LIBRARY.map((x) => x.topic)), []);
  const units = useMemo(
    () => uniq(QUESTION_LIBRARY.filter((x) => !f.topic || x.topic === f.topic).map((x) => x.subTopic)),
    [f.topic],
  );
  const sections = useMemo(
    () => uniq(QUESTION_LIBRARY
      .filter((x) => (!f.topic || x.topic === f.topic) && (!f.unit || x.subTopic === f.unit))
      .map((x) => x.section)),
    [f.topic, f.unit],
  );
  const tags = useMemo(
    () => uniq(QUESTION_LIBRARY
      .filter((x) => (!f.topic || x.topic === f.topic) && (!f.unit || x.subTopic === f.unit)
        && (f.sections.length === 0 || f.sections.includes(x.section)))
      .flatMap((x) => x.tags)),
    [f.topic, f.unit, f.sections],
  );

  // a step back up the cascade drops what was chosen below it — it no longer exists there
  const pickTopic = (topic: string) => onChange({ ...f, topic, unit: '', sections: [], tags: [] });
  const pickUnit = (unit: string) => onChange({ ...f, unit, sections: [], tags: [] });
  const pickSections = (v: string[]) => onChange({ ...f, sections: v, tags: [] });
  const asList = (v: unknown) => (typeof v === 'string' ? v.split(',') : (v as string[]));

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, ...(mb !== undefined && { mb }) }}>
      <CardContent>
        <Stack spacing={2}>
          {(search || usage) && (
            <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
              {search && (
                <TextField
                  size="small"
                  value={f.q}
                  onChange={(e) => onChange({ ...f, q: e.target.value })}
                  placeholder="חיפוש בטקסט השאלה"
                  inputProps={{ 'aria-label': 'חיפוש בטקסט השאלה' }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment>) }}
                  sx={{ flex: 1, minWidth: 220 }}
                />
              )}
              {usage && (
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={f.used}
                  onChange={(_, v: UsedFilter | null) => v && onChange({ ...f, used: v })}
                  sx={{ height: 40, '& .MuiToggleButton-root': { fontWeight: 700, px: 2 } }}
                >
                  {USED_FILTERS.map((u) => <ToggleButton key={u.key} value={u.key}>{u.label}</ToggleButton>)}
                </ToggleButtonGroup>
              )}
              <TextField
                select
                size="small"
                label="רמת קושי"
                value={f.difficulty}
                onChange={(e) => onChange({ ...f, difficulty: e.target.value })}
                sx={{ width: 150 }}
              >
                <MenuItem value="">כל הרמות</MenuItem>
                {DIFFICULTIES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Stack>
          )}

          {/* one line, each field narrowing the next: נושא → יחידה → תת נושא → תגיות */}
          <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
            <TextField
              select
              size="small"
              label="נושא"
              value={f.topic}
              onChange={(e) => pickTopic(e.target.value)}
              sx={{ flex: 1, minWidth: 160 }}
            >
              <MenuItem value="">כל הנושאים</MenuItem>
              {topics.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField
              select
              size="small"
              label="יחידה"
              value={f.unit}
              onChange={(e) => pickUnit(e.target.value)}
              disabled={!f.topic}
              sx={{ flex: 1, minWidth: 160 }}
            >
              <MenuItem value="">כל היחידות</MenuItem>
              {units.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            {/* several תתי נושא at once; the tick sits on the start side, as RTL puts it */}
            <TextField
              select
              size="small"
              label="תת נושא"
              disabled={!f.unit}
              value={f.sections}
              onChange={(e) => pickSections(asList(e.target.value))}
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
              sx={{ flex: 1, minWidth: 160 }}
            >
              {sections.map((sec) => (
                <MenuItem key={sec} value={sec}>
                  <Checkbox checked={f.sections.includes(sec)} />
                  <ListItemText primary={sec} />
                </MenuItem>
              ))}
            </TextField>
            {/* more than one tag can be on at a time */}
            <TextField
              select
              size="small"
              label="תגיות"
              disabled={f.sections.length === 0}
              value={f.tags}
              onChange={(e) => onChange({ ...f, tags: asList(e.target.value) })}
              SelectProps={{
                multiple: true,
                displayEmpty: true,
                renderValue: (v) => {
                  const picked = v as string[];
                  if (picked.length === 0) return 'כל התגיות';
                  return picked.length === 1 ? picked[0] : `${picked.length} תגיות נבחרו`;
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 160 }}
            >
              {tags.map((t) => (
                <MenuItem key={t} value={t}>
                  <Checkbox checked={f.tags.includes(t)} />
                  <ListItemText primary={t} />
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
