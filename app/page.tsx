/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { processMarkdownContent } from "@/config/markdown.config";
import "katex/dist/katex.min.css";
import "./highlight.css";
import Input from "@/components/input/input";
import Greeting from "@/components/greeting/greeting";
import AIMessage from "@/components/message/ai";
import UserMessage from "@/components/message/user";
import { motion } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  liked?: boolean;
  copied?: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [rawOutput, setRawOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { modelId, promptTemplateId, customPrompt } = useSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    setRawOutput("");
  }, []);

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

      setRawOutput("");
      setIsStreaming(true);

      const userMessage: Message = { role: "user", content: question };
      const updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedHistory,
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
        const finalText = final ? text + final : text;

        if (finalText) {
          const assistantMessage: Message = {
            role: "assistant",
            content: finalText,
            liked: undefined,
            copied: false,
          };
          setConversationHistory([...updatedHistory, assistantMessage]);
          setRawOutput("");
          if (!overrideQuestion) {
            setInput("");
          }
        }
      } catch (error: Error | any) {
        if (error?.name === "AbortError") {
          console.log("请求已被用户暂停");
          if (rawOutput && updatedHistory.length > 0) {
            const lastMessage = updatedHistory[updatedHistory.length - 1];
            if (lastMessage.role === "user") {
              const assistantMessage: Message = {
                role: "assistant",
                content: rawOutput,
                liked: undefined,
                copied: false,
              };
              setConversationHistory([...updatedHistory, assistantMessage]);
              setRawOutput("");
            }
          } else {
            setConversationHistory(conversationHistory);
          }
        } else {
          console.error("Error:", error);
          setConversationHistory(conversationHistory);
          setRawOutput("发生错误，请重试");
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsStreaming(false);
      }
    },
    [input, modelId, promptTemplateId, customPrompt, conversationHistory]
  );
  const pause = useCallback(() => {
    if (!isStreaming) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (rawOutput && conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.role === "user") {
        const assistantMessage: Message = {
          role: "assistant",
          content: rawOutput,
          liked: undefined,
          copied: false,
        };
        setConversationHistory([...conversationHistory, assistantMessage]);
        setRawOutput("");
      }
    }
    setIsStreaming(false);
  }, [isStreaming, rawOutput, conversationHistory]);

  // 自动滚动到最新消息（优化版）
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current) {
      // 检查用户是否手动向上滚动
      // 尝试多个可能的滚动容器
      const possibleContainers = [
        window,
        document.documentElement,
        document.body,
        messagesEndRef.current.closest('[class*="overflow"]') as HTMLElement,
      ].filter(Boolean) as (Window | HTMLElement)[];
      
      let shouldScroll = force;
      
      if (!force) {
        for (const container of possibleContainers) {
          if (container === window) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
            if (isNearBottom) {
              shouldScroll = true;
              break;
            }
          } else if (container instanceof HTMLElement) {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
            if (isNearBottom) {
              shouldScroll = true;
              break;
            }
          }
        }
      }
      
      if (shouldScroll) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  // 只在关键时机滚动：新消息添加
  const prevHistoryLengthRef = useRef(0);
  useEffect(() => {
    // 只在消息数量增加时滚动（新消息添加）
    if (conversationHistory.length > prevHistoryLengthRef.current) {
      // 延迟执行，等待DOM更新完成（特别是数学公式渲染）
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 200);
      prevHistoryLengthRef.current = conversationHistory.length;
      return () => clearTimeout(timer);
    }
    prevHistoryLengthRef.current = conversationHistory.length;
  }, [conversationHistory.length, scrollToBottom]);

  // 流式输出时的滚动（使用节流，减少滚动频率）
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef(0);
  
  useEffect(() => {
    if (isStreaming && rawOutput) {
      const now = Date.now();
      // 节流：至少间隔800ms才滚动一次，减少抖动
      if (now - lastScrollTimeRef.current > 800) {
        // 清除之前的定时器
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        // 延迟滚动，避免频繁触发
        scrollTimerRef.current = setTimeout(() => {
          scrollToBottom();
          lastScrollTimeRef.current = Date.now();
        }, 300);
      }
    } else if (!isStreaming && scrollTimerRef.current) {
      // 流式输出结束时，清除定时器并延迟滚动（等待数学公式渲染）
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
      setTimeout(() => {
        scrollToBottom(true);
      }, 500);
    }
    
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [isStreaming, rawOutput, scrollToBottom]);

  // 更新消息状态
  const updateMessage = useCallback((index: number, updates: Partial<Message>) => {
    setConversationHistory((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }, []);

  const output = processMarkdownContent(rawOutput);

  // 获取指定AI消息对应的用户消息（用于重新生成）
  const getUserMessageForAI = useCallback((aiIndex: number) => {
    for (let i = aiIndex - 1; i >= 0; i--) {
      if (conversationHistory[i].role === "user") {
        return conversationHistory[i].content;
      }
    }
    return "";
  }, [conversationHistory]);

  return (
    <div className="flex flex-col mx-auto max-w-3xl justify-center items-center w-full min-h-full px-4 md:px-0">
      {conversationHistory.length === 0 && <Greeting />}
      <div
        className={
          conversationHistory.length === 0
            ? "w-full max-w-3xl mx-auto"
            : "fixed bottom-0 left-0 right-0 w-full z-10"
        }
      >
        <motion.div
          layout
          layoutId="input-container"
          initial={false}
          transition={{
            layout: {
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.6,
            },
          }}
          className="max-w-3xl mx-auto"
        >
          <div className="px-3 sm:px-6 bg-gradient-to-t from-neutral-100 to-transparent dark:from-neutral-900 dark:to-transparent pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex flex-row items-center gap-2 w-full relative bg-neutral-100 dark:bg-neutral-900 rounded-full"
          >
            <Input
              input={input}
              setInput={setInput}
              isStreaming={isStreaming}
              onPause={pause}
            />
          </form>
          <p className="text-center text-sm opacity-50 py-1.5">
            弱智也有可能会犯错，请核查重要信息
          </p>
          </div>
        </motion.div>
      </div>
      <div className={`max-w-3xl px-3 sm:px-6 mx-auto w-full ${conversationHistory.length > 0 ? 'py-8 pb-40' : 'py-16'}`}>

        {conversationHistory.length > 0 && (
          <div className="mt-8 space-y-6 pb-4 -mx-0 md:-mx-2">
            {conversationHistory.map((message, index) => {
              if (message.role === "user") {
                return (
                  <div key={index}>
                    <UserMessage
                      content={message.content}
                      input={message.content}
                    />
                  </div>
                );
              } else {
                const processedContent = processMarkdownContent(
                  message.content
                );
                return (
                  <div key={index}>
                    <AIMessage
                      content={processedContent}
                      isStreaming={false}
                      rawOutput={message.content}
                      liked={message.liked}
                      copied={message.copied}
                      onLikedChange={(liked) => updateMessage(index, { liked })}
                      onCopiedChange={(copied) => updateMessage(index, { copied })}
                      onRegenerate={() => {
                        const userMsg = getUserMessageForAI(index);
                        if (userMsg) {
                          setInput(userMsg);
                          send(userMsg);
                        }
                      }}
                    />
                  </div>
                );
              }
            })}
            {conversationHistory.length > 0 &&
              conversationHistory[conversationHistory.length - 1].role ===
              "user" &&
              (isStreaming || rawOutput) && (
                <div>
                  <AIMessage
                    content={output}
                    isStreaming={isStreaming}
                    rawOutput={rawOutput}
                    liked={undefined}
                    copied={false}
                    onLikedChange={() => { }}
                    onCopiedChange={() => { }}
                    onRegenerate={() => { }}
                  />
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        )}
        {(isStreaming || rawOutput) && conversationHistory.length === 0 && (
          <div className="mt-4">
            <AIMessage
              content={output}
              isStreaming={isStreaming}
              rawOutput={rawOutput}
              liked={undefined}
              copied={false}
              onLikedChange={() => { }}
              onCopiedChange={() => { }}
              onRegenerate={() => { }}
            />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
