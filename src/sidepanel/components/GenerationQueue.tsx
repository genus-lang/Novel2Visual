import { useEffect } from 'react';
import { Clock, Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { useGenerationStore } from '@/store/generationStore';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';
import { useScenes } from '../hooks/useScenes';

export default function GenerationQueue() {
  const store = useGenerationStore();
  const { updateScene } = useScenes();

  useEffect(() => {
    const cleanup = ChromeMessenger.onMessage((msg) => {
      if (msg.type === 'QUEUE_STATE_UPDATED') {
        store.syncState(msg.status, msg.queue, msg.currentSceneId);
      } else if (msg.type === 'SCENE_GENERATION_SUCCESS') {
        store.setSceneStatus(msg.sceneId, { status: 'done' });
        if (msg.imageUrl) {
          updateScene(msg.sceneId, { imageUrl: msg.imageUrl }).catch(console.error);
        }
      } else if (msg.type === 'SCENE_GENERATION_FAILED') {
        store.setSceneStatus(msg.sceneId, {
          status: 'error',
          error: msg.error ?? 'Unknown error',
        });
      }
      return undefined;
    });
    return cleanup;
  }, [updateScene]);

  const { queue, currentSceneId, sceneStatuses, status } = store;
  const doneCount   = Object.values(sceneStatuses).filter((s) => s.status === 'done').length;
  const errorCount  = Object.values(sceneStatuses).filter((s) => s.status === 'error').length;
  const totalTracked = Object.keys(sceneStatuses).length;
  const isRunning   = status === 'running';

  // Recently finished scenes (last 4)
  const finishedEntries = Object.entries(sceneStatuses)
    .filter(([id, s]) => (s.status === 'done' || s.status === 'error') && id !== currentSceneId)
    .slice(-4);

  const hasAnything = currentSceneId || queue.length > 0 || totalTracked > 0;

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-1)',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* -- Header row -- */}
      <div style={{
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: hasAnything ? '1px solid var(--border)' : 'none',
      }}>
        {/* Left: title + LIVE badge */}
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
          Queue
        </span>
        {isRunning && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            background: 'rgba(139,92,246,0.15)', color: 'var(--accent)',
            fontSize: '9px', fontWeight: 700, padding: '1px 6px',
            borderRadius: '20px', letterSpacing: '0.04em',
          }}>
            <Loader2 size={8} className="spin" /> LIVE
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: counters */}
        {doneCount > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <CheckCircle2 size={10} /> {doneCount}
          </span>
        )}
        {errorCount > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <XCircle size={10} /> {errorCount} failed
          </span>
        )}
        {queue.length > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
            {queue.length} pending
          </span>
        )}
      </div>

      {/* -- Progress bar -- */}
      {totalTracked > 0 && (
        <div style={{ height: '2px', background: 'var(--bg-3)', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            width: `${Math.round((doneCount / totalTracked) * 100)}%`,
            background: 'var(--accent)',
            transition: 'width 500ms ease',
          }} />
        </div>
      )}

      {/* -- Queue rows -- */}
      {hasAnything && (
        <div style={{
          maxHeight: '112px',
          overflowY: 'auto',
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}>
          {/* Currently generating */}
          {currentSceneId && (
            <QueueRow label={currentSceneId} state="generating" />
          )}

          {/* Pending */}
          {queue.map((item) => (
            <QueueRow key={item.sceneId} label={item.title || item.sceneId} state="queued" />
          ))}

          {/* Recent finished */}
          {finishedEntries.map(([id, s]) => (
            <QueueRow key={id} label={id} state={s.status as 'done' | 'error'} error={s.error} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasAnything && (
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
          <Zap size={11} color="var(--text-muted)" />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Click "Generate All" or "Generate" on a scene
          </span>
        </div>
      )}
    </div>
  );
}

function QueueRow({
  label,
  state,
  error,
}: {
  label: string;
  state: 'generating' | 'queued' | 'done' | 'error';
  error?: string;
}) {
  const cfg = {
    generating: { icon: <Loader2 size={10} className="spin" color="var(--accent)" />,    textColor: 'var(--accent)',          badge: 'GENERATING', badgeColor: 'var(--accent)',    bg: 'rgba(139,92,246,0.08)' },
    queued:     { icon: <Clock size={10} color="var(--text-muted)" />,                   textColor: 'var(--text-secondary)',  badge: 'QUEUED',     badgeColor: 'var(--text-muted)', bg: 'transparent' },
    done:       { icon: <CheckCircle2 size={10} color="var(--success)" />,               textColor: 'var(--text-muted)',     badge: 'STORED',       badgeColor: 'var(--success)',   bg: 'transparent' },
    error:      { icon: <XCircle size={10} color="var(--danger)" />,                     textColor: 'var(--danger)',         badge: 'FAILED',     badgeColor: 'var(--danger)',    bg: 'rgba(248,113,113,0.07)' },
  }[state];

  return (
    <div
      title={error ?? label}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 7px', borderRadius: '5px',
        background: cfg.bg,
      }}
    >
      {cfg.icon}
      <span style={{
        fontSize: '10px', color: cfg.textColor,
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: state === 'generating' ? 600 : 400,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '8px', fontWeight: 700, letterSpacing: '0.05em',
        color: cfg.badgeColor, flexShrink: 0,
      }}>
        {cfg.badge}
      </span>
      {error && (
        <span style={{
          fontSize: '9px', color: 'var(--danger)',
          background: 'rgba(248,113,113,0.12)',
          padding: '1px 5px', borderRadius: '3px',
          maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {error.slice(0, 30)}{error.length > 30 ? '…' : ''}
        </span>
      )}
    </div>
  );
}
