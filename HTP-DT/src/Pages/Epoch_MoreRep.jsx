

import React, { use, useEffect, useState } from "react";
import WordCloud from "../Plots/WordCloud.jsx";
import { api } from "../API/API.jsx";
import epochData from "../Data/Epoch_MoreRep.json";
import { inference } from "../API/Inference.jsx";
import BarChart from "../Plots/BarChart.jsx";




function Epoch_MoreRep() {
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
  const [textSummary, setTextSummary] = useState("Loading ...");
  const [showEndScreen, setShowEndScreen] = useState(true);
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
    const categories = ["text", "pictures", "architecture", "barchart"];
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

  // Barchart effect: only run for barchart slot
  const [plotData, setPlotData] = useState([]);
  useEffect(() => {
    const fetchBarchartData = async () => {
      const slotObj = tippSlots[selectedSlot - 1];
      if (!slotObj || slotObj.category !== "barchart") return;
      let allHits = [];
      let page = 1;
      let perPage = 100;
      let keepGoing = true;
      while (keepGoing && page <= 30) { // limit to 10 pages for safety
        const hits = await api.search(slotObj.value, `&per_page=${perPage}&page=${page}`);
        if (Array.isArray(hits) && hits.length > 0) {
          allHits = allHits.concat(hits);
          if (hits.length < perPage) {
            keepGoing = false;
          } else {
            page++;
          }
        } else {
          keepGoing = false;
        }
      }
      if (!allHits || allHits.length === 0) return;
      let texts = 0;
      let pictures = 0;
      let videos = 0;
      let threeD = 0;
      allHits.forEach(hit => {
        if (hit.document.edmType === "TEXT") texts++;
        if (hit.document.edmType === "IMAGE") pictures++;
        if (hit.document.edmType === "VIDEO") videos++;
        if (hit.document.edmType === "3D") threeD++;
      });
      setPlotData([
        { letter: "Text", frequency: texts },
        { letter: "Bild", frequency: pictures },
        { letter: "Video", frequency: videos },
        { letter: "3D", frequency: threeD },
      ]);
    };
    fetchBarchartData();
  }, [entry, tippSlots, selectedSlot]);
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
    <div style={{ padding: 40, textAlign: 'center', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', height: '60vh', width: '60vw' }}>
      {(gameState === 'won' || gameState === 'lost') && showEndScreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30,32,34,0.98)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: 40, color: gameState === 'won' ? '#2ecc40' : '#e53935', marginBottom: 24, textShadow: '0 2px 8px #111' }}>
            {gameState === 'won' ? '🎉 Glückwunsch! Du hast die Epoche erraten!' : '❌ Leider verloren!'}
          </h2>
          <button
            style={{
              fontSize: 22,
              padding: '16px 40px',
              borderRadius: 10,
              background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              marginTop: 32,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #111'
            }}
            onClick={() => window.location.href = '/'}
          >
            Zurück zur Startseite
          </button>
          <button
            style={{
              fontSize: 18,
              padding: '12px 32px',
              borderRadius: 8,
              background: 'linear-gradient(90deg, #444 0%, #222 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              marginTop: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #111'
            }}
            onClick={() => setShowEndScreen(false)}
          >
            Tipps nochmal ansehen
          </button>
        </div>
      )}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        background: 'linear-gradient(90deg, #232526 0%, #414345 100%)',
        zIndex: 1100,
        boxShadow: '0 2px 12px #111',
        padding: '16px 0 8px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#fff',
      }}>
        <h2 style={{ margin: 0, color: '#ffffffff' }}>Rate die Epoche</h2>
        <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 4, color: '#ffffffff' }}>
          Versuch {attempts}/{maxAttempts}
        </div>
      </div>
  
  <div style={{ display: 'flex', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
        <div key={selectedSlot}>
          <span style={{ position: 'absolute', top: 16, left: 18, fontSize: 22, color: '#bbb', fontWeight: 'normal' }}>#{selectedSlot}</span>
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
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 24,
                    justifyContent: 'center',
                   
                    width: '100%',
                    maxWidth: '100%',
                    height: '100%',
                    maxHeight: '100%',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      minWidth: 120,
                      maxWidth: 300,
                      flex: '0 0 180px',
                    }}>
                      <img src={bookImg} alt="Buch" style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '100%' }} />
                      <div style={{
                        width: 250,
                        maxWidth: 180,
                        marginTop: 12,
                        fontSize: 16,
                        color: '#ccc',
                        textAlign: 'center',
                        overflow: 'auto',
                        wordBreak: 'break-word',
                        maxHeight: 200,
                      }}>{textSummary}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, maxWidth: 'calc(60vw - 220px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                      <WordCloud data={wordCountFiltered} width={340} height={350} />
                    </div>
                  </div>
                );
              } else {
                return <span style={{ marginTop: 24, fontSize: 36, color: '#bbb' }}>[Loading ...]</span>;
              }
            } else if (slotObj.category === 'barchart') {
              return <BarChart data={plotData}   width={100} height={400} />;
            } else {
              return <span style={{ marginTop: 24, fontSize: 36, color: '#fff' }}>{slotObj.category.charAt(0).toUpperCase() + slotObj.category.slice(1)}</span>;
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
          color: '#fff',
        }}
      >
  <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#fff' }}>Tipp:</div>
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
                  border: selectedSlot === num ? '3px solid #1976d2' : blocked ? '2px solid #444' : '2px solid #fff',
                  background: selectedSlot === num ? 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)' : blocked ? '#444' : 'rgba(255,255,255,0.08)',
                  color: selectedSlot === num ? '#fff' : blocked ? '#bbb' : '#fff',
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
        background: 'linear-gradient(90deg, #232526 0%, #414345 100%)',
        padding: '18px 0 18px 0',
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        boxShadow: '0 -2px 12px #111',
        zIndex: 1000
      }}>
        {epochEntries.map((ep, idx) => (
          <button
            key={ep.name}
            style={{
              fontSize: 12,
              width: 160,
              height: 48,
              borderRadius: 8,
              border: buttonStates[ep.name] === 'correct' ? '3px solid #2ecc40' : buttonStates[ep.name] === 'wrong' ? '3px solid #e53935' : buttonStates[ep.name] === 'disabled' ? '2px solid #444' : '2px solid #fff',
              background: buttonStates[ep.name] === 'correct' ? 'linear-gradient(90deg, #2ecc40 0%, #27ae60 100%)' : buttonStates[ep.name] === 'wrong' ? 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)' : buttonStates[ep.name] === 'disabled' ? '#444' : 'rgba(255,255,255,0.08)',
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

export default Epoch_MoreRep;
