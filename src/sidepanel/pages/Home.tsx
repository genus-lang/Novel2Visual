import { useState } from 'react';
import NovelProfile from '../components/NovelProfile';
import { Plus } from 'lucide-react';
import { useNovel } from '../hooks/useNovel';
import { useUiStore } from '@/store/uiStore';
import type { Genre } from '@/constants/genres';
import type { VisualStyle, AspectRatio } from '@/constants/styles';
export default function Home() {
  const [title, setTitle] = useState('');
  const { initProject } = useNovel();
  const setPage = useUiStore((s) => s.setPage);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await initProject({ 
      name: title.trim(),
      genre: 'fantasy' as Genre,
      visualStyle: 'anime' as VisualStyle,
      aspectRatio: '16:9' as AspectRatio,
      maintainCharacterConsistency: true,
    });
    setPage('chapter');
  };

  return (
    <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Start a new project
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
          Turn your chapters into stunning visual storyboards.
        </p>
        
        <div style={{ width: '100%', textAlign: 'left' }}>
          <NovelProfile title={title} setTitle={setTitle} />
        </div>
      <button 
        onClick={handleCreate}
        disabled={!title.trim()}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          background: title.trim() ? 'var(--accent)' : 'var(--bg-3)',
          color: title.trim() ? '#fff' : 'var(--text-muted)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          cursor: title.trim() ? 'pointer' : 'not-allowed',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          transition: 'background var(--transition)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
      >
        <Plus size={16} /> Create Project
      </button>
      </div>
    </div>
  );
}
