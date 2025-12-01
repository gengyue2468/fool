/* eslint-disable react-hooks/set-state-in-effect */
import Image from "next/image";
import {
  SVGProps,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { motion } from "motion/react";
import TextareaAutosize, {
  TextareaHeightChangeMeta,
} from "react-textarea-autosize";

const LINE_HEIGHT = 24;
const SINGLE_LINE_HEIGHT = 56; // px (py-4 top/bottom + line height)
const MAX_EDITOR_HEIGHT = 256; // px (max-h-64)

interface InputProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  onPause?: () => void;
}

export default function Input({
  input,
  setInput,
  isStreaming,
  onPause,
}: InputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useLayoutEffect(() => {
    setHasAnimated(true);
  }, []);

  useEffect(() => {
    if (!input) {
      setIsMultiline(false);
    }
  }, [input]);

  const handleHeightChange = useCallback(
    (height: number, meta: TextareaHeightChangeMeta) => {
      const textarea = textareaRef.current;
      const computed = textarea ? window.getComputedStyle(textarea) : null;
      const paddingTop = computed ? parseFloat(computed.paddingTop) || 0 : 0;
      const paddingBottom = computed
        ? parseFloat(computed.paddingBottom) || 0
        : 0;
      const baseLineHeight = computed
        ? parseFloat(computed.lineHeight) || LINE_HEIGHT
        : LINE_HEIGHT;
      const rowHeight = meta?.rowHeight || baseLineHeight;
      const scrollContentHeight = textarea
        ? Math.max(0, textarea.scrollHeight - paddingTop - paddingBottom)
        : Math.max(0, height - paddingTop - paddingBottom);
      const measuredLines = Math.max(
        1,
        Math.round(scrollContentHeight / rowHeight)
      );

      const value = textarea?.value ?? input;
      const normalized = value.replace(/\r/g, "").replace(/\u00A0/g, " ");
      const explicitLineCount =
        normalized === "" ? 1 : normalized.split("\n").length;
      const stripped = normalized.replace(/[\s\u00A0]/g, "");
      const hasContent = stripped.length > 0;
      const hasLineBreak = explicitLineCount > 1;
      const newlineOnly = hasLineBreak && !hasContent;

      let derivedLines = measuredLines;
      if (!hasContent) {
        derivedLines = 1;
      } else if (newlineOnly) {
        derivedLines = explicitLineCount;
      } else if (hasLineBreak) {
        derivedLines = Math.max(explicitLineCount, measuredLines);
      }

      const safeHeight = Math.max(height, SINGLE_LINE_HEIGHT);
      const exceededSingleLine = safeHeight > SINGLE_LINE_HEIGHT + 1;
      const reachedMaxHeight = safeHeight >= MAX_EDITOR_HEIGHT - 1;
      const nextMultiline =
        derivedLines > 1 || exceededSingleLine || reachedMaxHeight;
      setIsMultiline((prev) => (prev === nextMultiline ? prev : nextMultiline));
    },
    [input]
  );

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
          e.currentTarget.closest("form")?.requestSubmit();
        }
      }
    },
    [input, isStreaming]
  );

  return (
    <motion.div
      layout
      initial={{ borderRadius: 28 }}
      animate={{ borderRadius: isMultiline ? 24 : 28 }}
      transition={{
        layout: hasAnimated
          ? { duration: 0.2, ease: "easeInOut" }
          : { duration: 0 },
        borderRadius: hasAnimated
          ? { type: "spring", stiffness: 260, damping: 30 }
          : { duration: 0 },
      }}
      className={`group bg-neutral-200/50 dark:bg-neutral-800 relative focus-within:ring-2 focus-within:ring-neutral-200 dark:focus-within:ring-neutral-800 transition-all duration-200 focus-within:bg-neutral-100 dark:focus-within:bg-neutral-800/50 w-full ${
        isMultiline ? "p-3 pb-14" : "h-14"
      }`}
    >
      <TextareaAutosize
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onHeightChange={handleHeightChange}
        onKeyDown={handleKeyDown}
        placeholder="请让 AI 觉得你不是人类"
        minRows={1}
        maxRows={Math.max(
          1,
          Math.floor((MAX_EDITOR_HEIGHT - 16) / LINE_HEIGHT)
        )}
        cacheMeasurements
        className={`min-h-14 bg-transparent focus:outline-none w-full whitespace-pre-wrap wrap-break-word transition-[height] duration-200 text-base empty:placeholder:text-neutral-500 resize-none ${
          isMultiline
            ? "px-1 py-1 leading-6 max-h-64 overflow-y-auto"
            : "pl-14 pr-14 py-4 leading-6 max-h-14"
        }`}
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
        {isStreaming ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPause?.();
            }}
            className={`rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center hover:opacity-80 transition-opacity ${
              isMultiline ? "" : "absolute -translate-y-1/2 top-1/2 right-2"
            }`}
          >
            <MaterialSymbolsStop className="size-6" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={`rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed ${
              isMultiline ? "" : "absolute -translate-y-1/2 top-1/2 right-2"
            }`}
          >
            <MingcuteArrowUpLine className="size-6" />
          </button>
        )}
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

export function MaterialSymbolsStop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M6 18V6h12v12z" />
    </svg>
  );
}
