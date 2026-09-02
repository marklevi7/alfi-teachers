import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import TimerTwoToneIcon from '@mui/icons-material/TimerTwoTone';

export type Kind = 'תרגול' | 'בוחן';

/**
 * The one canonical task-kind icon — copied from the student app so תרגול / בוחן look
 * identical in both products. `bare` drops the rounded tile behind it, for tight places
 * like a table header where only the glyph is wanted.
 */
export function KindIcon({ kind, bare = false }: { kind: Kind; bare?: boolean }) {
  const Glyph = kind === 'בוחן' ? TimerTwoToneIcon : MenuBookTwoToneIcon;
  const glyph = <Glyph />;
  if (bare) {
    return (
      <Avatar
        variant="rounded"
        aria-label={kind}
        // no tile and no green: bare, it sits inside a line of text and takes the text's colour
        sx={{ width: 24, height: 24, bgcolor: 'transparent', color: 'text.primary', '& svg': { fontSize: 22 } }}
      >
        {glyph}
      </Avatar>
    );
  }
  return (
    <Avatar
      variant="rounded"
      aria-label={kind}
      sx={{
        // fixed on purpose: one size everywhere, no per-screen override.
        // 7 spacing units = 56px, and the glyph sits at MUI's `large` — the next size up
        // its own scale offers (small 20 / medium 24 / large 35).
        width: (t) => t.spacing(7),
        height: (t) => t.spacing(7),
        flexShrink: 0,
        // the same greys the מצב תלמידים table uses for a neutral cell: a 6% wash of the
        // text colour behind the glyph, and the text colour itself on top
        bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
        color: 'text.primary',
      }}
    >
      <Glyph fontSize="large" />
    </Avatar>
  );
}
