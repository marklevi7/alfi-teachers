import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';
import { QuestionPickCard } from './QuestionPickCard';
import { QuestionPreviewDialog } from './QuestionPreviewDialog';
import { ConfirmDialog, NoticeDialog } from './ConfirmDialog';
import { TestPreview } from './TestPreview';
import { EmptyState } from './EmptyState';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  QUESTION_LIBRARY, QUESTION_TAGS, CURRICULUM_TOPICS, unitsOf, sectionsOf, READY_TESTS, bankQuestionFor,
  type Difficulty, type LibraryQuestion, type ReadyTest, type ClassAssessment,
} from './mockData';
import { KindIcon } from './KindIcon';
import { PageHeader } from './PageHeader';
import { StickyBar, BarSpacer, fillsPage } from './StickyBar';

const DIFFICULTIES: Difficulty[] = ['קל', 'בינוני', 'קשה'];

// a test assembled question by question has no יח"ל field of its own yet
const UNIT_FALLBACK = '5 יח"ל';

const pad2 = (n: number) => String(n).padStart(2, '0');

// the app writes dates as DD/MM/YY everywhere, including in DateField
const todayAppDate = (() => {
  const now = new Date();
  return `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${String(now.getFullYear()).slice(2)}`;
})();

// the clock, on the same five-minute grid the picker's arrows walk
const clockPlus = (hours: number) => {
  const t = new Date();
  t.setHours(t.getHours() + hours);
  return `${pad2(t.getHours())}:${pad2(Math.floor(t.getMinutes() / 5) * 5)}`;
};

// same small meta text the other screens use
const META = {
  fontSize: (t: import('@mui/material/styles').Theme) => t.typography.body2.fontSize,
  fontWeight: 400,
  color: 'text.secondary',
} as const;

// the first decision of the screen: take a whole test that exists, or build one question
// by question. Everything below the tabs belongs to whichever route is open.
type Mode = 'questions' | 'existing';
const MODES: { key: Mode; label: string }[] = [
  { key: 'existing', label: 'בחירה מהערכות קיימות' },
  { key: 'questions', label: 'בחירת שאלות' },
];


/** one assessment the class already has, offered whole. Reading it is the way in — a card
    is a summary, not a click target, because a test is taken only after it has been read. */
function ReadyTestCard({ t, onPreview }: { t: ReadyTest; onPreview: () => void }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {/* the card is the way in: reading the test is how it is taken */}
      <CardActionArea onClick={onPreview} sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {/* always the test glyph — a תרגול is not built here */}
            <KindIcon kind="בוחן" size="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{t.title}</Typography>
              <Typography sx={META}>{t.questions.length} שאלות</Typography>
            </Stack>
            <Typography sx={{ ...META, mt: 1 }}>{t.unit} · {t.topic} · {t.subTopic}</Typography>
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

/** בניית מבחן — the form, then one of two routes to the questions, then out to the class. */
export function BuildTest({ onSend }: { onSend: (test: ClassAssessment) => void }) {
  const [title, setTitle] = useState('');
  // a new test opens today unless the teacher says otherwise
  const [date, setDate] = useState(todayAppDate);
  // a test opens now and runs an hour, unless the teacher moves either end
  const [opensAt, setOpensAt] = useState(() => clockPlus(0));
  const [closesAt, setClosesAt] = useState(() => clockPlus(1));
  // what the test is made of: every question ticked in the table below
  const [picked, setPicked] = useState<string[]>([]);
  // the filters cascade right to left: a נושא decides the יחידות, a יחידה decides the תת נושאים
  const [topic, setTopic] = useState('');
  const [unit, setUnit] = useState('');
  // more than one תת נושא can be on at a time
  const [sections, setSections] = useState<string[]>([]);
  // a teacher is offered what already exists first; building from questions is the other route
  const [mode, setMode] = useState<Mode>('existing');
  // these two stand outside the cascade — they cut across whatever branch is open
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('');
  // a question read in full, without having to pick it first
  const [preview, setPreview] = useState<LibraryQuestion | null>(null);
  // a whole test read end to end, the way the class will meet it
  const [testPreview, setTestPreview] = useState<ReadyTest | null>(null);

  const shown = useMemo(
    () => QUESTION_LIBRARY.filter((q) =>
      (!topic || q.topic === topic) &&
      (!unit || q.subTopic === unit) &&
      (sections.length === 0 || sections.includes(q.section)) &&
      // several tags can be on at once; a question matches if it carries any of them
      (tags.length === 0 || q.tags.some((t) => tags.includes(t))) &&
      (!difficulty || q.difficulty === difficulty)
    ),
    [topic, unit, sections, tags, difficulty],
  );

  // the same filters, read against a whole test: its נושא, its יחידה, the תת נושאים and
  // difficulties its questions cover, and its tags
  const readyTests = useMemo(
    () => READY_TESTS.filter((t) =>
      (!topic || t.topic === topic) &&
      (!unit || t.subTopic === unit) &&
      (sections.length === 0 || t.sections.some((sec) => sections.includes(sec))) &&
      (tags.length === 0 || t.tags.some((tag) => tags.includes(tag))) &&
      (!difficulty || t.difficulties.includes(difficulty as never))
    ),
    [topic, unit, sections, tags, difficulty],
  );

  // the ticked questions, read as one test so the same preview can show them
  const draftTest: ReadyTest = {
    id: 'draft',
    title: title || 'המבחן שנבנה',
    unit: '',
    topic: '',
    subTopic: '',
    tags: [],
    questions: picked
      .map((id) => QUESTION_LIBRARY.find((q) => q.id === id)?.prompt)
      .filter(Boolean) as string[],
    sections: [],
    difficulties: [],
  };
  const previewingDraft = testPreview?.id === 'draft';

  /** what a test of these questions is called, before the teacher renames it */
  const suggestedName = (test: ReadyTest) => {
    const known = test.questions.map(bankQuestionFor).filter(Boolean) as LibraryQuestion[];
    const topics = Array.from(new Set(known.map((k) => k.topic)));
    const units = Array.from(new Set(known.map((k) => k.subTopic)));
    if (topics.length === 1 && units.length === 1) return `מבחן ב${topics[0]} · ${units[0]}`;
    if (topics.length === 1) return `מבחן ב${topics[0]}`;
    return test.title;
  };
  // opening the preview is where a test gets its name, its day and its hours
  const openPreview = (test: ReadyTest) => {
    if (!title.trim()) setTitle(test.id === 'draft' ? suggestedName(test) : test.title);
    setTestPreview(test);
  };

  // what is about to go out: whatever the preview is showing, or the picks on the table
  const outgoing = testPreview
    ? (previewingDraft ? draftTest : testPreview)
    : mode === 'questions' ? draftTest : null;
  // an existing assessment brings its own name; the form's name overrides it when filled in
  const outgoingName = title.trim() || (outgoing && outgoing.id !== 'draft' ? outgoing.title : '');
  // nothing leaves half-filled: a name, a day, both hours, and at least one question
  const missing = [
    !outgoingName && 'שם המבחן',
    !date && 'תאריך',
    !opensAt && 'שעת פתיחה',
    !closesAt && 'שעת סגירה',
    !outgoing?.questions.length && 'שאלות',
  ].filter(Boolean) as string[];
  const [confirmSend, setConfirmSend] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const send = () => (missing.length ? setBlocked(true) : setConfirmSend(true));

  // a step back up the cascade drops what was chosen below it — it no longer exists there
  const pickTopic = (next: string) => { setTopic(next); setUnit(''); setSections([]); };
  const pickUnit = (next: string) => { setUnit(next); setSections([]); };

  const toggle = (id: string) =>
    setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  // the two dialogs of the send step, shown from whichever half of the screen is open
  const sendDialogs = (
    <>
        {blocked && (
          <NoticeDialog
            title="עוד אי אפשר לשלוח"
            body={`חסר כדי לשלוח את המבחן:\n${missing.join(', ')}`}
            onClose={() => setBlocked(false)}
          />
        )}

        {confirmSend && outgoing && (
          <ConfirmDialog
            title="לשלוח את המבחן לתלמידים?"
            // the sentence the teacher checks before the test leaves: when it opens and when it shuts
            body={`"${outgoingName}" · ${outgoing.questions.length === 1 ? 'שאלה אחת' : `${outgoing.questions.length} שאלות`}\nנפתח ב-${date.slice(0, 5)} בשעה ${opensAt}, ייסגר ב-${closesAt}`}
            confirmLabel="שליחה"
            onConfirm={() => {
              onSend({
                id: `new-${Date.now()}`,
                title: outgoingName,
                kind: 'בוחן',
                unit: outgoing.unit || UNIT_FALLBACK,
                topic: outgoing.topic || topic || 'כללי',
                subTopic: outgoing.subTopic || unit || 'מעורב',
                tags: outgoing.tags,
                opensOn: date,
                opensAt,
                closesAt,
                state: 'scheduled',
                // only a borrowed bank needs an index; this task carries its own questions
                reviewIndex: 0,
                questions: outgoing.questions,
                submitted: 0,
                avgScore: null,
              });
              setConfirmSend(false);
              setTestPreview(null);
            }}
            onClose={() => setConfirmSend(false)}
          />
        )}
    </>
  );

  // the preview is a step of this screen and not a box over it, so the sidebar stays
  if (testPreview) {
    return (
      <>
        <TestPreview
          // the draft is re-read on every render, so a removal inside it shows at once
          test={previewingDraft ? draftTest : testPreview}
          // the last step of both routes is the same one: send what is on the screen
          schedule={{ name: title, date, opensAt, closesAt }}
          onScheduleChange={{ setName: setTitle, setDate, setOpensAt, setClosesAt }}
          action={{ label: 'שליחה לתלמידים', onClick: send }}
          // only a test being assembled can lose a question here
          onRemoveQuestion={previewingDraft ? (i: number) => setPicked(picked.filter((_, k) => k !== i)) : undefined}
          onClose={() => setTestPreview(null)}
        />
        {sendDialogs}
      </>
    );
  }

  return (
    // the screen fills the page, so the bar below it always lands on the bottom edge
    <Box sx={fillsPage}>
    <Stack spacing={3} sx={{ flex: 1 }}>
      <PageHeader icon={<KindIcon kind="בוחן" />} title="בניית מבחן" />

      {/* the first decision: a whole test that exists, or questions picked one by one.
          The tab labels say what this half of the screen is, so it carries no heading */}
      <Tabs
        value={mode}
        onChange={(_, v: Mode) => setMode(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 800 } }}
      >
        {MODES.map((m) => <Tab key={m.key} value={m.key} label={m.label} />)}
      </Tabs>

      {/* a test already chosen leaves nothing to filter — the page is down to that one test */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          {/* the cascade runs right to left: נושא → יחידה → תת נושא, then where to draw from.
              Nothing to press — the table answers as each field changes. */}
          <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
            <TextField
              select
              size="small"
              label="נושא"
              value={topic}
              onChange={(e) => pickTopic(e.target.value)}
              sx={{ flex: 1, minWidth: 190 }}
            >
              <MenuItem value="">כל הנושאים</MenuItem>
              {CURRICULUM_TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField
              select
              size="small"
              label="יחידה"
              value={unit}
              onChange={(e) => pickUnit(e.target.value)}
              disabled={!topic}
              sx={{ flex: 1, minWidth: 190 }}
            >
              <MenuItem value="">כל היחידות</MenuItem>
              {unitsOf(topic).map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            {/* several תתי נושא at once; the tick sits on the start side, as RTL puts it */}
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
              sx={{ flex: 1, minWidth: 190 }}
            >
              {sectionsOf(topic, unit).map((sec) => (
                <MenuItem key={sec} value={sec}>
                  <Checkbox checked={sections.includes(sec)} />
                  <ListItemText primary={sec} />
                </MenuItem>
              ))}
            </TextField>
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
                  const picked = v as string[];
                  if (picked.length === 0) return 'כל התגיות';
                  return picked.length === 1 ? picked[0] : `${picked.length} תגיות נבחרו`;
                },
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 190 }}
            >
              {QUESTION_TAGS.map((t) => (
                <MenuItem key={t} value={t}>
                  <Checkbox checked={tags.includes(t)} />
                  <ListItemText primary={t} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="רמת קושי"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="">כל הרמות</MenuItem>
              {DIFFICULTIES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {mode === 'existing' ? (
        readyTests.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <EmptyState
              dense
              icon={<SearchOffRounded />}
              title="אין הערכות שמתאימות לסינון"
              body="אפשר לוותר על אחד מהפילטרים ולראות יותר הערכות קיימות."
            />
          </Card>
        ) : (
        <Stack spacing={2}>
          {readyTests.map((t) => (
            <ReadyTestCard key={t.id} t={t} onPreview={() => openPreview(t)} />
          ))}
        </Stack>
        )
      ) : (
      <>

      {shown.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <EmptyState
            dense
            icon={<SearchOffRounded />}
            title="אין שאלות שמתאימות לסינון"
            body="אפשר לוותר על אחד מהפילטרים ולראות יותר שאלות מהמאגר."
          />
        </Card>
      ) : (
        <Stack spacing={2}>
          {/* a question is a card, not a table row: one line of it says nothing, so three
              lines show with the last fading out, and the card opens it in full */}
          {shown.map((q) => (
            <QuestionPickCard
              key={q.id}
              q={q}
              selected={picked.includes(q.id)}
              onToggle={() => toggle(q.id)}
              onOpen={() => setPreview(q)}
            />
          ))}
        </Stack>
      )}

      </>
      )}

      {sendDialogs}

      {preview && (
        <QuestionPreviewDialog
          q={preview}
          selected={picked.includes(preview.id)}
          onToggleSelect={() => toggle(preview.id)}
          onClose={() => setPreview(null)}
        />
      )}

    </Stack>

      {/* the bar rides the bottom of the page: what is in the test so far, and what to do with
          it. Only the assembly route has one — a whole test is chosen, not counted. */}
      {mode === 'questions' && (
        <StickyBar>
          <Stack spacing={0.25}>
            <Typography sx={{ fontSize: (t) => t.typography.body2.fontSize, color: 'text.secondary' }}>
              שאלות שנבחרו
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFeatureSettings: '"tnum","lnum"' }}>
              {picked.length}
            </Typography>
          </Stack>
          <BarSpacer />
          {/* nothing goes out unread: the whole test opens first, and it is sent from there */}
          <Button
            variant="contained"
            disabled={picked.length === 0}
            onClick={() => openPreview(draftTest)}
            sx={{ fontWeight: 800 }}
          >
            המשך
          </Button>
        </StickyBar>
      )}
    </Box>
  );
}
