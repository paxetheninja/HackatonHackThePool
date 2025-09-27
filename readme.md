# Hack The Pool - Team Datentragödie. 
---

## Requierements:

- Node.js Version 22+ 

## Install Inctructions:

1. Clone this repo and open terminal
2. ```cd HTP-DT```
3. ```npm install```
4. ```npm run dev```
5. Open http://localhost:5173

If you want to make use of the LLM Summary function you will have to create a file called ".env" in HTP-DT and put your Openrouter API Key in there like this: ```VITE_OAI_KEY="api-key"```

---

## Bonus Info

You can test out our debug framework under http://localhost:5173/debug

DT-Server is a leftover from when we were still using local ML models, thus can safely be ignored. If you want to use it you'll have to install the following python packages:
- torch (cuda version)
- transformers
- FastAPI
- FastAPI[standard]
- Pydantic

### Thanks again for having us and shout outs to the other participants and their amazing projects. 
