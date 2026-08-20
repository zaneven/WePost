/**
 * 导出文件名清洗与构建工具。
 * 抽离为纯函数以便复用与单元测试。
 */

// Windows / 通用文件名非法字符
const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;
// 控制字符 (0x00-0x1F)
const CONTROL_CHARS = /[\x00-\x1f]/g;
// 连续空白与首尾点（避免 Windows 隐藏 / 误判）
const LEADING_DOTS = /^\.+/g;

/**
 * 将任意文本清洗为可安全用于文件名的片段。
 * - 去除非法字符、控制字符
 * - 去除首部点号、首尾空白
 * - 按最大长度截断（默认 20）
 * 返回空串表示无有效内容，由调用方回退默认名。
 */
export function sanitizeFilenameSegment(text: string, maxLen = 20): string {
  if (!text) return '';
  return text
    .replace(INVALID_FILENAME_CHARS, '')
    .replace(CONTROL_CHARS, '')
    .trim()
    .replace(LEADING_DOTS, '')
    .slice(0, maxLen)
    .trim();
}

/**
 * 基于模板 id 与标题构建完整导出文件名（不含扩展名）。
 * 标题无效时回退为 wepost-card。
 */
export function buildCardFilename(templateId: string, title: string): string {
  const safe = sanitizeFilenameSegment(title) || 'wepost-card';
  return `wepost-${templateId}-${safe}`;
}
