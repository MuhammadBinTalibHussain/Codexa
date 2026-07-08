// Placeholder scoring engine. Real AI-driven code analysis is scheduled
// for Week 5; for now this produces deterministic mock scores so the
// AI Reports API can be fully implemented and tested end-to-end today.
const generateMockAnalysis = (snippet) => {
  const codeLength = snippet.code.length;

  const readability = Math.max(40, 100 - Math.floor(codeLength / 20));
  const maintainability = Math.max(35, 95 - Math.floor(codeLength / 25));
  const performance = Math.max(50, 90 - Math.floor(codeLength / 40));
  const overall = Math.round((readability + maintainability + performance) / 3);

  const suggestions = [];
  if (codeLength > 500) suggestions.push("Consider splitting this snippet into smaller functions");
  if (!/\/\//.test(snippet.code) && !/\/\*/.test(snippet.code)) {
    suggestions.push("Add comments to explain non-obvious logic");
  }
  if (suggestions.length === 0) suggestions.push("No major issues detected");

  return { readability, maintainability, performance, overall, suggestions };
};

module.exports = { generateMockAnalysis };
