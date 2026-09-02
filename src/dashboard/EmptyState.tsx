import type { ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

// Same empty-state shape the student app uses (Practice.tsx): centred column, a picture,
// a bold headline, then one calm sentence of body text. `dense` is the version that has to
// live inside a dashboard card rather than fill a page.
export function EmptyState({ icon, title, body, dense = false, color = 'primary' }: {
  icon: ReactNode; title: string; body: string; dense?: boolean;
  // the picture belongs to the card it sits in, so it wears that card's colour
  color?: 'primary' | 'error' | 'warning';
}) {
  return (
    <Stack
      spacing={dense ? 1.5 : 3}
      alignItems="center"
      sx={{ textAlign: 'center', py: dense ? 3 : { xs: 6, md: 10 }, px: 2, maxWidth: 464, mx: 'auto' }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: dense ? 48 : 72, height: dense ? 48 : 72, borderRadius: 3,
          bgcolor: (t) => alpha(t.palette[color].main, 0.12), color: `${color}.main`,
          '& .MuiSvgIcon-root': { fontSize: dense ? 26 : 38 },
        }}
      >
        {icon}
      </Avatar>
      <Typography variant={dense ? 'subtitle1' : 'h5'} sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography
        variant={dense ? 'body2' : 'body1'}
        color="text.secondary"
        sx={{ lineHeight: 1.9, textWrap: 'pretty' }}
      >
        {body}
      </Typography>
    </Stack>
  );
}
