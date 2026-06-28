require("dotenv").config();
const express = require("express");
const cors = require("cors");
const appGraph = require("./researchGraph");

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));

app.post("/api/research", async (req, res) => {
  const { company } = req.body;
  if (!company) return res.status(400).json({ error: "Company name required" });

  try {
    const result = await appGraph.invoke({ company });
    res.json({ company, analysis: result.report });
  } catch (error) {
    console.error("Full error:", error);
    res.status(502).json({ error: "Graph execution failed", detail: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));