"use client";

import FontsSettings from "./fonts/fonts";
import ThemeSettings from "./theme/theme";

export default function AppearanceSettings() {
  return (
    <div className="space-y-8">
      <ThemeSettings />
      <FontsSettings />
    </div>
  );
}
