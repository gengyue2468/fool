/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { textStyles } from "@/components/settings/texts/text.config";
import { useEffect, useState } from "react";

type FontType = "sans" | "serif";

interface FontOption {
  type: FontType;
  label: string;
  description: string;
  fontFamily: string;
}

const fontOptions: FontOption[] = [
  {
    type: "sans",
    label: "Sans Serif 无衬线字体",
    description: "Mona Sans + Noto Sans SC",
    fontFamily: "var(--font-mona-sans), var(--font-noto-sans-sc), sans-serif",
  },
  {
    type: "serif",
    label: "Serif 衬线字体",
    description: "Playfair Display + Noto Serif SC",
    fontFamily: "var(--font-playfair), var(--font-noto-serif-sc), serif",
  },
];

function FontSelector({
  option,
  isSelected,
  onSelect,
}: {
  option: FontOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex-1 border-2 p-4 rounded-xl transition-all cursor-pointer ${
        isSelected
          ? "bg-neutral-200 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border-neutral-100 dark:border-neutral-900"
      }`}
      style={{ fontFamily: option.fontFamily }}
    >
      <div className="text-2xl mb-2">Aa 字体</div>
      <div className="text-sm opacity-50">{option.label}</div>
      <div className="text-sm opacity-50 mt-1">{option.description}</div>
    </button>
  );
}

export default function FontsSettings() {
  const { fontType, setFontType } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div>
        <h3 className={textStyles.subheading}>字体</h3>
        <div className="flex gap-4">
          {fontOptions.map((option) => (
            <div
              key={option.type}
              className="flex-1 p-4 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 h-[104px]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className={textStyles.subheading}>字体</h3>
      <div className="flex gap-4">
        {fontOptions.map((option) => (
          <FontSelector
            key={option.type}
            option={option}
            isSelected={fontType === option.type}
            onSelect={() => setFontType(option.type)}
          />
        ))}
      </div>
    </div>
  );
}
