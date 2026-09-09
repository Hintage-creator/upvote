import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, NotoSansNKo_400Regular } from '@expo-google-fonts/noto-sans-nko';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ScriptDisplayModeProvider } from './src/features/script/ScriptDisplayModeContext';
import { ContentDisclaimerBanner } from './src/features/ContentDisclaimerBanner';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({ NotoSansNKo_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ScriptDisplayModeProvider>
        <View style={styles.root}>
          <ContentDisclaimerBanner />
          <AppNavigator />
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
