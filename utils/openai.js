// backend/utils/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getOpenaiApiResponse = async (message) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);

    // Gemini response text
    const aiResponse = result.response.text();

    console.log("Gemini:", aiResponse);
    return { response: aiResponse };
  } catch (err) {
    console.error("Error calling Gemini:", err.message);
    return { response: "Failed to get response from Gemini AI" };
  }
};

module.exports = getOpenaiApiResponse;
