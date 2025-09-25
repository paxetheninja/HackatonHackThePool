export class Pool {



    constructor(query) {
        this.document = this.searchStatic(query);
    
        this.iiifManifest = this.fetchManifest(this.document.iiifManifest);
        this.iiifText = this.fetchIIFText(this.iiifManifest);
        this.gnd = this.fetchGND(this.document.fullViewMetadata);
    }

    async pic()
    {
        return this.document.previewImage;
    }

    async search(query,filter) {
        const response = await fetch("https://api.kulturpool.at/search/?q=" + query + filter);
        const json = await response.json();
        return json.hits;
    }

        async searchStatic(query) {
        const response = await fetch(query);
        const json = await response.json();
        return json.hits[0].document;
    }

    async fetchManifest(url) {

        const response = await fetch(url);
        const json = await response.json();
        return json.sequences?.[0]?.canvases;

    }

          async fetchIIFText(iiif) {
    
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
            

            return fullText;
          }

    async fetchGND(url) {

        const response = await fetch(url);
        const json = await response.json();
        return json.metadata.spatial.id;
    }


}

//export const pooler = new Pool();
