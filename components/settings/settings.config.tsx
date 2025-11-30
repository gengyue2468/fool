import { SVGProps } from "react";
import AppearanceSettings from "./appearance/appearance";
import ModelSettings from "./model/model";
import PromptSettings from "./prompt/prompt";

export const settingList = [
  {
    id: "appearance",
    icon: MaterialSymbolsLooks,
    name: "外观",
    title: "外观",
    description: "自定义应用的外观和显示效果。",
    component: AppearanceSettings,
  },
  {
    id: "model",
    icon: SiAiFill,
    name: "AI 模型选择",
    title: "AI 模型选择",
    description: "选择用于生成回答的 AI 模型。",
    component: ModelSettings,
  },
  {
    id: "prompt",
    icon: FluentPrompt16Filled,
    name: "模型 Prompt 设定",
    title: "模型 Prompt 设定",
    description: "自定义 AI 的系统提示词，让回答更加弱智！",
    component: PromptSettings,
  },
];

export function MaterialSymbolsLooks(props: SVGProps<SVGSVGElement>) {
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
        d="M1 17q0-2.275.863-4.275t2.362-3.5t3.5-2.363T12 6t4.275.863t3.5 2.362t2.363 3.5T23 17h-2q0-3.725-2.637-6.363T12 8t-6.362 2.638T3 17zm4 0q0-2.9 2.05-4.95T12 10t4.95 2.05T19 17h-2q0-2.075-1.463-3.537T12 12t-3.537 1.463T7 17z"
      />
    </svg>
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

export function FluentPrompt16Filled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        d="M14 1.5a.5.5 0 0 0-1 0V2h-.5a.5.5 0 0 0 0 1h.5v.5a.5.5 0 0 0 1 0V3h.5a.5.5 0 0 0 0-1H14zm-9.588.426C4.51 1.453 4.924 1 5.5 1s.99.453 1.089.926a3.2 3.2 0 0 0 .864 1.62a3.2 3.2 0 0 0 1.62.865c.473.098.926.512.926 1.09c0 .576-.453.99-.926 1.088a3.2 3.2 0 0 0-1.62.865a3.2 3.2 0 0 0-.864 1.62c-.098.472-.512.926-1.09.926c-.576 0-.99-.453-1.088-.926a3.2 3.2 0 0 0-.865-1.621a3.2 3.2 0 0 0-1.62-.864c-.472-.098-.925-.511-.926-1.087c-.001-.578.453-.993.926-1.091a3.2 3.2 0 0 0 1.62-.864a3.2 3.2 0 0 0 .865-1.62M11 5.5q0-.264-.06-.5h.56A2.5 2.5 0 0 1 14 7.5v4a2.5 2.5 0 0 1-2.5 2.5h-4A2.5 2.5 0 0 1 5 11.5v-.56a2.1 2.1 0 0 0 1 0v.56A1.5 1.5 0 0 0 7.5 13h4a1.5 1.5 0 0 0 1.5-1.5v-4A1.5 1.5 0 0 0 11.5 6h-.56q.06-.236.06-.5m-3 3a.5.5 0 0 1 .5-.5H11a.5.5 0 0 1 0 1H8.5a.5.5 0 0 1-.5-.5m.5 1.5a.5.5 0 0 0 0 1H10a.5.5 0 0 0 0-1zm-6 2a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 0 1H3v.5a.5.5 0 0 1-1 0V14h-.5a.5.5 0 0 1 0-1H2v-.5a.5.5 0 0 1 .5-.5"
      />
    </svg>
  );
}
