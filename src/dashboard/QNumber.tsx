import Box from '@mui/material/Box';

/**
 * The numbered circle from the student app's question cards (TaskDetail.tsx QMeta), minus
 * the solved/started dots — a teacher is looking at the class, not at one student's run.
 */
export function QNumber({ index }: { index: number }) {
  return (
    <Box
      sx={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 2, borderColor: 'grey.400', color: 'text.primary',
        fontWeight: 800, fontSize: '1.3rem', fontFeatureSettings: '"tnum","lnum"',
      }}
    >
      {index + 1}
    </Box>
  );
}
