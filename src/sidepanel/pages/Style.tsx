export default function Style() {
  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)' }}>
      <span style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🎨</span>
      <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Visual Style</h2>
      <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '14px' }}>
        Visual style selection is currently managed on the Overview page. 
        Advanced visual language configuration is coming soon.
      </p>
    </div>
  );
}
