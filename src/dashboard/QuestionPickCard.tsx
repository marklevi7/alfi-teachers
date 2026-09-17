
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Checkbox from '@mui/material/Checkbox';
import type { Theme } from '@mui/material/styles';
import { DifficultyPill, TagPill } from './Pills';
import { ClampedText } from './ClampedText';
import { GraphThumb } from './GraphThumb';
import { graphFor, type LibraryQuestion } from './mockData';

// the small meta text every card in the app uses
const META = {
  fontSize: (t: Theme) => t.typography.body2.fontSize,
  fontWeight: 400,
  color: 'text.secondary',
} as const;

/** one question in the picker: three lines of it, the rest on demand, and a tick to take it */
export function QuestionPickCard({ q, selected, onToggle, onOpen, disabled = false, disabledNote }: {
  q: LibraryQuestion;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  /** a question this list cannot take again — it is already in the task being built */
  disabled?: boolean;
  disabledNote?: string;
}) {
  const graph = graphFor(q.prompt);
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: selected ? 'primary.main' : 'divider',
        opacity: disabled ? 0.6 : 1,
        ...(selected && { boxShadow: 4 }),
        transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <Stack direction="row" alignItems="flex-start">
        {/* the tick takes the question; the body reads it */}
        <Box sx={{ pt: 2, ps: 1.5, flexShrink: 0 }}>
          <Checkbox
            checked={selected}
            disabled={disabled}
            onChange={onToggle}
            inputProps={{ 'aria-label': `בחירת השאלה ${q.prompt.split('\n')[0]}` }}
          />
        </Box>
        <CardActionArea onClick={onOpen} sx={{ flex: 1, minWidth: 0, px: 2, py: 2 }}>
          {/* a question with a picture shows it, and keeps three lines' worth of height for it */}
          <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ minHeight: graph ? 88 : undefined }}>
            <ClampedText
              text={q.prompt}
              maxHeight={88}
              textSx={{ lineHeight: (t) => t.typography.button.lineHeight }}
            />
            {graph && <GraphThumb graph={graph} />}
          </Stack>
          {/* everything the teacher filters by, quietly, under the question */}
          <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5, columnGap: 1.5, rowGap: 1 }}>
            <DifficultyPill level={q.difficulty} />
            <Typography sx={META}>{q.topic} · {q.subTopic} · {q.section}</Typography>
            {q.tags.map((t) => <TagPill key={t} label={t} />)}
            {disabled && disabledNote && (
              <Typography sx={{ ...META, fontWeight: 700, color: 'primary.dark' }}>{disabledNote}</Typography>
            )}
          </Stack>
        </CardActionArea>
      </Stack>
    </Card>
  );
}
