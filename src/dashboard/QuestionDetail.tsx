import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import { FREDOKA } from '../theme';
import { Pill, PILL_TEXT, DifficultyPill, TagPill } from './Pills';
import { SolutionAccordion } from './SolutionAccordion';
import { QNumber } from './QNumber';
import { GraphThumb } from './GraphThumb';
import { bankQuestionFor, solutionFor, graphFor } from './mockData';

/**
 * The head of an open question: the word, and the question's number in the same circle the
 * cards use. It sits in the host's own title row — a dialog's header, or the page's heading —
 * beside whatever navigation that host carries.
 */
export function QuestionHeading({ index, label = 'שאלה' }: { index?: number; label?: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {index !== undefined && <QNumber index={index} />}
      <Typography variant="h5" sx={{ ...FREDOKA, fontWeight: 600 }}>{label}</Typography>
    </Stack>
  );
}

/**
 * One question, read in full — the app's detail block, wherever a question is opened:
 * the question, a rule, the one meta line, then the answer. The title above it and the
 * navigation around it belong to the screen that hosts it, not to this.
 */
export function QuestionDetail({ prompt }: { prompt: string }) {
  const meta = bankQuestionFor(prompt);
  const solution = solutionFor(prompt);
  const graph = graphFor(prompt);
  return (
    <Stack spacing={2}>
      <Box>
        {/* the question in full — the student app's open-question type */}
        <Typography
          component="div"
          variant="h6"
          sx={{ fontWeight: 400, lineHeight: 2.1, textAlign: 'start', whiteSpace: 'pre-line' }}
        >
          {prompt}
        </Typography>

        {/* the curve the question hands over, read at full size */}
        {graph && (
          <Box sx={{ mt: 2 }}>
            <GraphThumb graph={graph} size="full" />
          </Box>
        )}

        {/* a rule between the question and what the teacher knows about it */}
        <Divider sx={{ mt: 2 }} />

        {meta && (
          <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5, columnGap: 1.5, rowGap: 1 }}>
            <DifficultyPill level={meta.difficulty} />
            <Typography variant="body2" color="text.secondary">
              {meta.topic} · {meta.subTopic} · {meta.section}
            </Typography>
            {/* a question that already went out says so, and says where */}
            {meta.usedIn.length > 0 && (
              <Pill>
                <HistoryRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography component="span" sx={{ ...PILL_TEXT, color: 'text.secondary' }}>
                  כבר בשימוש · {meta.usedIn.join(', ')}
                </Typography>
              </Pill>
            )}
            {meta.tags.map((t) => <TagPill key={t} label={t} />)}
          </Stack>
        )}
      </Box>

      {solution && <SolutionAccordion solution={solution} />}
    </Stack>
  );
}
