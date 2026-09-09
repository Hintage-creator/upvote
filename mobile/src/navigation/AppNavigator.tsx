import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { CourseNavigator } from './CourseNavigator';
import { PhrasebookScreen } from '../features/phrasebook/PhrasebookScreen';
import { ProgressScreen } from '../features/progress/ProgressScreen';
import { colors } from '../theme/colors';
import { AnimatedTabIcon } from './AnimatedTabIcon';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  CourseTab: '🔺',
  Phrasebook: '💬',
  Progress: '🐾',
};

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ focused }) => <AnimatedTabIcon emoji={TAB_ICONS[route.name]} focused={focused} />,
        })}
      >
        <Tab.Screen name="CourseTab" component={CourseNavigator} options={{ title: 'Pyramide' }} />
        <Tab.Screen name="Phrasebook" component={PhrasebookScreen} options={{ title: 'Phrasen' }} />
        <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Kungbäkola' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
