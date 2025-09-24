import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


def summarize(text):


    tokenizer = AutoTokenizer.from_pretrained("tiiuae/falcon-7b-instruct")
    model = AutoModelForCausalLM.from_pretrained(
        "tiiuae/falcon-7b-instruct",
        dtype=torch.bfloat16,
        device_map="auto",
        attn_implementation="sdpa",
    )

    #prompt = f"""Tell me what the following text is about: {text}"""

    prompt = f"Can you tell me about {text}?"

    input_ids = tokenizer(prompt , return_tensors="pt").to(model.device)

    output = model.generate(
        **input_ids,
        max_new_tokens=200,
        eos_token_id=tokenizer.eos_token_id,
        do_sample=True,
        temperature=0.7,
    )

    generated_ids = output[0][len(input_ids["input_ids"][0]):]

    print(tokenizer.decode(output[0], skip_special_tokens=True))

    return tokenizer.decode(generated_ids, skip_special_tokens=True)

    