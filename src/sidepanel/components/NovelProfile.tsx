import { Book } from 'lucide-react';

interface NovelProfileProps {
  title: string;
  setTitle: (t: string) => void;
}

export default function NovelProfile({ title, setTitle }: NovelProfileProps) {
  return (
    <div style={{ padding: '16px', background: 'var(--bg-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Book size={18} color="var(--accent)" />
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Novel Profile</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Novel Name</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Shadow Slave"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
            transition: 'border var(--transition)'
          }}
          onFocus={(e) => e.target.style.border = '1px solid var(--border-accent)'}
          onBlur={(e) => e.target.style.border = '1px solid var(--border)'}
        />
      </div>
    </div>
  );
}
