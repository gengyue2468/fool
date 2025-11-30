/* eslint-disable react-hooks/set-state-in-effect */
import Image from "next/image";
import {
  SVGProps,
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
} from "react";
import { motion } from "motion/react";

interface InputProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
}

export default function Input({ input, setInput, isStreaming }: InputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useLayoutEffect(() => {
    setHasAnimated(true); // eslint-disable-line
  }, []);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
    
    const lines = input.split("\n");
    const lineCount = lines.length;
    
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    
    const shouldBeMultiline = lineCount > 1 || scrollHeight > lineHeight + 32;

    if (input.trim() === "" && lineCount <= 1) {
      setIsMultiline(false);
      textarea.style.height = "";
      textarea.rows = 1;
    } else if (shouldBeMultiline) {
      setIsMultiline(true);
      const minHeight = lineCount * lineHeight;
      const actualHeight = Math.max(scrollHeight, minHeight);
      textarea.style.height = `${actualHeight}px`;
      textarea.rows = Math.max(2, lineCount);
    } else if (isMultiline) {
      const minHeight = lineCount * lineHeight;
      const actualHeight = Math.max(scrollHeight, minHeight);
      textarea.style.height = `${actualHeight}px`;
      textarea.rows = Math.max(2, lineCount);
    } else {
      textarea.style.height = "";
      textarea.rows = 1;
    }
  }, [input, isMultiline]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [setInput]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isStreaming) {
          e.currentTarget.form?.requestSubmit();
        }
      }
    },
    [input, isStreaming]
  );

  return (
    <motion.div
      initial={{ borderRadius: 28 }}
      animate={{
        borderRadius: isMultiline ? 24 : 28,
      }}
      transition={{
        borderRadius: hasAnimated
          ? { type: "spring", stiffness: 300, damping: 26 }
          : { duration: 0 },
      }}
      className={`group bg-neutral-200/50 dark:bg-neutral-800 relative focus-within:ring-2 focus-within:ring-neutral-200 dark:focus-within:ring-neutral-800 transition-colors focus-within:bg-neutral-100 dark:focus-within:bg-neutral-800/50 overflow-hidden w-full ${
        isMultiline ? "flex flex-col p-3 pb-14" : "h-14"
      }`}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="请让 AI 觉得你不是人类"
        className={`bg-transparent resize-none max-h-64 flex-1 focus:outline-none focus-within:outline-none transition-all duration-200 w-full ${
          isMultiline ? "px-1" : "h-14 py-4 pl-14 pr-14"
        }`}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div
        className={`flex items-center justify-between ${
          isMultiline ? "absolute bottom-2 left-2 right-2" : ""
        }`}
      >
        <div
          className={`rounded-full size-10 flex justify-center items-center ${
            isMultiline ? "" : "absolute -translate-y-1/2 top-1/2 left-2"
          }`}
        >
          <Image
            src="/static/laugh-cry.svg"
            alt="笑哭"
            width={24}
            height={24}
          />
        </div>
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className={`rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed ${
            isMultiline ? "" : "absolute -translate-y-1/2 top-1/2 right-2"
          }`}
        >
          <MingcuteArrowUpLine className="size-6" />
        </button>
      </div>
    </motion.div>
  );
}

export function MingcuteArrowUpLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none">
        <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          fill="currentColor"
          d="M12.707 3.636a1 1 0 0 0-1.414 0L5.636 9.293a1 1 0 1 0 1.414 1.414L11 6.757V20a1 1 0 1 0 2 0V6.757l3.95 3.95a1 1 0 0 0 1.414-1.414z"
        />
      </g>
    </svg>
  );
}
