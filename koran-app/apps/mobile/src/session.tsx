import type { UserStats } from "@koran-app/shared";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { api } from "./api";
import { colors } from "./theme";

interface SessionContextValue {
  userId: string;
  stats: UserStats;
  refreshStats: () => Promise<void>;
  applyStats: (stats: UserStats) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Bootstraps the single demo user this prototype ships with (see
 * apps/api/src/routes/users.ts) and keeps their gamification stats in memory
 * so every screen reflects the latest XP/streak/badges without re-fetching.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .startSession()
      .then(({ userId }) => {
        setUserId(userId);
        return api.getStats(userId);
      })
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.danger} />
      </View>
    );
  }

  if (!userId || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        userId,
        stats,
        refreshStats: async () => setStats(await api.getStats(userId)),
        applyStats: setStats,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
