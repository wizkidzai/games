import { useEffect } from 'react';
import { SessionManager } from '@wizkidz/analytics';
import MainMenu from './components/MainMenu';

const sessionManager = new SessionManager({
  onTimeout: () => window.location.reload(),
});

export default function App() {
  useEffect(() => {
    sessionManager.start();
    return () => sessionManager.stop();
  }, []);

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text] font-ui">
      <header className="flex items-center px-8 py-4 border-b border-[--color-border]">
        <img
          src="/marketing-assets/logo/wiz-kidz-logo-teal-271x120.png"
          alt="Wiz Kidz"
          style={{ height: 40 }}
        />
      </header>

      <main className="flex-1">
        <MainMenu />
      </main>
    </div>
  );
}
