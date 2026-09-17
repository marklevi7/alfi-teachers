import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/he';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { SxProps, Theme } from '@mui/material/styles';

dayjs.extend(customParseFormat);

/** the app writes dates as DD/MM/YY everywhere — cards, lists, the review header */
const APP_DATE = 'DD/MM/YY';

/**
 * A date field that opens MUI's own calendar instead of the browser's, so it follows the
 * theme (white, green, RTL) rather than the operating system's dark chrome.
 */
export function DateField({ label = 'תאריך', value, onChange, sx }: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  sx?: SxProps<Theme>;
}) {
  const parsed = value ? dayjs(value, APP_DATE) : null;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
      <DatePicker
        label={label}
        value={parsed && parsed.isValid() ? parsed : null}
        onChange={(next) => onChange(next && next.isValid() ? next.format(APP_DATE) : '')}
        format="DD/MM/YYYY"
        slotProps={{ textField: { sx, InputLabelProps: { shrink: true } } }}
      />
    </LocalizationProvider>
  );
}

// The arrows walk the round five-minute marks, 24h — Israel writes 13:15, never 1:15 PM.
// A typed 12:04 therefore steps up to 12:05 and down to 12:00, not to 12:09 and 11:59.
const MIN_STEP = 5;
const nextMinute = (m: number) => (Math.ceil((m + 1) / MIN_STEP) * MIN_STEP) % 60;
const prevMinute = (m: number) => ((Math.floor((m - 1) / MIN_STEP) * MIN_STEP) + 60) % 60;
const pad = (n: number) => String(n).padStart(2, '0');

/** one wheel of the picker: an up arrow, the number, what it counts, a down arrow */
function Unit({ value, caption, onUp, onDown }: {
  value: number; caption: string; onUp: () => void; onDown: () => void;
}) {
  const ARROW = {
    border: 1, borderColor: 'divider', borderRadius: 2, width: 52, height: 36,
  } as const;
  return (
    <Stack spacing={1} alignItems="center">
      <IconButton onClick={onUp} aria-label={`${caption} למעלה`} sx={ARROW}>
        <KeyboardArrowUpRounded />
      </IconButton>
      <Stack spacing={0} alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 800, fontFeatureSettings: '"tnum","lnum"' }}>
          {pad(value)}
        </Typography>
        <Typography variant="caption" color="text.secondary">{caption}</Typography>
      </Stack>
      <IconButton onClick={onDown} aria-label={`${caption} למטה`} sx={ARROW}>
        <KeyboardArrowDownRounded />
      </IconButton>
    </Stack>
  );
}

/**
 * Hours and minutes as two steppers in a popover — nothing to scroll through, and the
 * minutes move five at a time.
 */
export function TimeSelect({ label, value, onChange, sx }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  sx?: SxProps<Theme>;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // what is being typed right now; null means the field just shows the value it holds
  const [draft, setDraft] = useState<string | null>(null);
  // an empty field starts the day at 08:00 rather than at midnight
  const [h, m] = value ? value.split(':').map(Number) : [8, 0];
  const set = (hour: number, minute: number) => onChange(`${pad(hour)}:${pad(minute)}`);

  // digits only, and the colon writes itself: 1 → 2 → 1:2 → 12:0 → 12:00
  const type = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setDraft(digits.length <= 2 ? digits : `${digits.slice(0, -2)}:${digits.slice(-2)}`);
  };
  // on the way out the number becomes a real hour: 930 is 09:30, 25xx lands on 23
  const commit = () => {
    if (draft === null) return;
    const digits = draft.replace(/\D/g, '');
    setDraft(null);
    if (!digits) { onChange(''); return; }
    const padded = digits.padStart(4, '0');
    onChange(`${pad(Math.min(23, Number(padded.slice(0, 2))))}:${pad(Math.min(59, Number(padded.slice(2))))}`);
  };

  return (
    <>
      <TextField
        label={label}
        value={draft ?? value}
        placeholder="--:--"
        onChange={(e) => type(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
        InputLabelProps={{ shrink: true }}
        // the digits and the empty --:-- both breathe a little
        inputProps={{ inputMode: 'numeric', maxLength: 5, style: { letterSpacing: '0.12em' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={`בחירת ${label}`}
                onClick={(e) => { commit(); setAnchor(e.currentTarget); }}
              >
                <AccessTimeRounded />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={sx}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
      >
        {/* the two wheels are the whole popover, so it hugs them: narrow sides, everything centred */}
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography sx={{ fontWeight: 800, textAlign: 'center' }}>{label}</Typography>
          <Divider sx={{ my: 1.5 }} />
          {/* dir on the element, not in CSS: the RTL plugin mirrors a `direction` declaration.
              The two wheels then read in the same order as the "10:30" in the field. */}
          <Stack dir="ltr" direction="row" spacing={1.5} justifyContent="center">
            <Unit
              value={h}
              caption="שעה"
              onUp={() => set((h + 1) % 24, m)}
              onDown={() => set((h + 23) % 24, m)}
            />
            <Unit
              value={m}
              caption="דקות"
              onUp={() => set(h, nextMinute(m))}
              onDown={() => set(h, prevMinute(m))}
            />
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
