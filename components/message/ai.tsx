import { SVGProps } from "react";
import ReactMarkdown from "react-markdown";
import { remarkPlugins, rehypePlugins } from "@/config/markdown.config";
import Loader from "../loader/loader";
import AIToolbar from "../toolbar/ai";

interface AIMessageProps {
    content: string;
    isStreaming: boolean;
    rawOutput: string;
    liked?: boolean;
    copied?: boolean;
    onLikedChange: (liked: boolean | undefined) => void;
    onCopiedChange: (copied: boolean) => void;
    onRegenerate: () => void;
}

export default function AIMessage({
    content,
    isStreaming,
    rawOutput,
    liked,
    copied = false,
    onLikedChange,
    onCopiedChange,
    onRegenerate,
}: AIMessageProps) {
    return (
        <div className="w-full min-h-12 h-fit">
            <div className="w-full">
                <div 
                    className="float-left rounded-full size-10 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex justify-center items-center mr-3 mt-1 flex-shrink-0 z-10"
                    style={{
                        shapeOutside: 'circle(50%)',
                    }}
                >
                    <SiAiFill className="size-6" />
                </div>
                <div className="pt-4 prose prose-base prose-neutral dark:prose-invert text-black dark:text-white prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-pre:bg-neutral-200 dark:prose-pre:bg-neutral-800 prose-pre:text-black dark:prose-pre:text-white prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-base overflow-x-auto w-full max-w-none">
                    <ReactMarkdown
                        remarkPlugins={remarkPlugins}
                        rehypePlugins={rehypePlugins}
                        components={{
                            p: ({ children, ...props }) => (
                                <p 
                                    {...props}
                                    className="whitespace-pre-wrap break-words leading-relaxed"
                                    style={{ 
                                        marginTop: '0.5em',
                                        marginBottom: '0.5em',
                                    }}
                                >
                                    {children}
                                </p>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                    <div className="mt-1 pl-1">{isStreaming && <Loader />}</div>
                </div>
                <div className="mt-1 w-full clear-left">
                    <AIToolbar
                        isStreaming={isStreaming}
                        rawOutput={rawOutput}
                        liked={liked}
                        copied={copied}
                        onLikedChange={onLikedChange}
                        onCopiedChange={onCopiedChange}
                        onRegenerate={onRegenerate}
                    />
                </div>
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
