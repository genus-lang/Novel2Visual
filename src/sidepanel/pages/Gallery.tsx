import { useScenes } from '../hooks/useScenes';
import { useNovel } from '../hooks/useNovel';
import { Download, Trash2, RefreshCw } from 'lucide-react';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';
import { ZipExporter } from '@/services/downloads/ZipExporter';
import { usePromptBuilder } from '../hooks/usePromptBuilder';
import { useGenerationStore } from '@/store/generationStore';

export default function Gallery() {
  const { scenes, updateScene } = useScenes();
  const { activeProject } = useNovel();
  const { buildPrompt } = usePromptBuilder();
  const { queue, currentSceneId, setSceneStatus } = useGenerationStore();
  
  const generatedScenes = scenes.filter(s => s.imageUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Gallery
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {generatedScenes.length} images generated
          </p>
        </div>
        
        {generatedScenes.length > 0 && (
          <button
            onClick={async () => {
              try {
                const imagesToExport = generatedScenes.map(s => ({
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
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', transition: 'opacity var(--transition)'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
            Download ZIP <Download size={12} />
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', alignContent: 'start' }}>
        {generatedScenes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
            No images generated yet. Go to the Scenes tab to start generating.
          </div>
        ) : (
          generatedScenes.map((scene) => {
            const isGenerating = currentSceneId === scene.id || queue.some(s => s.sceneId === scene.id);
            
            return (
              <div key={scene.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--bg-3)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)',
                  position: 'relative'
                }}>
                  <img 
                    src={scene.imageUrl} 
                    alt={scene.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Overlay buttons on hover */}
                  <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: '4px', opacity: 0.85 }}>
                    <button
                      onClick={() => {
                        const prompt = buildPrompt(scene)?.raw || '';
                        if (prompt && !isGenerating) {
                          ChromeMessenger.toBackground({
                            type: 'ENQUEUE_SCENES',
                            provider: useGenerationStore.getState().activeProvider,
                            scenes: [{ sceneId: scene.id, title: scene.title, prompt }]
                          }).catch(console.error);
                        }
                      }}
                      title="Regenerate"
                      disabled={isGenerating}
                      style={{
                        background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                        padding: '4px', borderRadius: '4px', cursor: isGenerating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      onClick={() => { updateScene(scene.id, { imageUrl: undefined }); setSceneStatus(scene.id, { status: 'idle' }); }}
                      title="Delete Image"
                      style={{
                        background: 'rgba(248,113,113,0.8)', color: '#fff', border: 'none',
                        padding: '4px', borderRadius: '4px', cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Scene {String(scene.index).padStart(2, '0')}: {scene.title || 'Untitled'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

