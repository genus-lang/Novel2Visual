import { FileText } from 'lucide-react';

interface ChapterInputProps {
  text: string;
  setText: (t: string) => void;
}

export default function ChapterInput({ text, setText }: ChapterInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
        <FileText size={16} color="var(--accent)" />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Chapter Text</span>
      </div>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your chapter here..."
        style={{
          width: '100%',
          height: '180px',
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: '1.5',
          transition: 'border var(--transition)'
        }}
        onFocus={(e) => e.target.style.border = '1px solid var(--border-accent)'}
        onBlur={(e) => e.target.style.border = '1px solid var(--border)'}
      />
    </div>
  );
}
