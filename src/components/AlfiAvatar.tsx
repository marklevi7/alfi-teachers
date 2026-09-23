import Avatar from '@mui/material/Avatar';
import { green, lightGreen } from '@mui/material/colors';

/** the posed head the student app shows in a chat (Shell.tsx ALFI_POSE.smile) */
const SMILE = { src: 'alfi-smile.png', scale: 0.94, origin: '50% 50%' } as const;
/** one size and one background for every posed Alfi, same as the student app */
const ALFI_SIZE = 56;
const ALFI_ART = 44 / ALFI_SIZE;

/**
 * Alfi's head, copied from the student app (Shell.tsx AlfiAvatar). The teacher app only
 * ever runs the green theme, so there is one source here instead of two. `pose` is the
 * chat version: the head on the green ramp, exactly as the student meets it.
 */
export function AlfiAvatar({ size = 40, pose = false }: { size?: number; pose?: boolean }) {
  if (pose) {
    return (
      <Avatar
        src={SMILE.src}
        alt="אלפי"
        sx={{
          width: ALFI_SIZE, height: ALFI_SIZE, flexShrink: 0,
          // no stop percentages: the RTL plugin rewrites them and breaks the ramp
          background: `linear-gradient(to bottom, ${green[500]}, ${lightGreen[500]})`,
          '& .MuiAvatar-img': {
            transform: `scale(${SMILE.scale * ALFI_ART})`,
            transformOrigin: SMILE.origin,
            objectFit: 'contain',
          },
        }}
      />
    );
  }
  // the source art has a lot of air around the head — zoom in so the face fills the circle
  return (
    <Avatar
      src="alfi-green-head.png"
      alt="אלפי"
      sx={{ width: size, height: size, flexShrink: 0, bgcolor: 'grey.100', '& .MuiAvatar-img': { transform: 'scale(1.7)', transformOrigin: '50% 40%' } }}
    />
  );
}
