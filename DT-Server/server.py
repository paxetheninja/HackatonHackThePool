from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import inference

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173" ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class llm_response(BaseModel):
        output: str

class llm_request(BaseModel):
     input: str


@app.get("/")
def read_root():
    return {"Hello": "Test"}


@app.post("/llm", response_model=llm_response)
def get_llm_response(request: llm_request):
    summary = inference.summarize(request.input)
    return {"output": summary}