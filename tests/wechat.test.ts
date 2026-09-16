import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveWeChatConfig,
  loadWeChatConfig,
  clearWeChatConfig,
  hasWeChatConfig,
  maskSecret,
} from '@/lib/wechat/config';
import { isValidIp, extractIpFromWeChatError } from '@/lib/wechat/ip';
import { buildDraftArticleHtml } from '@/lib/wechat/publisher';
import { stripMarkdown } from '@/lib/wechat/markdown';

describe('微信配置本地存储 (WeChat Config)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('未保存配置时返回 null', () => {
    expect(loadWeChatConfig()).toBeNull();
    expect(hasWeChatConfig()).toBe(false);
  });

  it('正常保存并读取完整的微信配置', () => {
    const ok = saveWeChatConfig({
      appId: 'wx1234567890abcdef',
      appSecret: 'secret_value_123456',
      authorDefault: '测试作者',
      proxyUrl: 'http://localhost:3000/api/wechat/proxy',
    });

    expect(ok).toBe(true);
    expect(hasWeChatConfig()).toBe(true);

    const loaded = loadWeChatConfig();
    expect(loaded).not.toBeNull();
    expect(loaded?.appId).toBe('wx1234567890abcdef');
    expect(loaded?.appSecret).toBe('secret_value_123456');
    expect(loaded?.authorDefault).toBe('测试作者');
    expect(loaded?.proxyUrl).toBe('http://localhost:3000/api/wechat/proxy');
  });

  it('清除配置能成功将 localStorage 置空', () => {
    saveWeChatConfig({
      appId: 'wx1111111111111111',
      appSecret: 'secret_1111111111111111',
    });
    expect(hasWeChatConfig()).toBe(true);

    clearWeChatConfig();
    expect(hasWeChatConfig()).toBe(false);
    expect(loadWeChatConfig()).toBeNull();
  });

  it('maskSecret 脱敏处理正常', () => {
    expect(maskSecret('')).toBe('');
    expect(maskSecret('12345678')).toBe('••••••••');
    expect(maskSecret('abcdef1234567890xyz')).toBe('abcd••••••••0xyz');
  });
});

describe('公网 IP 校验与微信 40164 报错提取 (WeChat IP Tools)', () => {
  it('isValidIp 正确校验 IPv4 与 IPv6', () => {
    expect(isValidIp('140.245.74.58')).toBe(true);
    expect(isValidIp('127.0.0.1')).toBe(true);
    expect(isValidIp('192.168.1.1')).toBe(true);
    expect(isValidIp('::1')).toBe(true);
    expect(isValidIp('2001:db8::1')).toBe(true);

    expect(isValidIp('999.1.1.1')).toBe(false);
    expect(isValidIp('1.2.3')).toBe(false);
    expect(isValidIp('abc.def.ghi.jkl')).toBe(false);
    expect(isValidIp('')).toBe(false);
  });

  it('extractIpFromWeChatError 能从标准微信 40164 错误中提取来源 IP', () => {
    const err1 =
      'invalid ip 140.245.74.58 ipv6 ::ffff:140.245.74.58, not in whitelist rid: 6aaa37eb-291364a0-0778d07f';
    expect(extractIpFromWeChatError(err1)).toBe('140.245.74.58');

    const err2 = 'invalid ip 114.242.12.34, not in whitelist';
    expect(extractIpFromWeChatError(err2)).toBe('114.242.12.34');

    expect(extractIpFromWeChatError('system error')).toBeNull();
    expect(extractIpFromWeChatError(undefined)).toBeNull();
  });
});

describe('微信草稿正文 HTML 拼装 (buildDraftArticleHtml)', () => {
  const mockImageUrls = [
    'http://mmbiz.qpic.cn/mmbiz_png/abc1/0',
    'http://mmbiz.qpic.cn/mmbiz_png/abc2/0',
  ];

  it('仅图片模式 (image-only) 正确渲染图片列表，不附加正文段落', () => {
    const html = buildDraftArticleHtml(mockImageUrls, '这是一段文字', 'image-only');
    expect(html).toContain('http://mmbiz.qpic.cn/mmbiz_png/abc1/0');
    expect(html).toContain('http://mmbiz.qpic.cn/mmbiz_png/abc2/0');
    expect(html).not.toContain('这是一段文字');
    expect(html).toContain('<img src="http://mmbiz.qpic.cn/mmbiz_png/abc1/0"');
  });

  it('图文并存模式 (image-with-text) 包含卡片图片与转义后的段落文本', () => {
    const text = '第一段文字 <script>alert(1)</script>\n\n第二段文字 "双引号" & 符号';
    const html = buildDraftArticleHtml(mockImageUrls, text, 'image-with-text');

    expect(html).toContain('http://mmbiz.qpic.cn/mmbiz_png/abc1/0');
    expect(html).toContain('第一段文字 &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('第二段文字 &quot;双引号&quot; &amp; 符号');
    expect(html).toContain('<p style="margin: 0 0 14px 0;');
  });

  it('若无文字内容即使指定 image-with-text 也安全退回图片模式', () => {
    const html = buildDraftArticleHtml(mockImageUrls, '   ', 'image-with-text');
    expect(html).toContain('http://mmbiz.qpic.cn/mmbiz_png/abc1/0');
    expect(html).not.toContain('<p style=');
  });

  it('正文中的 Markdown 标记应被清洗为干净纯文本', () => {
    const md = '## 标题\n\n> 引用内容\n\n**加粗文字** 与 *斜体*，还有 [链接文本](https://example.com)';
    const html = buildDraftArticleHtml(mockImageUrls, md, 'image-with-text');
    expect(html).not.toContain('##');
    expect(html).not.toContain('&gt;');
    expect(html).not.toContain('**');
    expect(html).not.toContain('https://example.com');
    expect(html).toContain('标题');
    expect(html).toContain('引用内容');
    expect(html).toContain('加粗文字 与 斜体，还有 链接文本');
  });
});

describe('Markdown 纯文本清洗 (stripMarkdown)', () => {
  it('处理空串或 undefined', () => {
    expect(stripMarkdown('')).toBe('');
    expect(stripMarkdown(undefined)).toBe('');
  });

  it('去除标题、引用、分割线', () => {
    const input = '# 一级标题\n### 三级标题\n\n> 引用语句\n---\n正文';
    const output = stripMarkdown(input);
    expect(output).toBe('一级标题\n三级标题\n\n引用语句\n\n正文');
  });

  it('去除粗体、斜体、删除线、行内代码与代码围栏', () => {
    const input = '这是**粗体**，这是*斜体*，这是~~删除线~~，这是`const a = 1;`代码。\n```javascript\nconsole.log(123);\n```';
    const output = stripMarkdown(input);
    expect(output).toContain('这是粗体，这是斜体，这是删除线，这是const a = 1;代码。');
    expect(output).toContain('console.log(123);');
    expect(output).not.toContain('```');
    expect(output).not.toContain('**');
  });

  it('转换列表与保留文本链接', () => {
    const input = '- [x] 已完成项\n- 未完成项\n* 另一项\n+ 第四项\n[点击链接](https://wepost.zaneven.com)';
    const output = stripMarkdown(input);
    expect(output).toContain('• 已完成项');
    expect(output).toContain('• 未完成项');
    expect(output).toContain('• 另一项');
    expect(output).toContain('• 第四项');
    expect(output).toContain('点击链接');
    expect(output).not.toContain('https://wepost.zaneven.com');
  });
});

