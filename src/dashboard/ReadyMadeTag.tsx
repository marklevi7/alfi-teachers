import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';

/**
 * What a ready-made test carries instead of its edit controls: a label, and why it is locked.
 * The same tag on every screen that shows a pre-set test — the editor and the preview — so a
 * teacher meets one explanation, not two.
 */
export function ReadyMadeTag({ kind }: { kind: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Chip
        size="small"
        color="primary"
        variant="outlined"
        icon={<LockOutlined />}
        label={kind === 'בוחן' ? 'מבחן מוכן' : 'תרגול מוכן'}
        sx={{ fontWeight: 700 }}
      />
      <Tooltip
        placement="top"
        arrow
        title={`ה${kind} נבנה מראש כיחידה סגורה — השאלות שבו נקבעו יחד ואי אפשר להוסיף או להסיר מהן. אפשר עדיין לשנות את השם, התאריך והשעות, או למחוק את המשימה כולה.`}
      >
        <IconButton size="small" aria-label="למה אי אפשר לערוך את השאלות">
          <InfoOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
