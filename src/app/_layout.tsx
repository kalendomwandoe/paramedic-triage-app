import { Stack } from "expo-router";
import { TriageProvider } from "../context/TriageContext";

export default function RootLayout() {
  return (
    <TriageProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TriageProvider>
  );
}