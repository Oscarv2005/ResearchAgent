# Research Agent — AI Investment Research Agent

This is my submission for the InsideIIM × Altuni AI Labs take-home: an AI agent that takes a company name, does some research on it, and tells you whether it would INVEST or PASS — and why.

**Live demo:** https://research-agent-ai-invest.vercel.app/

---

## Overview

The idea is simple: type in a company name, hit go, and the agent does two things in sequence — it researches the company, then analyzes what it found and gives a verdict (INVEST or PASS) along with its reasoning. Under the hood it's a small two-step LangGraph pipeline sitting behind an Express API, with a React frontend that shows the result as a readable report.

I kept the actual "thinking" part deliberately simple — two LLM calls, one after the other — and spent the rest of my time making the experience around it feel like a real product: a homepage with a live-ish stock ticker, an activity feed that tracks queries you've run this session, and a dashboard that renders the final report nicely.

**What it's actually built with:**
- **Frontend:** React 19 + Vite (I went with plain React/Vite instead of Next.js — more on that below)
- **Backend:** Node.js + Express
- **Agent orchestration:** LangGraph.js — a 2-node `StateGraph`
- **LLM:** Google's Gemini (`gemini-2.5-flash`), called directly through the `@google/generative-ai` SDK
- **One fun extra:** the live ticker on the homepage hits the Anthropic API directly from the browser with web search turned on, just to pull semi-live stock prices for flavor

---

## How to Run It

You'll need:
- Node 18+
- A Gemini API key from Google AI Studio (https://aistudio.google.com/app/apikey)
- Optionally, an Anthropic API key if you want the homepage ticker to actually fetch live prices instead of falling back to static ones

```bash
git clone https://github.com/Oscarv2005/ResearchAgent.git
cd ResearchAgent

cd backend && npm install
cd ../frontend && npm install
```

Then set up your env files.

**`backend/.env`**
```env
GOOGLE_API_KEY=your_google_gemini_api_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3000
```

And run both:
```bash
# backend
cd backend
npm run start   # or npx nodemon server.js if you want auto-reload

# frontend, in a second terminal
cd frontend
npm run dev
```

Go to `http://localhost:5173`, click into **Agent**, type something like `Tesla` or `Infosys`, hit **Execute Analysis**, and you'll land on the Dashboard with the generated report.

One honest caveat: in the deployed version, the homepage ticker calls Anthropic's API straight from the browser. That's fine for a demo, but it's not how I'd ship it for real — see the trade-offs section below.

---

## How It Works

Here's roughly what happens end to end:

```
React (Vite)              Express API              LangGraph (Gemini 2.5 Flash)
─────────────              ───────────              ──────────────────────────
Agent page ──POST /api/research──▶ server.js ──▶ researchGraph.js
                                                    research ──▶ analyze
Dashboard ◀── { company, analysis } ◀──────────────┘
```

`backend/researchGraph.js` is where the actual agent lives. It's a LangGraph `StateGraph` with three bits of state — `company`, `searchData`, and `report` — and two nodes:

- **research** asks Gemini something like "research this company, give me key financial and business data"
- **analyze** takes that output and asks Gemini to decide INVEST or PASS, with reasons

The graph is wired `start → research → analyze → end` and gets compiled once when the server boots up.

`backend/server.js` is intentionally tiny — one route, `POST /api/research`, that invokes the graph and hands back `{ company, analysis }`.

On the frontend, `Agent.jsx` is the query screen — you type a company, it posts to the backend, and while it's waiting it shows a little "Research Node → Analyze Node" status indicator so it feels like something is actually happening (because it is). Once the response comes back, `Dashboard.jsx` renders the Markdown report with `react-markdown` alongside some run metadata. `App.jsx` is the shell — homepage, ticker, the query counter, and simple view-switching between Home/Agent/Dashboard (no router library, just state).

**Why only two nodes?** The brief asks for LangChain.js/LangGraph.js, so I wanted to actually show I understand the framework rather than bolt it on superficially. A two-node linear graph is the smallest honest demonstration of `StateGraph` — and I deliberately left it modular enough that you could drop in more nodes later (risk scoring, sentiment, a valuation step) without touching the API contract, which always just returns `{ company, analysis }`.

---

## Key Decisions & Trade-offs

I made a bunch of calls here that weren't spelled out in the brief, so I'm being upfront about them rather than pretending they were the "perfect" choice:

**Gemini, called directly instead of through LangChain's model wrapper.** Honestly, it was just faster to get working. LangChain is doing real work for the graph structure (`StateGraph`), but I'm not using its model-abstraction layer, so swapping providers later would mean touching `researchGraph.js` directly rather than just changing a config line.

**The research step relies entirely on what the LLM already knows — there's no live web search or financial data API in the loop.** This is the trade-off I'm least comfortable with, and if I'm honest about it: for something that calls itself an *investment* tool, not grounding the research in real, current data is a real gap. Numbers can be stale or just made up. I'd fix this first with more time.

**Just two nodes, no branching, no retries, no tool calls.** I wanted something that reliably worked end to end rather than an ambitious agent that breaks half the time. The cost is that the agent can't second-guess itself — if the research step gives a thin answer, analyze has no way to ask for more.

**The report comes back as one big Markdown string instead of structured JSON** (something like `{ verdict, confidence, risks, catalysts }`). Much simpler to generate and to render, but it means the frontend can't do anything verdict-aware — no colored INVEST/PASS badge, no risk table — without parsing free text after the fact.

**The homepage ticker calls Anthropic's API directly from the browser.** This was a fun little addition to make the homepage feel alive, but it's not something I'd do in production — any real API key would be exposed client-side. It does fall back gracefully to static sample prices if the call fails, which softens that risk for a demo, but it's still the wrong pattern long-term.

**No database, no auth, no rate limiting.** All out of scope for a 7-day solo assignment focused on one core feature, but obviously not production-ready as-is.

---

## Example Runs

Try it on the live demo or locally with a few companies — `Tesla`, `Infosys`, `Zomato` are good starting points. Each run takes you through the Agent screen (you'll see the Research → Analyze pipeline status), then drops you on the Dashboard with the rendered verdict and reasoning.

*(Paste 2–3 real outputs here — company name plus the verdict and key reasoning the agent gave — before you submit. I'm leaving this as a placeholder since I can't run your live keys from here.)*

---

## What I'd Improve With More Time

If I had another week, in rough priority order:

1. **Actually ground the research** — wire in a real search or financial-data tool as a proper node in the graph, instead of trusting the LLM's memory. This is the single biggest gap right now.
2. **Structured output** — get the analyze node to return real JSON (verdict, confidence, risks, catalysts, sources) instead of free-text Markdown, and build UI around that.
3. **A slightly smarter graph** — maybe a risk node and a valuation node running alongside research, or a reflection step where analyze can send it back for more research if the data's thin.
4. **Move the ticker call server-side** — proxy it through Express instead of calling Anthropic from the browser, and cache it so it's not re-fetching every time someone opens the tab.
5. **Some persistence** — even just SQLite, so past queries don't vanish on refresh.
6. **Basic resilience** — input validation, retries on the LLM calls, better error states than a generic banner.
7. **Tests** — there are none right now. I'd at least mock the LLM and test the graph nodes plus the `/api/research` route.
8. ~~Deploy it~~ — done, see the live demo link above.

---

## Bonus: AI Build Log

This was built with AI assistance throughout, as the assignment asks for. Chat transcripts from the build process are included separately in this submission.
