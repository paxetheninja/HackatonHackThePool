from openai import OpenAI

def gpt(text):

    prompt = f"""Tell me what the following text is about: {text}"""

    client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
    )

    completion = client.chat.completions.create(
    extra_headers={
        "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
    },
    model="openai/gpt-4o",
    messages=[
        {
        "role": "user",
        "content": prompt
        }
    ]
    )

    print(completion.choices[0].message.content)
