import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import WordCloud from './Plots/WordCloud';

import { stopwordsDE } from './NLP/StopWords';


import GameStart from './Pages/GameStart.jsx';
import GameSelection from './Pages/GameSelection.jsx';
import Epoch from './Pages/Epoch.jsx';

import { api } from './API/API.jsx';

function AppContent() {

  //#region Declarations
    const imgScale = 2;

    const [hits, setHits] = useState([]);
    const [query, setQuery] = useState("Tragödie");
    const filter = "&per_page=50"

    const [iiif, setIIIf] = useState([]);
    const [wordCountFiltered, setWordCountFiltered] = useState([])

    const [llmText, setLllmText] = useState("")

  //#endregion





    //#region Use Effects

    useEffect(() => {

      api.search(query, filter).then(setHits).catch(console.error);

    }, [query])

    useEffect(() => {

      async function fetchIIFText() {

        if(!iiif.length) return;

        const texts = iiif.map(canvas => {
        const fullTextURL = canvas.otherContent[0]?.resources[0]?.resource["@id"];
        if(!fullTextURL) return Promise.resolve("");
        return fetch (fullTextURL)
          .then(response => response.text())
          .catch(error => {console.error("Fetch failed for: ", fullTextURL, error)});
        });

        const allTexts = await Promise.all(texts);

        const fullText = allTexts.join("");
        console.log(fullText);

        llmAnaylze(fullText);

        let words = fullText.toLowerCase().split(/\W+/).filter(Boolean).filter(word => !stopwordsDE.has(word));
        words = words.filter(words => words.length > 3 && isNaN(words));

        const wordCounts = {};
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        setWordCountFiltered(Array.from(Object.entries(wordCounts)).filter(([word, count]) => count > 5)); 
      }

      fetchIIFText();

    },[iiif])

    //#endregion


    //#region Functions

    function llmAnaylze(text) {

    //  console.log(text)

       // const strippedText = text.substring(80, 2000);

        fetch("http://127.0.0.1:8000/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({input: text})
        }).then(response => response.json()).then(data => setLllmText(data.output))


    }

    function fetchIIIF(url) {
      api.fetchManifest(url).then(setIIIf).catch(console.error);
   }

        function queryInput(input) {
      setQuery(input.target.value);
    }

    //#endregion

    console.log(hits)

  return (
    <>

      <img src="datatragedy.png" width={150*imgScale} height={100*imgScale}></img>
      <h1>Hack The Pool - Datentragödie</h1>


        {wordCountFiltered && Object.keys(wordCountFiltered).length > 0 && (
         <WordCloud data={wordCountFiltered} width={800} height={500} />
        )}  

        <p className='llmTExt'>{llmText}</p>
        

        <Link to="/gamestart">
          <button style={{ marginBottom: 20 }}>Go to GameStart</button>
        </Link>


      <h1>Objects</h1>

    <input className='queryInput' value={query} onChange={queryInput}></input>

    <div className='responseGrid'>
      {hits.map((hit, index) => (
      <div className='responseHolder' key={hit.document.id || index}>
      <ul>
        <a href={hit.document.isShownAt}>
        <img 
        src={hit.document.previewImage} 
        alt={hit.document.title?.[0] || "not loaded"} 
        />
        </a>
        <li>{hit.document.title?.[0]}</li>
        <li>{hit.document.creator}</li>
        <li>{hit.document.created}</li>

        <li>-----</li>
        <li>{hit.document.dataProvider}</li>
        <li>{hit.document.id}</li>
        <li>
          <button onClick={() => fetchIIIF(hit.document.iiifManifest)}>Show Wordcloud</button>
          <button onClick={() => llmAnaylze(hit.document.title[0])}>Get Summary</button>
        </li>
      </ul> 
      </div>  
    ))}
    </div>
    </>
  )
}

function AppContentGame() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>Game Selection</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/epoch"><button>Rate die Epoche</button></Link>
        <button>Rate den Ort</button>
        <button>Rate die Person</button>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContentGame />} /> 
        <Route path="/gameselection" element={<GameSelection />} />
        <Route path="/gamestart" element={<GameStart />} />
        <Route path="/epoch" element={<Epoch />} />
      </Routes>
    </Router>
  );
}

export default App
