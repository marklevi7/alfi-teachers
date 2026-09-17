import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

/** one curve on a plot: what to draw, and — when it differs from the rest — how */
export type Curve = {
  fn: (x: number) => number;
  /** a palette colour, so a second curve can be told from the first */
  color?: GraphColor;
};

/** what a question's picture is: the curves it shows and the window they are read in */
export type Graph = {
  curves: Curve[];
  from: number;
  to: number;
};

export type GraphColor = 'info' | 'primary' | 'secondary' | 'warning' | 'error' | 'text';
export type GraphSize = 'thumb' | 'full';

// the card thumbnail — a square sheet with one corner turned up, the way a page of work looks —
// and the same plot read at full size inside an open question
// The thumbnail is drawn in the sheet's own 79×79 grid and shown a little larger than that;
// the full size plot keeps a plain frame.
const SIZES: Record<GraphSize, { w: number; h: number; pad: number; stroke: number; box: number | string }> = {
  thumb: { w: 79, h: 79, pad: 10, stroke: 2, box: 88 },
  full: { w: 300, h: 200, pad: 16, stroke: 2.5, box: 300 },
};

const SAMPLES = 48;

// The sheet, exactly as drawn: a rounded square with the bottom-inline-start corner turned back,
// and the flap that corner leaves. Both paths live in the 79×79 grid above.
const SHEET_PATH =
  'M8 0.5H71C75.1421 0.500001 78.5 3.85787 78.5 8V71C78.5 75.1421 75.1421 78.5 71 78.5H19.9912L0.5 58.7939V8L0.509766 7.61426C0.710536 3.65139 3.98724 0.5 8 0.5Z';
const FOLD_PATH = 'M12 59.5C16.1421 59.5 19.5 62.8579 19.5 67V77.793L1.20703 59.5H12Z';

/**
 * The one plot in the app: every graph — on a card, inside an open question, anywhere later —
 * is this component. Drawn, not stored: the bank has no images yet, so the curves are sampled
 * from the functions themselves.
 *
 * `color` and `strokeWidth` are the knobs; a curve may override the colour for itself.
 */
export function GraphThumb({ graph, size = 'thumb', color = 'info', strokeWidth }: {
  graph: Graph;
  size?: GraphSize;
  color?: GraphColor;
  strokeWidth?: number;
}) {
  const theme = useTheme();
  const { w: W, h: H, pad: PAD, stroke, box } = SIZES[size];
  const paletteOf = (c: GraphColor) => (c === 'text' ? theme.palette.text.primary : theme.palette[c].main);

  const xs = Array.from({ length: SAMPLES + 1 }, (_, i) => graph.from + ((graph.to - graph.from) * i) / SAMPLES);
  const sampled = graph.curves.map((c) => xs.map(c.fn));
  const all = sampled.flat();
  const yMin = Math.min(...all);
  const yMax = Math.max(...all);
  const span = yMax - yMin || 1;
  const px = (x: number) => PAD + ((x - graph.from) / (graph.to - graph.from)) * (W - PAD * 2);
  const py = (y: number) => H - PAD - ((y - yMin) / span) * (H - PAD * 2);
  const sheet = size === 'thumb';
  const clipId = `graph-sheet-${W}`;
  // the sheet's own lines: light enough to sit under the curve, not compete with it
  const sheetStroke = theme.palette.grey[400];
  // the axes sit where zero falls, when zero is inside the window at all
  const zeroY = yMin <= 0 && yMax >= 0 ? py(0) : null;
  const zeroX = graph.from <= 0 && graph.to >= 0 ? px(0) : null;

  return (
    <Box
      sx={{
        width: box,
        height: sheet ? box : H,
        flexShrink: 0,
        // the thumbnail draws its own sheet, so the box around it stays out of the way
        ...(sheet
          ? { bgcolor: 'transparent' }
          // the full plot is framed in the same line the sheet is drawn with
          : { borderRadius: 2, border: 1, borderColor: 'grey.400', bgcolor: 'background.paper', overflow: 'hidden' }),
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="תצוגה מוקטנת של הגרף">
        {sheet && (
          <>
            <defs>
              <clipPath id={clipId}>
                <path d={SHEET_PATH} />
              </clipPath>
            </defs>
            <path d={SHEET_PATH} fill={theme.palette.background.paper} stroke={sheetStroke} />
          </>
        )}
        <g clipPath={sheet ? `url(#${clipId})` : undefined}>
        {zeroY !== null && (
          <line x1={PAD / 2} y1={zeroY} x2={W - PAD / 2} y2={zeroY} stroke={theme.palette.divider} strokeWidth={1} />
        )}
        {zeroX !== null && (
          <line x1={zeroX} y1={PAD / 2} x2={zeroX} y2={H - PAD / 2} stroke={theme.palette.divider} strokeWidth={1} />
        )}
        {sampled.map((ys, ci) => (
          <polyline
            key={ci}
            points={xs.map((x, i) => `${px(x).toFixed(1)},${py(ys[i]).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={paletteOf(graph.curves[ci].color ?? color)}
            strokeWidth={strokeWidth ?? stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        </g>
        {/* the turned corner is over the page, not under it: the curve stops where it starts */}
        {sheet && <path d={FOLD_PATH} fill={theme.palette.grey[300]} stroke={sheetStroke} />}
      </svg>
    </Box>
  );
}
