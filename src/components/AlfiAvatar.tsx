import Avatar from '@mui/material/Avatar';

/**
 * Alfi's head, copied from the student app (Shell.tsx AlfiAvatar). The teacher app only
 * ever runs the green theme, so there is one source here instead of two.
 */
export function AlfiAvatar({ size = 40 }: { size?: number }) {
  // the source art has a lot of air around the head — zoom in so the face fills the circle
  return (
    <Avatar
      src="alfi-green-head.png"
      alt="אלפי"
      sx={{ width: size, height: size, flexShrink: 0, bgcolor: 'grey.100', '& .MuiAvatar-img': { transform: 'scale(1.7)', transformOrigin: '50% 40%' } }}
    />
  );
}
