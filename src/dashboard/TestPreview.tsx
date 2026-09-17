import { useState, type ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import { FREDOKA } from '../theme';
import { DateField, TimeSelect } from './DateTimeFields';
import { KindIcon } from './KindIcon';
import { PageHeader, TaskTitle } from './PageHeader';
import { StickyBar, BarSpacer, fillsPage } from './StickyBar';
import { QNumber } from './QNumber';
import { DifficultyPill, TagPill } from './Pills';
import { ClampedText } from './ClampedText';
import { ConfirmDeleteDialog } from './ConfirmDialog';
import { QuestionDetail, QuestionHeading } from './QuestionDetail';
import { bankQuestionFor, type ReadyTest } from './mockData';

// three lines of a prompt at the card's line height, then it fades out
const PREVIEW_H = 88;
// same reading width the screens behind the dialog use (Shell.tsx)
const CONTENT_MAX_WIDTH = 1120;

/** when the test opens and closes, exactly as the form was filled in */
export type TestSchedule = { name: string; date: string; opensAt: string; closesAt: string };

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h6" sx={{ ...FREDOKA, fontWeight: 600, color: 'text.secondary', pt: 3 }}>
      {children}
    </Typography>
  );
}

/** what the teacher gets under a question and the class does not: where it is from, how hard, its tags */
function QuestionMeta({ prompt }: { prompt: string }) {
  const meta = bankQuestionFor(prompt);
  if (!meta) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
      <DifficultyPill level={meta.difficulty} />
      <Typography variant="body2" color="text.secondary">
        {meta.topic} · {meta.subTopic} · {meta.section}
      </Typography>
      {meta.tags.map((t) => <TagPill key={t} label={t} />)}
    </Stack>
  );
}

/** one question in the list: the student app's card, cut off mid-air when it runs long */
function QuestionCard({ prompt, index, onOpen, onRemove }: {
  prompt: string; index: number; onOpen: () => void; onRemove?: () => void;
}) {
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
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <QNumber index={index} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* the fade at the cut is the whole hint — the card itself opens the question */}
          <ClampedText
            text={prompt}
            maxHeight={PREVIEW_H}
            textSx={{ lineHeight: (t) => t.typography.button.lineHeight }}
          />
          <QuestionMeta prompt={prompt} />
        </Box>
        {/* a test being assembled can still lose a question; a ready-made one cannot */}
        {onRemove && (
          <Box
            component="span"
            sx={{ flexShrink: 0 }}
            // the card is itself a button, so the removal has to stop the click here
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <Tooltip title="הסרת השאלה" placement="top" arrow>
              <IconButton component="span" aria-label={`הסרת שאלה ${index + 1}`} sx={{ color: 'error.main' }}>
                <DeleteOutlineRounded />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

/**
 * The last step before a test goes out: the whole thing as its own screen — what it is called,
 * when it opens and closes, what it covers, and every question in order. Opening a question
 * shows it in full with its worked solution. The one action rides the bottom.
 *
 * A screen and not a dialog on purpose: the teacher keeps the sidebar, so the preview is a
 * step in the flow rather than a box over it.
 */
export function TestPreview({ test, schedule, onScheduleChange, action, onRemoveQuestion, onClose }: {
  test: ReadyTest;
  /** the form's own line: name, day and hours. Left out, the test's own title stands in. */
  schedule?: TestSchedule;
  /** given, the details are edited here — this step is where a test is named and timed */
  onScheduleChange?: {
    setName: (v: string) => void;
    setDate: (v: string) => void;
    setOpensAt: (v: string) => void;
    setClosesAt: (v: string) => void;
  };
  /** the one thing this preview commits to, on the bar at the bottom */
  action?: { label: string; icon?: ReactNode; onClick: () => void };
  /** given only for a test still being assembled — a ready-made test is fixed */
  onRemoveQuestion?: (index: number) => void;
  onClose: () => void;
}) {
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const prompt = openQ === null ? null : test.questions[openQ];

  const name = schedule?.name?.trim() || test.title;
  const curriculum = [test.unit, test.topic, test.subTopic].filter(Boolean).join(' · ');

  return (
    // the screen fills the page even when the test is short, so the bar below it always
    // lands on the bottom edge; once the test is long, sticky keeps it there
    <Box sx={fillsPage}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto' }}>
          {prompt === null ? (
            <Stack spacing={3}>
              <PageHeader back={{ label: 'חזרה לעריכה', onClick: onClose }} title="תצוגה מקדימה" />

              {/* the test itself: its glyph, its name, and what it is made of */}
              <TaskTitle
                icon={<KindIcon kind="בוחן" />}
                name={name}
                meta={[curriculum, `${test.questions.length} שאלות`].filter(Boolean).join(' · ')}
              />

              {/* this step is where the test is named and timed — the screen before it is
                  only about what goes into it */}
              {schedule && onScheduleChange && (
                <>
                  <SectionTitle>פרטי המבחן</SectionTitle>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <TextField
                          label="שם המבחן"
                          placeholder="הכנס שם מבחן…"
                          value={schedule.name}
                          onChange={(e) => onScheduleChange.setName(e.target.value)}
                          sx={{ flex: 2, minWidth: 260 }}
                        />
                        <DateField value={schedule.date} onChange={onScheduleChange.setDate} sx={{ flex: 1, minWidth: 180 }} />
                        <TimeSelect label="שעת פתיחה" value={schedule.opensAt} onChange={onScheduleChange.setOpensAt} sx={{ width: 150 }} />
                        <TimeSelect label="שעת סגירה" value={schedule.closesAt} onChange={onScheduleChange.setClosesAt} sx={{ width: 150 }} />
                      </Stack>
                    </CardContent>
                  </Card>
                </>
              )}

              <SectionTitle>שאלות המבחן ({test.questions.length})</SectionTitle>
              <Stack spacing={2}>
                {test.questions.map((q, i) => (
                  <QuestionCard
                    key={q}
                    prompt={q}
                    index={i}
                    onOpen={() => setOpenQ(i)}
                    onRemove={onRemoveQuestion ? () => setConfirmRemove(i) : undefined}
                  />
                ))}
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button onClick={() => setOpenQ(null)} variant="outlined" startIcon={<ArrowForwardRounded />}>
                  חזרה לרשימת השאלות
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <QuestionHeading index={openQ ?? 0} />
                <Box sx={{ flexGrow: 1 }} />
              </Stack>

              <QuestionDetail prompt={prompt} />
            </Stack>
          )}
        </Box>
      </Box>

      {/* the one action of the screen, on a bar that rides the bottom of the page. Reading a
          single question is not the moment to send the test, so the bar waits for the list. */}
      {action && prompt === null && (
        <StickyBar>
          <Typography color="text.secondary">
            {test.questions.length} שאלות · {name}
          </Typography>
          <BarSpacer />
          <Button onClick={onClose} sx={{ fontWeight: 800 }}>חזרה לעריכה</Button>
          <Button
            variant="contained"
            startIcon={action.icon}
            onClick={() => { action.onClick(); }}
            sx={{ fontWeight: 800 }}
          >
            {action.label}
          </Button>
        </StickyBar>
      )}

      {confirmRemove !== null && (
        <ConfirmDeleteDialog
          title={`להסיר את שאלה ${confirmRemove + 1}?`}
          body="השאלה תוסר מהמבחן. אפשר יהיה לבחור אותה שוב מהטבלה."
          confirmLabel="הסרה"
          onConfirm={() => { onRemoveQuestion?.(confirmRemove); setConfirmRemove(null); }}
          onClose={() => setConfirmRemove(null)}
        />
      )}
    </Box>
  );
}
