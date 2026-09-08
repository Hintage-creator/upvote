// A deliberately minimal stack "router" implemented with React state instead
// of react-navigation: this prototype only ever needs a linear stack of
// screens, and hand-rolling that avoids pulling in a large navigation
// dependency (with its own native modules) for something this simple.
// A production build with deep linking, tabs, etc. should switch to
// react-navigation or expo-router instead.
import type { Badge, PronunciationScore, Verse, VocabItem } from "@koran-app/shared";
import React, { createContext, useContext, useMemo, useState } from "react";

export type Route =
  | { screen: "home" }
  | { screen: "lesson"; lessonId: string }
  | { screen: "record"; lessonId: string; item: Verse | VocabItem }
  | {
      screen: "feedback";
      lessonId: string;
      item: Verse | VocabItem;
      result: PronunciationScore;
      newlyEarnedBadges: Badge[];
    }
  | { screen: "quiz"; lessonId: string }
  | { screen: "profile" };

interface NavigationContextValue {
  route: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ screen: "home" }]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      route: stack[stack.length - 1],
      navigate: (route) => setStack((s) => [...s, route]),
      goBack: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      canGoBack: stack.length > 1,
    }),
    [stack]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within a NavigationProvider");
  return ctx;
}
