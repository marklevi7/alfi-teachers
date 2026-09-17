import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { alpha } from '@mui/material/styles';

/**
 * The worked solution, folded away until the teacher asks for it — they are deciding whether
 * to use the question, not solving it. Blue, because it is ALFI's answer and not the class's.
 */
export function SolutionAccordion({ solution }: { solution: string }) {
  return (
    <Accordion
      // open on arrival: the teacher came here to read it, and can fold it away
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: (t) => alpha(t.palette.info.main, 0.24),
        bgcolor: (t) => alpha(t.palette.info.main, 0.08),
        // MUI draws a divider line above an accordion; a single panel has nothing to divide
        '&::before': { display: 'none' },
        '&:first-of-type, &:last-of-type': { borderRadius: 3 },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>הפתרון</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography component="div" sx={{ whiteSpace: 'pre-line', textAlign: 'start', lineHeight: 2 }}>
          {solution}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
