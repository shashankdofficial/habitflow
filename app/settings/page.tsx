"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Divider,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LogOut, User as UserIcon, Bell, Shield, Moon } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  if (authLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) return null;

  return (
    <Box minH="100vh" bg={bg}>
      <Navbar />
      <Box maxW="4xl" mx="auto" px={4} py={8}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl">Settings</Heading>
              <Text color="gray.600" mt={2}>
                Manage your account and preferences ⚙️
              </Text>
            </Box>
            <Button
              as={NextLink}
              href="/dashboard"
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </Flex>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Flex align="center" gap={6}>
                  <Box
                    w="20"
                    h="20"
                    borderRadius="full"
                    bg="blue.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="blue.600"
                  >
                    <UserIcon size={40} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">{name || "User"}</Heading>
                    <Text color="gray.600">{email}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Flex>

                <Divider />

                <VStack align="stretch" spacing={4}>
                  <Heading size="md" display="flex" alignItems="center" gap={2}>
                    <UserIcon size={20} />
                    Profile Information
                  </Heading>

                  <FormControl>
                    <FormLabel>Display Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isDisabled>
                    <FormLabel>Email Address</FormLabel>
                    <Input value={email} />
                  </FormControl>

                  <Button colorScheme="blue" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" display="flex" alignItems="center" gap={2}>
                  <Bell size={20} />
                  Notifications
                </Heading>

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Email Notifications</Text>
                    <Text fontSize="sm" color="gray.600">
                      Receive daily reminders and progress updates
                    </Text>
                  </Box>
                  <Switch
                    isChecked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                </HStack>

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Push Notifications</Text>
                    <Text fontSize="sm" color="gray.600">
                      Get notified when it&apos;s time to complete habits
                    </Text>
                  </Box>
                  <Switch
                    isChecked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" display="flex" alignItems="center" gap={2}>
                  <Moon size={20} />
                  Appearance
                </Heading>

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Dark Mode</Text>
                    <Text fontSize="sm" color="gray.600">
                      Switch between light and dark themes
                    </Text>
                  </Box>
                  <Switch
                    isChecked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" display="flex" alignItems="center" gap={2}>
                  <Shield size={20} />
                  Account
                </Heading>

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Change Password</Text>
                    <Text fontSize="sm" color="gray.600">
                      Update your password regularly for security
                    </Text>
                  </Box>
                  <Button size="sm" variant="outline">
                    Change
                  </Button>
                </HStack>

                <Divider />

                <Button
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<LogOut size={18} />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}
