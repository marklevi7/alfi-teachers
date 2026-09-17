import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { FREDOKA } from '../theme';

/**
 * The line every screen opens with. One place, so the page title's font, size and weight are
 * set once for the whole app.
 *
 * With `back`, the row is three columns: the way back at the inline start and the title
 * centred across the full width, so it does not drift with the button's length. Without it,
 * the title leads the row, with an optional glyph before it and actions at the far end.
 */
export function PageHeader({ title, subtitle, back, actions, icon }: {
  title: ReactNode;
  /** the quiet line under the title */
  subtitle?: ReactNode;
  /** the way back out of this screen. Back points right — that is "backwards" in RTL */
  back?: { label: string; onClick: () => void };
  /** buttons at the inline end of the title row. Only on a screen with no back button */
  actions?: ReactNode;
  /** the kind glyph before the title, on a screen that is about one kind of task */
  icon?: ReactNode;
}) {
  const heading = (
    <Typography variant="h3" sx={{ ...FREDOKA, fontWeight: 600 }}>
      {title}
    </Typography>
  );
  return (
    <Stack spacing={0.5}>
      {back ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 2 }}>
          <Box sx={{ justifySelf: 'start' }}>
            <Button onClick={back.onClick} variant="outlined" startIcon={<ArrowForwardRounded />}>
              {back.label}
            </Button>
          </Box>
          {heading}
        </Box>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center">
          {icon}
          {heading}
          {actions && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              {actions}
            </>
          )}
        </Stack>
      )}
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Stack>
  );
}

/**
 * The line under a page title on a screen that is about one task: its glyph, its name, and
 * whatever that screen tags it with — with the task's own quiet line under them.
 */
export function TaskTitle({ icon, name, after, meta }: {
  icon?: ReactNode;
  name: ReactNode;
  /** a chip or note that belongs to the name itself */
  after?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        {icon}
        <Typography variant="h5" sx={{ ...FREDOKA, fontWeight: 600 }}>
          {name}
        </Typography>
        {after}
      </Stack>
      {meta && <Typography color="text.secondary">{meta}</Typography>}
    </Stack>
  );
}
