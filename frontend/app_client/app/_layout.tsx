import { Stack } from 'expo-router';
// import { Provider } from 'react-redux';
// import { useEffect } from 'react';
// import { store } from '../src/store';
// import { logConnectionStatus } from '../src/utils/connectionTest';

export default function RootLayout() {
  // useEffect(() => {
  //   // Test service connections on app startup in development
  //   if (__DEV__) {
  //     logConnectionStatus().catch(console.error);
  //   }
  // }, []);

  return (
    // <Provider store={store}>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
    // </Provider>
  );
}
