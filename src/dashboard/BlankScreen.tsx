import Typography from '@mui/material/Typography';
import { FREDOKA } from '../theme';

// Nothing built here yet — just makes the nav item land somewhere real.
export function BlankScreen({ title }: { title: string }) {
  return (
    <Typography variant="h3" sx={{ ...FREDOKA, fontWeight: 600 }}>
      {title}
    </Typography>
  );
}
