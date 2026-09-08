import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import { FREDOKA } from '../theme';
import { KindIcon } from './KindIcon';
import { QNumber } from './QNumber';
import { QuestionLibrary } from './QuestionLibrary';
import { EmptyState } from './EmptyState';
import { UNITS, ASSESSMENT_TAGS, ASSESSMENT_QUESTIONS, type ClassAssessment } from './mockData';

function SectionTitle({ children }: { children: ReactNode }) {
  // same section heading as סקירת הערכה, including the doubled space above it
  return (
    <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600, color: 'text.secondary', pt: 3 }}>
      {children}
    </Typography>
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
  const [unit, setUnit] = useState(task.unit);
  const [topic, setTopic] = useState(task.topic);
  const [subTopic, setSubTopic] = useState(task.subTopic);
  const [tags, setTags] = useState<string[]>(task.tags);
  // the questions as they stand in the queued task — no results on them, nothing has run
  const [questions, setQuestions] = useState(() => ASSESSMENT_QUESTIONS[task.reviewIndex].map((q) => q.prompt));
  // removing a question is not undoable, so it is asked about first
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <Stack spacing={3}>
      {/* back points right — that is "backwards" in RTL, so no dir-icon on it */}
      <Box>
        <Button onClick={onBack} variant="outlined" startIcon={<ArrowForwardRounded />}>
          חזרה לכל ההערכות
        </Button>
      </Box>

      <Stack spacing={1}>
        {/* the page title, with the kind glyph on its own line so the two line up */}
        <Stack direction="row" spacing={2} alignItems="center">
          <KindIcon kind={task.kind} />
          <Typography variant="h3" sx={{ ...FREDOKA, fontWeight: 600 }}>
            עריכת {task.kind} מתוזמן
          </Typography>
        </Stack>
        <Stack spacing={0.25}>
          <Typography variant="h5" sx={{ ...FREDOKA, fontWeight: 600 }}>
            {task.title}
          </Typography>
          <Typography color="text.secondary">
            ייפתח בתאריך {task.opensOn} · טרם נשלח לתלמידים, אפשר לשנות הכל או לבטל
          </Typography>
        </Stack>
      </Stack>

      <SectionTitle>פרטי המשימה</SectionTitle>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField label="שם המשימה" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ flex: 2, minWidth: 260 }} />
              <TextField label="תאריך פתיחה" value={opensOn} onChange={(e) => setOpensOn(e.target.value)} sx={{ flex: 1, minWidth: 180 }} />
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField select label="יחידה" value={unit} onChange={(e) => setUnit(e.target.value)} sx={{ width: 160 }}>
                {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
              <TextField label="נושא" value={topic} onChange={(e) => setTopic(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
              <TextField label="תת נושא" value={subTopic} onChange={(e) => setSubTopic(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
            </Stack>
            {/* more than one tag can be on at a time */}
            <TextField
              select
              label="תגיות"
              value={tags}
              onChange={(e) => setTags(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as unknown as string[]))}
              SelectProps={{ multiple: true, displayEmpty: true, renderValue: (v) => (v as string[]).length ? (v as string[]).join(', ') : 'ללא תגיות' }}
              InputLabelProps={{ shrink: true }}
              fullWidth
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

      <SectionTitle>שאלות ה{task.kind} ({questions.length})</SectionTitle>
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
              <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ px: 3, py: 2.5 }}>
                <QNumber index={i} />
                {/* nothing has run yet, so a question is only its text */}
                <Typography
                  component="div"
                  sx={{
                    flex: 1, minWidth: 0, whiteSpace: 'pre-line', textAlign: 'start',
                    lineHeight: (t) => t.typography.button.lineHeight,
                  }}
                >
                  {prompt}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Tooltip title="עריכת השאלה" placement="top" arrow>
                    <IconButton aria-label={`עריכת שאלה ${i + 1}`}><EditRounded /></IconButton>
                  </Tooltip>
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
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
      <Box>
        <Button variant="outlined" startIcon={<AddRounded />} onClick={() => setLibraryOpen(true)}>
          הוספת שאלה
        </Button>
      </Box>

      {libraryOpen && (
        <QuestionLibrary
          inUse={questions}
          onPick={(q) => { setQuestions([...questions, q.prompt]); setLibraryOpen(false); }}
          onClose={() => setLibraryOpen(false)}
        />
      )}

      {confirmRemove !== null && (
        <Dialog
          open
          onClose={() => setConfirmRemove(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>להסיר את שאלה {confirmRemove + 1}?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              השאלה תוסר מה{task.kind} ולא ניתן יהיה לשחזר אותה. שאר השאלות יישארו כפי שהן.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setConfirmRemove(null)} sx={{ fontWeight: 800 }}>ביטול</Button>
            <Button
              onClick={() => {
                setQuestions(questions.filter((_, k) => k !== confirmRemove));
                setConfirmRemove(null);
              }}
              variant="contained"
              color="error"
              startIcon={<DeleteOutlineRounded />}
              sx={{ fontWeight: 800 }}
            >
              הסרה
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* the primary action leads on the inline start (right); deleting sits at the far end */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 1 }}>
        <Button
          variant="contained"
          onClick={() => onSave({ ...task, title, opensOn, unit, topic, subTopic, tags })}
          sx={{ fontWeight: 800 }}
        >
          שמירה
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onDelete} color="error" startIcon={<DeleteOutlineRounded />} sx={{ fontWeight: 800 }}>
          מחיקת המשימה
        </Button>
      </Stack>
    </Stack>
  );
}
