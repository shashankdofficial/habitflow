"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Link as ChakraLink,
  Stack,
  Alert,
  AlertIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("gray.50", "gray.900")}
      px={4}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} w="full">
        <Stack align="center">
          <Heading fontSize="4xl">Sign in to HabitFlow</Heading>
          <Text fontSize="lg" color="gray.600">
            Build better habits, one day at a time ✨
          </Text>
        </Stack>

        <Box
          rounded="lg"
          bg={useColorModeValue("white", "gray.800")}
          boxShadow="lg"
          p={8}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                bg="blue.400"
                color="white"
                _hover={{ bg: "blue.500" }}
                isLoading={loading}
                loadingText="Signing in..."
              >
                Sign in
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </Button>
            </Stack>
          </form>

          <Stack pt={6}>
            <Text align="center">
              Don&apos;t have an account?{" "}
              <ChakraLink as={NextLink} href="/signup" color="blue.400">
                Sign up
              </ChakraLink>
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
