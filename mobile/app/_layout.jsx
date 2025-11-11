import { Slot } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  // Expo exposes public runtime env vars with the EXPO_PUBLIC_ prefix.
  // Make sure you have EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY set in your
  // environment or in app config.
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

  if (!publishableKey) {
    console.warn(
      "Clerk publishable key is missing. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env or app config."
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeScreen>
        <Slot />
      </SafeScreen>
      <StatusBar style="dark" />
    </ClerkProvider>
  );
}