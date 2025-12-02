import { SVGProps } from "react";
import ReactMarkdown from "react-markdown";
import { remarkPlugins, rehypePlugins } from "@/config/markdown.config";
import UserToolbar from "../toolbar/user";
import Image from "next/image";

interface UserMessageProps {
    content: string;
    input: string;
}

export default function UserMessage({ content, input }: UserMessageProps) {
    return (
        <div className="flex flex-row items-start gap-2 sm:gap-4 w-full min-h-12 justify-end">
            <div className="flex flex-col items-end justify-start max-w-[85%] sm:max-w-[80%]">
                <div className="px-3 sm:px-4 py-1.5 rounded-2xl text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 prose prose-sm sm:prose-base prose-neutral dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-headings:font-semibold prose-h1:text-xl overflow-x-auto">
                    {content}
                </div>
                <div className="flex justify-end mt-1">
                    <UserToolbar input={input} />
                </div>
            </div>
            <div className="shrink-0 rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center">
                <Image
                    src="/static/laugh-cry.svg"
                    width={12}
                    height={12}
                    alt="User"
                    className="size-6"
                />
            </div>
        </div>
    );
}

export function TdesignUserCircleFilled(props: SVGProps<SVGSVGElement>) {
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
                d="M23 12c0 3.345-1.493 6.342-3.85 8.36A10.96 10.96 0 0 1 12 23c-2.73 0-5.227-.994-7.15-2.64A10.98 10.98 0 0 1 1 12C1 5.925 5.925 1 12 1s11 4.925 11 11m-7-3.5a4 4 0 1 0-8 0a4 4 0 0 0 8 0m2.5 9.725V18a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4v.225q.31.323.65.615A8.96 8.96 0 0 0 12 21a8.96 8.96 0 0 0 6.5-2.775"
            />
        </svg>
    );
}
