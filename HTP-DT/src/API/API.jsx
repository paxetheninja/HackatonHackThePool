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

    async fetchGND(url) {

        const response = await fetch(url);
        const json = await response.json();
        return json.metadata.spatial.id;
    }

}


export const api = new API();
