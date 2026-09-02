import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { yellow } from '@mui/material/colors';
import type { CellStatus } from './mockData';

// Each status maps onto an MUI palette entry; 'none' has no colour of its own, so it
// borrows the neutral text tone. Note `pass` reads from `primary`, not `success` — the
// shared theme's success is teal, and a passing grade has to be ALFI's own green.
const STATUS_COLOR: Record<Exclude<CellStatus, 'none'>, 'primary' | 'error' | 'warning'> = {
  pass: 'primary',
  fail: 'error',
  partial: 'warning',
};

// הגיש חלקית is its own step between pass and fail, so its ring and fill are yellow
// rather than the warning orange. The number inside still uses the warning tone.
const PARTIAL_RING = yellow[700];

export function statusFill(t: Theme, status: CellStatus) {
  if (status === 'none') return alpha(t.palette.text.primary, 0.06);
  if (status === 'partial') return alpha(PARTIAL_RING, 0.18);
  return alpha(t.palette[STATUS_COLOR[status]].main, 0.14);
}

export function statusBorder(t: Theme, status: CellStatus) {
  if (status === 'none') return alpha(t.palette.text.primary, 0.18);
  if (status === 'partial') return PARTIAL_RING;
  return t.palette[STATUS_COLOR[status]].main;
}

// One score in a circle, coloured by status. Shared by מצב תלמידים and סקירת הערכה so a
// grade looks identical wherever it shows up.
export function ScoreDot({ score, status }: { score: number | null; status: CellStatus }) {
  return (
    <Box
      sx={{
        width: 38, height: 38, borderRadius: '50%', mx: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 2, borderColor: (t) => statusBorder(t, status),
        bgcolor: (t) => statusFill(t, status),
        color: status === 'none' ? 'text.disabled' : `${STATUS_COLOR[status]}.dark`,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {score ?? '—'}
      </Typography>
    </Box>
  );
}
