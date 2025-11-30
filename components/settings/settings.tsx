"use client";

import { Dialog } from "radix-ui";
import React, { SVGProps, useState } from "react";
import { settingList } from "./settings.config";
import { motion, AnimatePresence } from "motion/react";

interface SettingsProps {
  children?: React.ReactNode;
}

export default function Settings({ children }: SettingsProps) {
  const [activeId, setActiveId] = useState<string>("appearance");

  const activeSetting = settingList.find((setting) => setting.id === activeId);
  const ActiveComponent = activeSetting?.component;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed left-1/2 -translate-x-1/2 z-50 top-1/2 -translate-y-1/2 rounded-3xl h-[65vh] max-h-[90vh] max-w-4xl w-[calc(100%-2rem)] md:w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden flex flex-col md:flex-row"
          >
            <div className="bg-neutral-200 dark:bg-neutral-800 px-4 py-2 md:py-6 w-full md:w-64 shrink-0 h-auto md:h-full flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible overflow-y-visible md:overflow-y-auto">
              <div className="flex flex-row md:flex-col gap-0.5 w-full md:w-auto min-w-full md:min-w-0">
                {settingList.map((setting) => (
                  <button
                    key={setting.id}
                    onClick={() => setActiveId(setting.id)}
                    className={`flex flex-row items-center gap-2 px-4 py-2.5 rounded-xl w-auto md:w-full text-left cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap md:whitespace-normal ${
                      activeId === setting.id
                        ? "bg-neutral-300 dark:bg-neutral-700 font-medium"
                        : ""
                    }`}
                  >
                    <setting.icon className="size-5 shrink-0" />
                    <span className="hidden sm:inline">{setting.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 px-6 md:px-8 py-4 md:py-6 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {activeSetting && (
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="h-full"
                  >
                    <Dialog.Title className="text-lg font-semibold mb-2">
                      {activeSetting.title}
                    </Dialog.Title>
                    <Dialog.Description className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                      {activeSetting.description}
                    </Dialog.Description>
                    {ActiveComponent && <ActiveComponent />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Dialog.Close asChild>
              <button className="absolute top-2 right-2 md:top-4 md:right-4 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-full size-8 md:size-10 flex items-center justify-center cursor-pointer transition-colors z-10">
                <MaterialSymbolsClose className="size-4 md:size-5" />
              </button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function MaterialSymbolsClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
      />
    </svg>
  );
}
