   export function llmAnaylze(text) {

    const strippedText = text.substring(0, 20000);
    const out = "";

    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer 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',
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
    }).then(response => response.json()).then(text => out = text);

    return out;


/* Deprecated Backend Call

        fetch("http://127.0.0.1:8000/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({input: text})
        }).then(response => response.json()).then(data => setLllmText(data.output))
*/

  }