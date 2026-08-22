import { Habit, HabitLog } from "../types";

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

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const MODEL = "google/gemma-2-9b-it:free"; 

async function callOpenRouter(prompt: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    return null;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8081",
        "X-Title": "HabitFlow Mobile",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("OpenRouter fetch error:", err);
    return null;
  }
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
