import { useUiStore, type Page } from '@/store/uiStore';
import { LayoutDashboard, BookOpen, Film, Users, Palette, Image as ImageIcon } from 'lucide-react';

export default function Sidebar() {
  const { page, setPage } = useUiStore();

  const nav = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'chapter', label: 'Chapter', icon: BookOpen },
    { id: 'scenes', label: 'Scenes', icon: Film },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'style', label: 'Visual Style', icon: Palette },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  ] as const;

  return (
    <div style={{
      width: '64px',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-1)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 8px',
      flexShrink: 0,
      alignItems: 'center'
    }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {nav.map((item) => {
          const isActive = page === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as Page)}
              title={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                background: isActive ? 'var(--bg-2)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--border)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-0)';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
