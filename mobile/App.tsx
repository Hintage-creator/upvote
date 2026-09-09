import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, NotoSansNKo_400Regular } from '@expo-google-fonts/noto-sans-nko';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ScriptDisplayModeProvider } from './src/features/script/ScriptDisplayModeContext';
import { ContentDisclaimerBanner } from './src/features/ContentDisclaimerBanner';
import { StoryScreen } from './src/features/dungeon/StoryScreen';
import { hasSeenStory, markStorySeen } from './src/features/dungeon/storyProgress';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({ NotoSansNKo_400Regular });
  const [storySeen, setStorySeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenStory().then(setStorySeen);
  }, []);

  if (!fontsLoaded || storySeen === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  async function enterPyramid() {
    await markStorySeen();
    setStorySeen(true);
  }

  return (
    <SafeAreaProvider>
      <ScriptDisplayModeProvider>
        <View style={styles.root}>
          {storySeen ? (
            <>
              <ContentDisclaimerBanner />
              <AppNavigator />
            </>
          ) : (
            <StoryScreen onDone={enterPyramid} />
          )}
        </View>
      </ScriptDisplayModeProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
