const buildCEOAssistantPrompt = (userMessage, context = {}) => {
  const {
    companyData = {},
    recentMetrics = {},
    userRole = 'CEO',
    conversationHistory = []
  } = context;

  const systemPrompt = `You are an AI-powered CEO Assistant designed to help business leaders make informed decisions.

Your capabilities include:
- Analyzing business data and metrics
- Providing strategic recommendations
- Answering questions about company performance
- Generating reports and insights
- Helping with financial analysis
- Assisting with employee management decisions
- Offering market trends and competitive analysis

Context about the company:
${companyData.name ? `Company Name: ${companyData.name}` : ''}
${companyData.industry ? `Industry: ${companyData.industry}` : ''}
${companyData.size ? `Company Size: ${companyData.size} employees` : ''}
${companyData.revenue ? `Annual Revenue: ${companyData.revenue}` : ''}

${Object.keys(recentMetrics).length > 0 ? `Recent Metrics:\n${JSON.stringify(recentMetrics, null, 2)}` : ''}

Guidelines:
- Be professional and concise
- Provide actionable insights
- Use data to support recommendations
- Ask clarifying questions when needed
- Consider both short-term and long-term implications
- Be aware of business risks and opportunities`;

  return {
    system: systemPrompt,
    user: userMessage,
    history: conversationHistory
  };
};

const buildAnalysisPrompt = (data, analysisType = 'general') => {
  const prompts = {
    general: `Analyze the following business data and provide key insights, trends, and recommendations:\n\n${JSON.stringify(data, null, 2)}`,

    financial: `Perform a financial analysis on the following data. Include:
- Key financial metrics
- Trends and patterns
- Areas of concern
- Recommendations for improvement
- Comparison with industry standards (if applicable)

Data:\n${JSON.stringify(data, null, 2)}`,

    employee: `Analyze the employee data below and provide insights on:
- Workforce trends
- Performance patterns
- Retention concerns
- Recommendations for HR strategy

Data:\n${JSON.stringify(data, null, 2)}`,

    market: `Analyze the market data and provide:
- Market trends
- Competitive positioning
- Opportunities and threats
- Strategic recommendations

Data:\n${JSON.stringify(data, null, 2)}`,

    operations: `Review the operational data and identify:
- Efficiency metrics
- Bottlenecks or issues
- Process improvements
- Cost optimization opportunities

Data:\n${JSON.stringify(data, null, 2)}`
  };

  return prompts[analysisType] || prompts.general;
};

const buildSuggestionsPrompt = (context, category = 'general') => {
  return `Based on the following context, provide 3-5 actionable suggestions for ${category} improvements:

Context: ${JSON.stringify(context, null, 2)}

For each suggestion, include:
1. The suggestion itself
2. Expected impact
3. Implementation difficulty (Low/Medium/High)
4. Estimated timeline
5. Priority level (High/Medium/Low)`;
};

const buildDocumentProcessingPrompt = (documentType, extractedText) => {
  return `You are processing a ${documentType} document. Extract and summarize the following:

1. Key information and data points
2. Important dates and deadlines
3. Action items or decisions needed
4. Financial figures (if any)
5. Main insights or conclusions

Document content:
${extractedText}

Provide a structured summary that a CEO can quickly review.`;
};

const buildReportPrompt = (reportType, timeframe, data) => {
  const reportPrompts = {
    executive: `Generate an executive summary report for ${timeframe}. Include:
- Overall performance overview
- Key achievements
- Critical issues or concerns
- Strategic recommendations
- Next quarter priorities

Data:\n${JSON.stringify(data, null, 2)}`,

    financial: `Create a financial report for ${timeframe} covering:
- Revenue and profit analysis
- Expense breakdown
- Cash flow status
- Budget vs. actual comparison
- Financial health indicators
- Recommendations

Data:\n${JSON.stringify(data, null, 2)}`,

    departmental: `Prepare a departmental performance report for ${timeframe}:
- Key metrics by department
- Performance against goals
- Resource utilization
- Challenges and wins
- Recommendations for each department

Data:\n${JSON.stringify(data, null, 2)}`
  };

  return reportPrompts[reportType] || reportPrompts.executive;
};

module.exports = {
  buildCEOAssistantPrompt,
  buildAnalysisPrompt,
  buildSuggestionsPrompt,
  buildDocumentProcessingPrompt,
  buildReportPrompt
};
