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
}

export const inference = new Inference();