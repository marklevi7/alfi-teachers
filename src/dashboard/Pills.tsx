import type { ReactNode } from 'react';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Difficulty } from './mockData';

/**
 * The one pill, taken from the student app (Practice.tsx GradePill / ExpiredPill): white
 * with a hairline, so it reads the same on a plain card and on a tinted one. Everything
 * that shows a small piece of labelled meta goes through here.
 */
export const PILL = {
  height: 28, px: 1.25, borderRadius: 1.5, flexShrink: 0,
  display: 'inline-flex', alignItems: 'center', gap: 0.75,
  bgcolor: 'background.paper', border: 1, borderColor: 'grey.400',
} as const;

export const PILL_TEXT = {
  fontSize: (t: Theme) => t.typography.body2.fontSize,
  fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap',
} as const;

export function Pill({ children }: { children: ReactNode }) {
  return <Box sx={PILL}>{children}</Box>;
}

/** "ציון ממוצע: 53" — a grey label, then the value in the text colour. */
export function LabeledPill({ label, value }: { label: string; value: string | number }) {
  return (
    <Pill>
      <Typography component="span" sx={{ ...PILL_TEXT, color: 'text.secondary' }}>{label}:</Typography>
      <Typography component="span" sx={{ ...PILL_TEXT, color: 'text.primary', fontFeatureSettings: '"tnum","lnum"' }}>
        {value}
      </Typography>
    </Pill>
  );
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  קל: 'primary.dark',
  בינוני: 'warning.dark',
  קשה: 'error.dark',
};

export function DifficultyPill({ level }: { level: Difficulty }) {
  return (
    <Pill>
      <Typography component="span" sx={{ ...PILL_TEXT, color: DIFFICULTY_COLOR[level] }}>{level}</Typography>
    </Pill>
  );
}
