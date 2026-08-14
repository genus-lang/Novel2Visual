import { useState } from 'react';
import { useNovel } from '../hooks/useNovel';
import { useCharacters } from '../hooks/useCharacters';
import { Plus, Trash2, Edit2, UserPlus } from 'lucide-react';
import type { CharacterAppearance } from '@/types/character';

export default function Characters() {
  const { activeProjectId } = useNovel();
  const { characters, addCharacter, deleteCharacter } = useCharacters(activeProjectId);
  const [isAdding, setIsAdding] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const handleAdd = async () => {
    if (!newCharName.trim() || !newCharDesc.trim()) return;
    const appearance: CharacterAppearance = {}; // Can be expanded later
    await addCharacter(newCharName.trim(), appearance, newCharDesc.trim());
    setIsAdding(false);
    setNewCharName('');
    setNewCharDesc('');
  };

  if (!activeProjectId) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Please create or select a project first.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Character Bible</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isAdding ? 'Cancel' : <><Plus size={14} /> Add Character</>}
        </button>
      </div>

      {isAdding && (
        <div style={{ background: 'var(--bg-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>New Character</h3>
          <input
            type="text"
            placeholder="Character Name (e.g. Kael)"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}
          />
          <textarea
            placeholder="Visual description (e.g. A young man with black hair, wearing a red cloak...)"
            value={newCharDesc}
            onChange={(e) => setNewCharDesc(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              marginBottom: '12px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newCharName.trim() || !newCharDesc.trim()}
            style={{
              width: '100%',
              background: newCharName.trim() && newCharDesc.trim() ? 'var(--accent)' : 'var(--bg-3)',
              color: newCharName.trim() && newCharDesc.trim() ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              cursor: newCharName.trim() && newCharDesc.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600
            }}
          >
            Save Character
          </button>
        </div>
      )}

      {characters.length === 0 && !isAdding ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          <UserPlus size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '14px' }}>No characters added yet.</p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>Add characters to ensure visual consistency across your scenes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {characters.map((char) => (
            <div key={char.id} style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '16px' }}>{char.name}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => deleteCharacter(char.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {char.visualDescription}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
