import type { ReactNode } from 'react';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

/**
 * Put this on a screen that ends in a <StickyBar>: it makes the screen fill the page even when
 * its content is short, so the bar always lands on the bottom edge. Once the content is long,
 * `position: sticky` keeps the bar there while the page scrolls under it.
 *
 * The screen's own content goes in a child with `flex: 1`, the bar after it.
 */
export const fillsPage = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: (t: Theme) => `calc(100vh - ${t.spacing(12)})`,
} as const;

/** The bar that rides the bottom of a page: what the screen holds, and what to do with it. */
export function StickyBar({ children }: { children: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderRadius: 3,
        mt: 3,
        // cancels the page's own bottom padding, so the bar sits on the very edge
        mb: -6,
        bgcolor: 'background.paper',
        boxShadow: 6,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 3, py: 2 }}>
        {children}
      </Stack>
    </Paper>
  );
}

/** the gap inside a bar that pushes what follows it to the far end */
export const BarSpacer = () => <Box sx={{ flexGrow: 1 }} />;
