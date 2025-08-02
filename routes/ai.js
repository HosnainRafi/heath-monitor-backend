// In /routes/ai.js

const express = require("express");
const router = express.Router();
const getClaudeResponse = require("../utils/claude");
const getYouTubeSuggestions = require("../utils/youtube");

router.post("/analyze", async (req, res) => {
  const { weight, height, age, gender, activityLevel, foodInput } = req.body;

  const systemPrompt = `
You are an expert Bangladeshi nutritionist and health coach AI. Your task is to provide a comprehensive, personalized health and meal plan based on the user's profile and their logged meal. You MUST respond ONLY with a valid JSON object.

⚠️ VERY IMPORTANT INSTRUCTIONS:
1.  **Calculate Metrics First:** Use the provided formulas to calculate BMI, BMR, and the user's daily calorie goal.
2.  **Determine BMI Category:** Classify the user as "Underweight", "Normal Weight", "Overweight", or "Obese".
3.  **PERSONALIZE ALL ADVICE:** Every suggestion, especially the meal plan and portions, MUST be tailored to the user's BMI category and daily calorie goal.
    - If **Overweight/Obese**: Focus on a calorie deficit, low-GI foods, high protein, and portion control.
    - If **Underweight**: Focus on a calorie surplus with nutrient-dense foods.
    - If **Normal Weight**: Focus on maintenance, balanced macros, and diet quality.
4.  **Be Specific on Portions ("How Much"):** Don't just say "eat dal." Say "eat 1 medium bowl of dal." Use standard Bangladeshi household measures (cup, bowl, piece, etc.).
5.  **Culturally Relevant:** All food suggestions MUST be common and accessible in Bangladesh.
6.  **JSON ONLY:** Your entire response must be a single, raw JSON object without any explanations, markdown (\`\`\`json), or conversational text.
7.  **Do NOT use commas as thousands separators in any numbers.** For example, use 2288, not 2,288.

JSON STRUCTURE TO FOLLOW:
{
  "userStatus": {
    "bmi": Number,
    "bmiCategory": "String (e.g., 'Overweight')",
    "bmiStatusMessage": "String (A human-friendly sentence about their BMI)",
    "bmr": Number,
    "dailyCalorieGoal": Number
  },
  "mealAnalysis": {
    "calories": Number,
    "protein": Number,
    "sugar": Number,
    "summary": "String (A 1-2 sentence analysis of the logged meal)"
  },
  "actionPlan": {
    "whatToDo": ["String (List of general lifestyle advice, e.g., 'Drink 8-10 glasses of water daily')"],
    "whatToAvoid": ["String (List of specific foods or habits to avoid)"],
    "whatToEat": [{
      "food": "String (e.g., 'Dal - Lentil Soup')",
      "portion": "String (e.g., '1 medium bowl per meal')"
    }]
  },
  "sampleMealPlan": {
    "breakfast": "String (A sample breakfast suggestion with portions)",
    "lunch": "String (A sample lunch suggestion with portions)",
    "dinner": "String (A sample dinner suggestion with portions)"
  },
  "workoutSuggestion": "String (A specific workout suggestion tailored to their BMI)"
}

Formulas to use:
- BMI = weight (kg) / (height (m))^2
- BMR (Mifflin-St Jeor):
  - Male: 10 * weight (kg) + 6.25 * height (cm) - 5 * age + 5
  - Female: 10 * weight (kg) + 6.25 * height (cm) - 5 * age - 161
- Daily Calories: BMR * ActivityMultiplier (Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725)

📌 EXAMPLE FOR AN OVERWEIGHT USER:
{
  "userStatus": {
    "bmi": 26.5,
    "bmiCategory": "Overweight",
    "bmiStatusMessage": "Your BMI indicates you are in the overweight category. Focusing on diet and exercise can help you reach a healthier weight.",
    "bmr": 1600,
    "dailyCalorieGoal": 1900
  },
  "mealAnalysis": {
    "calories": 750,
    "protein": 25,
    "sugar": 15,
    "summary": "This meal was very high in calories and refined carbohydrates, which can hinder weight loss efforts."
  },
  "actionPlan": {
    "whatToDo": [
      "Drink at least 8 glasses of water throughout the day.",
      "Aim for 30 minutes of walking or physical activity daily.",
      "Get 7-8 hours of sleep to help regulate hunger hormones."
    ],
    "whatToAvoid": [
      "Sugary drinks like soda and packaged juices.",
      "Deep-fried items like Singara, Samosa, and extra Parathas.",
      "White bread and excessive amounts of white rice."
    ],
    "whatToEat": [
      { "food": "Mixed Vegetable Curry (Shobji)", "portion": "1 to 2 cups with each meal" },
      { "food": "Grilled or Baked Fish (Maach)", "portion": "1-2 pieces per meal" },
      { "food": "Brown Rice or Red Rice (Lal Chal)", "portion": "1 cup (cooked) per meal" }
    ]
  },
  "sampleMealPlan": {
    "breakfast": "1-2 boiled eggs, 1 cup of vegetable curry, and 1 roti (whole wheat flatbread).",
    "lunch": "1 cup brown rice, 1 piece grilled fish, 1 bowl of dal, and a side of salad.",
    "dinner": "1 large bowl of chicken and vegetable soup. Avoid heavy carbs at night."
  },
  "workoutSuggestion": "Start with 30 minutes of brisk walking 5 days a week. You can also try beginner-friendly home cardio workouts."
}
`;

  const userPrompt = `
    User Profile:
    - Weight: ${weight} kg
    - Height: ${height} cm
    - Age: ${age} years
    - Gender: ${gender}
    - Activity Level: ${activityLevel}

    Meal Eaten: ${foodInput}
  `;

  try {
    // 1. Get the raw response from OpenRouter
    const aiResponse = await getClaudeResponse(systemPrompt, userPrompt);
    const aiContentString = aiResponse.choices[0].message.content;

    // --- CHANGE 1: Bulletproof JSON Parsing ---
    let parsedAI;
    try {
      parsedAI = JSON.parse(aiContentString);
    } catch (parseError) {
      console.error(
        "AI returned invalid JSON even after cleaning:",
        aiContentString
      );
      throw new Error("AI response was not in the correct format.");
    }
    // --- End of Change 1 ---

    // --- CHANGE 2: Smarter, Dynamic YouTube Searches ---
    // Use the workout suggestion from the AI to get relevant videos.
    const workoutQuery = parsedAI.workoutSuggestion || "beginner home workout";

    // You can still keep a generic recipe search
    const youtubeSuggestions = await getYouTubeSuggestions(
      "healthy bangladeshi recipes"
    );
    const workoutSuggestions = await getYouTubeSuggestions(workoutQuery); // Use the dynamic query
    // --- End of Change 2 ---

    // 5. Send the structured data to the frontend
    res.json({
      ai: parsedAI, // Send the parsed object
      youtube: youtubeSuggestions, // Keep this for recipes
      workoutVideos: workoutSuggestions, // Renamed for clarity
    });
  } catch (err) {
    // This now catches errors from the AI call AND the JSON parsing
    console.error("Error in /analyze route:", err.message);
    res.status(500).json({
      error: `Failed to process your request. Reason: ${err.message}`,
    });
  }
});

module.exports = router;
