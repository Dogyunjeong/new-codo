import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import FeedScreen from '../screens/main/FeedScreen';
import GoalsScreen from '../screens/main/GoalsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreatePostScreen from '../screens/create/CreatePostScreen';
import CreateGoalScreen from '../screens/create/CreateGoalScreen';
import PostDetailScreen from '../screens/detail/PostDetailScreen';
import GoalDetailScreen from '../screens/detail/GoalDetailScreen';
import UserProfileScreen from '../screens/detail/UserProfileScreen';

export type MainTabParamList = {
  FeedTab: undefined;
  GoalsTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  CreatePost: { goalId?: string };
  CreateGoal: undefined;
  PostDetail: { postId: string };
  GoalDetail: { goalId: string };
  UserProfile: { userId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'FeedTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'GoalsTab') {
            iconName = focused ? 'target' : 'target-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="FeedTab" 
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen 
        name="GoalsTab" 
        component={GoalsScreen}
        options={{ title: 'Goals' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ 
          title: 'Create Post',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="CreateGoal" 
        component={CreateGoalScreen}
        options={{ 
          title: 'Create Goal',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{ title: 'Post' }}
      />
      <Stack.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen}
        options={{ title: 'Goal' }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;