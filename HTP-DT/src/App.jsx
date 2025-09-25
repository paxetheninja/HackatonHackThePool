import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import WordCloud from './Plots/WordCloud';

import { stopwordsDE } from './NLP/StopWords';
import { inference } from './API/Inference.jsx';


import GameStart from './Pages/GameStart.jsx';
import GameSelection from './Pages/GameSelection.jsx';
import Epoch from './Pages/Epoch.jsx';

import { api } from './API/API.jsx';
import { Pool } from './API/Pool.jsx';

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
      console.log(query,filter)

    }, [query])



    //#endregion


    //#region Functions

    function llmAnaylzer(text) {

    //  setLllmText(llmAnaylze(text));
    const strippedText = text.substring(0, 20000);
    setLllmText(inference.summarize(strippedText))

/*
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: `Kannst du mir in ein bis zwei Sätzen den inhalt bzw das Fazit von zwei der im Folgenden Werk vorkommenden Geschichten sagen ${strippedText}?`
          },
        ],
      }),
    }).then(response => response.json()).then(text => setLllmText(text.choices[0].message.content) );

*/



/* Deprecated Backend Call

        fetch("http://127.0.0.1:8000/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({input: text})
        }).then(response => response.json()).then(data => setLllmText(data.output))
*/

  }

    function fetchIIIF(url) {
      api.getProcessedFullText(url).then(setWordCountFiltered).catch(console.error);
     // api.fetchManifest(url).then(setIIIf).catch(console.error);
   }

        function queryInput(input) {
      setQuery(input.target.value);
    }

    //#endregion

    console.log(hits)



    function testPooler() {
      
      const p = new Pool("https://api.kulturpool.at/search/?q=Trag%C3%B6die");

      console.log(p.hits)

    }

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
          <button onClick={() => llmAnaylzer(hit.document.title[0])}>Get Summary</button>
          <button onClick={() => testPooler(hit.document.title[0])}>Test Pooler</button>
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
        <Route path="/" element={<AppContent/>} /> 
        <Route path="/gameselection" element={<GameSelection />} />
        <Route path="/gamestart" element={<GameStart />} />
        <Route path="/epoch" element={<Epoch />} />
      </Routes>
    </Router>
  );
}

export default App
