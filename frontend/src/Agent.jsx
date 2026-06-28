import { useState } from "react";

function Agent({ onResult, onError, onQueryStart }) {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const runResearch = async () => {
    if (!company.trim()) return onError("Please enter a valid company name.");
    setLoading(true);
    if (onQueryStart) onQueryStart(company.trim());
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/research`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: company.trim() }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Research failed");
      onResult(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-wrapper">
      {/* LEFT — context panel */}
      <div className="agent-left">
        <div className="agent-left-top">
          <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Initialize Research Agent
          </div>
          <h2 className="agent-left-title">
            Run
            <br />
            Analysis
          </h2>
          <p className="agent-left-desc">
            Enter a ticker symbol or company name to deploy the research graph.
            The agent runs two sequential nodes: research, then analyze.
          </p>
        </div>

        <div>
          <div className="sidebar-label" style={{ marginBottom: "0.75rem" }}>
            Node Pipeline
          </div>
          <div className="agent-node-list">
            {[
              {
                label: "Research Node",
                status: loading ? "Running…" : "Standby",
                active: loading,
              },
              {
                label: "Analyze Node",
                status: loading ? "Queued" : "Standby",
                active: false,
              },
            ].map((n, i) => (
              <div className="agent-node" key={i}>
                <div
                  className={`agent-node-dot${n.active ? " agent-node-dot--active" : ""}`}
                ></div>
                <span className="agent-node-label">{n.label}</span>
                <span className="agent-node-status">{n.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — input */}
      <div className="agent-right">
        <div className="agent-container">
          <div className="agent-title">Query Input</div>
          <input
            className="agent-input"
            placeholder="Ticker or company name (e.g. AAPL, Tesla)..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runResearch()}
          />
          <button
            className="btn-run-agent"
            onClick={runResearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>Orchestrating…
              </>
            ) : (
              "Execute Analysis ↗"
            )}
          </button>
          {loading && (
            <p className="agent-status-text">
              → Research node running · Analyze node queued
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Agent;
