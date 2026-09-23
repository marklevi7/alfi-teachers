import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/** what a toast says, and how it reads — a plain confirmation unless something was removed */
export type ToastMessage = { text: string; severity?: 'success' | 'info' } | null;

/**
 * The one place the app says "done": bottom centre, over whatever sticky bar the screen has,
 * gone on its own after a few seconds. MUI's Snackbar + Alert, nothing custom.
 */
export function Toast({ message, onClose }: { message: ToastMessage; onClose: () => void }) {
  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={4000}
      onClose={(_, reason) => { if (reason !== 'clickaway') onClose(); }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {/* the Alert is the Snackbar's child, so it only renders while there is something to say */}
      <Alert
        onClose={onClose}
        severity={message?.severity ?? 'success'}
        variant="filled"
        sx={{
          fontWeight: 700,
          alignItems: 'center',
          // the shared theme's `success` is teal; green in this app means primary
          ...((message?.severity ?? 'success') === 'success' && { bgcolor: 'primary.main' }),
        }}
      >
        {message?.text ?? ''}
      </Alert>
    </Snackbar>
  );
}
