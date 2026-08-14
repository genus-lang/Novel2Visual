import { useProjectStore } from '@/store/projectStore';
import { VISUAL_STYLE_LIST, ASPECT_RATIO_LIST, type VisualStyle, type AspectRatio } from '@/constants/styles';
import { Palette, Maximize } from 'lucide-react';

export default function Style() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  if (!activeProject) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No active project selected.
      </div>
    );
  }

  const { visualStyle, aspectRatio } = activeProject.profile;

  const handleStyleChange = (styleKey: VisualStyle) => {
    updateProject(activeProject.id, {
      profile: { ...activeProject.profile, visualStyle: styleKey }
    });
  };

  const handleAspectChange = (ratioKey: AspectRatio) => {
    updateProject(activeProject.id, {
      profile: { ...activeProject.profile, aspectRatio: ratioKey }
    });
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>
      
      {/* Aspect Ratio Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Maximize size={18} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Aspect Ratio</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {ASPECT_RATIO_LIST.map((ratio) => (
            <button
              key={ratio.key}
              onClick={() => handleAspectChange(ratio.key)}
              style={{
                padding: '12px',
                background: aspectRatio === ratio.key ? 'var(--accent)' : 'var(--bg-2)',
                color: aspectRatio === ratio.key ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${aspectRatio === ratio.key ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition)'
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>{ratio.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Visual Style Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Palette size={18} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Visual Style</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {VISUAL_STYLE_LIST.map((style) => (
            <button
              key={style.key}
              onClick={() => handleStyleChange(style.key)}
              style={{
                padding: '16px',
                background: visualStyle === style.key ? 'var(--accent)' : 'var(--bg-2)',
                color: visualStyle === style.key ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${visualStyle === style.key ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition)'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{style.name}</div>
              <div style={{ fontSize: '12px', opacity: visualStyle === style.key ? 0.9 : 0.6, lineHeight: 1.4 }}>
                {style.description}
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
