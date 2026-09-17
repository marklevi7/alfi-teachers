import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';

/**
 * The one warning shown before anything is destroyed — a question, a whole task.
 * Kept in one place so every "are you sure" in the app reads and looks the same.
 */
export function ConfirmDeleteDialog({ title, body, confirmLabel, onConfirm, onClose }: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 800 }}>ביטול</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteOutlineRounded />}
          sx={{ fontWeight: 800 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** the same frame, for an action that creates rather than destroys */
export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onClose }: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ whiteSpace: 'pre-line' }}>{body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 800 }}>ביטול</Button>
        <Button onClick={onConfirm} variant="contained" sx={{ fontWeight: 800 }}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}

/** nothing to decide — something is missing and the action cannot run yet */
export function NoticeDialog({ title, body, onClose }: {
  title: string; body: string; onClose: () => void;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ whiteSpace: 'pre-line' }}>{body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ fontWeight: 800 }}>הבנתי</Button>
      </DialogActions>
    </Dialog>
  );
}
