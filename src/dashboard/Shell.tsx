import { useState, type ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SchoolRounded from '@mui/icons-material/SchoolRounded';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { AlfiWordmark } from '../components/AlfiWordmark';
import { FREDOKA } from '../theme';

// ניהול משימות is gone as its own screen — it merges into תוצאות הערכות, which inherits
// its icon (decided on the 23 Aug kickoff call).
// 'assessment-review' and 'scheduled-task' are drill-ins, not nav items: they are reached
// by clicking a row, so they never appear in NAV.
export type Screen = 'main' | 'students' | 'build-test' | 'build-practice' | 'results' | 'assessment-review' | 'scheduled-task';
export type NavKey = Exclude<Screen, 'assessment-review' | 'scheduled-task'>;

export const NAV: { key: NavKey; label: string; icon: ReactNode }[] = [
  { key: 'main', label: 'מסך ראשי', icon: <SchoolRounded /> },
  { key: 'students', label: 'מצב התלמידים', icon: <ShowChartRounded /> },
  { key: 'build-test', label: 'בניית מבחן', icon: <AssignmentRounded /> },
  { key: 'build-practice', label: 'בניית תרגול', icon: <MenuBookRounded /> },
  { key: 'results', label: 'כל ההערכות', icon: <AssignmentTurnedInRounded /> },
];

const SIDEBAR_WIDTH = 240;
// Cap the content so cards stop stretching on a wide monitor, but stay fluid below the cap
// so a small laptop never gets a horizontal scrollbar. Every screen uses this — the width
// behaviour is identical app-wide.
const CONTENT_MAX_WIDTH = 1120;

// Shared chrome: sidebar nav (right in RTL) + main content area.
// Every teacher screen renders inside this via `active` / `children`.
export function Shell({ active, onNavigate, children }: { active: Screen; onNavigate: (s: NavKey) => void; children: ReactNode }) {
  // Only one class exists in the current data — this becomes real filtering once more classes ship.
  const [classId, setClassId] = useState('י-1');

  return (
    // The window never scrolls: the content column is the single scroller, and an RTL
    // element puts its scrollbar on the inline end — the physical LEFT edge, which is
    // where Mark wants it on every screen.
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', bgcolor: 'grey.50' }}>
      {/* full height beside the scroller, and never a scrollbar of its own */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH, flexShrink: 0, bgcolor: 'background.paper',
          display: 'flex', flexDirection: 'column',
          borderInlineStart: '1px solid', borderColor: 'divider',
          height: '100%', overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3, pt: 4, pb: 2 }}>
          <AlfiWordmark sx={{ width: '100%', height: 'auto' }} />
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <TextField select size="small" fullWidth value={classId} onChange={(e) => setClassId(e.target.value)}>
            <MenuItem value="י-1">כיתה י-1</MenuItem>
            <MenuItem value="י-2">כיתה י-2</MenuItem>
            <MenuItem value="י-3">כיתה י-3</MenuItem>
          </TextField>
        </Box>

        <List>
          {NAV.map((item) => {
            const selected = item.key === active;
            return (
              <ListItemButton
                key={item.key}
                selected={selected}
                onClick={() => onNavigate(item.key)}
                sx={{
                  borderRadius: 4, mx: 1.5, mb: 0.5, py: 1.5, px: 2,
                  '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: 'text.secondary' },
                  '&.Mui-selected': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12) },
                  '&.Mui-selected:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.18) },
                  '&.Mui-selected .MuiListItemIcon-root, &.Mui-selected .MuiListItemText-primary': { color: 'primary.dark' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { ...FREDOKA, fontWeight: selected ? 600 : 500 } }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <List>
          <ListItemButton
            sx={{
              borderRadius: 4, mx: 1.5, mb: 1, py: 1.5, px: 2,
              '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: 'text.secondary' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutRounded className="dir-icon" />
            </ListItemIcon>
            <ListItemText primary="התנתק" primaryTypographyProps={{ sx: { ...FREDOKA, fontWeight: 500 } }} />
          </ListItemButton>
        </List>
      </Box>

      {/* The one and only scrollbar in the app. A scroll container insets sticky children
          by its own padding, so the vertical padding lives on the column inside instead —
          otherwise a sticky table header parks 48px down and rows show through the gap. */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, height: '100%', overflowY: 'auto', px: 6 }}>
        <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto', py: 6 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
