import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseRounded from '@mui/icons-material/CloseRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import { FREDOKA } from '../theme';
import { EmptyState } from './EmptyState';
import { QuestionPickCard } from './QuestionPickCard';
import { QuestionPreviewDialog } from './QuestionPreviewDialog';
import { QUESTION_LIBRARY, type LibraryQuestion } from './mockData';
import { QuestionFilters, NO_FILTERS, matchesFilters } from './QuestionFilters';

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
  // the filter box's own value — the same box בניית מבחן shows
  const [filters, setFilters] = useState(NO_FILTERS);
  const [picked, setPicked] = useState<LibraryQuestion | null>(null);
  // a question opened to be read in full, with its answer
  const [reading, setReading] = useState<LibraryQuestion | null>(null);

  const shown = useMemo(() => QUESTION_LIBRARY.filter((x) => matchesFilters(x, filters)), [filters]);

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
        {/* the app's one filter box, shared with בניית מבחן */}
        <QuestionFilters value={filters} onChange={setFilters} mb={3} />

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

      {reading && <QuestionPreviewDialog prompt={reading.prompt} onClose={() => setReading(null)} />}

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
