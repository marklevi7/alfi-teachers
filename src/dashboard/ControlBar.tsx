import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import { grey } from '@mui/material/colors';

export type Device = 'desktop' | 'mobile';

// The demo states of whichever screen is open — the teacher app's equivalent of the
// student app's sub-dashboards (MainScreen.tsx DASH_VERSIONS[].subs).
export type ScreenVariant = { key: string; label: string };

const barBtnSx = (selected: boolean) => ({
  minWidth: 48,
  borderRadius: 2,
  fontWeight: 700,
  ...(selected
    ? {}
    : { color: grey[300], borderColor: grey[700], '&:hover': { borderColor: grey[500], bgcolor: 'transparent' } }),
});

// Same dev control bar as the student app (dashboard/MainScreen.tsx VersionBar): the
// screen's sub-states on the inline start, the device toggle and close on the far end.
export function ControlBar({ device, onDeviceChange, onClose, variants = [], variant, onVariantChange }: {
  device: Device; onDeviceChange: (d: Device) => void; onClose: () => void;
  variants?: ScreenVariant[]; variant?: string; onVariantChange?: (key: string) => void;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: grey[900], px: 2, py: 1, flexShrink: 0, zIndex: (t) => t.zIndex.modal + 1 }}>
      {variants.map((v) => (
        <Button
          key={v.key}
          size="small"
          variant={v.key === variant ? 'contained' : 'outlined'}
          onClick={() => onVariantChange?.(v.key)}
          sx={barBtnSx(v.key === variant)}
        >
          {v.label}
        </Button>
      ))}
      <Box sx={{ flex: 1 }} />
      <IconButton size="small" onClick={() => onDeviceChange('desktop')} aria-label="תצוגת מחשב" sx={{ color: device === 'desktop' ? grey[100] : grey[500], '&:hover': { color: grey[100] } }}>
        <DesktopWindowsRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => onDeviceChange('mobile')} aria-label="תצוגת מובייל" sx={{ color: device === 'mobile' ? grey[100] : grey[500], '&:hover': { color: grey[100] } }}>
        <SmartphoneRoundedIcon fontSize="small" />
      </IconButton>
      <Divider orientation="vertical" flexItem sx={{ borderColor: grey[700] }} />
      <IconButton size="small" onClick={onClose} aria-label="סגירת בקרות" sx={{ color: grey[400], '&:hover': { color: grey[100] } }}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
