import { Tabs } from 'expo-router';

export default function TabLayout() {
  // Remove auth check from tabs layout to prevent redirect loops
  // Auth check is handled at the root level in index.tsx

  return (
    <Tabs>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarLabel: 'Goals',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}