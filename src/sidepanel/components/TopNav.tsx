import { Settings, Sparkles } from 'lucide-react';
import { useNovel } from '../hooks/useNovel';
import { useAiProvider } from '../hooks/useAiProvider';

export default function TopNav() {
  const { activeProject } = useNovel();
  const { 
    activeProvider, setActiveProvider, 
    geminiConnected, chatgptConnected, 
    findAndConnectGemini, findAndConnectChatgpt 
  } = useAiProvider();

  const isConnected = activeProvider === 'gemini' ? geminiConnected : chatgptConnected;
  const connectFn = activeProvider === 'gemini' ? findAndConnectGemini : findAndConnectChatgpt;
  
  return (
    <div style={{
      height: '48px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
          <Sparkles size={16} color="var(--accent)" />
          Novel2Visual
        </div>
        
        {activeProject && (
          <>
            <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeProject.profile.name}
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={activeProvider}
            onChange={(e) => setActiveProvider(e.target.value as 'gemini' | 'chatgpt')}
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="gemini">Gemini</option>
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>

        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--success)', fontWeight: 500 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            {activeProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} Connected
          </div>
        ) : (
          <button 
            onClick={() => connectFn()}
            style={{ 
              background: 'transparent', border: '1px solid var(--border)', 
              color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', 
              fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' 
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)' }} />
            Connect {activeProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}
          </button>
        )}
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
