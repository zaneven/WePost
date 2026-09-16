/**
 * 清除正文中的 Markdown 格式标记，转换为适合微信生态（尤其是图片贴图号与图文）的纯文本内容。
 */
export function stripMarkdown(md?: string): string {
  if (!md) return '';
  return md
    // 移除标题前缀 #, ##, ### 等
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    // 移除引用符号 >
    .replace(/^[ \t]*>[ \t]*/gm, '')
    // 移除代码块围栏 ```lang\n ... \n```
    .replace(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g, '$1')
    // 移除行内代码 `code`
    .replace(/`([^`]+)`/g, '$1')
    // 移除粗体/斜体 **text**, *text*, __text__, _text_
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 移除删除线 ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // 转换任务列表项 - [ ] / - [x]
    .replace(/^[ \t]*[-*+][ \t]+\[[ xX]\][ \t]+/gm, '• ')
    // 转换无序列表标记 - / * / + 为简明圆点 •
    .replace(/^[ \t]*[-*+][ \t]+/gm, '• ')
    // 移除图片引用 ![alt](url)
    .replace(/!\[(.*?)\]\(.*?\)/g, '')
    // 转换链接 [text](url) 为普通文本 text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 移除 KaTeX 公式标记 $$...$$ 和 $...$
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$\n]+)\$/g, '$1')
    // 移除分割线 ---, ***
    .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '')
    // 压缩多余的连续换行（最多保留 2 个换行）
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
