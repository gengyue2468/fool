import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { PluggableList } from "unified";

// Remark 插件列表
export const remarkPlugins: PluggableList = [remarkGfm, remarkMath];


// Rehype 插件列表
// 使用 KaTeX 渲染所有数学公式（快速且支持大部分 LaTeX 语法）
// KaTeX 支持：$...$ (行内) 和 $$...$$ (块级)
// 也支持：\(...\) 和 \[...\] 格式（会在预处理阶段转换为 $ 格式）
export const rehypePlugins: PluggableList = [
  rehypeKatex,
  rehypeHighlight,
];

/**
 * 过滤 AI 思考过程标签
 */
export function filterThinkTags(content: string): string {
  if (!content) return "";
  // 移除完整的 <think>...</think> 块
  let processed = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // 移除未闭合的 <think> 标签及其后面的内容
  const thinkIndex = processed.search(/<think>/i);
  if (thinkIndex !== -1) {
    processed = processed.substring(0, thinkIndex);
  }
  return processed;
}

/**
 * 检测内容是否为 LaTeX 文档格式
 */
function isLatexDocument(content: string): boolean {
  return (
    /\\documentclass/.test(content) ||
    /\\begin\{document\}/.test(content) ||
    /\\usepackage/.test(content)
  );
}

/**
 * 将 LaTeX 文档格式转换为 Markdown + KaTeX
 */
function convertLatexDocument(content: string): string {
  let result = content;

  // 移除 LaTeX 文档结构命令
  result = result.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/g, "");
  result = result.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, "");
  result = result.replace(/\\begin\{document\}/g, "");
  result = result.replace(/\\end\{document\}/g, "");
  result = result.replace(/\\maketitle/g, "");
  result = result.replace(/\\title\{([^}]*)\}/g, "# $1");
  result = result.replace(/\\author\{([^}]*)\}/g, "*$1*");
  result = result.replace(/\\date\{([^}]*)\}/g, "*$1*");

  // 转换章节标题
  result = result.replace(/\\section\*?\{([^}]*)\}/g, "## $1");
  result = result.replace(/\\subsection\*?\{([^}]*)\}/g, "### $1");
  result = result.replace(/\\subsubsection\*?\{([^}]*)\}/g, "#### $1");
  result = result.replace(/\\paragraph\*?\{([^}]*)\}/g, "##### $1");

  // 转换文本格式
  result = result.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
  result = result.replace(/\\textit\{([^}]*)\}/g, "*$1*");
  result = result.replace(/\\underline\{([^}]*)\}/g, "<u>$1</u>");
  result = result.replace(/\\text\{([^}]*)\}/g, "$1");

  // 转换 enumerate/itemize 环境为 Markdown 列表
  result = result.replace(/\\begin\{enumerate\}/g, "");
  result = result.replace(/\\end\{enumerate\}/g, "");
  result = result.replace(/\\begin\{itemize\}/g, "");
  result = result.replace(/\\end\{itemize\}/g, "");
  result = result.replace(/\\item\s*/g, "- ");

  // 转换数学环境
  result = convertMathEnvironments(result);

  return result;
}

/**
 * 转换数学环境为 KaTeX 格式
 */
function convertMathEnvironments(content: string): string {
  let result = content;

  // align/align* 环境
  result = result.replace(
    /\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g,
    (_, math) => {
      const cleaned = math.trim();
      return `\n$$\n\\begin{aligned}${cleaned}\\end{aligned}\n$$\n`;
    }
  );

  // equation/equation* 环境
  result = result.replace(
    /\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g,
    (_, math) => `\n$$\n${math.trim()}\n$$\n`
  );

  // gather/gather* 环境
  result = result.replace(
    /\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g,
    (_, math) => `\n$$\n${math.trim()}\n$$\n`
  );

  // split 环境
  result = result.replace(
    /\\begin\{split\}([\s\S]*?)\\end\{split\}/g,
    (_, math) => `\\begin{aligned}${math}\\end{aligned}`
  );

  // cases 环境 (KaTeX 支持)
  // 保持不变，KaTeX 原生支持

  // 处理转义的反斜杠：将 \\\( 和 \\\[ 转换为 \( 和 \[
  // 这样可以处理在 markdown 中被转义的 LaTeX 语法
  // 使用纯字符串操作，避免正则转义问题
  // 在字符串中：\\ 表示一个反斜杠，所以 \\\\( 表示两个反斜杠 + 左括号
  // 使用 split/join 方法处理所有情况
  result = result.split("\\\\( ").join("\\(");
  result = result.split("\\\\[ ").join("\\[");

  // 行内数学 \(...\) -> $...$
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);

  // 块级数学 \[...\] -> $$...$$
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n$$\n${math}\n$$\n`);

  return result;
}

/**
 * 规范化数学公式格式
 * 同时支持 LaTeX 和已有的 $ 符号格式
 */
function normalizeMathNotation(content: string): string {
  let result = content;

  // 如果已经使用 $ 符号，确保格式正确
  // 修复可能的格式问题：$$ 和 $ 之间的空格
  result = result.replace(/\$\$\s+/g, "$$");
  result = result.replace(/\s+\$\$/g, "$$");

  // 处理转义的反斜杠：将 \\\( 和 \\\[ 转换为 \( 和 \[
  // 这样可以处理在 markdown 中被转义的 LaTeX 语法
  // 使用纯字符串操作，避免正则转义问题
  // 在字符串中：\\ 表示一个反斜杠，所以 \\\\( 表示两个反斜杠 + 左括号
  // 使用 split/join 方法处理所有情况
  result = result.split("\\\\( ").join("\\(");
  result = result.split("\\\\[ ").join("\\[");

  // 转换 LaTeX 行内数学 \(...\) -> $...$
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);

  // 转换 LaTeX 块级数学 \[...\] -> $$...$$
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`);

  return result;
}

/**
 * 修复流式输出中未闭合的代码块
 */
export function fixIncompleteCodeBlocks(content: string): string {
  const matches = content.match(/```/g);
  if (matches && matches.length % 2 !== 0) {
    return content + "\n```";
  }
  return content;
}

/**
 * 修复流式输出中未闭合的数学公式
 */
function fixIncompleteMath(content: string): string {
  // 检查 $$ 块级公式是否闭合
  const blockMatches = content.match(/\$\$/g);
  if (blockMatches && blockMatches.length % 2 !== 0) {
    return content + "$$";
  }
  return content;
}

/**
 * 检测并包裹未包裹的数学表达式
 * 识别包含 LaTeX 命令的文本并自动包裹为数学公式
 */
function wrapUnwrappedMath(content: string): string {
  let result = content;
  
  // 移除单独的 $ 符号（不是数学公式标记的）
  // 匹配单独的 $ 后跟非数学内容（如 $---）
  result = result.replace(/\$---/g, "---");
  result = result.replace(/\$(\s|$)/gm, "$1");
  
  // 检测包含 LaTeX 数学命令但未包裹的表达式
  // 常见的 LaTeX 数学命令模式
  const mathCommandPattern = /\\[a-zA-Z]+\{?[^}]*\}?/g;
  
  // 按行处理
  const lines = result.split("\n");
  const processedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    
    // 跳过已经包裹的数学公式
    if (trimmedLine.startsWith("$$") && trimmedLine.endsWith("$$")) {
      return line;
    }
    if (trimmedLine.startsWith("$") && trimmedLine.endsWith("$") && trimmedLine.length > 1) {
      return line;
    }
    
    // 检查是否包含 LaTeX 数学命令
    const hasMathCommand = mathCommandPattern.test(line);
    if (!hasMathCommand) {
      return line;
    }
    
    // 重置正则表达式
    mathCommandPattern.lastIndex = 0;
    
    // 如果整行看起来像数学表达式（包含 LaTeX 命令且没有太多中文）
    const chineseCharCount = (line.match(/[\u4e00-\u9fa5]/g) || []).length;
    const mathCommandCount = (line.match(/\\[a-zA-Z]+/g) || []).length;
    
    // 如果数学命令数量较多，或者整行主要是数学表达式
    if (mathCommandCount > 0 && (mathCommandCount >= chineseCharCount || chineseCharCount === 0)) {
      // 检查是否整行都是数学表达式
      if (trimmedLine.length > 0 && !trimmedLine.match(/^[^\\]*[：:][^\\]*$/)) {
        // 包裹整行为块级公式
        const indent = line.match(/^\s*/)?.[0] || "";
        return `${indent}$$${trimmedLine}$$`;
      }
    }
    
    // 否则，尝试包裹行内的数学表达式片段
    // 匹配包含 LaTeX 命令的片段
    return line.replace(/([^$]*?)(\\[a-zA-Z]+\{[^}]*\}[^$]*?)(?=\s|$|[^\\])/g, (match, prefix, mathPart) => {
      // 如果数学部分包含常见的数学命令，包裹它
      if (mathPart.match(/\\times|\\div|\\text\{|\\mathrm\{|\\frac|\\sqrt/)) {
        // 检查前后是否已经有 $ 符号
        if (!prefix.trim().endsWith("$") && !mathPart.trim().startsWith("$")) {
          return `${prefix}$${mathPart}$`;
        }
      }
      return match;
    });
  });
  
  return processedLines.join("\n");
}

/**
 * 移除数学公式块前的缩进，防止被识别为代码块
 * Markdown 中 4 个空格缩进会被解析为代码块
 */
function fixMathBlockIndentation(content: string): string {
  // 移除 $$ 块前的行首空格/制表符
  let result = content.replace(/^[ \t]+\$\$/gm, "$$");
  // 移除 $$ 块后的行首空格/制表符
  result = result.replace(/\$\$[ \t]*$/gm, "$$");
  return result;
}

/**
 * 移除 \newcommand 等 LaTeX 宏定义（KaTeX 不支持）
 */
function removeLatexMacros(content: string): string {
  // 移除 \newcommand 定义
  let result = content.replace(/\\newcommand\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/g, "");
  // 移除 \renewcommand 定义
  result = result.replace(/\\renewcommand\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/g, "");
  // 移除 \def 定义
  result = result.replace(/\\def\\[a-zA-Z]+\{[^}]*\}/g, "");
  return result;
}

/**
 * 处理 Markdown 内容的主函数
 * 自动检测并处理 LaTeX 文档格式和普通 Markdown
 */
export function processMarkdownContent(content: string): string {
  if (!content) return "";

  let result = content;

  // 1. 过滤思考标签
  result = filterThinkTags(result);

  // 2. 移除 LaTeX 宏定义
  result = removeLatexMacros(result);

  // 3. 检测并转换 LaTeX 文档格式
  if (isLatexDocument(result)) {
    result = convertLatexDocument(result);
  } else {
    // 对于非 LaTeX 文档，也处理数学环境和符号
    result = convertMathEnvironments(result);
    result = normalizeMathNotation(result);
  }

  // 4. 修复数学公式块的缩进问题
  result = fixMathBlockIndentation(result);

  // 5. 检测并包裹未包裹的数学表达式
  result = wrapUnwrappedMath(result);

  // 6. 修复未闭合的代码块和数学公式
  result = fixIncompleteCodeBlocks(result);
  result = fixIncompleteMath(result);

  return result;
}
