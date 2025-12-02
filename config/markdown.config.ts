/* eslint-disable prefer-const */
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
  // 修复行内数学公式的空格问题
  result = result.replace(/\$\s+/g, "$");
  result = result.replace(/\s+\$/g, "$");

  // 处理转义的反斜杠：将 \\\( 和 \\\[ 转换为 \( 和 \[
  // 这样可以处理在 markdown 中被转义的 LaTeX 语法
  // 需要处理多种转义情况：\\\(, \\\\\(, 等等
  result = result.replace(/\\\\+\(/g, "\\(");
  result = result.replace(/\\\\+\[/g, "\\[");

  // 转换 LaTeX 行内数学 \(...\) -> $...$
  // 使用非贪婪匹配，允许内容包含反斜杠
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    return `$${math}$`;
  });

  // 转换 LaTeX 块级数学 \[...\] -> $$...$$
  // 使用非贪婪匹配，允许内容包含反斜杠
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    return `\n$$\n${math}\n$$\n`;
  });

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
  
  // 常见的 LaTeX 数学命令（按长度排序，长的在前，避免部分匹配）
  const mathCommands = [
    '\\begin{aligned}', '\\end{aligned}', '\\begin{cases}', '\\end{cases}',
    '\\begin{matrix}', '\\end{matrix}', '\\begin{pmatrix}', '\\end{pmatrix}',
    '\\begin{bmatrix}', '\\end{bmatrix}', '\\begin{vmatrix}', '\\end{vmatrix}',
    '\\overrightarrow', '\\overleftarrow', '\\overbrace', '\\underbrace',
    '\\displaystyle', '\\textstyle', '\\scriptstyle', '\\scriptscriptstyle',
    '\\frac', '\\sqrt', '\\sum', '\\prod', '\\int', '\\oint', '\\iint', '\\iiint',
    '\\lim', '\\sup', '\\inf', '\\max', '\\min', '\\arg',
    '\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc',
    '\\arcsin', '\\arccos', '\\arctan', '\\sinh', '\\cosh', '\\tanh',
    '\\log', '\\ln', '\\lg', '\\exp',
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\varepsilon',
    '\\zeta', '\\eta', '\\theta', '\\vartheta', '\\iota', '\\kappa',
    '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\varpi',
    '\\rho', '\\varrho', '\\sigma', '\\varsigma', '\\tau', '\\upsilon',
    '\\phi', '\\varphi', '\\chi', '\\psi', '\\omega',
    '\\Delta', '\\Gamma', '\\Lambda', '\\Omega', '\\Phi', '\\Pi', '\\Psi',
    '\\Sigma', '\\Theta', '\\Upsilon', '\\Xi',
    '\\times', '\\div', '\\pm', '\\mp', '\\cdot', '\\ast', '\\star',
    '\\leq', '\\geq', '\\neq', '\\approx', '\\equiv', '\\sim', '\\simeq',
    '\\cong', '\\propto', '\\parallel', '\\perp',
    '\\in', '\\notin', '\\subset', '\\supset', '\\subseteq', '\\supseteq',
    '\\cup', '\\cap', '\\emptyset', '\\varnothing', '\\setminus',
    '\\rightarrow', '\\leftarrow', '\\Rightarrow', '\\Leftarrow',
    '\\leftrightarrow', '\\Leftrightarrow', '\\mapsto',
    '\\forall', '\\exists', '\\nexists', '\\therefore', '\\because',
    '\\partial', '\\nabla', '\\infty', '\\emptyset', '\\varnothing',
    '\\text', '\\mathrm', '\\mathbf', '\\mathit', '\\mathcal',
    '\\mathbb', '\\mathfrak', '\\mathsf', '\\mathtt', '\\boldsymbol',
    '\\left', '\\right', '\\big', '\\Big', '\\bigg', '\\Bigg',
    '\\bigl', '\\bigr', '\\Bigl', '\\Bigr', '\\biggl', '\\biggr',
    '\\hat', '\\check', '\\breve', '\\acute', '\\grave', '\\tilde', '\\bar',
    '\\vec', '\\dot', '\\ddot', '\\dddot', '\\overline', '\\underline',
  ];
  
  // 构建数学命令正则表达式（转义特殊字符）
  const escapedCommands = mathCommands.map(cmd => 
    cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const mathCommandPattern = new RegExp(
    `\\\\(${escapedCommands.join('|')})`,
    'gi'
  );
  
  // 按行处理
  const lines = result.split('\n');
  const processedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    
    // 跳过已经包裹的数学公式
    if (trimmedLine.startsWith('$$') && trimmedLine.endsWith('$$')) {
      return line;
    }
    // 跳过行内数学公式（$...$ 但不是 $$...$$）
    if (/^\$[^$].*[^$]\$$/.test(trimmedLine)) {
      return line;
    }
    
    // 检查是否包含 LaTeX 数学命令
    const mathCommandMatches = line.match(mathCommandPattern);
    if (!mathCommandMatches || mathCommandMatches.length === 0) {
      mathCommandPattern.lastIndex = 0;
      return line;
    }
    mathCommandPattern.lastIndex = 0;
    
    const mathCommandCount = mathCommandMatches.length;
    
    // 检查行中是否包含数学符号
    const hasMathOperators = /[=+\-*/^_<>|]/.test(line);
    
    // 统计中文字符数量
    const chineseChars = (line.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // 移除数学命令和常见数学符号后，检查剩余文本
    const textWithoutMath = line
      .replace(/\\[a-zA-Z]+\{?[^}]*\}?/g, '')
      .replace(/[=+\-*/^_<>|()\[\]{}\s,.;:!?]/g, '');
    
    // 判断是否为数学表达式
    // 条件：包含数学命令，且（命令数量>=2 或 有数学符号且无中文 或 移除数学后文本很少）
    const isLikelyMath = 
      mathCommandCount > 0 && 
      (
        mathCommandCount >= 2 || 
        (mathCommandCount >= 1 && hasMathOperators && chineseChars === 0) ||
        (mathCommandCount >= 1 && textWithoutMath.length <= 2 && chineseChars === 0)
      );
    
    if (isLikelyMath) {
      // 检查是否整行都是数学表达式
      // 如果移除数学命令和符号后，剩余文本很少或没有，则认为是纯数学表达式
      const hasSignificantText = textWithoutMath.length > 3 || chineseChars > 0;
      
      if (!hasSignificantText) {
        // 整行是数学表达式，包裹为块级公式
        const indent = line.match(/^\s*/)?.[0] || '';
        return `${indent}$$${trimmedLine}$$`;
      } else {
        // 行内包含数学表达式，尝试包裹数学部分
        // 使用正则表达式匹配包含数学命令的片段
        // 匹配模式：反斜杠 + 字母 + 可选的花括号内容 + 可能的数学符号
        const inlineMathRegex = /(\\[a-zA-Z]+\{?[^}]*\}?[=+\-*/^_<>|()\[\]\s]*)/g;
        let processedLine = line;
        const matches: Array<{ match: string; index: number }> = [];
        
        let match;
        while ((match = inlineMathRegex.exec(line)) !== null) {
          // 检查匹配前后是否已经有 $ 符号
          const before = line.substring(0, match.index).trim();
          const after = line.substring(match.index + match[0].length).trim();
          const beforeEndsWithDollar = before.endsWith('$');
          const afterStartsWithDollar = after.startsWith('$');
          
          if (!beforeEndsWithDollar && !afterStartsWithDollar) {
            matches.push({ match: match[0], index: match.index });
          }
        }
        
        // 从后往前替换，避免索引偏移
        for (let i = matches.length - 1; i >= 0; i--) {
          const { match: mathMatch, index } = matches[i];
          processedLine = 
            processedLine.substring(0, index) + 
            `$${mathMatch}$` + 
            processedLine.substring(index + mathMatch.length);
        }
        
        return processedLine;
      }
    }
    
    return line;
  });
  
  return processedLines.join('\n');
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
 * 处理换行符，确保Markdown中的换行能正确显示
 * 将单个换行符转换为两个空格+换行（Markdown标准）
 * 但保留代码块和数学公式中的原始换行
 */
function processLineBreaks(content: string): string {
  const lines = content.split('\n');
  const processed: string[] = [];
  let inCodeBlock = false;
  let inMathBlock = false;
  let codeBlockType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 检测代码块开始/结束
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        codeBlockType = trimmedLine.substring(3).trim();
      }
      processed.push(line);
      continue;
    }

    // 检测数学公式块
    if (trimmedLine === '$$' || trimmedLine.startsWith('$$')) {
      inMathBlock = !inMathBlock;
      processed.push(line);
      continue;
    }

    // 在代码块或数学块中，保持原样
    if (inCodeBlock || inMathBlock) {
      processed.push(line);
      continue;
    }

    // 空行保持原样
    if (trimmedLine === '') {
      processed.push(line);
      continue;
    }

    // 检查是否是列表项、标题、引用等特殊格式
    const isListItem = /^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line);
    const isHeading = /^#+\s/.test(trimmedLine);
    const isBlockquote = /^>\s/.test(trimmedLine);
    const isHorizontalRule = /^[-*_]{3,}$/.test(trimmedLine);
    const isTableRow = /^\|/.test(trimmedLine);

    // 特殊格式保持原样
    if (isListItem || isHeading || isBlockquote || isHorizontalRule || isTableRow) {
      processed.push(line);
      continue;
    }

    // 检查下一行是否是特殊格式或空行
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const nextTrimmed = nextLine.trim();
    const nextIsSpecial = 
      nextTrimmed === '' ||
      /^#+\s/.test(nextTrimmed) ||
      /^[-*+]\s/.test(nextTrimmed) ||
      /^\d+\.\s/.test(nextTrimmed) ||
      /^>\s/.test(nextTrimmed) ||
      /^```/.test(nextTrimmed) ||
      /^\$\$/.test(nextTrimmed) ||
      /^\|/.test(nextTrimmed);

    // 如果下一行是特殊格式或空行，当前行保持原样
    if (nextIsSpecial) {
      processed.push(line);
      continue;
    }

    // 普通文本行：如果下一行不是空行且不是特殊格式，添加两个空格
    // 这样单个换行符会被Markdown渲染为换行
    if (nextTrimmed !== '' && !nextIsSpecial) {
      // 检查行尾是否已经有空格
      if (!line.endsWith('  ')) {
        processed.push(line + '  ');
      } else {
        processed.push(line);
      }
    } else {
      processed.push(line);
    }
  }

  return processed.join('\n');
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

  // 2. 处理换行符
  result = processLineBreaks(result);

  // 3. 移除 LaTeX 宏定义
  result = removeLatexMacros(result);

  // 4. 检测并转换 LaTeX 文档格式
  if (isLatexDocument(result)) {
    result = convertLatexDocument(result);
  } else {
    // 对于非 LaTeX 文档，也处理数学环境和符号
    result = convertMathEnvironments(result);
    result = normalizeMathNotation(result);
  }

  // 5. 修复数学公式块的缩进问题
  result = fixMathBlockIndentation(result);

  // 6. 检测并包裹未包裹的数学表达式
  result = wrapUnwrappedMath(result);

  // 7. 修复未闭合的代码块和数学公式
  result = fixIncompleteCodeBlocks(result);
  result = fixIncompleteMath(result);

  return result;
}
