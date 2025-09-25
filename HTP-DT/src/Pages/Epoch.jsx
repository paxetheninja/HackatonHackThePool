

import React, { useEffect, useState } from "react";

function Epoch() {
  const [entry, setEntry] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [epochEntries, setEpochEntries] = useState([]);
  const [buttonStates, setButtonStates] = useState({}); // {entry: 'default'|'correct'|'wrong'|'disabled'}
  const [attempts, setAttempts] = useState(0);
  const [gameState, setGameState] = useState("running"); // 'running' | 'Won' | 'Lost'
  const maxAttempts = 3;

  useEffect(() => {
    fetch("/src/Data/Epoch.csv")
      .then((res) => res.text())
      .then((text) => {
        // Split by semicolon and filter out empty entries
        const entries = text.split(';').map(e => e.trim()).filter(Boolean);
        setEpochEntries(entries);
        if (entries.length > 0) {
          const random = entries[Math.floor(Math.random() * entries.length)];
          setEntry(random);
        }
      });
  }, []);

  const handleEpochGuess = (guess) => {
    if (buttonStates[guess] || gameState !== "running") return; // already pressed or game over
    if (guess === entry) {
      setGameState("Won");
      setButtonStates(prev => {
        const newStates = {};
        epochEntries.forEach(e => {
          if (prev[e] === 'wrong') {
            newStates[e] = 'wrong';
          } else if (e === guess) {
            newStates[e] = 'correct';
          } else {
            newStates[e] = 'disabled';
          }
        });
        return newStates;
      });
    } else {
      if (attempts + 1 >= maxAttempts) {
        setGameState("Lost");
        setButtonStates(prev => {
          const newStates = { ...prev, [guess]: 'wrong' };
          epochEntries.forEach(e => {
            if (!newStates[e]) newStates[e] = 'disabled';
          });
          return newStates;
        });
      } else {
        setButtonStates(prev => ({
          ...prev,
          [guess]: 'wrong'
        }));
      }
      setAttempts(a => a + 1);
    }
  };

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        zIndex: 1100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '16px 0 8px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#000',
      }}>
        <h2 style={{ margin: 0, color: '#000' }}>Rate die Epoche</h2>
        <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 4, color: '#000' }}>
          Versuch {attempts}/{maxAttempts}
        </div>
      </div>
      <div style={{ height: 90 }} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
        <div
          key={selectedSlot}
          style={{
            width: 800,
            height: 300,
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
            margin: '0 auto',
          }}
        >
          <span style={{ position: 'absolute', top: 16, left: 18, fontSize: 22, color: '#888', fontWeight: 'normal' }}>#{selectedSlot}</span>
          <span style={{ marginTop: 48 }}>{entry}</span>
        </div>
      </div>
      <div style={{ margin: '24px 0 0 0', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Tipp:</div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              style={{
                fontSize: 20,
                width: 120,
                height: 48,
                borderRadius: 8,
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
      </div>

      {/* Epoch entry buttons fixed to bottom */}
      <div style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: '18px 0 18px 0',
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        zIndex: 1000
      }}>
        {epochEntries.map((ep, idx) => (
          <button
            key={ep}
            style={{
              fontSize: 20,
              width: 160,
              height: 48,
              borderRadius: 8,
              border: buttonStates[ep] === 'correct' ? '3px solid #2ecc40' : buttonStates[ep] === 'wrong' ? '3px solid #e53935' : buttonStates[ep] === 'disabled' ? '2px solid #888' : '2px solid #000',
              background: buttonStates[ep] === 'correct' ? '#2ecc40' : buttonStates[ep] === 'wrong' ? '#e53935' : buttonStates[ep] === 'disabled' ? '#888' : '#000',
              color: '#fff',
              fontWeight: buttonStates[ep] === 'correct' ? 'bold' : 'normal',
              transition: 'all 0.2s',
              cursor: buttonStates[ep] ? 'not-allowed' : 'pointer',
              opacity: buttonStates[ep] ? 0.7 : 1,
            }}
            onClick={() => handleEpochGuess(ep)}
            disabled={!!buttonStates[ep]}
          >
            {ep}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Epoch;
