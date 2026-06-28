import { useState, useCallback, useRef, useEffect } from "react";
import "./index.css";
import Nav from "./nav";
import Agent from "./Agent";
import Dashboard from "./Dashboard";

const DOT_COLORS = [
  "activity-dot--green",
  "activity-dot--violet",
  "activity-dot--amber",
];

const TICKER_SYMBOLS = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "AMZN",
  "GOOG",
  "META",
  "BRK.B",
  "JPM",
  "NFLX",
];

const FALLBACK_ITEMS = [
  { sym: "AAPL", price: "$213.40", change: "+1.2%", up: true },
  { sym: "TSLA", price: "$248.90", change: "-0.8%", up: false },
  { sym: "NVDA", price: "$875.20", change: "+3.4%", up: true },
  { sym: "MSFT", price: "$415.60", change: "+0.6%", up: true },
  { sym: "AMZN", price: "$189.75", change: "-0.3%", up: false },
  { sym: "GOOG", price: "$172.30", change: "+1.7%", up: true },
  { sym: "META", price: "$521.40", change: "+2.1%", up: true },
  { sym: "BRK.B", price: "$401.20", change: "+0.2%", up: true },
  { sym: "JPM", price: "$198.50", change: "+0.9%", up: true },
  { sym: "NFLX", price: "$632.10", change: "-1.1%", up: false },
];

const CAPABILITIES = [
  {
    num: "01",
    name: "Market Intelligence",
    desc: "Pulls earnings calls, SEC filings, and analyst reports. Distills signal from noise across thousands of sources simultaneously.",
    tag: "SEC · Earnings · Filings",
  },
  {
    num: "02",
    name: "Sentiment Analysis",
    desc: "Scans social feeds, forums, and news in real-time. Surfaces momentum shifts before they hit price action.",
    tag: "Social · News · Feeds",
  },
  {
    num: "03",
    name: "Industry Trends",
    desc: "Tracks patent filings, regulatory updates, and clinical outcomes. Maps the landscape before the market prices it in.",
    tag: "Patents · Regulatory · Clinical",
  },
];

function Ticker() {
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [status, setStatus] = useState("loading"); 
  const intervalRef = useRef(null);

  const fetchQuotes = useCallback(async () => {
    try {
      const prompt = `Return ONLY a JSON array, no markdown, no explanation. For each of these stock symbols: ${TICKER_SYMBOLS.join(", ")} — provide the latest price and daily percent change.
Format exactly like this:
[{"sym":"AAPL","price":"$213.40","change":"+1.2%","up":true},...]
Use real current market data. "up" is true if change is positive.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found");

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed) || parsed.length === 0)
        throw new Error("Empty array");

      setItems(parsed);
      setStatus("live");
    } catch (e) {
      console.warn("Ticker fetch failed, using fallback:", e.message);
      setStatus("fallback");
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    
    intervalRef.current = setInterval(fetchQuotes, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchQuotes]);

  const doubled = [...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker-status-dot">
        <span
          className={`ticker-status-indicator${status === "live" ? " live" : ""}`}
          title={status === "live" ? "Live data" : "Cached data"}
        />
      </div>
      <div className="ticker-inner">
        {doubled.map((t, i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-sym">{t.sym}</span>
            <span className="ticker-price">{t.price}</span>
            <span className={t.up ? "ticker-up" : "ticker-dn"}>{t.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HomePage({ queriesRun, avgSynthTime, activityFeed, onNavigate }) {
  const lastQuery = activityFeed[0] ?? null;

  return (
    <main className="home">
     
      <Ticker />

    
      <section className="hero">
       
        <div className="hero-left">
          <div className="hero-left-inner">
            <div className="tag-row">
              {["Analyze", "Measure", "Implement", "Automate"].map((t) => (
                <span
                  key={t}
                  className={`tag${t === "Analyze" ? " tag--active" : ""}`}
                >
                  {t}
                </span>
              ))}
            </div>

            <h1 className="hero-title">
              Find What
              <br />
              Matters,
              <br />
              <em>Faster.</em>
            </h1>

            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="hero-meta-num">{queriesRun}</span>
                <span className="hero-meta-lbl">Queries run</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-num">
                  {avgSynthTime ? `${avgSynthTime}s` : "—"}
                </span>
                <span className="hero-meta-lbl">Avg synthesis</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-num hero-meta-num--sm">
                  {lastQuery ? lastQuery.name : "—"}
                </span>
                <span className="hero-meta-lbl">Last query</span>
              </div>
            </div>
          </div>

          <div className="hero-desc-row">
            <p className="hero-desc">
              Deploy autonomous agents to synthesize market data, earnings
              reports, and industry trends in real-time. Zero lag. Zero noise.
            </p>
            <div className="hero-cta-group">
              <button className="btn-cta" onClick={() => onNavigate("agent")}>
                Run Agent ↗
              </button>
              <button
                className="btn-ghost"
                onClick={() => onNavigate("dashboard")}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        
        <div className="hero-right">
          <div className="hero-panel-header">
            <span className="live-badge">
              <span className="live-dot"></span>Live feed
            </span>
            <span className="hero-card-label">Agent activity</span>
          </div>

       
          <div className="pipeline">
            <div className="pipeline-title">Node pipeline</div>
            <div className="pipeline-nodes">
              {[
                { label: "Research node", status: "Standby" },
                { label: "Analyze node", status: "Standby" },
              ].map((n) => (
                <div className="p-node" key={n.label}>
                  <div className="p-dot"></div>
                  <span className="p-label">{n.label}</span>
                  <span className="p-status">{n.status}</span>
                </div>
              ))}
            </div>
          </div>

          
          {activityFeed.length === 0 ? (
            <div className="activity-empty">
              <div className="activity-empty-inner">
                No queries yet —<br />
                run your first analysis.
              </div>
            </div>
          ) : (
            <div className="activity-list">
              {activityFeed.slice(0, 4).map((item, i) => (
                <div
                  key={i}
                  className={`activity-item${i === 0 && item.pending ? " activity-item--active" : ""}`}
                >
                  <span
                    className={`activity-dot ${item.dotClass}${item.pending ? " activity-dot--pulse" : ""}`}
                  />
                  <div className="activity-info">
                    <span className="activity-name">{item.name}</span>
                    <span className="activity-status">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="hero-card-footer">
            <span className="node-count">
              {queriesRun} {queriesRun === 1 ? "query" : "queries"} this session
            </span>
            <span className="hero-card-label">2 nodes active</span>
          </div>
        </div>
      </section>

      
      <section className="features">
        <div className="features-grid">
          {CAPABILITIES.map((f) => (
            <div className="feature-card" key={f.num}>
              <div className="feature-num">{f.num}</div>
              <div className="feature-line"></div>
              <h3 className="feature-name">{f.name}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-bottom">{f.tag}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function App() {
  const [researchData, setResearchData] = useState(null);
  const [activeView, setActiveView] = useState("home");
  const [error, setError] = useState(null);
  const [queriesRun, setQueriesRun] = useState(0);
  const [synthTimes, setSynthTimes] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const queryStartRef = useRef(null);

  const avgSynthTime = synthTimes.length
    ? (
        synthTimes.reduce((a, b) => a + b, 0) /
        synthTimes.length /
        1000
      ).toFixed(1)
    : null;

  const handleQueryStart = useCallback((company) => {
    queryStartRef.current = Date.now();
    const dotClass = DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
    setActivityFeed((prev) => [
      {
        name: company.toUpperCase(),
        status: "Running analysis…",
        ts: Date.now(),
        dotClass,
        pending: true,
      },
      ...prev.slice(0, 4),
    ]);
  }, []);

  const handleQueryComplete = useCallback((company) => {
    const elapsed = Date.now() - (queryStartRef.current || Date.now());
    setQueriesRun((n) => n + 1);
    setSynthTimes((prev) => [...prev, elapsed]);
    setActivityFeed((prev) =>
      prev.map((item, i) =>
        i === 0
          ? {
              ...item,
              status: `Done in ${(elapsed / 1000).toFixed(1)}s`,
              pending: false,
            }
          : item,
      ),
    );
  }, []);

  const handleNavigate = useCallback((view) => {
    setActiveView(view);
    setError(null);
  }, []);

  return (
    <div className="app">
      <Nav onNavigate={handleNavigate} activeView={activeView} />
      {error && <div className="error-banner">{error}</div>}

      {activeView === "home" && (
        <HomePage
          queriesRun={queriesRun}
          avgSynthTime={avgSynthTime}
          activityFeed={activityFeed}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === "agent" && (
        <Agent
          onQueryStart={handleQueryStart}
          onResult={(data) => {
            handleQueryComplete(data.company);
            setResearchData(data);
            setActiveView("dashboard");
          }}
          onError={setError}
        />
      )}

      {activeView === "dashboard" && <Dashboard researchData={researchData} />}
    </div>
  );
}

export default App;
