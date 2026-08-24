import { useState } from 'react';
import Box from '@mui/material/Box';
import { Shell, NAV, type Screen } from './dashboard/Shell';
import { TeacherMain } from './dashboard/TeacherMain';
import { BlankScreen } from './dashboard/BlankScreen';
import { ControlBar, type Device } from './dashboard/ControlBar';

export function App() {
  const [screen, setScreen] = useState<Screen>('main');
  const [showBar, setShowBar] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');

  return (
    <>
      {/* invisible hotspot — top-right corner toggles the dev control bar (hidden by default), same as the student app */}
      <Box
        onClick={() => setShowBar((v) => !v)}
        aria-label="הצגת בקרות פיתוח"
        sx={{ position: 'fixed', top: 0, insetInlineEnd: 0, width: 20, height: 20, zIndex: (t) => t.zIndex.modal + 2, cursor: 'default' }}
      />
      {showBar && <ControlBar device={device} onDeviceChange={setDevice} onClose={() => setShowBar(false)} />}
      {device === 'mobile' ? (
        // real mobile viewport: the app runs inside a phone-sized iframe so xs breakpoints apply
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.900', py: 3 }}>
          <Box
            component="iframe"
            src={window.location.pathname}
            title="תצוגת מובייל"
            sx={{ width: 390, height: 'min(844px, 92vh)', border: 0, borderRadius: 6, boxShadow: 24, bgcolor: 'background.paper' }}
          />
        </Box>
      ) : (
        <Shell active={screen} onNavigate={setScreen}>
          {screen === 'main' ? <TeacherMain /> : <BlankScreen title={NAV.find((n) => n.key === screen)!.label} />}
        </Shell>
      )}
    </>
  );
}
