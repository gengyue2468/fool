import Tooltip from "../tooltip/tooltip";
import {
  MaterialSymbolsCheck,
  MaterialSymbolsThumbDownOutline,
  MaterialSymbolsThumbDown,
  MaterialSymbolsThumbUp,
  MaterialSymbolsThumbUpOutline,
  LucideCopy,
  LucideRefreshCw,
  styles,
} from "./toolbar.config";

interface AIToolbarProps {
  isStreaming: boolean;
  rawOutput: string;
  liked?: boolean;
  copied?: boolean;
  onLikedChange: (liked: boolean | undefined) => void;
  onCopiedChange: (copied: boolean) => void;
  onRegenerate: () => void;
}

export default function AIToolbar({
  isStreaming,
  rawOutput,
  liked,
  copied = false,
  onLikedChange,
  onCopiedChange,
  onRegenerate,
}: AIToolbarProps) {
  return (
    <div className="flex flex-row items-center mt-2 gap-1 -mx-1">
      <Tooltip content="复制">
        <button
          onClick={() => {
            navigator.clipboard.writeText(rawOutput);
            onCopiedChange(true);
            setTimeout(() => onCopiedChange(false), 2000);
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
              const newLiked = !liked ? true : undefined;
              onLikedChange(newLiked);
              await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: rawOutput,
                  liked: true,
                }),
              });
            }}
            className={styles.btn}
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
              const newLiked = liked === false ? undefined : false;
              onLikedChange(newLiked);
              await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: rawOutput,
                  liked: false,
                }),
              });
            }}
            className={styles.btn}
          >
            {liked === false ? (
              <MaterialSymbolsThumbDown className={styles.icon} />
            ) : (
              <MaterialSymbolsThumbDownOutline className={styles.icon} />
            )}
          </button>
        </Tooltip>
      )}

      {!isStreaming && (
        <Tooltip content="重新生成">
          <button
            type="button"
            onClick={onRegenerate}
            className={styles.btn}
          >
            <LucideRefreshCw className={styles.icon} />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
