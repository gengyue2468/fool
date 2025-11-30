"use client";

import { useState, useCallback } from "react";
import { SVGProps } from "react";
import Image from "next/image";
import Loader from "@/components/loader/loader";
import { useSettings } from "@/contexts/SettingsContext";
import ReactMarkdown from "react-markdown";
import {
  remarkPlugins,
  rehypePlugins,
  processMarkdownContent,
} from "@/config/markdown.config";
import "katex/dist/katex.min.css";
import "./highlight.css";
import Input from "@/components/input/input";
import Tooltip from "@/components/tooltip/tooltip";

export default function Home() {
  const [input, setInput] = useState("");
  const [rawOutput, setRawOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const { modelId, promptTemplateId, customPrompt } = useSettings();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const send = useCallback(async () => {
    setRawOutput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          model: modelId,
          promptTemplate: promptTemplateId,
          customPrompt:
            promptTemplateId === "custom" ? customPrompt : undefined,
        }),
      });

      if (!response.ok) throw new Error("请求失败");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应");

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setRawOutput(text);
      }

      const final = decoder.decode();
      if (final) setRawOutput(text + final);
    } catch (error) {
      console.error("Error:", error);
      setRawOutput("发生错误，请重试");
    } finally {
      setIsStreaming(false);
    }
  }, [input, modelId, promptTemplateId, customPrompt]);

  const output = processMarkdownContent(rawOutput);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-3xl px-6 py-16 mx-auto w-full">
        <h1 className="text-center mb-8 text-3xl font-semibold">
          你今天看起来很聪明！
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex flex-row items-center gap-2 w-full relative"
        >
          <Input input={input} setInput={setInput} isStreaming={isStreaming} />
        </form>
        <p className="text-center text-sm opacity-50 mt-4">
          弱智也有可能会犯错，请核查重要信息
        </p>
        {output && (
          <>
            <div className="mt-8 flex flex-row items-start gap-4 w-full min-h-12">
              <div className="shrink-0 rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center">
                <SiAiFill className="size-6" />
              </div>
              <div className="flex-1 prose prose-neutral dark:prose-invert text-black dark:text-white prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-pre:bg-neutral-200 dark:prose-pre:bg-neutral-800  prose-pre:rounded-3xl overflow-x-auto">
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                >
                  {output}
                </ReactMarkdown>
                {isStreaming && <Loader />}
              </div>
            </div>
            <div className="flex flex-row items-center mt-2 gap-1 pl-12">
              <Tooltip content="复制">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rawOutput);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="opacity-50 hover:opacity-100 flex flex-row items-center gap-2 p-2 rounded-xl  hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer outline-none"
                >
                  {copied ? (
                    <MaterialSymbolsCheck className="size-4" />
                  ) : (
                    <LucideCopy className="size-4" />
                  )}
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function SiAiFill(props: SVGProps<SVGSVGElement>) {
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
        d="m9.96 9.137l.886-3.099c.332-1.16 1.976-1.16 2.308 0l.885 3.099a1.2 1.2 0 0 0 .824.824l3.099.885c1.16.332 1.16 1.976 0 2.308l-3.099.885a1.2 1.2 0 0 0-.824.824l-.885 3.099c-.332 1.16-1.976 1.16-2.308 0l-.885-3.099a1.2 1.2 0 0 0-.824-.824l-3.099-.885c-1.16-.332-1.16-1.976 0-2.308l3.099-.885a1.2 1.2 0 0 0 .824-.824m8.143 7.37c.289-.843 1.504-.844 1.792 0l.026.087l.296 1.188l1.188.297c.96.24.96 1.602 0 1.842l-1.188.297l-.296 1.188c-.24.959-1.603.959-1.843 0l-.297-1.188l-1.188-.297c-.96-.24-.96-1.603 0-1.842l1.188-.297l.297-1.188zm.896 2.29a1 1 0 0 1-.203.203a1 1 0 0 1 .203.203a1 1 0 0 1 .203-.203a1 1 0 0 1-.203-.204M4.104 2.506c.298-.871 1.585-.842 1.818.087l.296 1.188l1.188.297c.96.24.96 1.602 0 1.842l-1.188.297l-.296 1.188c-.24.959-1.603.959-1.843 0l-.297-1.188l-1.188-.297c-.96-.24-.96-1.603 0-1.842l1.188-.297l.297-1.188zM5 4.797a1 1 0 0 1-.203.202A1 1 0 0 1 5 5.203a1 1 0 0 1 .203-.204A1 1 0 0 1 5 4.796"
      />
    </svg>
  );
}

export function LucideCopy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </g>
    </svg>
  );
}

export function LucideThumbsUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 10v12m8-16.12L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88"
      />
    </svg>
  );
}

export function LucideThumbsDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 14V2M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88"
      />
    </svg>
  );
}

export function MaterialSymbolsCheck(props: SVGProps<SVGSVGElement>) {
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
        d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"
      />
    </svg>
  );
}
