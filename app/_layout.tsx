import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../src/controllers/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      {/* Thêm initialRouteName="admin" */}
      <Stack initialRouteName="client" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="client" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}