import { describe, it, expect } from 'vitest';
import { sanitizeFilenameSegment, buildCardFilename } from '@/lib/filename';

describe('sanitizeFilenameSegment', () => {
  it('移除 Windows 非法字符', () => {
    expect(sanitizeFilenameSegment('a/b\\c:d*e?f"g<h>i|j')).toBe('abcdefghij');
  });

  it('移除控制字符', () => {
    expect(sanitizeFilenameSegment('a\x00b\x1fc')).toBe('abc');
  });

  it('去除首尾空白与首部点号', () => {
    expect(sanitizeFilenameSegment('  .hidden  ')).toBe('hidden');
  });

  it('按最大长度截断', () => {
    expect(sanitizeFilenameSegment('一二三四五六七八九十一二三四五六七八九十', 10)).toBe(
      '一二三四五六七八九十'
    );
  });

  it('空输入返回空串', () => {
    expect(sanitizeFilenameSegment('')).toBe('');
    expect(sanitizeFilenameSegment('   ')).toBe('');
  });

  it('仅非法字符时返回空串', () => {
    expect(sanitizeFilenameSegment('\\\\///')).toBe('');
  });
});

describe('buildCardFilename', () => {
  it('组合模板 id 与清洗后的标题', () => {
    expect(buildCardFilename('minimal-magazine', '深度思考')).toBe(
      'wepost-minimal-magazine-深度思考'
    );
  });

  it('标题含非法字符时被清洗', () => {
    expect(buildCardFilename('dark-glass', 'a/b:c')).toBe('wepost-dark-glass-abc');
  });

  it('标题为空时回退 wepost-card', () => {
    expect(buildCardFilename('zen-quote', '')).toBe('wepost-zen-quote-wepost-card');
    expect(buildCardFilename('zen-quote', '///')).toBe('wepost-zen-quote-wepost-card');
  });
});
