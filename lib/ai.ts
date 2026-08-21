import { GoogleGenAI } from "@google/genai";
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

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

  if (ai) {
    try {
      const prompt = `You are HabitFlow AI, an elite productivity coach.
Analyze these user habits & logs:
Habits: ${JSON.stringify(habits.map((h) => ({ title: h.title, time: h.time_of_day, target: h.target_value })))}
Total Check-ins Logged: ${totalCompletions}

Return a JSON object with:
{
  "headline": "Short snappy encouraging title",
  "summary": "1-2 sentence insights on performance and streak trends",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "suggestedAction": "Actionable focus for today"
}
ONLY valid JSON, no markdown codeblock tags.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.warn("Gemini API call error, falling back to rule engine:", err);
    }
  }

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
  if (ai) {
    try {
      const prompt = `A user wants habits for the goal: "${userGoal}".
Generate 3 distinct, high-impact habit templates.
Return a JSON array of objects with keys:
"title", "description", "frequency" ("daily" | "weekly"), "time_of_day" ("morning" | "afternoon" | "evening" | "anytime"), "target_value" (number or null), "target_unit" (string or null), "color" ("blue"|"green"|"purple"|"orange"|"pink"|"red"), "icon" ("water"|"fitness"|"self_improvement"|"book"|"sleep"|"work"|"food").
ONLY valid JSON, no markdown codeblock tags.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini habit generation error, using fallback templates:", err);
    }
  }

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
