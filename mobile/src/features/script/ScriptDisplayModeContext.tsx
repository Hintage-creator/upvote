import React, { createContext, useContext, useMemo, useState } from 'react';

export type ScriptDisplayMode = 'latin' | 'nko' | 'side-by-side';

interface ScriptDisplayModeValue {
  mode: ScriptDisplayMode;
  setMode: (mode: ScriptDisplayMode) => void;
}

const ScriptDisplayModeContext = createContext<ScriptDisplayModeValue | null>(null);

export function ScriptDisplayModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ScriptDisplayMode>('side-by-side');
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ScriptDisplayModeContext.Provider value={value}>{children}</ScriptDisplayModeContext.Provider>;
}

export function useScriptDisplayMode(): ScriptDisplayModeValue {
  const ctx = useContext(ScriptDisplayModeContext);
  if (!ctx) {
    throw new Error('useScriptDisplayMode must be used within a ScriptDisplayModeProvider');
  }
  return ctx;
}
