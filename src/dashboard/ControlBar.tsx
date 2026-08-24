import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import { grey } from '@mui/material/colors';

export type Device = 'desktop' | 'mobile';

// Same dev control bar as the student app (dashboard/MainScreen.tsx VersionBar) —
// just the device toggle for now, since there's only one screen/version to switch.
// Add version/sub-screen switching back in here if this app grows the same way.
export function ControlBar({ device, onDeviceChange, onClose }: { device: Device; onDeviceChange: (d: Device) => void; onClose: () => void }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: grey[900], px: 2, py: 1, position: 'sticky', top: 0, zIndex: (t) => t.zIndex.modal + 1 }}>
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
