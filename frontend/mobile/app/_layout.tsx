import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // TODO: Restaurar sesión desde AsyncStorage
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
