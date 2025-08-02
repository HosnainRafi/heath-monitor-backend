// In /utils/claude.js

const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function getClaudeResponse(systemPrompt, userPrompt) {
  // Make sure your OpenRouter API key is loaded
  console.log(
    "OpenRouter API Key:",
    process.env.OPENROUTER_API_KEY ? "Loaded" : "Missing"
  );

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3-haiku", // The model name OpenRouter expects
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          // OpenRouter uses 'Authorization: Bearer', not 'x-api-key'
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // The response structure from OpenRouter
    return response.data;
  } catch (error) {
    // Log the detailed error from OpenRouter
    console.error(
      "Error from OpenRouter:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to get response from OpenRouter AI.");
  }
}

module.exports = getClaudeResponse;
