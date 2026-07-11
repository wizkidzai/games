import { useEffect } from 'react';
import { SessionManager } from '@wizkidz/analytics';
import MainMenu from './components/MainMenu';
import { CONFIG } from './config';

const sessionManager = new SessionManager({
  onTimeout: () => window.location.reload(),
  timeoutMs: CONFIG.idleTimeoutMinutes * 60_000,
});

export default function App() {
  useEffect(() => {
    sessionManager.start();
    return () => sessionManager.stop();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[--color-bg] text-[--color-text] font-ui">
      <MainMenu />
    </div>
  );
}
