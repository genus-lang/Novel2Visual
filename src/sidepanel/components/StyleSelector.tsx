import { Palette, Sparkles, Filter } from 'lucide-react';

interface StyleSelectorProps {
  genre: string;
  setGenre: (g: string) => void;
  visualStyle: string;
  setVisualStyle: (s: string) => void;
  scenesCount: string;
  setScenesCount: (c: string) => void;
}

export default function StyleSelector({ genre, setGenre, visualStyle, setVisualStyle, scenesCount, setScenesCount }: StyleSelectorProps) {
  const genres = ['Auto Detect', 'Fantasy', 'Cultivation', 'Sci-Fi', 'Romance', 'Horror', 'LitRPG', 'Martial Arts'];
  const styles = ['Anime / Manhwa', 'Realistic CGI', 'Watercolor', 'Comic Book', 'Ink & Wash', 'Cinematic Concept Art'];
  const sceneOptions = ['Auto', '10', '15', '20', 'All'];

  return (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
          <Sparkles size={14} color="var(--accent)" />
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Genre</label>
        </div>
        <select 
          value={genre} 
          onChange={(e) => setGenre(e.target.value)}
          style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
            cursor: 'pointer'
          }}
        >
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
          <Palette size={14} color="var(--accent)" />
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Visual Style</label>
        </div>
        <select 
          value={visualStyle} 
          onChange={(e) => setVisualStyle(e.target.value)}
          style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
            cursor: 'pointer'
          }}
        >
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
          <Filter size={14} color="var(--accent)" />
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Scenes</label>
        </div>
        <select 
          value={scenesCount} 
          onChange={(e) => setScenesCount(e.target.value)}
          style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
            cursor: 'pointer'
          }}
        >
          {sceneOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}
