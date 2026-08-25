// WePost Core Types
// 桶导出：统一指向卡片生成的核心类型。
// 早期设想的 Article / PublishResult（服务于未实现的发布引擎）已随「多平台分发」远期阶段下线；
// 现阶段产品为纯前端卡片生成器，核心数据模型为 CardData。
export * from './card';
