import { useState, useEffect, useRef } from 'react';
import { lighten } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import SearchRounded from '@mui/icons-material/SearchRounded';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import { ScoreDot, statusFill, statusBorder } from './ScoreDot';
import { EmptyState } from './EmptyState';
import { PageHeader } from './PageHeader';
import { KindIcon, type Kind } from './KindIcon';
import { STATUS_DATES, STATUS_ASSESSMENTS, STUDENT_STATUS, STATUS_LEGEND } from './mockData';

const NAME_COL_WIDTH = 150;
const DATE_COL_WIDTH = 78;

// The header is sticky for vertical scroll, so it must be fully opaque or rows show
// through it — a solid colour mixed off the token, not a translucent alpha() tint.
const HEADER_BG = (t: Theme) => lighten(t.palette.primary.main, 0.94);

// never squeeze below this many date columns, however narrow the window gets
const MIN_COLS = 4;

// 'empty' is the first-use state: the class exists but nothing has been sent to it yet.
export type StudentsVariant = 'mid' | 'empty';

// מצב תלמידים — one row per student, one column per assessment date. The table never
// scrolls sideways: it fits as many date columns as the width allows, and the ישן/חדש
// buttons page through whatever doesn't fit.
export function StudentsStatus({ variant = 'mid' }: { variant?: StudentsVariant }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [kind, setKind] = useState<'all' | Kind>('all');
  // deliberately larger than any real index: it clamps to maxStart below, so the table
  // always opens on the newest dates no matter how many columns fit
  const [startIdx, setStartIdx] = useState(STATUS_DATES.length);
  const [visibleCols, setVisibleCols] = useState(MIN_COLS);
  const tableWrapRef = useRef<HTMLDivElement>(null);

  // fit the column count to the actual space rather than guessing at breakpoints
  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const measure = () => {
      const forDates = el.clientWidth - NAME_COL_WIDTH;
      const fits = Math.floor(forDates / DATE_COL_WIDTH);
      setVisibleCols(Math.max(MIN_COLS, Math.min(STATUS_DATES.length, fits)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [variant]);

  // the kind filter narrows which columns exist at all; paging then runs over what is left
  const matchIdx = STATUS_ASSESSMENTS
    .map((a, i) => (kind === 'all' || a.kind === kind ? i : -1))
    .filter((i) => i >= 0);
  const maxStart = Math.max(0, matchIdx.length - visibleCols);
  const start = Math.min(startIdx, maxStart);

  const rows = STUDENT_STATUS.filter((s) => s.name.includes(name.trim()));
  // Newest first in the DOM, which puts it on the RIGHT in RTL — the newest assessment is
  // the one a teacher looks at first. One list of absolute indexes drives the header and
  // every row, so a score can never drift away from its column.
  const visibleIdx = matchIdx.slice(start, start + visibleCols).reverse();

  const header = (
    <PageHeader title="מצב תלמידים" subtitle="מעקב מפורט אחר ביצועי התלמידים בהערכות שונות" />
  );

  if (variant === 'empty') {
    return (
      <Stack spacing={3}>
        {header}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <EmptyState
              icon={<ShowChartRounded />}
              title="אין עדיין נתונים על הכיתה"
              body="ברגע שתשלחי לכיתה תרגול או מבחן, כל תלמיד יקבל כאן שורה עם הציונים שלו לאורך זמן."
            />
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {header}

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              label="שם תלמיד"
              placeholder="חיפוש לפי שם תלמיד"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <TextField
              select
              size="small"
              label="סוג הערכה"
              value={kind}
              // a narrower filter can leave fewer columns than the window, so jump back to
              // the newest ones rather than keeping a page that no longer exists
              onChange={(e) => { setKind(e.target.value as 'all' | Kind); setStartIdx(STATUS_ASSESSMENTS.length); }}
              sx={{ width: 150 }}
            >
              <MenuItem value="all">הכל</MenuItem>
              <MenuItem value="תרגול">תרגולים</MenuItem>
              <MenuItem value="בוחן">בחנים</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="מתאריך"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 170 }}
            />
            <TextField
              size="small"
              label="עד תאריך"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 170 }}
            />
            <Button variant="contained" startIcon={<SearchRounded />} sx={{ height: 40 }}>
              חיפוש
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* The newest date is on the right, so "newer" is the right-hand button pointing
          right and "older" is the left-hand one pointing left. No dir-icon here: these
          arrows mean a physical direction on the table, so mirroring them would send them
          the wrong way. First in the DOM = rightmost in RTL. */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChevronRightRounded />}
          disabled={start >= maxStart}
          onClick={() => setStartIdx(Math.min(maxStart, start + 1))}
        >
          חדש יותר
        </Button>
        <Button
          size="small"
          variant="outlined"
          endIcon={<ChevronLeftRounded />}
          disabled={start === 0}
          onClick={() => setStartIdx(Math.max(0, start - 1))}
        >
          ישן יותר
        </Button>
      </Stack>

      {/* Card clips with overflow:hidden by default, which would kill the sticky header */}
      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'visible' }}>
        {/* No scrolling of its own: rows flow down the page so there is a single
            scrollbar, and the date window is paged by the buttons above. The header
            still sticks — to the page rather than to a container. */}
        <TableContainer ref={tableWrapRef} sx={{ overflow: 'visible' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: NAME_COL_WIDTH, fontWeight: 700, bgcolor: HEADER_BG, py: 1.5 }}>
                  שם תלמיד
                </TableCell>
                {/* date on top, then the canonical תרגול / בוחן glyph under it — the same
                    icon the student app uses, without its rounded tile */}
                {visibleIdx.map((idx) => STATUS_ASSESSMENTS[idx]).map((a) => (
                  <TableCell
                    key={a.date}
                    align="center"
                    sx={{ width: DATE_COL_WIDTH, fontWeight: 700, bgcolor: HEADER_BG, py: 1.5 }}
                  >
                    {/* the column is only a date and a glyph — hovering names the assessment */}
                    <Tooltip title={`${a.kind}: ${a.title}`} placement="top" arrow>
                      <Stack spacing={0.5} alignItems="center">
                        <Box component="span">{a.date}</Box>
                        <KindIcon kind={a.kind} bare />
                      </Stack>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.name} hover>
                  <TableCell sx={{ width: NAME_COL_WIDTH, fontWeight: 600 }}>
                    {s.name}
                  </TableCell>
                  {visibleIdx.map((idx) => (
                    <TableCell key={idx} align="center" sx={{ px: 0.5 }}>
                      {/* which assessment a score belongs to is only in the header, so
                          every dot names it on hover too */}
                      <Tooltip
                        title={`${STATUS_ASSESSMENTS[idx].kind}: ${STATUS_ASSESSMENTS[idx].title}`}
                        placement="top"
                        arrow
                      >
                        <Box sx={{ display: 'inline-flex' }}>
                          <ScoreDot score={s.cells[idx].score} status={s.cells[idx].status} />
                        </Box>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ py: 2 }}>
          {STATUS_LEGEND.map((l) => (
            <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
              <Box
                sx={{
                  width: 14, height: 14, borderRadius: 0.75,
                  border: 2, borderColor: (t) => statusBorder(t, l.status),
                  bgcolor: (t) => statusFill(t, l.status),
                }}
              />
              <Typography variant="caption" color="text.secondary">{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
