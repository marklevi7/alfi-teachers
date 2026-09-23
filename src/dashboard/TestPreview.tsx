import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import { FREDOKA } from '../theme';
import { DateField, TimeSelect } from './DateTimeFields';
import { KindIcon } from './KindIcon';
import { PageHeader, TaskTitle } from './PageHeader';
import { ReadyMadeTag } from './ReadyMadeTag';
import { StickyBar, BarSpacer, fillsPage } from './StickyBar';
import { QuestionCard } from './TestQuestionCard';
import { ConfirmDeleteDialog } from './ConfirmDialog';
import { QuestionPreviewDialog } from './QuestionPreviewDialog';
import { type ReadyTest } from './mockData';

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

/**
 * The last step before a test goes out: the whole thing as its own screen — what it is called,
 * when it opens and closes, what it covers, and every question in order. Opening a question
 * shows it in full with its worked solution. The one action rides the bottom.
 *
 * A screen and not a dialog on purpose: the teacher keeps the sidebar, so the preview is a
 * step in the flow rather than a box over it.
 */
export function TestPreview({ test, schedule, onScheduleChange, action, onRemoveQuestion, readyMade, onClose }: {
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
  /** a test taken whole off the shelf: its questions were set together and cannot change */
  readyMade?: boolean;
  onClose: () => void;
}) {
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const prompt = openQ === null ? null : test.questions[openQ];

  const name = schedule?.name?.trim() || test.title;
  // the three levels, in order: נושא → יחידה → תת נושא
  const curriculum = [test.topic, test.subTopic, test.sections.join(', ')].filter(Boolean).join(' · ');

  return (
    // the screen fills the page even when the test is short, so the bar below it always
    // lands on the bottom edge; once the test is long, sticky keeps it there
    <Box sx={fillsPage}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto' }}>
            <Stack spacing={3}>
              <PageHeader back={{ label: 'חזרה לעריכה', onClick: onClose }} title="בניית מבחן" />

              {/* the test itself: its glyph, its name, and what it is made of */}
              <TaskTitle
                icon={<KindIcon kind="בוחן" />}
                name={name}
                // the same tag the task editor shows: this one was built as a closed unit
                after={readyMade ? <ReadyMadeTag kind="בוחן" /> : undefined}
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
        </Box>
      </Box>

      {/* a question of the test opens in the app's question popup, over the list */}
      {prompt !== null && (
        <QuestionPreviewDialog
          prompt={prompt}
          index={openQ ?? 0}
          onClose={() => setOpenQ(null)}
        />
      )}

      {/* the one action of the screen, on a bar that rides the bottom of the page. Reading a
          single question is not the moment to send the test, so the bar waits for the list. */}
      {action && (
        <StickyBar>
          {/* the way back leads the bar at the inline start — the far RIGHT here — and what
              the test is, then the one thing this step commits to, close it at the far end */}
          <Button onClick={onClose} sx={{ fontWeight: 800 }}>חזרה לעריכה</Button>
          <Typography color="text.secondary">
            {test.questions.length} שאלות · {name}
          </Typography>
          <BarSpacer />
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
