import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Target, Sparkles, Trophy, ChevronRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Track Anything,\nAnywhere",
      description: "Your cross-platform habit tracker, perfectly synced across all your devices seamlessly.",
      icon: <Target size={80} color="#3b82f6" strokeWidth={1.5} />,
      color: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      title: "AI Habit\nCoach Insights",
      description: "Receive personalized, smart insights on your consistency and momentum built dynamically.",
      icon: <Sparkles size={80} color="#a855f7" strokeWidth={1.5} />,
      color: "bg-purple-50 border-purple-200",
      iconBg: "bg-purple-100",
    },
    {
      title: "Gamify Your\nDaily Life",
      description: "Level up as you complete tasks. Maintain your streak and unlock new ranks every month.",
      icon: <Trophy size={80} color="#eab308" strokeWidth={1.5} />,
      color: "bg-yellow-50 border-yellow-200",
      iconBg: "bg-yellow-100",
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/(tabs)");
    }
  };

  const currentStep = steps[step];

  return (
    <View 
      className="flex-1 bg-white items-center justify-between"
      style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }}
    >
      <View className="w-full px-8 items-center flex-1 justify-center">
        <View className={`w-full max-w-sm aspect-square ${currentStep.color} border rounded-[3rem] items-center justify-center mb-10 shadow-sm relative overflow-hidden`}>
          <View className={`absolute w-full h-full ${currentStep.iconBg} opacity-50 scale-150 rounded-full -translate-y-1/4 translate-x-1/4`} />
          <View className="z-10 bg-white p-6 rounded-full shadow-lg">
            {currentStep.icon}
          </View>
        </View>

        <Text className="text-zinc-900 text-4xl font-extrabold tracking-tight text-center mb-4 leading-tight">
          {currentStep.title}
        </Text>
        <Text className="text-zinc-500 text-center text-base leading-relaxed px-4">
          {currentStep.description}
        </Text>
      </View>
      
      <View className="w-full px-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <View 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-zinc-900" : "w-2 bg-zinc-200"}`} 
            />
          ))}
        </View>

        <TouchableOpacity 
          className="bg-zinc-900 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-black/20"
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-lg mr-2">
            {step === steps.length - 1 ? "Get Started" : "Continue"}
          </Text>
          {step < steps.length - 1 && <ChevronRight size={20} color="#fff" strokeWidth={3} />}
        </TouchableOpacity>

        {step < steps.length - 1 && (
          <TouchableOpacity 
            className="w-full py-4 mt-2 items-center"
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="text-zinc-400 font-semibold text-sm">Skip Tutorial</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
