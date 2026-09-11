import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, NotoSansNKo_400Regular } from '@expo-google-fonts/noto-sans-nko';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ScriptDisplayModeProvider } from './src/features/script/ScriptDisplayModeContext';
import { ContentDisclaimerBanner } from './src/features/ContentDisclaimerBanner';
import { StoryScreen } from './src/features/dungeon/StoryScreen';
import { IntroVideoScreen } from './src/features/dungeon/IntroVideoScreen';
import { hasSeenStory, markStorySeen } from './src/features/dungeon/storyProgress';
import { CatAvatar } from './src/features/dungeon/CatAvatar';
import { colors } from './src/theme/colors';

type Stage = 'intro' | 'story' | 'app';

export default function App() {
  const [fontsLoaded] = useFonts({ NotoSansNKo_400Regular });
  const [storySeen, setStorySeen] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>('intro');

  useEffect(() => {
    hasSeenStory().then(setStorySeen);
  }, []);

  if (!fontsLoaded || storySeen === null) {
    return (
      <View style={styles.loading}>
        <CatAvatar sootStage={0} size={72} />
        <Text style={styles.loadingText}>Kungbäkola wacht auf …</Text>
      </View>
    );
  }

  function finishIntro() {
    setStage(storySeen ? 'app' : 'story');
  }

  async function enterPyramid() {
    await markStorySeen();
    setStorySeen(true);
    setStage('app');
  }

  return (
    <SafeAreaProvider>
      <ScriptDisplayModeProvider>
        <View style={styles.root}>
          {stage === 'intro' ? (
            <IntroVideoScreen onDone={finishIntro} />
          ) : stage === 'story' ? (
            <StoryScreen onDone={enterPyramid} />
          ) : (
            <>
              <ContentDisclaimerBanner />
              <AppNavigator />
            </>
          )}
        </View>
      </ScriptDisplayModeProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: 12 },
  loadingText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
