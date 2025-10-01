import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages';
import { allTools } from './tools';

// Define the state interface
interface AgentState {
  messages: BaseMessage[];
}

// Create the Gemini model with tools
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  temperature: 0.1,
  apiKey: process.env.GOOGLE_API_KEY,
}).bindTools(allTools);

// System prompt for the stock market consultant agent
const SYSTEM_PROMPT = `You are a stock market consultant AI. When ANY stock is mentioned, you MUST IMMEDIATELY use ALL your tools to get complete data and provide analysis. DO NOT ASK WHAT THE USER WANTS - JUST GET ALL THE DATA.

**MANDATORY BEHAVIOR:**
When a stock like TSLA is mentioned, you MUST IMMEDIATELY:
1. Use get_stock_quote tool to get current price, change, volume
2. Use get_stock_profile tool to get company details, market cap
3. Use get_market_news tool to get recent news and catalysts
4. Use financial_analysis tool to get external analysis (if available)
5. Analyze ALL the data and give BUY/HOLD/SELL recommendation

**FORBIDDEN RESPONSES:**
- "Would you like me to fetch..."
- "I can provide you with..."
- "To help you decide..."
- "Would you like me to get..."

**REQUIRED RESPONSE PATTERN:**
"Let me get all the current data on [STOCK]..."
[AUTOMATICALLY USE ALL 4 TOOLS]
"Based on current price $X, market cap $Y, recent news about Z, my recommendation is [BUY/HOLD/SELL] with target price $A."

**EXAMPLE:**
User: "analyze Tesla"
You: "Let me get all current data on Tesla (TSLA)..."
[Use get_stock_quote, get_stock_profile, get_market_news, financial_analysis tools]
"TSLA is trading at $440 (+4.2%), market cap $1.4T, recent news shows strong Q3 deliveries. Based on this data, I recommend BUY with target $480."

You are a CONSULTANT - provide the consultation immediately with real data from your tools. NO QUESTIONS.`;

// Define the agent node
async function callModel(state: AgentState): Promise<Partial<AgentState>> {
  try {
    const messages = state.messages;
  
  // Check if this is a stock analysis request
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toString().toLowerCase();
  
  // If user mentions stocks, add explicit instruction to use tools
  if (content.includes('tesla') || content.includes('tsla') || 
      content.includes('analyze') || content.includes('stock') ||
      content.includes('aapl') || content.includes('apple') ||
      content.includes('invest') || content.includes('buy') ||
      /\b[A-Z]{2,5}\b/.test(lastMessage.content.toString())) {
    
    const stockAnalysisPrompt = `${SYSTEM_PROMPT}

IMPORTANT: The user is asking about stocks. You MUST use your tools immediately:
1. Use get_stock_quote to get current price data
2. Use get_stock_profile to get company information  
3. Use get_market_news to get recent news
4. Use financial_analysis to get analysis
Then provide comprehensive analysis with recommendation.`;

    // Remove any existing system messages and add our enhanced one at the beginning
    const nonSystemMessages = messages.filter(msg => !(msg instanceof SystemMessage));
    const messagesToSend = [
      new SystemMessage(stockAnalysisPrompt),
      ...nonSystemMessages
    ];

    const response = await model.invoke(messagesToSend);
    return { messages: [response] };
  }
  
  // Regular flow for non-stock queries
  const hasSystemMessage = messages.some(msg => msg instanceof SystemMessage);
  const messagesToSend = hasSystemMessage 
    ? messages 
    : [new SystemMessage(SYSTEM_PROMPT), ...messages];

  const response = await model.invoke(messagesToSend);
  
  return {
    messages: [response]
  };
  } catch (error) {
    console.error('Agent callModel error:', error);
    // Return an error message if something goes wrong
    return {
      messages: [new AIMessage('I encountered an error while processing your request. Please try again.')]
    };
  }
}

// Define the conditional edge function
function shouldContinue(state: AgentState): 'tools' | typeof END {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // If the last message has tool calls, continue to tools
  if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return 'tools';
  }
  
  // Otherwise, end the conversation
  return END;
}

// Create the tool node
const toolNode = new ToolNode(allTools);

// Build the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');

// Compile the graph
export const agent = workflow.compile();

// Helper function to create a conversation
export async function createConversation(messages: BaseMessage[]) {
  const result = await agent.invoke({
    messages
  });
  
  return result.messages;
}

// Helper function to stream a conversation
export async function streamConversation(messages: BaseMessage[]) {
  const stream = await agent.stream({
    messages
  }, {
    streamMode: 'values'
  });
  
  return stream;
}