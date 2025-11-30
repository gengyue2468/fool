import Image from "next/image";
import { SVGProps } from "react";
import Settings from "../settings/settings";

export default function Hero() {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 fixed top-0 w-full">
      <div className="flex flex-row items-center">
        <Image src="/static/laugh-cry.svg" alt="笑哭" width={24} height={24} />
      </div>
      <div className="flex flex-row items-center gap-4">
        <Settings>
          <button className="bg-neutral-200 dark:bg-neutral-800 rounded-full size-10 flex flex-row items-center justify-center gap-2">
            <LucideSlidersHorizontal className="size-5" />
          </button>
        </Settings>
      </div>
    </div>
  );
}

export function LucideSlidersHorizontal(props: SVGProps<SVGSVGElement>) {
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
        d="M10 5H3m9 14H3M14 3v4m2 10v4m5-9h-9m9 7h-5m5-14h-7m-6 5v4m0-2H3"
      />
    </svg>
  );
}
