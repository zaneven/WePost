// WePost Markdown Parser & Compiler Placeholder
export interface ParseOptions {
  theme?: string;
  enableMath?: boolean;
  highlightTheme?: string;
}

export function parseMarkdownToHtml(markdown: string, _options?: ParseOptions): string {
  // TODO: implement unified/remark compiler pipeline
  return markdown;
}
