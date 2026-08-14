import { Star, Image as ImageIcon, Loader2, Clock, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import type { Scene } from '@/types/scene';
import { useGenerationStore } from '@/store/generationStore';
import { usePromptBuilder } from '../hooks/usePromptBuilder';
import { useScenes } from '../hooks/useScenes';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';

export default function SceneList({ scenes }: { scenes: Scene[] }) {
  const { queue, currentSceneId, sceneStatuses, setSceneStatus } = useGenerationStore();
  const { buildPrompt } = usePromptBuilder();
  const { updateScene } = useScenes();

  if (scenes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
        No scenes extracted yet. Paste a chapter and click Analyze.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {scenes.map((scene, i) => {
        const isQueued = queue.some((s) => s.sceneId === scene.id);
        const isGenerating = currentSceneId === scene.id;
        const statusEntry = sceneStatuses[scene.id];
        const sceneStatus = isGenerating
          ? 'generating'
          : isQueued
          ? 'queued'
          : statusEntry?.status ?? (scene.imageUrl ? 'done' : 'idle');
        const errorMsg = statusEntry?.error;

        const enqueueSingle = () => {
          const prompt = buildPrompt(scene)?.raw;
          if (prompt) {
            ChromeMessenger.toBackground({
              type: 'ENQUEUE_SCENES',
              provider: useGenerationStore.getState().activeProvider,
              scenes: [{ sceneId: scene.id, title: scene.title, prompt }],
            }).catch(console.error);
          }
        };

        const borderColor =
          sceneStatus === 'generating' ? 'var(--accent)'
          : sceneStatus === 'error'      ? 'var(--danger)'
          : sceneStatus === 'done'       ? 'rgba(74,222,128,0.35)'
          : 'var(--border)';

        return (
          <div
            key={scene.id}
            style={{
              background: 'var(--bg-2)',
              border: `1px solid ${borderColor}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              overflow: 'hidden',
              boxShadow: sceneStatus === 'generating' ? '0 0 10px rgba(139,92,246,0.15)' : 'var(--shadow-sm)',
              transition: 'box-shadow 300ms, border-color 300ms',
            }}
          >
            {/* Thumbnail — fixed 80px wide */}
            <div style={{
              width: '80px',
              minHeight: '80px',
              flexShrink: 0,
              background: 'var(--bg-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: `1px solid ${borderColor}`,
              transition: 'border-color 300ms',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {scene.imageUrl ? (
                <img
                  src={scene.imageUrl}
                  alt="Scene"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : isGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loader2 size={18} color="var(--accent)" className="spin" />
                  <span style={{ fontSize: '8px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.04em' }}>GEN…</span>
                </div>
              ) : isQueued ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Clock size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>WAIT</span>
                </div>
              ) : sceneStatus === 'error' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={18} color="var(--danger)" />
                  <span style={{ fontSize: '8px', color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.04em' }}>ERR</span>
                </div>
              ) : (
                <ImageIcon size={20} style={{ opacity: 0.15 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
              {/* Scene label + stars row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', flexShrink: 0 }}>
                  SCENE {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const stars = scene.importance || 1;
                    return (
                      <Star key={idx} size={9}
                        fill={idx < stars ? 'var(--warning)' : 'transparent'}
                        color={idx < stars ? 'var(--warning)' : 'var(--border)'}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Title — single line, truncated */}
              <div style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {scene.title || 'Untitled Scene'}
              </div>

              {/* Error banner */}
              {sceneStatus === 'error' && errorMsg && (
                <div title={errorMsg} style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: '4px',
                  padding: '4px 7px',
                  fontSize: '10px',
                  color: 'var(--danger)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  ? {errorMsg}
                </div>
              )}

              {/* Description — 1 line max */}
              <p style={{
                color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.4, margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {scene.sourceText}
              </p>

              {/* Footer: tags + button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
                {/* Character tags — at most 1 visible + count */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                  {scene.characters.slice(0, 1).map((c) => (
                    <span key={c} style={{
                      fontSize: '9px', background: 'var(--bg-3)', color: 'var(--text-muted)',
                      padding: '2px 6px', borderRadius: '10px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px',
                    }}>
                      {c}
                    </span>
                  ))}
                  {scene.characters.length > 1 && (
                    <span style={{
                      fontSize: '9px', background: 'var(--bg-3)', color: 'var(--text-muted)',
                      padding: '2px 6px', borderRadius: '10px', flexShrink: 0,
                    }}>
                      +{scene.characters.length - 1}
                    </span>
                  )}
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', gap: '4px' }}>{sceneStatus === 'done' && <button onClick={() => { updateScene(scene.id, { imageUrl: undefined }); setSceneStatus(scene.id, { status: 'idle' }); }} title="Delete image" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.25)', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={10} /></button>}<ActionButton sceneStatus={sceneStatus as any} onClick={enqueueSingle} /></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionButton({
  sceneStatus,
  onClick,
}: {
  sceneStatus: 'idle' | 'queued' | 'generating' | 'done' | 'error';
  onClick: () => void;
}) {
  const isDisabled = sceneStatus === 'queued' || sceneStatus === 'generating';

  const config: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
    idle:       { label: 'Generate',    icon: null,                                             bg: 'var(--accent)',              color: '#fff' },
    queued:     { label: 'Queued',      icon: <Clock size={10} />,                              bg: 'var(--bg-3)',                color: 'var(--text-muted)' },
    generating: { label: 'Generating', icon: <Loader2 size={10} className="spin" />,           bg: 'rgba(139,92,246,0.15)',       color: 'var(--accent)' },
    done:       { label: 'Regen',      icon: <RefreshCw size={10} />,                          bg: 'var(--bg-3)',                color: 'var(--text-secondary)' },
    error:      { label: 'Retry',      icon: <RefreshCw size={10} />,                          bg: 'rgba(248,113,113,0.12)',      color: 'var(--danger)' },
  };
  const c = config[sceneStatus];

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${sceneStatus === 'error' ? 'rgba(248,113,113,0.25)' : sceneStatus === 'idle' ? 'transparent' : 'var(--border)'}`,
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        opacity: isDisabled ? 0.75 : 1,
        transition: 'opacity 150ms',
      }}
    >
      {c.icon}
      {c.label}
    </button>
  );
}



