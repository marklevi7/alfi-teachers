import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

/** three-ish lines of body text — enough to tell what it is, short enough to stay a preview */
export const PREVIEW_H = 66;

const FADE = (t: Theme) => `linear-gradient(to top, transparent 0, ${t.palette.common.black} 28px)`;

/**
 * Text cut off mid-air so it reads as "there is more inside" — the student app's preview fade.
 * One copy of it, so a long answer and a long question clip exactly the same way.
 *
 * The measuring ref sits on the content, not on the clipping box, so the answer stays the
 * same whether the text is currently expanded or not.
 */
export function ClampedText({ text, maxHeight = PREVIEW_H, expanded = false, onClipChange, textSx }: {
  text: string;
  maxHeight?: number;
  expanded?: boolean;
  onClipChange?: (clipped: boolean) => void;
  textSx?: SxProps<Theme>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tooTall, setTooTall] = useState(false);
  // kept in a ref so a parent's inline callback does not re-subscribe the observer every render
  const report = useRef(onClipChange);
  report.current = onClipChange;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const over = el.scrollHeight > maxHeight + 1;
      setTooTall(over);
      report.current?.(over);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, maxHeight]);

  const clipped = tooTall && !expanded;
  return (
    <Box
      sx={{
        ...(clipped
          ? { height: maxHeight, overflow: 'hidden', maskImage: FADE, WebkitMaskImage: FADE }
          : {}),
      }}
    >
      <Typography
        ref={ref}
        component="div"
        sx={{ whiteSpace: 'pre-line', textAlign: 'start', ...textSx }}
      >
        {text}
      </Typography>
    </Box>
  );
}
