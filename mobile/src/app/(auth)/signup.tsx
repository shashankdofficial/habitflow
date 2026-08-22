import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import * as Google from "expo-auth-session/build/providers/Google.js";

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        const credential = GoogleAuthProvider.credential(null, authentication.accessToken);
        signInWithCredential(auth, credential).catch((err) => {
          setError(err.message || "Failed to sign in with Google");
        });
      }
    } else if (response?.type === "error") {
      setError("Google Sign-In was cancelled or failed.");
    }
  }, [response]);

  const handleSignUp = async () => {
    try {
      setError("");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      // Navigation is handled automatically by _layout.tsx
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-zinc-950"
    >
      <View 
        className="flex-1 p-6 justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-white text-4xl font-extrabold mb-2 tracking-tight text-center">
          Create your account
        </Text>
        <Text className="text-zinc-400 text-center mb-10 text-lg">
          Start building better habits today ✨
        </Text>

        <View className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full shadow-xl">
          {error ? <Text className="text-red-400 mb-4 text-center">{error}</Text> : null}

          <TextInput
            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl p-4 mb-4"
            placeholder="Name"
            placeholderTextColor="#71717a"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl p-4 mb-4"
            placeholder="Email"
            placeholderTextColor="#71717a"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl p-4 mb-6"
            placeholder="Password"
            placeholderTextColor="#71717a"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 w-full py-4 rounded-xl items-center mb-4"
            onPress={handleSignUp}
          >
            <Text className="text-white font-semibold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-zinc-800" />
            <Text className="text-zinc-500 mx-4">or</Text>
            <View className="flex-1 h-px bg-zinc-800" />
          </View>

          <TouchableOpacity 
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 w-full py-4 rounded-xl items-center mb-4 flex-row justify-center"
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Text className="text-white font-semibold text-lg">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text className="text-zinc-400">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-blue-400 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
