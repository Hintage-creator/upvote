import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseStackParamList } from './types';
import { CourseListScreen } from '../features/course/CourseListScreen';
import { LessonScreen } from '../features/course/LessonScreen';
import { QuizScreen } from '../features/quiz/QuizScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<CourseStackParamList>();

export function CourseNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: 'Die Pyramide' }} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Kammer' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Rätsel' }} />
    </Stack.Navigator>
  );
}
