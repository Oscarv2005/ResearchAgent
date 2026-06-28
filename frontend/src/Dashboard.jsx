import ReactMarkdown from "react-markdown";
import "./index.css";

function Dashboard({ researchData }) {
  const now = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <div className="dashboard-sidebar">
        <div>
          <div className="sidebar-label">Report</div>
          <div className="sidebar-meta">
            <div className="sidebar-meta-item">
              <span className="sidebar-meta-key">Company</span>
              <span className="sidebar-meta-val">
                {researchData ? researchData.company : "—"}
              </span>
            </div>
            <div className="sidebar-meta-item">
              <span className="sidebar-meta-key">Status</span>
              <span
                className="sidebar-meta-val"
                style={{ color: researchData ? "#4ADE80" : "var(--tm)" }}
              >
                {researchData ? "Complete" : "No data"}
              </span>
            </div>
            <div className="sidebar-meta-item">
              <span className="sidebar-meta-key">Generated</span>
              <span className="sidebar-meta-val">
                {researchData ? now : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <div>
          <div className="sidebar-label">Nodes Run</div>
          <div className="sidebar-meta">
            {[
              { label: "Research", done: !!researchData },
              { label: "Analyze", done: !!researchData },
            ].map((n, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid var(--bdr)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: n.done ? "#4ADE80" : "var(--bdr2)",
                  }}
                ></div>
                <span
                  className="sidebar-meta-val"
                  style={{ fontSize: "0.75rem" }}
                >
                  {n.label} Node
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <span className="dashboard-title">Research Analysis</span>
          <span className="hero-card-label">AI-Driven Investment Insights</span>
        </div>

        <div className="dashboard-content">
          {researchData ? (
            <div className="analysis-card">
              <div className="company-name">{researchData.company}</div>
              <div className="analysis-text">
                <ReactMarkdown>{researchData.analysis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              No analysis loaded — run a query from the Agent page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
