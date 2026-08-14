import SceneList from '../components/SceneList';
import { useScenes } from '../hooks/useScenes';
import { useNovel } from '../hooks/useNovel';
import { Sparkles, Download } from 'lucide-react';
import { useGenerationStore } from '@/store/generationStore';
import { usePromptBuilder } from '../hooks/usePromptBuilder';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';
import { ZipExporter } from '@/services/downloads/ZipExporter';

export default function Scenes() {
  const { scenes } = useScenes();
  const { activeProject } = useNovel();
  const { queue, currentSceneId } = useGenerationStore();
  const { buildPrompt } = usePromptBuilder();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProject?.profile.name || 'Untitled Project'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
              Chapter 1 &middot; {scenes.length} scenes
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {scenes.some(scene => scene.imageUrl) && (
              <button
                onClick={async () => {
                  try {
                    const imagesToExport = scenes
                      .filter(s => s.imageUrl)
                      .map(s => ({
                        filename: `Scene_${String(s.index).padStart(2, '0')}.png`,
                        dataUrl: s.imageUrl!
                      }));
                    
                    const exporter = new ZipExporter();
                    await exporter.export(activeProject?.profile.name || 'Project', imagesToExport);
                  } catch (e) {
                    console.error('Failed to export ZIP:', e);
                  }
                }}
                style={{
                  background: 'var(--bg-3)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                  padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '6px', flexShrink: 0, transition: 'background var(--transition)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--border)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-3)'}>
                Download ZIP <Download size={12} />
              </button>
            )}
            <button
              onClick={() => {
                const toEnqueue = scenes
                  .filter(scene => !scene.imageUrl && !queue.some((s: any) => s.sceneId === scene.id) && currentSceneId !== scene.id)
                  .map(scene => ({
                     sceneId: scene.id,
                     title: scene.title,
                     prompt: buildPrompt(scene)?.raw || ''
                  }))
                  .filter(s => s.prompt);
                
                if (toEnqueue.length > 0) {
                   ChromeMessenger.toBackground({
                      type: 'ENQUEUE_SCENES',
                      provider: useGenerationStore.getState().activeProvider,
                      scenes: toEnqueue
                   }).catch(console.error);
                }
              }}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '6px', flexShrink: 0, transition: 'opacity var(--transition)'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              Regenerate Missing <Sparkles size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Scene list */}
      <div style={{ padding: '16px' }}>
        <SceneList scenes={scenes} />
      </div>
    </div>
  );
}
