
import { useEffect, useState } from 'react';


function GameSelection() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [guess, setGuess] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(1);
  const query = "Tragödie";
  const filter = "&per_page=50";

  useEffect(() => {
    fetch(`https://api.kulturpool.at/search/?q=${query}${filter}`)
      .then(response => response.json())
      .then(json => {
        setResults(json.hits || []);
        if (json.hits && json.hits.length > 0) {
          setSelected(json.hits[0]);
        }
      })
      .catch(error => console.error(error));
  }, []);

  const handleStart = () => {
    setGameStarted(true);
  };

  return (
    <div style={{ padding: 40 }}>
      {!gameStarted && (
        <>
          <div style={{ marginTop: 20 }}>
            {selected ? (
              <div style={{ border: '2px solid #333', padding: 16, background: '#000000' }}>
                <h3>First API Result (Selected):</h3>
                <div><b>Title:</b> {selected.document.title?.[0]}</div>
                <div><b>Creator:</b> {selected.document.creator}</div>
                <div><b>Created:</b> {selected.document.created}</div>
                <div><b>Provider:</b> {selected.document.dataProvider}</div>
                <div><b>ID:</b> {selected.document.id}</div>
                <div>
                  <a href={selected.document.isShownAt} target="_blank" rel="noopener noreferrer">
                    <img src={selected.document.previewImage} alt={selected.document.title?.[0] || "not loaded"} style={{ maxWidth: 200 }} />
                  </a>
                </div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
          <button style={{ marginTop: 32, fontSize: 20, padding: '12px 32px' }} onClick={handleStart}>
            Start Game
          </button>
        </>
      )}

      {gameStarted && (
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                style={{
                  fontSize: 20,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: selectedSlot === num ? '3px solid #1976d2' : '2px solid #000',
                  background: selectedSlot === num ? '#1976d2' : '#000',
                  color: selectedSlot === num ? '#fff' : '#ccc',
                  fontWeight: selectedSlot === num ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedSlot(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <div
              key={selectedSlot}
              style={{
                width: 1200,
                height: 600,
                border: '4px solid #1976d2',
                borderRadius: 18,
                background: '#e3f0ff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: '#222',
                fontWeight: 'bold',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ position: 'absolute', top: 16, left: 18, fontSize: 22, color: '#888', fontWeight: 'normal' }}>#{selectedSlot}</span>
              <span style={{ marginTop: 48 }}>{selectedSlot}</span>
            </div>
          </div>
          <input
            type="text"
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            style={{ fontSize: 20, padding: 8, width: 260, border: '2px solid #1976d2', borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}

export default GameSelection;