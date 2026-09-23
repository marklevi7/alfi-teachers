import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import { FREDOKA } from '../theme';
import { KindIcon } from './KindIcon';
import { QNumber } from './QNumber';
import CardActionArea from '@mui/material/CardActionArea';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { ClampedText } from './ClampedText';
import { PageHeader, TaskTitle } from './PageHeader';
import { ReadyMadeTag } from './ReadyMadeTag';
import { StickyBar, BarSpacer, fillsPage } from './StickyBar';
import { QuestionDetail, QuestionHeading } from './QuestionDetail';
import { GraphThumb } from './GraphThumb';
import { QuestionLibrary } from './QuestionLibrary';
import { ConfirmDeleteDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { DateField, TimeSelect } from './DateTimeFields';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import {
  ASSESSMENT_QUESTIONS, TOPICS, SUB_TOPICS, subTopicsOf, sectionsOf, sectionsOfAssessment, graphFor,
  type ClassAssessment,
} from './mockData';

/** the last item in a נושא / תת נושא list: picking it asks for the new value instead of setting one */
const NEW_VALUE = '__new__';

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));


/** one field, one question: what is the new נושא called. Kept apart from the form behind it. */
function NewValueDialog({ title, label, onAdd, onClose }: {
  title: string; label: string; onAdd: (value: string) => void; onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && trimmed) onAdd(trimmed); }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 800 }}>ביטול</Button>
        <Button onClick={() => onAdd(trimmed)} disabled={!trimmed} variant="contained" sx={{ fontWeight: 800 }}>
          הוספה
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionTitle({ children, after }: { children: ReactNode; after?: ReactNode }) {
  // same section heading as סקירת הערכה, including the doubled space above it
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 3 }}>
      <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600, color: 'text.secondary' }}>
        {children}
      </Typography>
      {after}
    </Stack>
  );
}

// A task that has not opened yet has no results to show, so this screen is the task itself:
// the same fields the build form fills in, prefilled, plus the delete only a queued task
// can offer. Replace the body with the shared בניית תרגול / בניית מבחן form once it exists.
export function ScheduledTask({ task, onBack, onSave, onDelete }: {
  task: ClassAssessment;
  onBack: () => void;
  onSave: (next: ClassAssessment) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [opensOn, setOpensOn] = useState(task.opensOn);
  const [opensAt, setOpensAt] = useState(task.opensAt ?? '');
  const [closesAt, setClosesAt] = useState(task.closesAt ?? '');
  const [topic, setTopic] = useState(task.topic);
  const [subTopic, setSubTopic] = useState(task.subTopic);
  const [sections, setSections] = useState<string[]>(() => sectionsOfAssessment(task));
  // tags live on questions, not on the task, so the form no longer edits them
  const tags = task.tags;
  // the questions as they stand in the queued task — no results on them, nothing has run
  const [questions, setQuestions] = useState(
    () => task.questions ?? ASSESSMENT_QUESTIONS[task.reviewIndex].map((q) => q.prompt),
  );
  // removing a question is not undoable, so it is asked about first
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  // a question opened to be read, as in בניית מבחן — the text in full with its answer
  const [reading, setReading] = useState<number | null>(null);
  // a נושא the teacher invents here joins the list for the rest of the session
  const [addedTopics, setAddedTopics] = useState<string[]>([]);
  const [addedSubTopics, setAddedSubTopics] = useState<string[]>([]);
  const [creating, setCreating] = useState<null | 'topic' | 'subTopic'>(null);

  // whatever the class has covered, plus anything invented here, plus the value already on the
  // task — a select cannot show a value that is not one of its options
  const topicOptions = uniq([...TOPICS, ...addedTopics, topic]);
  const underTopic = subTopicsOf(topic);
  const subTopicOptions = uniq([...(underTopic.length ? underTopic : SUB_TOPICS), ...addedSubTopics, subTopic]);
  const sectionOptions = uniq([...sectionsOf(topic, subTopic), ...sections]);

  // a step back up the cascade drops what was chosen below it
  const pickTopic = (next: string) => { setTopic(next); setSubTopic(''); setSections([]); };
  const pickSubTopic = (next: string) => { setSubTopic(next); setSections([]); };
  // a task that already went out is still editable, but it cannot be called off any more
  const queued = task.state === 'scheduled';
  // a test taken whole off the shelf: its question list is fixed, the details around it are not
  const fixed = task.readyMade === true;

  return (
    // the screen fills the page, so the bar below it always lands on the bottom edge
    <Box sx={fillsPage}>
    <Stack spacing={3} sx={{ flex: 1 }}>
      <PageHeader
        back={{ label: 'חזרה לכל ההערכות', onClick: onBack }}
        title={`עריכת ${task.kind}${queued ? ' מתוזמן' : ''}`}
      />

      {/* the task itself: its glyph, its name, and — on a ready-made one — the same lock the
          question list carries */}
      <TaskTitle
        icon={<KindIcon kind={task.kind} />}
        name={task.title}
        after={fixed && <ReadyMadeTag kind={task.kind} />}
        meta={queued
          ? `ייפתח בתאריך ${task.opensOn}${opensAt ? ` בשעה ${opensAt}` : ''} · טרם נשלח לתלמידים, אפשר לשנות הכל או לבטל`
          : `נפתח בתאריך ${task.opensOn}${opensAt ? ` בשעה ${opensAt}` : ''} · כבר נשלח לתלמידים, שינויים יחולו על מי שטרם הגיש`}
      />

      <SectionTitle>פרטי המשימה</SectionTitle>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2.5}>
            {/* the basic line: what it is called, on what day, and between which hours */}
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="שם המשימה"
                placeholder="הכנס שם משימה…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ flex: 2, minWidth: 260 }}
              />
              <DateField value={opensOn} onChange={setOpensOn} sx={{ flex: 1, minWidth: 180 }} />
              <TimeSelect label="שעת פתיחה" value={opensAt} onChange={setOpensAt} sx={{ width: 150 }} />
              <TimeSelect label="שעת סגירה" value={closesAt} onChange={setClosesAt} sx={{ width: 150 }} />
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {/* the same three levels the rest of the app files a task under, in order */}
              <TextField
                select
                label="נושא"
                value={topic}
                onChange={(e) => (e.target.value === NEW_VALUE ? setCreating('topic') : pickTopic(e.target.value))}
                sx={{ flex: 1, minWidth: 200 }}
              >
                {topicOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                <MenuItem value={NEW_VALUE} sx={{ color: 'primary.main', fontWeight: 800 }}>+ נושא חדש…</MenuItem>
              </TextField>
              {/* the hierarchy is walked in order: a יחידה only exists under a נושא */}
              <TextField
                select
                label="יחידה"
                value={subTopic}
                onChange={(e) => (e.target.value === NEW_VALUE ? setCreating('subTopic') : pickSubTopic(e.target.value))}
                disabled={!topic}
                sx={{ flex: 1, minWidth: 200 }}
              >
                {subTopicOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                <MenuItem value={NEW_VALUE} sx={{ color: 'primary.main', fontWeight: 800 }}>+ יחידה חדשה…</MenuItem>
              </TextField>
              {/* more than one תת נושא can sit under a task, as its questions do */}
              <TextField
                select
                label="תת נושא"
                disabled={!subTopic}
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
                sx={{ flex: 1, minWidth: 200 }}
              >
                {sectionOptions.map((sec) => (
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

      <SectionTitle after={fixed ? <ReadyMadeTag kind={task.kind} /> : undefined}>
        שאלות ה{task.kind} ({questions.length})
      </SectionTitle>
      {questions.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <EmptyState
              icon={<HelpOutlineRounded />}
              title="אין עדיין שאלות"
              body={`הוסיפי שאלות ל${task.kind} לפני מועד הפתיחה — אחרת הוא לא ייצא לתלמידים.`}
            />
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {questions.map((prompt, i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{
                borderRadius: 3,
                transition: (t) => t.transitions.create(['box-shadow', 'border-color']),
                '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            >
              <Stack direction="row" alignItems="flex-start">
                {/* the card opens the question in full, the way בניית מבחן does */}
                <CardActionArea onClick={() => setReading(i)} sx={{ flex: 1, minWidth: 0, px: 3, py: 2.5 }}>
                  {/* a card with a picture holds three lines' worth of height even when the
                      question is one line, so the thumbnail always has room */}
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    spacing={2}
                    sx={{ minHeight: graphFor(prompt) ? 88 : undefined }}
                  >
                    <QNumber index={i} />
                    <ClampedText
                      text={prompt}
                      maxHeight={88}
                      textSx={{ lineHeight: (t) => t.typography.button.lineHeight }}
                    />
                    {/* a question about a curve shows it, so the shape is read before the words */}
                    {graphFor(prompt) && <GraphThumb graph={graphFor(prompt)!} />}
                  </Stack>
                </CardActionArea>
                {/* a ready-made test keeps its questions: nothing to remove them with */}
                {!fixed && (
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, px: 1.5, pt: 2 }}>
                  <Tooltip title="הסרת השאלה" placement="top" arrow>
                    <IconButton
                      aria-label={`הסרת שאלה ${i + 1}`}
                      onClick={() => setConfirmRemove(i)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteOutlineRounded />
                    </IconButton>
                  </Tooltip>
                </Stack>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
      {!fixed && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" startIcon={<AddRounded />} onClick={() => setLibraryOpen(true)}>
            הוספת שאלה
          </Button>
        </Box>
      )}

      {creating && (
        <NewValueDialog
          title={creating === 'topic' ? 'נושא חדש' : 'תת נושא חדש'}
          label={creating === 'topic' ? 'שם הנושא' : 'שם תת הנושא'}
          onAdd={(value) => {
            if (creating === 'topic') { setAddedTopics([...addedTopics, value]); setTopic(value); }
            else { setAddedSubTopics([...addedSubTopics, value]); setSubTopic(value); }
            setCreating(null);
          }}
          onClose={() => setCreating(null)}
        />
      )}

      {reading !== null && (
        <Dialog
          open
          onClose={() => setReading(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle component="div" sx={{ pb: 0 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <QuestionHeading index={reading} />
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={() => setReading(null)} aria-label="סגירה">
                <CloseRounded />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <QuestionDetail prompt={questions[reading]} />
          </DialogContent>
        </Dialog>
      )}

      {libraryOpen && (
        <QuestionLibrary
          inUse={questions}
          onPick={(q) => { setQuestions([...questions, q.prompt]); setLibraryOpen(false); }}
          onClose={() => setLibraryOpen(false)}
        />
      )}

      {confirmRemove !== null && (
        <ConfirmDeleteDialog
          title={`להסיר את שאלה ${confirmRemove + 1}?`}
          body={`השאלה תוסר מה${task.kind} ולא ניתן יהיה לשחזר אותה. שאר השאלות יישארו כפי שהן.`}
          confirmLabel="הסרה"
          onConfirm={() => {
            setQuestions(questions.filter((_, k) => k !== confirmRemove));
            setConfirmRemove(null);
          }}
          onClose={() => setConfirmRemove(null)}
        />
      )}

      {confirmDeleteTask && (
        <ConfirmDeleteDialog
          title={`למחוק את ${task.kind === 'בוחן' ? 'הבוחן' : 'התרגול'}?`}
          body={`"${title}" יימחק על כל שאלותיו ולא ניתן יהיה לשחזר אותו. המשימה לא תישלח לתלמידים.`}
          confirmLabel="מחיקה"
          onConfirm={onDelete}
          onClose={() => setConfirmDeleteTask(false)}
        />
      )}

    </Stack>

      {/* the same bar בניית מבחן and תצוגה מקדימה end on: what the task holds at the inline
          start, and the actions at the far end — the primary one last, on the very edge */}
      <StickyBar>
        <Typography color="text.secondary">
          {questions.length} שאלות · {title || 'ללא שם'}
        </Typography>
        <BarSpacer />
        {queued && (
          <Button onClick={() => setConfirmDeleteTask(true)} color="error" startIcon={<DeleteOutlineRounded />} sx={{ fontWeight: 800 }}>
            מחיקת המשימה
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => onSave({ ...task, title, opensOn, opensAt, closesAt, topic, subTopic, sections, tags })}
          sx={{ fontWeight: 800 }}
        >
          שמירה
        </Button>
      </StickyBar>
    </Box>
  );
}
