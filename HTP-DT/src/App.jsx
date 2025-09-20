import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LinePlot from './Plots/LinePlot'

import WordCloud from './Plots/WordCloud';

import { stopwordsDE } from './NLP/StopWords';

import GameStart from './Pages/GameStart.jsx';
import GameSelection from './Pages/GameSelection.jsx';

function AppContent() {

    const imgScale = 2;

    const [hits, setHits] = useState([]);
    const [query, setQuery] = useState("Tragödie");
    const filter = "&per_page=50"

    const [iiif, setIIIf] = useState([]);
    const [wordCountFiltered, setWordCountFiltered] = useState([])

    function queryInput(input) {
      setQuery(input.target.value);
    }

    useEffect(() => {
      fetch("https://api.kulturpool.at/search/?q=" + query + filter )
        .then(response => response.json())
        .then(json => {
          setHits(json.hits);
        })
        .catch(error => console.error(error))
    }, [query])

    useEffect(() => {

      async function fetchIIFText() {

        if(!iiif.length) return;

        const texts = iiif.map(canvas => {
        const fullTextURL = canvas.otherContent[0]?.resources[0]?.resource["@id"];
        if(!fullTextURL) return Promise.resolve("");
        return fetch (fullTextURL).then(response => response.text()).catch(error => {console.error("Fetch failed for: ", fullTextURL, error)});
        });

        const allTexts = await Promise.all(texts)

        const fullText = allTexts.join("")
     //   console.log(fullText);

        let words = fullText.toLowerCase().split(/\W+/).filter(Boolean).filter(word => !stopwordsDE.has(word));
        words = words.filter(words => words.length > 3 && isNaN(words));


        const wordCounts = {};
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

       // console.log("Word Counts: ", wordCounts);


        setWordCountFiltered(Array.from(Object.entries(wordCounts)).filter(([word, count]) => count > 5));

        
      }

      fetchIIFText();





    },[iiif])

    function fetchIIIF(url) {
      fetch(url)
        .then(response => response.json())
        .then(json => {
          const canvases = json.sequences?.[0]?.canvases; 
          const fullText = canvases;
        //  console.log("FULL TEXT: " + fullText)
          setIIIf(canvases);

        })
        .catch(error => console.error(error))

    }





    console.log(hits)

  return (
    <>

      <img src="datatragedy.png" width={150*imgScale} height={100*imgScale}></img>
      <h1>Hack The Pool - Datentragödie</h1>
        <Link to="/gamestart">
          <button style={{ marginBottom: 20 }}>Go to GameStart</button>
        </Link>

        {wordCountFiltered && Object.keys(wordCountFiltered).length > 0 && (
         <WordCloud data={wordCountFiltered} width={800} height={500} />
        )}  


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
        </li>
      </ul> 
      </div>  
    ))}
    </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} /> 
        <Route path="/gameselection" element={<GameSelection />} />
        <Route path="/gamestart" element={<GameStart />} />
      </Routes>
    </Router>
  );
}

export default App
