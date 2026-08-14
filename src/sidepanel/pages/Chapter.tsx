import { useState } from 'react';
import ChapterInput from '../components/ChapterInput';
import StyleSelector from '../components/StyleSelector';
import { Wand2 } from 'lucide-react';
import { useNovel } from '../hooks/useNovel';
import { useScenes } from '../hooks/useScenes';
import { useUiStore } from '@/store/uiStore';

export default function Chapter() {
  const [text, setText] = useState('');
  const [genre, setGenre] = useState('Auto Detect');
  const [visualStyle, setVisualStyle] = useState('Anime / Manhwa');
  const [scenesCount, setScenesCount] = useState('Auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { activeProjectId } = useNovel();
  const { analyzeChapter } = useScenes();
  const setPage = useUiStore((s) => s.setPage);

  const handleAnalyze = async () => {
    if (!text.trim() || !activeProjectId) return;
    setIsAnalyzing(true);
    try {
      // Pass 'All' as a special value to the filter, otherwise parse number
      const maxScenes = scenesCount === 'All' ? undefined : scenesCount === 'Auto' ? 15 : parseInt(scenesCount, 10);
      await analyzeChapter(text, activeProjectId, { maxScenes });
      setPage('scenes');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ChapterInput text={text} setText={setText} />
      
      <div style={{ height: '1px', background: 'var(--border)' }} />
      
      <StyleSelector 
        genre={genre} setGenre={setGenre}
        visualStyle={visualStyle} setVisualStyle={setVisualStyle}
        scenesCount={scenesCount} setScenesCount={setScenesCount}
      />

      <button 
        onClick={handleAnalyze}
        disabled={!text.trim() || isAnalyzing || !activeProjectId}
        style={{
          width: '100%',
          padding: '12px',
          background: text.trim() && !isAnalyzing ? 'var(--accent)' : 'var(--bg-3)',
          color: text.trim() && !isAnalyzing ? '#fff' : 'var(--text-muted)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          cursor: text.trim() && !isAnalyzing ? 'pointer' : 'not-allowed',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px',
          transition: 'background var(--transition)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
      >
        <Wand2 size={16} /> {isAnalyzing ? 'Analyzing...' : 'Analyze Chapter'}
      </button>
    </div>
  );
}
