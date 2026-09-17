import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { LibraryQuestion } from './mockData';
import { QuestionDetail, QuestionHeading } from './QuestionDetail';

/**
 * One question, opened in full, in the app's detail layout: title, the question, a rule, the
 * one meta line, then the answer. The dialog's own chrome — the action and the X — is the
 * frame around it, not part of the block.
 *
 * `onToggleSelect` is what makes it more than a reader: the header button ticks the question
 * in whatever list opened it. Leave it out and the dialog is read-only.
 */
export function QuestionPreviewDialog({ q, selected = false, onToggleSelect, onClose }: {
  q: LibraryQuestion;
  selected?: boolean;
  onToggleSelect?: () => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={phone}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: phone ? 0 : 4 } }}
    >
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <QuestionHeading label="תצוגת השאלה" />
          <Box sx={{ flex: 1, minWidth: 0 }} />
          {/* picking the question is the point of reading it, so the action sits right here */}
          {onToggleSelect && (
            <Button
              variant={selected ? 'outlined' : 'contained'}
              startIcon={selected ? <RemoveRounded /> : <AddRounded />}
              onClick={() => { onToggleSelect(); onClose(); }}
              sx={{ fontWeight: 800, flexShrink: 0 }}
            >
              {/* the label says what the click will do, not what the question already is */}
              {selected ? 'הסרה מהמבחן' : 'הוספה למבחן'}
            </Button>
          )}
          <IconButton onClick={onClose} aria-label="סגירה" sx={{ mt: -0.5, flexShrink: 0 }}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <QuestionDetail prompt={q.prompt} />
      </DialogContent>
    </Dialog>
  );
}
