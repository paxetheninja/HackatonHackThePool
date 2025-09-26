import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import WordCloud from './Plots/WordCloud';
import BarChart from './Plots/BarChart.jsx';


import { stopwordsDE } from './NLP/StopWords';
import { inference } from './API/Inference.jsx';


import GameStart from './Pages/GameStart.jsx';
import GameSelection from './Pages/GameSelection.jsx';
import Epoch from './Pages/Epoch.jsx';
import Epoch_MoreRep from './Pages/Epoch_MoreRep.jsx';

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

    const [llmText, setLllmText] = useState("");



    const [plotData, setPlotData]  = useState ([
  { letter: "Text", frequency: 100 },
  { letter: "Bild", frequency: 30 },
  { letter: "Video", frequency: 10 },
  { letter: "3D", frequency: 200 },
  ])
  //#endregion

    //#region Use Effects

    useEffect(() => {

      api.search(query, filter).then(setHits).catch(console.error);
      
    }, [query])

    useEffect(() => {
      if (!hits || hits.length === 0) return;

      let texts = 0;
      let pictures = 0;
      let videos = 0;
      let threeD = 0;


      hits.forEach(hit => {
        if (hit.document.edmType === "TEXT") texts++;
        if (hit.document.edmType === "IMAGE") pictures++;
        if (hit.document.edmType === "VIDEO") videos++;
        if (hit.document.edmType === "3D") threeD++;
      });

      console.log(texts);
      console.log(pictures);
      console.log(videos);
      console.log(threeD);

      setPlotData([
        { letter: "Text", frequency: texts },
        { letter: "Bild", frequency: pictures },
        { letter: "Video", frequency: videos },
        { letter: "3D", frequency: threeD },
      ]);
    }, [hits]);

    //#endregion


    //#region Functions

    function llmAnaylzer(text) {

    //  setLllmText(llmAnaylze(text));
    const strippedText = text.substring(0, 20000);
    setLllmText(inference.summarize(strippedText))

      
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


      <BarChart data={plotData} />

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
      <img src="datatragedy.png" alt="Logo" width={300} height={200} style={{ marginBottom: 16 }} />
      <h2>Game Selection</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
        <Link to="/epoch" style={{ width: 260 }}>
          <button style={{ width: '100%', height: 56, fontSize: 14 }}>Rate die Epoche</button>
        </Link>
        <Link to="/epoch_morerep" style={{ width: 260 }}>
          <button style={{ width: '100%', height: 56, fontSize: 14 }}>Rate die Epoche mit Metadaten</button>
        </Link>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
         
        <Route path="/" element={<AppContentGame/>}/>
        <Route path="/debug" element={<AppContent/>}/>
        <Route path="/gameselection" element={<GameSelection />} />
        <Route path="/gamestart" element={<GameStart />} />
        <Route path="/epoch" element={<Epoch />} />
        <Route path="/epoch_morerep" element={<Epoch_MoreRep />} />
      </Routes>
    </Router>
  );
}

export default App
