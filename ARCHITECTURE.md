# DoOneThing 架构设计文档

## 1. 系统概述

DoOneThing是一个Chrome浏览器扩展,通过AI技术帮助用户专注于单一任务,智能过滤干扰内容。

## 2. 核心设计原则

- **AI驱动**: 使用大语言模型理解用户意图和判断内容相关性
- **实时响应**: 毫秒级的URL判断和内容过滤
- **渐进增强**: 支持离线模式,预设规则 + AI动态判断
- **隐私优先**: 本地处理敏感数据,最小化数据传输

## 3. 技术架构

### 3.1 扩展组件

```
┌─────────────────────────────────────────────────────────┐
│                     Chrome Extension                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Popup (React UI)                                        │
│  ├── 用户输入专注目标                                      │
│  ├── AI状态显示                                           │
│  ├── 设置面板                                             │
│  └── 统计信息                                             │
│                                                           │
│  Background Service Worker                               │
│  ├── AI Intent Analyzer                                  │
│  ├── URL Classifier (缓存 + AI判断)                      │
│  ├── WebRequest Blocker                                  │
│  └── Message Handler                                     │
│                                                           │
│  Content Scripts (注入到网页)                             │
│  ├── DOM Content Filter                                  │
│  ├── YouTube Special Handler                             │
│  └── UI Overlay                                          │
│                                                           │
│  Blocked Page                                            │
│  ├── 拦截提示                                             │
│  ├── 推荐资源                                             │
│  └── 返回选项                                             │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 3.2 数据流

```
用户输入 → AI分析 → 生成规则 → 缓存到本地
    ↓
访问URL → 本地规则匹配 → 命中:直接放行/拦截
    ↓
未命中 → AI实时判断 → 结果缓存 → 执行动作
    ↓
页面加载 → Content Script注入 → DOM过滤 → 用户看到过滤后的页面
```

## 4. 核心模块详解

### 4.1 AI Intent Analyzer (意图分析器)

**职责**: 解析用户的专注目标,生成判断规则

**输入**: 
- 用户自然语言描述(如"我要学习Python编程")

**输出**:
```typescript
{
  intent: "系统化学习 Python 编程",
  confidence: 92
}
```

**实现策略**:
- 使用 LLM 将用户自然语言意图改写成短而清晰的目标
- 后续所有判断仅基于该目标和用户自定义白/黑名单

### 4.2 URL Classifier (URL分类器)

**职责**: 快速判断URL是否与当前专注目标相关

**判断流程**:
```
URL输入
  ↓
检查白名单 → 命中 → 允许
  ↓
检查黑名单 → 命中 → 拦截
  ↓
检查缓存 → 命中 → 使用缓存结果
  ↓
AI实时判断(基于意图) → 缓存结果 → 返回决策
```

**缓存策略**:
- 域名级别: 24小时缓存
- URL级别: 1小时缓存
- LRU淘汰机制

### 4.3 Content Filter (内容过滤器)

**职责**: 过滤页面内部的无关内容

**YouTube特殊处理**:
```javascript
// 视频页面
- 分析视频标题、描述、标签
- AI判断视频主题是否相关
- 不相关则拦截播放

// 推荐侧边栏
- 遍历所有推荐视频
- AI批量判断相关性
- 移除不相关视频DOM
- 保留相关推荐

// 首页Feed
- 分析每个视频缩略图信息
- 过滤不相关内容
- 重新布局页面
```

**通用网站处理**:
- 识别广告模块(已有规则)
- 识别推荐/相关内容区域
- AI判断后选择性隐藏

### 4.4 Redirect Manager (重定向管理器)

**职责**: 拦截不相关网站,提供替代方案

**拦截页面功能**:
- 显示为什么被拦截
- 推荐3-5个相关学习网站
- 提供临时允许选项(需确认)
- 显示今日拦截统计

**智能推荐**:
```typescript
// 根据专注目标推荐网站
intent: "学习编程" → 推荐: Coursera, freeCodeCamp, LeetCode
intent: "写作" → 推荐: Medium, Writing resources, Grammar tools
intent: "研究" → 推荐: Google Scholar, JSTOR, Research Gate
```

## 5. AI服务设计

### 5.1 API选择

支持多种AI服务:
- **OpenAI GPT-4o**: 准确度高,速度快
- **Anthropic Claude**: 推理能力强
- **本地模型**: 离线模式(可选)

### 5.2 Prompt工程

**意图分析 Prompt**:
```
你是一个专注助手。用户想要专注做一件事,请把目标改写得简短清晰:
用户说: "{用户输入}"

返回JSON:
{"intent": "10个单词以内的目标", "confidence": 95}
```

**URL 判断 Prompt**:
```
专注目标: {intent}
URL: {url}
标题: {title}
严格模式: {strictness}

判断这个页面是否有助于用户的目标。若不确定且内容可能有帮助,请选择允许。
返回JSON:
{"relevant": true/false, "reason": "原因", "confidence": 0-100}
```

### 5.3 性能优化

- **批量请求**: 一次请求判断多个URL
- **流式响应**: 使用streaming减少等待
- **结果缓存**: 相同query复用结果
- **降级策略**: API失败时使用规则引擎

## 6. 数据存储设计

### 6.1 Chrome Storage

```typescript
// chrome.storage.local
{
  // 当前会话
  currentSession: {
    intent: string,
    startTime: timestamp,
    active: boolean,
    rules: ClassificationRules
  },
  
  // AI配置
  aiConfig: {
    provider: "openai" | "claude",
    apiKey: string,
    model: string
  },
  
  // 缓存
  urlCache: {
    [url: string]: {
      relevant: boolean,
      timestamp: number,
      confidence: number
    }
  },
  
  // 统计
  stats: {
    totalBlocked: number,
    websitesBlocked: string[],
    focusTime: number
  },
  
  // 用户设置
  settings: {
    strictness: "relaxed" | "standard" | "strict",
    whitelist: string[],
    blacklist: string[]
  }
}
```

## 7. 权限需求

```json
{
  "permissions": [
    "storage",
    "declarativeNetRequest"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

## 8. 性能指标

- URL判断延迟: < 100ms (缓存命中)
- AI判断延迟: < 2s (新URL)
- Content Script执行: < 50ms
- 内存占用: < 100MB
- 缓存大小: < 10MB

## 9. 安全考虑

- API密钥加密存储
- 不记录用户浏览历史
- 本地优先处理
- 用户数据不上传服务器
- CSP策略保护

## 10. 扩展性设计

- 插件化AI Provider
- 可配置的过滤规则
- 自定义拦截页面模板
- 支持导入/导出配置
- Webhook通知(可选)

## 11. 开发路线图

### Phase 1: MVP (2周)
- ✅ 架构设计
- [ ] 基础扩展框架
- [ ] OpenAI集成
- [ ] 简单URL拦截
- [ ] 基础UI

### Phase 2: 核心功能 (3周)
- [ ] AI意图分析完善
- [ ] 智能URL分类
- [ ] Content过滤器
- [ ] YouTube特殊处理
- [ ] 拦截页面设计

### Phase 3: 优化增强 (2周)
- [ ] 性能优化
- [ ] 缓存策略优化
- [ ] UI/UX打磨
- [ ] 错误处理
- [ ] 用户测试

### Phase 4: 高级功能 (2周)
- [ ] 多AI Provider支持
- [ ] 统计面板
- [ ] 数据导出
- [ ] 自定义规则
- [ ] 社区分享

## 12. 技术挑战与解决方案

### 挑战1: AI判断延迟
**解决**: 多级缓存 + 预判断 + 乐观UI

### 挑战2: YouTube动态内容
**解决**: MutationObserver监听 + 批量处理

### 挑战3: API成本
**解决**: 智能缓存 + 规则引擎 + 批量请求

### 挑战4: 隐私问题
**解决**: 本地处理 + 最小化数据传输 + 用户控制

## 13. 测试策略

- 单元测试: Jest + Testing Library
- E2E测试: Playwright
- 手动测试: 真实场景验证
- 性能测试: Chrome DevTools
- A/B测试: 不同AI策略对比
