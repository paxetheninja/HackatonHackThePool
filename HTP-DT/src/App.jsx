import { useEffect, useState } from 'react'
import './App.css'

import LinePlot from './Plots/LinePlot'

function App() {

    const imgScale = 2;

    const _data = [10, 15, 20, 18, 25, 30, 28, 35, 40, 38];

    const [hits, setHits] = useState([])

    const query = "Tragödie"

    const filter = "&per_page=50"

    useEffect(() => {
      fetch("https://api.kulturpool.at/search/?q=" + query + filter )
        .then(response => response.json())
        .then(json => {setHits(json.hits)})
        .catch(error => console.error(error))
    }, [])


    console.log(hits)

  return (
    <>
      <img src="datatragedy.png" width={150*imgScale} height={100*imgScale}></img>
      <h1>Hack The Pool - Datentragödie</h1>

      <LinePlot data={_data}></LinePlot>

      <h1>Objects</h1>


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
        <li>{hit.document.id}</li>
        <li>{hit.document.dataProvider}</li>
      </ul> 
      </div>  
    ))}
    </div>
    </>
  )
}

export default App
