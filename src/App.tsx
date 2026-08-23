import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Logo } from './components/Logo';

// Placeholder scaffold — no screens yet. Product scope is TBD, see PRODUCT.md.
export function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Stack spacing={3} alignItems="center">
        <Logo size="large" tagline={false} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ALFI for Teachers
        </Typography>
      </Stack>
    </Box>
  );
}
