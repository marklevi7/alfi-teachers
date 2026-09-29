import { alpha, type Theme } from '@mui/material/styles';

/**
 * The app's one scrollbar treatment — a thin, borderless thumb instead of the browser's own
 * scrollbar, which draws a track line down both sides that reads as a stray rule wherever it
 * sits next to a card or another pane. Spread this into the `sx` of any element that scrolls:
 * Shell.tsx's main page scroller, בניית מבחן's split view, and any DialogContent long enough
 * to need one.
 */
export const NICE_SCROLLBAR = {
  '&::-webkit-scrollbar': { width: 8 },
  '&::-webkit-scrollbar-track': { background: 'transparent', border: 'none' },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: (t: Theme) => alpha(t.palette.text.primary, 0.18),
    borderRadius: 8,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: (t: Theme) => alpha(t.palette.text.primary, 0.32),
  },
  scrollbarWidth: 'thin',
  scrollbarColor: (t: Theme) => `${alpha(t.palette.text.primary, 0.18)} transparent`,
} as const;
