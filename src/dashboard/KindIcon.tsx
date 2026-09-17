import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import TimerTwoToneIcon from '@mui/icons-material/TimerTwoTone';

export type Kind = 'תרגול' | 'בוחן';

/**
 * The one canonical task-kind icon — copied from the student app so תרגול / בוחן look
 * identical in both products. `bare` drops the rounded tile behind it, for tight places
 * like a table header where only the glyph is wanted. `size="small"` is the same tile one
 * step down MUI's own scale, for lists where the glyph is a marker and not a heading.
 * `tone` says how far along the task is: 'filled' is the student app's green tile, 'outlined'
 * is the same tile while the task is still open to the class, and 'muted' drops the green
 * altogether for a task that has not gone out yet.
 */
export function KindIcon({ kind, bare = false, size = 'medium', tone = 'filled' }: {
  kind: Kind; bare?: boolean; size?: 'small' | 'medium'; tone?: 'filled' | 'outlined' | 'muted';
}) {
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
        // two sizes only, both off the spacing scale: 7 units = 56px with the glyph at MUI's
        // `large`, or 5 units = 40px with it at `medium` (small 20 / medium 24 / large 35).
        width: (t) => t.spacing(size === 'small' ? 5 : 7),
        height: (t) => t.spacing(size === 'small' ? 5 : 7),
        flexShrink: 0,
        // the student app's own tile colours (KindIcon.tsx there): a 12% wash of the brand
        // green behind the glyph, and the green itself on top. Open keeps the green but only
        // as an outline, and a queued task wears the neutral grey wash the מצב תלמידים table uses.
        ...(tone === 'muted'
          ? { bgcolor: (t) => alpha(t.palette.text.primary, 0.06), color: 'text.primary' }
          : tone === 'outlined'
            ? {
                bgcolor: 'transparent',
                color: 'primary.main',
                border: 1,
                borderColor: (t) => alpha(t.palette.primary.main, 0.5),
              }
            : { bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main' }),
      }}
    >
      <Glyph fontSize={size === 'small' ? 'medium' : 'large'} />
    </Avatar>
  );
}
