import { useState } from 'react';
import Box from '@mui/material/Box';
import { Shell, NAV, type Screen, type NavKey } from './dashboard/Shell';
import { TeacherMain } from './dashboard/TeacherMain';
import { StudentsStatus, type StudentsVariant } from './dashboard/StudentsStatus';
import { AssessmentReview, type ReviewVariant } from './dashboard/AssessmentReview';
import { AllAssessments, type AllAssessmentsVariant } from './dashboard/AllAssessments';
import { ScheduledTask } from './dashboard/ScheduledTask';
import { BuildTest } from './dashboard/BuildTest';
import { CLASS_ASSESSMENTS, type ClassAssessment } from './dashboard/mockData';
import { BlankScreen } from './dashboard/BlankScreen';
import { ControlBar, type Device, type ScreenVariant } from './dashboard/ControlBar';
import type { MainVariant } from './dashboard/MainDashboard';

// The demo states each screen can be shown in, switched from the dev control bar.
// A screen with nothing listed here simply has one state.
const SCREEN_VARIANTS: Partial<Record<Screen, ScreenVariant[]>> = {
  main: [
    { key: 'mid', label: 'mid-use' },
    { key: 'empty', label: 'blank' },
    { key: 'many', label: 'many students' },
  ],
  students: [
    { key: 'mid', label: 'mid-use' },
    { key: 'empty', label: 'blank' },
  ],
  'assessment-review': [
    { key: 'full', label: 'full' },
    { key: 'blank', label: 'blank' },
  ],
  results: [
    { key: 'mid', label: 'mid-use' },
    { key: 'empty', label: 'blank' },
  ],
};

export function App() {
  const [screen, setScreen] = useState<Screen>('main');
  // which row of תרגולים אחרונים opened סקירת הערכה, and where the back button returns to
  const [assessment, setAssessment] = useState(0);
  const [reviewFrom, setReviewFrom] = useState<'main' | 'results'>('main');
  // כל ההערכות owns real state — a delete has to survive leaving the screen
  const [assessments, setAssessments] = useState<ClassAssessment[]>(CLASS_ASSESSMENTS);
  const [scheduledId, setScheduledId] = useState<string | null>(null);
  const scheduled = assessments.find((a) => a.id === scheduledId) ?? null;
  const [showBar, setShowBar] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');
  const [variant, setVariant] = useState('mid');

  const variants = SCREEN_VARIANTS[screen] ?? [];

  // every screen opens on its first state, so switching screens never lands on a demo
  // state that screen doesn't have
  const navigate = (s: NavKey) => {
    setScreen(s);
    setVariant(SCREEN_VARIANTS[s]?.[0]?.key ?? 'mid');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* invisible hotspot — top-right corner toggles the dev control bar (hidden by default), same as the student app */}
      <Box
        onClick={() => setShowBar((v) => !v)}
        aria-label="הצגת בקרות פיתוח"
        sx={{ position: 'fixed', top: 0, insetInlineEnd: 0, width: 20, height: 20, zIndex: (t) => t.zIndex.modal + 2, cursor: 'default' }}
      />
      {showBar && (
        <ControlBar
          device={device}
          onDeviceChange={setDevice}
          onClose={() => setShowBar(false)}
          variants={variants}
          variant={variant}
          onVariantChange={setVariant}
        />
      )}
      {device === 'mobile' ? (
        // real mobile viewport: the app runs inside a phone-sized iframe so xs breakpoints apply
        <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.900', py: 3 }}>
          <Box
            component="iframe"
            src={window.location.pathname}
            title="תצוגת מובייל"
            sx={{ width: 390, height: 'min(844px, 92vh)', border: 0, borderRadius: 6, boxShadow: 24, bgcolor: 'background.paper' }}
          />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {/* סקירת הערכה has no nav item of its own — it belongs to תוצאות הערכות, so that
              item stays lit however the teacher got here */}
          <Shell active={screen === 'assessment-review' || screen === 'scheduled-task' ? 'results' : screen} onNavigate={navigate}>
            {screen === 'main' ? (
              <TeacherMain
                variant={variant as MainVariant}
                onOpenAssessment={(i) => {
                  setAssessment(i);
                  setReviewFrom('main');
                  setScreen('assessment-review');
                  setVariant(SCREEN_VARIANTS['assessment-review']![0].key);
                }}
              />
            ) : screen === 'assessment-review' ? (
              <AssessmentReview
                index={assessment}
                variant={variant as ReviewVariant}
                backLabel={reviewFrom === 'results' ? 'חזרה לכל ההערכות' : 'חזרה למסך הראשי'}
                onBack={() => {
                  setScreen(reviewFrom);
                  setVariant(SCREEN_VARIANTS[reviewFrom]?.[0]?.key ?? 'mid');
                }}
              />
            ) : screen === 'students' ? (
              <StudentsStatus variant={variant as StudentsVariant} />
            ) : screen === 'scheduled-task' && scheduled ? (
              <ScheduledTask
                task={scheduled}
                onBack={() => setScreen('results')}
                onSave={(next) => {
                  setAssessments(assessments.map((a) => (a.id === next.id ? next : a)));
                  setScreen('results');
                }}
                onDelete={() => {
                  setAssessments(assessments.filter((a) => a.id !== scheduled.id));
                  setScreen('results');
                }}
              />
            ) : screen === 'build-test' ? (
              <BuildTest
                // a sent test joins כל ההערכות as a scheduled one, and the screen follows it there
                onSend={(next) => {
                  setAssessments([next, ...assessments]);
                  setScreen('results');
                }}
              />
            ) : screen === 'results' ? (
              <AllAssessments
                variant={variant as AllAssessmentsVariant}
                items={assessments}
                onItemsChange={setAssessments}
                onEditTask={(id) => { setScheduledId(id); setScreen('scheduled-task'); }}
                onOpenReview={(i) => {
                  setAssessment(i);
                  setReviewFrom('results');
                  setScreen('assessment-review');
                  setVariant(SCREEN_VARIANTS['assessment-review']![0].key);
                }}
              />
            ) : (
              <BlankScreen title={NAV.find((n) => n.key === screen)!.label} />
            )}
          </Shell>
        </Box>
      )}
    </Box>
  );
}
