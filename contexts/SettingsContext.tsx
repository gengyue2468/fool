"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useSyncExternalStore,
} from "react";
import type { ModelId, PromptTemplateId } from "@/config/ai.config";

type FontType = "serif" | "sans";

interface Settings {
  fontType: FontType;
  modelId: ModelId;
  promptTemplateId: PromptTemplateId;
  customPrompt: string;
}

interface SettingsContextType {
  fontType: FontType;
  setFontType: (font: FontType) => void;
  modelId: ModelId;
  setModelId: (model: ModelId) => void;
  promptTemplateId: PromptTemplateId;
  setPromptTemplateId: (template: PromptTemplateId) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "foolish-settings";

const defaultSettings: Settings = {
  fontType: "sans",
  modelId: "deepseek/deepseek-v3.2-exp",
  promptTemplateId: "silly",
  customPrompt: "",
};

let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

let cachedSettings: Settings | null = null;

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return defaultSettings;
}

function saveSettings(settings: Partial<Settings>) {
  try {
    const current = cachedSettings ?? loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedSettings = updated;
    emitChange();
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

function getSnapshot(): Settings {
  if (cachedSettings === null) {
    cachedSettings = loadSettings();
  }
  return cachedSettings;
}

function getServerSnapshot(): Settings {
  return defaultSettings;
}

function applyFontClass(font: FontType) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("font-serif", "font-sans");
    document.documentElement.classList.add(`font-${font}`);
  }
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (typeof document !== "undefined") {
    applyFontClass(settings.fontType);
  }

  const setFontType = useCallback((font: FontType) => {
    applyFontClass(font);
    saveSettings({ fontType: font });
  }, []);

  const setModelId = useCallback((model: ModelId) => {
    saveSettings({ modelId: model });
  }, []);

  const setPromptTemplateId = useCallback((template: PromptTemplateId) => {
    saveSettings({ promptTemplateId: template });
  }, []);

  const setCustomPrompt = useCallback((prompt: string) => {
    saveSettings({ customPrompt: prompt });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        fontType: settings.fontType,
        setFontType,
        modelId: settings.modelId,
        setModelId,
        promptTemplateId: settings.promptTemplateId,
        setPromptTemplateId,
        customPrompt: settings.customPrompt,
        setCustomPrompt,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
