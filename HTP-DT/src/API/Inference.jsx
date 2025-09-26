export class Inference {

   async summarize(text) {

    const strippedText = text.substring(0, 20000);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            content: `Kannst du mir in ein bis zwei Sätzen den inhalt des Folgenden Textes erklären ${strippedText}?`
          },
        ],
      }),
    })
    const json = await response.json()
    const summary = json.choices[0].message.content;
    return summary;
  }   

  async analyzeLocations(hits) {

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            content: `
            Kannst du bitte in folgendem JSON objekt für alle einzelnen objekte herausfinden woher diese kommen und mir das ergebnis in diesem Format ausgeben:     
            const dataEU = [
              { id: 276, rate: 5.4 },  // Germany
              { id: 250, rate: 7.1 },  // France
              { id: 380, rate: 8.5 },  // Italy
              { id: 724, rate: 12.3 }, // Spain
            ];

            Json objekt: ${hits}?`
          },
        ],
      }),
    }) 
    const json = await response.json()
    const result = json.choices[0].message.content;
    return result;



  }


}

export const inference = new Inference();