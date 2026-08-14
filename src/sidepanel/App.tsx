// ─── App.tsx ──────────────────────────────────────────────────────────────────
// Root component for the Novel2Visual side panel.

import { useStorage } from './hooks/useStorage';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import GenerationQueue from './components/GenerationQueue';

import Home from './pages/Home';
import Chapter from './pages/Chapter';
import Scenes from './pages/Scenes';
import Characters from './pages/Characters';
import Style from './pages/Style';
import Gallery from './pages/Gallery';

import { useUiStore } from '@/store/uiStore';

export default function App() {
  useStorage(); // load persisted data on mount
  const { page } = useUiStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-0)', overflow: 'hidden' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {page === 'home' && <Home />}
            {page === 'chapter' && <Chapter />}
            {page === 'scenes' && <Scenes />}
            {page === 'characters' && <Characters />}
            {page === 'style' && <Style />}
            {page === 'gallery' && <Gallery />}
          </main>
          <GenerationQueue />
        </div>
      </div>
    </div>
  );
}
