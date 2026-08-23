import { Habit, HabitLog } from "@/types";

export interface AICoachInsight {
  headline: string;
  summary: string;
  tips: string[];
  suggestedAction: string;
}

export interface AIRecommendedHabit {
  title: string;
  description: string;
  frequency: "daily" | "weekly";
  time_of_day: "morning" | "afternoon" | "evening" | "anytime";
  target_value?: number;
  target_unit?: string;
  color: string;
  icon: string;
}

const FREE_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free"
];

async function callOpenRouter(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    return null;
  }

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "HabitFlow",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (response.status === 404) {
        console.warn(`OpenRouter model ${model} returned 404, trying fallback model...`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.error(`OpenRouter fetch error with model ${model}:`, err);
    }
  }
  return null;
}

export async function getAICoachInsights(habits: Habit[], logs: HabitLog[]): Promise<AICoachInsight> {
  const activeHabitsCount = habits.length;
  const completedLogs = logs.filter((l) => l.status === "completed");
  const totalCompletions = completedLogs.length;

  if (activeHabitsCount === 0) {
    return {
      headline: "Welcome to HabitFlow AI Coach! 🚀",
      summary: "You don't have any active habits yet. Starting with 2-3 small daily routines is the key to building long-term momentum.",
      tips: [
        "Start small (e.g., Drink 1 glass of water every morning).",
        "Set consistent daily reminders.",
        "Link new habits to existing daily triggers."
      ],
      suggestedAction: "Create your first habit"
    };
  }

  const prompt = `You are HabitFlow AI, an elite productivity coach.
Analyze these user habits & logs:
Habits: ${JSON.stringify(habits.map((h) => ({ title: h.title, time: h.time_of_day, target: h.target_value })))}
Total Check-ins Logged: ${totalCompletions}

Return ONLY a JSON object with this exact structure:
{
  "headline": "Short snappy encouraging title",
  "summary": "1-2 sentence insights on performance and streak trends",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "suggestedAction": "Actionable focus for today"
}
Do not include markdown codeblocks (\`\`\`json). Just return the raw JSON object.`;

  const aiResponseText = await callOpenRouter(prompt);

  if (aiResponseText) {
    try {
      const cleaned = aiResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.headline && parsed.summary) {
        return parsed;
      }
    } catch (err) {
      console.warn("OpenRouter API parse error, falling back to rule engine:", err);
    }
  }

  // Fallback Rule Engine
  if (totalCompletions < 5) {
    return {
      headline: "Building Foundation Mode 🎯",
      summary: `You've logged ${totalCompletions} check-ins across ${activeHabitsCount} habits. Consistency in the first week builds identity habits.`,
      tips: [
        "Focus on completion over perfection.",
        "Complete your morning habits first to generate early dopamine.",
        "Log progress daily right after finishing."
      ],
      suggestedAction: "Complete today's morning routine"
    };
  }

  return {
    headline: "Momentum is Building! 🔥",
    summary: `Great progress with ${totalCompletions} completions logged! Keep your streak alive to solidify your habit habits.`,
    tips: [
      "Use quantitative targets to measure incremental growth.",
      "Review weekly analytics to spot missed day patterns.",
      "Never miss 2 days in a row!"
    ],
    suggestedAction: "Check off your highest priority habit"
  };
}

export async function generateAIHabitSuggestions(userGoal: string): Promise<AIRecommendedHabit[]> {
  const prompt = `A user wants habits for the goal: "${userGoal}".
Generate 3 distinct, high-impact habit templates.
Return ONLY a JSON array of objects with these exact keys:
"title", "description", "frequency" ("daily" | "weekly"), "time_of_day" ("morning" | "afternoon" | "evening" | "anytime"), "target_value" (number or null), "target_unit" (string or null), "color" ("blue"|"green"|"purple"|"orange"|"pink"|"red"), "icon" ("water"|"fitness"|"self_improvement"|"book"|"sleep"|"work"|"food").
Do not include markdown codeblocks (\`\`\`json). Just return the raw JSON array.`;

  const aiResponseText = await callOpenRouter(prompt);

  if (aiResponseText) {
    try {
      const cleaned = aiResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn("OpenRouter habit generation error, using fallback templates:", err);
    }
  }

  // Fallback rules...
  const goalLower = userGoal.toLowerCase();
  if (goalLower.includes("fit") || goalLower.includes("health") || goalLower.includes("weight") || goalLower.includes("gym")) {
    return [
      {
        title: "Morning Hydration",
        description: "Drink water right after waking up",
        frequency: "daily",
        time_of_day: "morning",
        target_value: 2000,
        target_unit: "ml",
        color: "blue",
        icon: "water"
      },
      {
        title: "Daily Workout Session",
        description: "30 minutes of cardio or resistance exercise",
        frequency: "daily",
        time_of_day: "afternoon",
        target_value: 30,
        target_unit: "mins",
        color: "green",
        icon: "fitness"
      },
      {
        title: "8 Hours Restful Sleep",
        description: "Sleep early and avoid screen time before bed",
        frequency: "daily",
        time_of_day: "evening",
        color: "purple",
        icon: "sleep"
      }
    ];
  }

  if (goalLower.includes("read") || goalLower.includes("study") || goalLower.includes("focus") || goalLower.includes("learn")) {
    return [
      {
        title: "Daily Reading",
        description: "Read non-fiction or educational book",
        frequency: "daily",
        time_of_day: "evening",
        target_value: 20,
        target_unit: "pages",
        color: "purple",
        icon: "book"
      },
      {
        title: "Deep Work Sprint",
        description: "Uninterrupted focused work block",
        frequency: "daily",
        time_of_day: "morning",
        target_value: 45,
        target_unit: "mins",
        color: "blue",
        icon: "work"
      },
      {
        title: "Mindful Meditation",
        description: "Calm breathing & reflection",
        frequency: "daily",
        time_of_day: "morning",
        target_value: 10,
        target_unit: "mins",
        color: "orange",
        icon: "self_improvement"
      }
    ];
  }

  return [
    {
      title: "Daily Hydration Goal",
      description: "Keep body hydrated throughout the day",
      frequency: "daily",
      time_of_day: "morning",
      target_value: 2500,
      target_unit: "ml",
      color: "blue",
      icon: "water"
    },
    {
      title: "Morning Stretch & Walk",
      description: "Light movement to activate energy",
      frequency: "daily",
      time_of_day: "morning",
      target_value: 15,
      target_unit: "mins",
      color: "green",
      icon: "fitness"
    },
    {
      title: "Evening Gratitude & Journal",
      description: "Write down 3 wins of the day",
      frequency: "daily",
      time_of_day: "evening",
      color: "pink",
      icon: "self_improvement"
    }
  ];
}
