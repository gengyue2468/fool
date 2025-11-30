"use client";

import { textStyles } from "@/components/settings/texts/text.config";
import ThemeToggler from "./themeToogler";

export default function ThemeSettings() {
  return (
    <div className="flex flex-row items-center justify-between">
      <div>
        <h3 className={textStyles.subheading}>主题</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          选择应用程序的外观主题
        </p>
      </div>
      <ThemeToggler />
    </div>
  );
}
