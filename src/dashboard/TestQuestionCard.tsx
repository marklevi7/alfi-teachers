import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { QNumber } from './QNumber';
import { DifficultyPill, TagPill } from './Pills';
import { ClampedText } from './ClampedText';
import { GraphThumb } from './GraphThumb';
import { graphFor, bankQuestionFor } from './mockData';

// three lines of a prompt at the card's line height, then it fades out
const PREVIEW_H = 88;

/** what the teacher gets under a question and the class does not: where it is from, how hard, its tags */
export function QuestionMeta({ prompt }: { prompt: string }) {
  const meta = bankQuestionFor(prompt);
  if (!meta) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
      <DifficultyPill level={meta.difficulty} />
      <Typography variant="body2" color="text.secondary">
        {meta.topic} · {meta.subTopic} · {meta.section}
      </Typography>
      {meta.tags.map((t) => <TagPill key={t} label={t} />)}
    </Stack>
  );
}

/**
 * One question in the list: the student app's card, cut off mid-air when it runs long.
 *
 * With `onOpen` the card is the way into the question, and says so — a pointer, a lift and a
 * green edge under the cursor. Without it the card is only something to read: a plain block,
 * no hover, nothing to click.
 */
export function QuestionCard({ prompt, index, onOpen, onRemove }: {
  prompt: string; index: number; onOpen?: () => void; onRemove?: () => void;
}) {
  // a question that had a picture when it was picked keeps it here
  const graph = graphFor(prompt);
  return (
    <Paper
      {...(onOpen ? { component: 'button' as const, onClick: onOpen } : {})}
      variant="outlined"
      sx={{
        display: 'block', width: '100%', textAlign: 'start', font: 'inherit', color: 'inherit',
        borderRadius: 3, p: 2,
        ...(onOpen && {
          cursor: 'pointer',
          transition: (t) => t.transitions.create(['box-shadow', 'border-color']),
          '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }),
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <QNumber index={index} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minHeight: graph ? 88 : undefined }}>
            <ClampedText
              text={prompt}
              maxHeight={PREVIEW_H}
              textSx={{ lineHeight: (t) => t.typography.button.lineHeight }}
            />
            {graph && <GraphThumb graph={graph} />}
          </Stack>
          <QuestionMeta prompt={prompt} />
        </Box>
        {/* a test being assembled can still lose a question; a ready-made one cannot */}
        {onRemove && (
          <Box
            component="span"
            sx={{ flexShrink: 0 }}
            // the card is itself a button, so the removal has to stop the click here
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <Tooltip title="הסרת השאלה" placement="top" arrow>
              <IconButton component="span" aria-label={`הסרת שאלה ${index + 1}`} sx={{ color: 'error.main' }}>
                <DeleteOutlineRounded />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
