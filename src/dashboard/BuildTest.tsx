import { useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';
import { QuestionPickCard } from './QuestionPickCard';
import { QuestionPreviewDialog } from './QuestionPreviewDialog';
import { ConfirmDialog, NoticeDialog } from './ConfirmDialog';
import { TestPreview } from './TestPreview';
import { EmptyState } from './EmptyState';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  QUESTION_LIBRARY, READY_TESTS, bankQuestionFor,
  type LibraryQuestion, type ReadyTest, type ClassAssessment,
} from './mockData';
import { KindIcon, type Kind } from './KindIcon';
import { QuestionCard } from './TestQuestionCard';
import { QuestionFilters, NO_FILTERS, matchesFilters } from './QuestionFilters';
import { ReadyMadeTag } from './ReadyMadeTag';
import { PageHeader } from './PageHeader';
import { StickyBar, BarSpacer } from './StickyBar';
import { NICE_SCROLLBAR } from './scrollbar';


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

// the type's own value is 'בוחן'; every screen actually calls it "מבחן" — the same split
// ReadyMadeTag already reads by
const NOUN: Record<Kind, string> = { בוחן: 'מבחן', תרגול: 'תרגול' };

// the first decision of the screen: take a whole test that exists, or build one question
// by question. Everything below the tabs belongs to whichever route is open.
type Mode = 'questions' | 'existing';
const MODES: { key: Mode; label: string }[] = [
  { key: 'existing', label: 'בחירה מהערכות קיימות' },
  { key: 'questions', label: 'בחירת שאלות' },
];


/** one assessment the class already has, offered whole. Reading it is the way in — a card
    is a summary, not a click target, because a test is taken only after it has been read. */
function ReadyTestCard({ t, kind, onPreview, selected = false }: {
  t: ReadyTest;
  kind: Kind;
  onPreview: () => void;
  /** in the split view, the test the pane beside the list is showing */
  selected?: boolean;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: selected ? 'primary.main' : 'divider',
        ...(selected && { boxShadow: 4, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }),
        transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {/* the card is the way in: reading the test is how it is taken */}
      <CardActionArea onClick={onPreview} sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <KindIcon kind={kind} size="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{t.title}</Typography>
              <Typography sx={META}>{t.questions.length} שאלות</Typography>
            </Stack>
            {/* the three levels a question sits under: נושא → יחידה → תת נושא */}
            <Typography sx={{ ...META, mt: 1 }}>
              {[t.topic, t.subTopic, t.sections.join(', ')].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

/** The demo states of this screen, switched from the dev control bar: the two routes into
    the questions, the assembly route with questions already on it, and the step that reads
    a whole test. The screen is remounted on a switch, so each state opens clean. */
export type BuildTestVariant = 'existing' | 'questions' | 'picked' | 'preview';

/** the questions a 'picked' demo opens with — the first few the library offers */
const DEMO_PICKS = 3;

/** the demo's first ready-made item of this kind — 'preview' opens on it named already */
const firstReadyOf = (kind: Kind) => READY_TESTS.find((t) => t.kind === kind) ?? READY_TESTS[0];

/** בניית מבחן / בניית תרגול — the form, then one of two routes to the questions, then out to
    the class. One component behind both screens: only the kind and its wording differ. */
export function BuildTest({ kind, variant = 'existing', onSend }: {
  /** which builder this is — decides the glyph, every "מבחן"/"תרגול" word, and which ready
      assessments the shelf offers */
  kind: Kind;
  variant?: BuildTestVariant;
  onSend: (test: ClassAssessment) => void;
}) {
  const noun = NOUN[kind];
  // a test read in full already carries its name; the other states start unnamed
  const [title, setTitle] = useState(variant === 'preview' ? firstReadyOf(kind).title : '');
  // a new test opens today unless the teacher says otherwise
  const [date, setDate] = useState(todayAppDate);
  // a test opens now and runs an hour, unless the teacher moves either end. A תרגול has no
  // closing time or date by default — it stays open until the teacher decides otherwise
  const [opensAt, setOpensAt] = useState(() => clockPlus(0));
  const [closesAt, setClosesAt] = useState(() => (kind === 'תרגול' ? '' : clockPlus(1)));
  const [closesOn, setClosesOn] = useState('');
  // what the test is made of: every question ticked in the table below
  const [picked, setPicked] = useState<string[]>(
    () => (variant === 'picked' ? QUESTION_LIBRARY.slice(0, DEMO_PICKS).map((q) => q.id) : []),
  );
  // the filter box's own value: free text, history with the class, and the cascade
  const [filters, setFilters] = useState(NO_FILTERS);
  const { topic, unit, sections, tags, difficulty } = filters;
  // a teacher is offered what already exists first; building from questions is the other route
  const [mode, setMode] = useState<Mode>(
    variant === 'questions' || variant === 'picked' ? 'questions' : 'existing',
  );
  // which test the reading pane is showing; the first one on the shelf until another is clicked
  const [openId, setOpenId] = useState<string | null>(null);
  // a question read in full, without having to pick it first
  const [preview, setPreview] = useState<LibraryQuestion | null>(null);
  // a whole test read end to end, the way the class will meet it
  const [testPreview, setTestPreview] = useState<ReadyTest | null>(
    variant === 'preview' ? firstReadyOf(kind) : null,
  );

  const shown = useMemo(() => QUESTION_LIBRARY.filter((q) => matchesFilters(q, filters)), [filters]);

  // the same filters, read against a whole test: its נושא, its יחידה, the תת נושאים and
  // difficulties its questions cover, and its tags. The shelf only ever offers this builder's
  // own kind — a תרגול builder never lists a בוחן, and the other way around
  const readyTests = useMemo(
    () => READY_TESTS.filter((t) =>
      t.kind === kind &&
      (!filters.q || t.title.includes(filters.q.trim())) &&
      (!topic || t.topic === topic) &&
      (!unit || t.subTopic === unit) &&
      (sections.length === 0 || t.sections.some((sec) => sections.includes(sec))) &&
      (tags.length === 0 || t.tags.some((tag) => tags.includes(tag))) &&
      (!difficulty || t.difficulties.includes(difficulty as never))
    ),
    [kind, filters, topic, unit, sections, tags, difficulty],
  );

  // the test the pane reads: the one clicked, while the filters still show it
  const openTest = readyTests.find((t) => t.id === openId) ?? readyTests[0] ?? null;

  // the ticked questions, read as one test so the same preview can show them
  const draftTest: ReadyTest = {
    id: 'draft',
    title: title || `ה${noun} שנבנה`,
    kind,
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
    if (topics.length === 1 && units.length === 1) return `${noun} ב${topics[0]} · ${units[0]}`;
    if (topics.length === 1) return `${noun} ב${topics[0]}`;
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
  // nothing leaves half-filled: a name, a day, an opening hour, and at least one question.
  // A תרגול has no closing hour to demand — it stays open until the teacher says otherwise
  const missing = [
    !outgoingName && `שם ה${noun}`,
    !date && 'תאריך',
    !opensAt && 'שעת פתיחה',
    kind === 'בוחן' && !closesAt && 'שעת סגירה',
    !outgoing?.questions.length && 'שאלות',
  ].filter(Boolean) as string[];
  const [confirmSend, setConfirmSend] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const send = () => (missing.length ? setBlocked(true) : setConfirmSend(true));

  const toggle = (id: string) =>
    setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  // the two dialogs of the send step, shown from whichever half of the screen is open
  const sendDialogs = (
    <>
        {blocked && (
          <NoticeDialog
            title="עוד אי אפשר לשלוח"
            body={`חסר כדי לשלוח את ה${noun}:\n${missing.join(', ')}`}
            onClose={() => setBlocked(false)}
          />
        )}

        {confirmSend && outgoing && (
          <ConfirmDialog
            title={`לשלוח את ה${noun} לתלמידים?`}
            // the sentence the teacher checks before it leaves: when it opens, and when it
            // shuts — a תרגול without a closing date or hour just doesn't mention one, and a
            // closing date only shows up when it differs from the opening day
            body={`"${outgoingName}" · ${outgoing.questions.length === 1 ? 'שאלה אחת' : `${outgoing.questions.length} שאלות`}\nנפתח ב-${date.slice(0, 5)} בשעה ${opensAt}${
              closesOn || closesAt
                ? `, ייסגר ${[closesOn && `ב-${closesOn.slice(0, 5)}`, closesAt && `בשעה ${closesAt}`].filter(Boolean).join(' ')}`
                : ''
            }`}
            confirmLabel="שליחה"
            onConfirm={() => {
              onSend({
                id: `new-${Date.now()}`,
                title: outgoingName,
                kind,
                topic: outgoing.topic || topic || 'כללי',
                subTopic: outgoing.subTopic || unit || 'מעורב',
                tags: outgoing.tags,
                opensOn: date,
                opensAt,
                closesAt,
                closesOn,
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
          kind={kind}
          // the draft is re-read on every render, so a removal inside it shows at once
          test={previewingDraft ? draftTest : testPreview}
          // the last step of both routes is the same one: send what is on the screen
          schedule={{ name: title, date, opensAt, closesAt, closesOn }}
          onScheduleChange={{ setName: setTitle, setDate, setOpensAt, setClosesAt, setClosesOn }}
          action={{ label: 'שליחה לתלמידים', onClick: send }}
          // only a test being assembled can lose a question here
          onRemoveQuestion={previewingDraft ? (i: number) => setPicked(picked.filter((_, k) => k !== i)) : undefined}
          // a test taken off the shelf says so, and says why its questions are fixed
          readyMade={!previewingDraft}
          onClose={() => setTestPreview(null)}
        />
        {sendDialogs}
      </>
    );
  }

  return (
    // the screen takes exactly the page and nothing below it moves: the shelf scrolls its two
    // halves, the question list scrolls itself, and the bar below both stays on the bottom edge
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <Stack
      spacing={3}
      sx={{
        flex: 1,
        minHeight: 0,
        // the shelf manages its own scrolling; the question list scrolls as one column, and
        // nothing in that column is allowed to be squeezed to fit — it scrolls instead
        ...(mode === 'questions' && {
          overflowY: 'auto',
          pb: 1,
          '& > *': { flexShrink: 0 },
          ...NICE_SCROLLBAR,
        }),
      }}
    >
      <PageHeader icon={<KindIcon kind={kind} />} title={`בניית ${noun}`} />

      {/* the first decision: a whole test that exists, or questions picked one by one.
          The tab labels say what this half of the screen is, so it carries no heading */}
      <Tabs
        value={mode}
        onChange={(_, v: Mode) => setMode(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 800 } }}
      >
        {MODES.map((m) => <Tab key={m.key} value={m.key} label={m.label} />)}
      </Tabs>

      {/* the app's one filter box, shared with מאגר השאלות. A shelf of whole tests has no
          history with the class to filter by */}
      <QuestionFilters value={filters} onChange={setFilters} usage={mode === 'questions'} />

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
          // the mail-client split: the shelf on one half, what a card holds on the other.
          // The two halves fill what is left of the page and scroll on their own, the way a
          // mail client's list and reading pane do
          // the reading pane is where the teacher actually reads a test, so it gets the
          // larger half — the shelf only has to fit a title and a line of meta per row
          <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 3fr' }, gap: 2 }}>
            {/* the shelf scrolls inside its own half — a plain block scroller, so the cards
                keep their height instead of being squeezed by the flex column */}
            <Box sx={{ minHeight: 0, overflowY: 'auto', pb: 1, ...NICE_SCROLLBAR }}>
            <Stack spacing={2}>
              {readyTests.map((t) => (
                <ReadyTestCard
                  key={t.id}
                  t={t}
                  kind={kind}
                  selected={t.id === openTest?.id}
                  // a click reads the test beside the list instead of leaving the shelf
                  onPreview={() => setOpenId(t.id)}
                />
              ))}
            </Stack>
            </Box>
            {/* the reading pane: the test scrolls inside it, and the list beside it stays put */}
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, minHeight: 0, display: 'flex', flexDirection: 'column' }}
            >
              {openTest && (
                <CardContent sx={{ flex: 1, minHeight: 0, overflowY: 'auto', ...NICE_SCROLLBAR }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <KindIcon kind={kind} size="small" />
                      {/* the name is the way out of the pane: it opens the test on the whole screen,
                          exactly as clicking a card does on the other version */}
                      <Tooltip title={`פתיחת ה${noun} במסך מלא`} placement="top" arrow>
                        <Link
                          component="button"
                          type="button"
                          variant="h6"
                          underline="hover"
                          color="inherit"
                          onClick={() => openPreview(openTest)}
                          sx={{ fontWeight: 800, lineHeight: 1.2, flex: 1, minWidth: 0, textAlign: 'start', cursor: 'pointer' }}
                        >
                          {openTest.title}
                        </Link>
                      </Tooltip>
                      {/* a test off the shelf is a closed unit, and says so wherever it is read */}
                      <ReadyMadeTag kind={kind} />
                    </Stack>
                    <Typography sx={META}>
                      {[openTest.topic, openTest.subTopic, openTest.sections.join(', ')].filter(Boolean).join(' · ')}
                      {' · '}{openTest.questions.length} שאלות
                    </Typography>
                    {/* the same question card the full preview uses. Here it is only read —
                        the whole test opens from the name above, not question by question */}
                    <Stack spacing={1.5}>
                      {openTest.questions.map((q, i) => (
                        <QuestionCard key={q} prompt={q} index={i} />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              )}
              {/* naming, timing and sending still happen on the full step; the way there rides
                  the pane's bottom edge, so it is reachable without scrolling the test */}
              {openTest && (
                <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={() => openPreview(openTest)} sx={{ fontWeight: 800 }}>
                    המשך
                  </Button>
                </Box>
              )}
            </Card>
          </Box>
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
          prompt={preview.prompt}
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
