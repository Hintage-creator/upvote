import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useNavigation, NavigationProvider } from "./src/navigation";
import { SessionProvider } from "./src/session";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LessonScreen } from "./src/screens/LessonScreen";
import { RecordScreen } from "./src/screens/RecordScreen";
import { FeedbackScreen } from "./src/screens/FeedbackScreen";
import { QuizScreen } from "./src/screens/QuizScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { AlphabetScreen } from "./src/screens/AlphabetScreen";
import { colors } from "./src/theme";

function Router() {
  const { route } = useNavigation();

  switch (route.screen) {
    case "home":
      return <HomeScreen />;
    case "lesson":
      return <LessonScreen lessonId={route.lessonId} />;
    case "record":
      return <RecordScreen lessonId={route.lessonId} item={route.item} />;
    case "feedback":
      return (
        <FeedbackScreen
          lessonId={route.lessonId}
          item={route.item}
          result={route.result}
          newlyEarnedBadges={route.newlyEarnedBadges}
        />
      );
    case "quiz":
      return <QuizScreen lessonId={route.lessonId} />;
    case "profile":
      return <ProfileScreen />;
    case "alphabet":
      return <AlphabetScreen />;
  }
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SessionProvider>
        <NavigationProvider>
          <Router />
        </NavigationProvider>
      </SessionProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
});
