import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import { FREDOKA } from '../theme';
import { MainDashboard, type MainVariant } from './MainDashboard';

// Placeholder greeting — real teacher name comes from auth once that's wired up.
export function TeacherMain({ variant = 'mid', onOpenAssessment }: { variant?: MainVariant; onOpenAssessment: (i: number) => void }) {
  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" sx={{ ...FREDOKA, fontWeight: 600 }}>
          שלום רבקה כהן
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<AssignmentRounded />}>
            צור מבחן חדש
          </Button>
          <Button variant="outlined" startIcon={<MenuBookRounded />}>
            צור תרגול חדש
          </Button>
        </Stack>
      </Stack>

      <MainDashboard variant={variant} onOpenAssessment={onOpenAssessment} />
    </Stack>
  );
}
