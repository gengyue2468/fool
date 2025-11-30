"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { availableModels, type ModelId } from "@/config/ai.config";
import { SVGProps } from "react";

export default function ModelSettings() {
  const { modelId, setModelId } = useSettings();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">选择模型</label>
        <div className="grid gap-2 -mx-3 w-[calc(100%+1.5rem)] md:translate-x-0 md:w-full">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => setModelId(model.id as ModelId)}
              className={`flex items-center gap-2 md:gap-4 p-3 rounded-xl text-left transition-colors ${
                modelId === model.id
                  ? "bg-neutral-200 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                  : "hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base">{model.name}</div>
                <div className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {model.description}
                </div>
              </div>
              {modelId === model.id && (
                <div className="rounded-full bg-neutral-300 dark:bg-neutral-700 size-6 md:size-8 flex items-center justify-center shrink-0">
                    <MaterialSymbolsCheck className="size-4 md:size-5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MaterialSymbolsCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>
  )
}
