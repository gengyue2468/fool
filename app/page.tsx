/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef } from "react";
import { SVGProps } from "react";
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
import Toolbar from "@/components/toolbar/toolbar";
import Greeting from "@/components/greeting/greeting";

export default function Home() {
  const [input, setInput] = useState("");
  const [rawOutput, setRawOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { modelId, promptTemplateId, customPrompt } = useSettings();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | undefined>(undefined);

  const send = useCallback(
    async (overrideQuestion?: string) => {
      const question = (overrideQuestion ?? input).trim();
      if (!question) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLastQuestion(question);
      setRawOutput("");
      setIsStreaming(true);
      setLiked(undefined);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: question }],
            model: modelId,
            promptTemplate: promptTemplateId,
            customPrompt:
              promptTemplateId === "custom" ? customPrompt : undefined,
          }),
          signal: controller.signal,
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
      } catch (error: Error | any) {
        if (error?.name === "AbortError") {
          console.log("请求已被用户暂停");
        } else {
          console.error("Error:", error);
          setRawOutput("发生错误，请重试");
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsStreaming(false);
      }
    },
    [input, modelId, promptTemplateId, customPrompt]
  );
  const pause = useCallback(() => {
    if (!isStreaming) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, [isStreaming]);

  const output = processMarkdownContent(rawOutput);

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="max-w-3xl px-6 py-16 mx-auto w-full">
       <Greeting />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex flex-row items-center gap-2 w-full relative"
        >
          <Input
            input={input}
            setInput={setInput}
            isStreaming={isStreaming}
            onPause={pause}
          />
        </form>
        <p className="text-center text-sm opacity-50 mt-4">
          弱智也有可能会犯错，请核查重要信息
        </p>
        {(isStreaming || rawOutput) && (
          <>
            <div className="mt-6 flex flex-row items-start gap-4 w-full min-h-12">
              <div className="mt-2 shrink-0 rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center">
                <SiAiFill className="size-6" />
              </div>
              <div className="pt-2 flex-1 prose prose-neutral dark:prose-invert text-black dark:text-white prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-pre:bg-neutral-200 dark:prose-pre:bg-neutral-800  prose-pre:rounded-xl overflow-x-auto">
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                >
                  {output}
                </ReactMarkdown>
                {isStreaming && <Loader />}
              </div>
            </div>
            <Toolbar
              input={input}
              isStreaming={isStreaming}
              lastQuestion={lastQuestion}
              rawOutput={rawOutput}
              send={send}
              setInput={setInput}
              setCopied={setCopied}
              setLiked={setLiked}
              copied={copied}
              liked={liked}
              setLastQuestion={setLastQuestion}
              setRawOutput={setRawOutput}
            />
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
