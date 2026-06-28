const { StateGraph, Annotation } = require("@langchain/langgraph");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const StateAnnotation = Annotation.Root({
  company: Annotation({
    reducer: (_, y) => y,
    default: () => "",
  }),
  searchData: Annotation({
    reducer: (_, y) => y,
    default: () => "",
  }),
  report: Annotation({
    reducer: (_, y) => y,
    default: () => "",
  }),
});

const researchNode = async (state) => {
  const result = await model.generateContent(`Research: ${state.company}. Provide key financial and business data.`);
  return { searchData: result.response.text() };
};

const analyzeNode = async (state) => {
  const result = await model.generateContent(`Analyze the following company data and decide INVEST or PASS with reasons:\n\n${state.searchData}`);
  return { report: result.response.text() };
};

const workflow = new StateGraph(StateAnnotation)
  .addNode("research", researchNode)
  .addNode("analyze", analyzeNode)
  .addEdge("__start__", "research")
  .addEdge("research", "analyze")
  .addEdge("analyze", "__end__");

module.exports = workflow.compile();