import Tooltip from "../tooltip/tooltip";
import { SVGProps } from "react";

interface ToolbarProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  lastQuestion: string;
  setLastQuestion: (value: string) => void;
  rawOutput: string;
  setRawOutput: (value: string) => void;
  send: (overrideQuestion?: string) => Promise<void>;
  setCopied: (value: boolean) => void;
  setLiked: (value: boolean) => void;
  copied: boolean;
  liked: boolean | undefined;
}

export default function Toolbar({
  input,
  isStreaming,
  lastQuestion,
  rawOutput,
  send,
  setInput,
  setCopied,
  setLiked,
  copied,
  liked,
}: ToolbarProps) {
  const styles = {
    icon: "size-4.5",
    btn: "opacity-80 hover:opacity-100 flex flex-row items-center gap-2 p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer outline-none",
  };
  return (
    <div className="flex flex-row items-center mt-2 gap-1 pl-12">
      <Tooltip content="复制">
        <button
          onClick={() => {
            navigator.clipboard.writeText(rawOutput);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={styles.btn}
        >
          {copied ? (
            <MaterialSymbolsCheck className={styles.icon} />
          ) : (
            <LucideCopy className={styles.icon} />
          )}
        </button>
      </Tooltip>
      {liked !== false && (
        <Tooltip content="喜欢">
          <button
            onClick={async () => {
              setLiked(true);
              await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: input,
                  liked: true,
                }),
              });
            }}
            className={`${styles.btn} 
          `}
          >
            {!liked ? (
              <MaterialSymbolsThumbUpOutline className={styles.icon} />
            ) : (
              <MaterialSymbolsThumbUp className={styles.icon} />
            )}
          </button>
        </Tooltip>
      )}
      {liked !== true && (
        <Tooltip content="不喜欢">
          <button
            onClick={async () => {
              setLiked(false);
              await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: input,
                  liked: false,
                }),
              });
            }}
            className={`${styles.btn}`}
          >
            {liked === false ? (
              <MaterialSymbolsThumbDown className={`${styles.icon}`} />
            ) : (
              <MaterialSymbolsThumbDownOutline className={styles.icon} />
            )}
          </button>
        </Tooltip>
      )}

      {!isStreaming && lastQuestion && (
        <Tooltip content="重新生成">
          <button
            type="button"
            onClick={() => {
              setInput(lastQuestion);
              send(lastQuestion);
            }}
            className={styles.btn}
          >
            <LucideRefreshCw className={styles.icon} />
          </button>
        </Tooltip>
      )}
    </div>
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

export function MaterialSymbolsThumbUpOutline(props: SVGProps<SVGSVGElement>) {
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
        d="M18 21H7V8l7-7l1.25 1.25q.175.175.288.475t.112.575v.35L14.55 8H21q.8 0 1.4.6T23 10v2q0 .175-.05.375t-.1.375l-3 7.05q-.225.5-.75.85T18 21m-9-2h9l3-7v-2h-9l1.35-5.5L9 8.85zM9 8.85V19zM7 8v2H4v9h3v2H2V8z"
      />
    </svg>
  );
}

export function MaterialSymbolsThumbUp(props: SVGProps<SVGSVGElement>) {
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
        d="M18 21H8V8l7-7l1.25 1.25q.175.175.288.475t.112.575v.35L15.55 8H21q.8 0 1.4.6T23 10v2q0 .175-.037.375t-.113.375l-3 7.05q-.225.5-.75.85T18 21M6 8v13H2V8z"
      />
    </svg>
  );
}

export function MaterialSymbolsThumbDownOutline(
  props: SVGProps<SVGSVGElement>
) {
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
        d="M6 3h11v13l-7 7l-1.25-1.25q-.175-.175-.288-.475T8.35 20.7v-.35L9.45 16H3q-.8 0-1.4-.6T1 14v-2q0-.175.05-.375t.1-.375l3-7.05q.225-.5.75-.85T6 3m9 2H6l-3 7v2h9l-1.35 5.5L15 15.15zm0 10.15V5zm2 .85v-2h3V5h-3V3h5v13z"
      />
    </svg>
  );
}

export function MaterialSymbolsThumbDown(props: SVGProps<SVGSVGElement>) {
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
        d="M6 3h10v13l-7 7l-1.25-1.25q-.175-.175-.288-.475T7.35 20.7v-.35L8.45 16H3q-.8 0-1.4-.6T1 14v-2q0-.175.037-.375t.113-.375l3-7.05q.225-.5.75-.85T6 3m12 13V3h4v13z"
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

export function LucideRefreshCw(props: SVGProps<SVGSVGElement>) {
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
        <path d="M3 12a9 9 0 0 1 9-9a9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5m5 4a9 9 0 0 1-9 9a9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </g>
    </svg>
  );
}
