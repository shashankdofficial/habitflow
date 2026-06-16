"use client";

import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const mapAuthError = (error: any): Error => {
  const code = error?.code;
  let message = "An unexpected error occurred. Please try again.";

  switch (code) {
    case "auth/invalid-credential":
      message = "Invalid email or password. Please check your credentials.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email. Please sign up.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/email-already-in-use":
      message = "An account already exists with this email address.";
      break;
    case "auth/weak-password":
      message = "Password should be at least 6 characters long.";
      break;
    case "auth/invalid-email":
      message = "Please enter a valid email address.";
      break;
    case "auth/user-disabled":
      message = "This user account has been disabled. Please contact support.";
      break;
    case "auth/popup-closed-by-user":
      message = "Sign-in popup closed before completion. Please try again.";
      break;
    default:
      if (error?.message) {
        message = error.message.replace(/^Firebase:\s*/, "");
      }
  }

  return new Error(message);
};

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          user_metadata: {
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          },
          created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Firebase Signin Error:", error);
      throw mapAuthError(error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        
        setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email || "",
          user_metadata: {
            name: name,
          },
          created_at: userCredential.user.metadata.creationTime || new Date().toISOString(),
        });
      }
      return userCredential.user;
    } catch (error) {
      console.error("Firebase Signup Error:", error);
      throw mapAuthError(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Firebase Google Signin Error:", error);
      throw mapAuthError(error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Firebase Signout Error:", error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
