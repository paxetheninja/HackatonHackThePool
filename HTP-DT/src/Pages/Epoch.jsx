

import React, { useEffect, useState } from "react";
import WordCloud from "../Plots/WordCloud.jsx";
import { api } from "../API/API.jsx";
import epochData from "../Data/Epoch.json";
import { inference } from "../API/Inference.jsx";





function Epoch() {
  const epochEntries = epochData;
  const [entry, setEntry] = useState(null); // {name, text, pictures, audio, persons}
  const [selectedSlot, setSelectedSlot] = useState(1);
  // Tipp slots: array of { category, value }
  const [tippSlots, setTippSlots] = useState([null, null, null, null, null]);
  const [previewImage, setPreviewImage] = useState("");
  const [buttonStates, setButtonStates] = useState({});
  const [gameState, setGameState] = useState("running");
  const [attempts, setAttempts] = useState(0);
  const [wordCountFiltered, setWordCountFiltered] = useState(null);
  const [textSummary, setTextSummary] = useState("Summary");
  // Fetch processed text for 'text' Tipp slot
  useEffect(() => {
    const fetchProcessedText = async () => {
      const slotObj = tippSlots[selectedSlot - 1];
      if (slotObj && slotObj.category === "text" && entry) {
        try {
          const result = await api.searchStatic(slotObj.value);
          api.getProcessedFullText(result[0].document.iiifManifest).then(setWordCountFiltered).catch(console.error);
          const fullTextRaw = await api.getRawText(result[0].document.iiifManifest);
          inference.summarize(fullTextRaw).then(setTextSummary).catch(console.error);
        } catch (e) {
          setWordCountFiltered(null);
        }
      } else {
        setWordCountFiltered(null);
      }
    };
    fetchProcessedText();
  }, [entry, tippSlots, selectedSlot]);
  const maxAttempts = 5;

  // On mount or reset, pick a random entry and random categories
  useEffect(() => {
    const randomEntry = epochEntries[Math.floor(Math.random() * epochEntries.length)];
    setEntry(randomEntry);
    // Build Tipp slots: randomly pick 5 (category, value) pairs from entry's available data
    const categories = ["text", "pictures", "architecture"];
    let slotOptions = [];
    categories.forEach(cat => {
      if (randomEntry[cat] && Array.isArray(randomEntry[cat])) {
        randomEntry[cat].forEach(val => {
          slotOptions.push({ category: cat, value: val });
        });
      }
    });
    // Shuffle and pick 5
    slotOptions = slotOptions.sort(() => 0.5 - Math.random());
    setTippSlots(slotOptions.slice(0, 5));
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
      const slotObj = tippSlots[selectedSlot - 1];
      if (slotObj && (slotObj.category === "pictures" || slotObj.category === "architecture" || slotObj.category === "text" )) {
        try {
          const result = await api.searchStatic(slotObj.value);
          let preview = "";
          if (Array.isArray(result)) {
            if (result[0]?.document?.previewImage) {
              preview = result[0].document.previewImage;
            } else {
              preview = slotObj.value;
            }
          } else if (result?.document?.previewImage) {
            preview = result.document.previewImage;
          } else {
            preview = slotObj.value;
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
  }, [entry, tippSlots, selectedSlot]);

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
        <div key={selectedSlot}>
          <span style={{ position: 'absolute', top: 16, left: 18, fontSize: 22, color: '#888', fontWeight: 'normal' }}>#{selectedSlot}</span>
          {(() => {
            const slotObj = tippSlots[selectedSlot-1];
            if (!slotObj) return null;
            if ((slotObj.category === 'pictures' || slotObj.category === 'architecture') && previewImage) {
              return <img src={previewImage} alt={`Tipp ${selectedSlot}`} style={{ marginTop: 24, maxHeight: 250, maxWidth: '100%', borderRadius: 12 }} />;
            } else if (slotObj.category === 'text') {
              if (wordCountFiltered && Object.keys(wordCountFiltered).length > 0) {
                // Try to get a preview image for the book (use previewImage if available, fallback to placeholder)
                const bookImg = previewImage;
                return (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32, justifyContent: 'center', marginTop: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
                      <img src={bookImg} alt="Buch" style={{ width: 120, height: 180, objectFit: 'cover', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                      <div style={{width: 450, marginTop: 12, fontSize: 18, color: '#444', textAlign: 'center' }}>{textSummary}</div>
                    </div>
                    <WordCloud data={wordCountFiltered} width={600} height={400} />
                  </div>
                );
              } else {
                return <span style={{ marginTop: 24, fontSize: 36, color: '#888' }}>[Loading ...]</span>;
              }
            } else {
              return <span style={{ marginTop: 24, fontSize: 36 }}>{slotObj.category.charAt(0).toUpperCase() + slotObj.category.slice(1)}</span>;
            }
          })()}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Tipp:</div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(num => {
            // Unlock all tips if gameState is 'won'
            const blocked = gameState === 'won' ? false : num > (attempts + 1);
            return (
              <button
                key={num}
                style={{
                  fontSize: 20,
                  width: 120,
                  height: 48,
                  borderRadius: 8,
                  border: selectedSlot === num ? '3px solid #1976d2' : blocked ? '2px solid #888' : '2px solid #000',
                  background: selectedSlot === num ? '#1976d2' : blocked ? '#888' : '#000',
                  color: selectedSlot === num ? '#fff' : blocked ? '#bbb' : '#ccc',
                  fontWeight: selectedSlot === num ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  cursor: blocked ? 'not-allowed' : 'pointer',
                  opacity: blocked ? 0.5 : 1,
                }}
                onClick={() => !blocked && setSelectedSlot(num)}
                disabled={blocked}
              >
                {num}
              </button>
            );
          })}
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
