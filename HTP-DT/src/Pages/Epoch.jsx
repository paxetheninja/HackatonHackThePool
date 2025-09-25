

import React, { useEffect, useState } from "react";
import { api } from "../API/API.jsx";
import epochData from "../Data/Epoch.json";





function Epoch() {
  const epochEntries = epochData;
  const [entry, setEntry] = useState(null); // {name, text, pictures, audio, persons}
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([null, null, null, null, null]); // 5 Tipp slots
  const [previewImage, setPreviewImage] = useState("");
  const [buttonStates, setButtonStates] = useState({});
  const [gameState, setGameState] = useState("running");
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // On mount or reset, pick a random entry and random categories
  useEffect(() => {
    const randomEntry = epochEntries[Math.floor(Math.random() * epochEntries.length)];
    setEntry(randomEntry);
    const allCategories = ["text", "pictures", "audio", "persons", "architecture"];
    const shuffled = allCategories.sort(() => 0.5 - Math.random());
    setSelectedCategories(shuffled.slice(0, 5));
    setSelectedSlot(1);
    setButtonStates({});
    setGameState("running");
    setAttempts(0);
    setPreviewImage("");
  }, []);

  // Fetch preview image for selected Tipp slot if category is 'pictures' or 'architecture'
  useEffect(() => {
    const fetchPreview = async () => {
      if (!entry) {
        setPreviewImage("");
        return;
      }
      const cat = selectedCategories[selectedSlot - 1];
      if ((cat === "pictures" || cat === "architecture") && entry[cat] && entry[cat].length > 0) {
        const arr = entry[cat];
        const slot = selectedSlot - 1;
        const idx = arr.length === 1 ? 0 : (slot % arr.length);
        const picString = arr[idx];
        try {
          const result = await api.searchStatic(picString);
          let preview = "";
          if (Array.isArray(result)) {
            if (result[0]?.document?.previewImage) {
              preview = result[0].document.previewImage;
            } else {
              preview = picString;
            }
          } else if (result?.document?.previewImage) {
            preview = result.document.previewImage;
          } else {
            preview = picString;
          }
          setPreviewImage(preview);
        } catch (e) {
          setPreviewImage("");
        }
      } else {
        setPreviewImage("");
      }
    };
    fetchPreview();
  }, [entry, selectedCategories, selectedSlot]);

  const handleEpochGuess = (guess) => {
    if (buttonStates[guess] || gameState !== "running" || !entry) return;
    if (guess === entry.name) {
      setGameState("won");
      setButtonStates(prev => {
        const newStates = {};
        epochEntries.forEach(e => {
          if (e.name === guess) {
            newStates[e.name] = "correct";
          } else if (prev[e.name] === "wrong") {
            newStates[e.name] = "wrong";
          } else {
            newStates[e.name] = "disabled";
          }
        });
        return newStates;
      });
    } else {
      if (attempts + 1 >= maxAttempts) {
        setGameState("lost");
        setButtonStates(prev => {
          const newStates = { ...prev, [guess]: "wrong" };
          epochEntries.forEach(e => {
            if (!newStates[e.name]) newStates[e.name] = "disabled";
          });
          return newStates;
        });
      } else {
        setButtonStates(prev => ({
          ...prev,
          [guess]: "wrong"
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
            fontSize: 32,
            color: '#222',
            fontWeight: 'bold',
            position: 'relative',
            transition: 'all 0.2s',
            margin: '0 auto',
          }}
        >
          <span style={{ position: 'absolute', top: 16, left: 18, fontSize: 22, color: '#888', fontWeight: 'normal' }}>#{selectedSlot}</span>
          {selectedCategories[selectedSlot-1] && (
            (selectedCategories[selectedSlot-1] === 'pictures' || selectedCategories[selectedSlot-1] === 'architecture') && previewImage ? (
              <img src={previewImage} alt={`Tipp ${selectedSlot}`} style={{ marginTop: 24, maxHeight: 250, maxWidth: '100%', borderRadius: 12 }} />
            ) : (
              <span style={{ marginTop: 24, fontSize: 36 }}>{selectedCategories[selectedSlot-1].charAt(0).toUpperCase() + selectedCategories[selectedSlot-1].slice(1)}</span>
            )
          )}
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
            key={ep.name}
            style={{
              fontSize: 20,
              width: 160,
              height: 48,
              borderRadius: 8,
              border: buttonStates[ep.name] === 'correct' ? '3px solid #2ecc40' : buttonStates[ep.name] === 'wrong' ? '3px solid #e53935' : buttonStates[ep.name] === 'disabled' ? '2px solid #888' : '2px solid #000',
              background: buttonStates[ep.name] === 'correct' ? '#2ecc40' : buttonStates[ep.name] === 'wrong' ? '#e53935' : buttonStates[ep.name] === 'disabled' ? '#888' : '#000',
              color: '#fff',
              fontWeight: buttonStates[ep.name] === 'correct' ? 'bold' : 'normal',
              transition: 'all 0.2s',
              cursor: buttonStates[ep.name] ? 'not-allowed' : 'pointer',
              opacity: buttonStates[ep.name] ? 0.7 : 1,
            }}
            onClick={() => handleEpochGuess(ep.name)}
            disabled={!!buttonStates[ep.name]}
          >
            {ep.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Epoch;
