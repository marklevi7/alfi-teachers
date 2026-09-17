import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import { PageHeader } from './PageHeader';
import { MainDashboard, type MainVariant } from './MainDashboard';

// Placeholder greeting — real teacher name comes from auth once that's wired up.
export function TeacherMain({ variant = 'mid', onOpenAssessment }: { variant?: MainVariant; onOpenAssessment: (i: number) => void }) {
  return (
    <Stack spacing={4}>
      <PageHeader
        title="שלום רבקה כהן"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<AssignmentRounded />}>
              צור מבחן חדש
            </Button>
            <Button variant="outlined" startIcon={<MenuBookRounded />}>
              צור תרגול חדש
            </Button>
          </Stack>
        }
      />

      <MainDashboard variant={variant} onOpenAssessment={onOpenAssessment} />
    </Stack>
  );
}
