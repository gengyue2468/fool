import { useEffect } from "react";
import Tooltip from "../tooltip/tooltip";
import { LucideCopy, MaterialSymbolsCheck, styles } from "./toolbar.config";
import { useState } from "react";

interface UserToolbarProps {
  input: string;
}

export default function UserToolbar({ input }: UserToolbarProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  return (
    <div className="flex flex-row items-center mt-2 gap-1 -mx-1">
      <Tooltip content="复制">
        <button
          className={styles.btn}
          onClick={() => {
            navigator.clipboard.writeText(input);
            setCopied(true);
          }}
        >
          {copied ? (
            <MaterialSymbolsCheck className={styles.icon} />
          ) : (
            <LucideCopy className={styles.icon} />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
