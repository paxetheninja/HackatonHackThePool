import { stopwordsDE } from "../NLP/StopWords";

export class API {

    
    async search(query,filter) {
        const response = await fetch("https://api.kulturpool.at/search/?q=" + query + filter);
        const json = await response.json();
        return json.hits;
    }

    async searchStatic(query) {
        const response = await fetch(query);
        const json = await response.json();
        return json.hits;
    }

    async fetchManifest(url) {

        const response = await fetch(url);
        const json = await response.json();
        return json.sequences?.[0]?.canvases;

    }


    async getProcessedFullText(url) {

        const response = await fetch(url);
        const json = await response.json();
        const iiif = json.sequences?.[0]?.canvases;


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


        let words = fullText.toLowerCase().split(/\W+/).filter(Boolean).filter(word => !stopwordsDE.has(word));
        words = words.filter(words => words.length > 3 && isNaN(words));

        const wordCounts = {};
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        return Array.from(Object.entries(wordCounts)).filter(([word, count]) => count > 5); 

    }

    async fetchGND(url) {

        const response = await fetch(url);
        const json = await response.json();
        return json.metadata.spatial.id;
    }

}

export const api = new API();
