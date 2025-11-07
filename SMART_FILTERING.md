# 智能网站过滤策略

## 更新内容

优化了 AI 判断逻辑，使其对宽泛的通用知识网站更加智能和宽容。

## 核心改进

### 1. 宽容度分级处理

三种宽容度模式对通用网站有不同的处理策略：

#### **Relaxed (宽松)**
- 对 Google、Wikipedia 等通用网站非常宽容
- 只要搜索词/页面内容与目标相关就放行
- 只拦截明显无关的娱乐内容

#### **Standard (标准)**  
- 平衡的判断策略
- 分析 URL 参数、搜索词、页面标题
- 内容合理相关就允许访问

#### **Strict (严格)**
- 严格审查，即使是通用网站
- 要求具体内容直接相关才放行

### 2. 基于内容而非域名判断

对以下通用知识网站，不再简单地按域名拦截，而是分析具体内容：

**搜索引擎**:
- Google (所有地区)
- Bing
- DuckDuckGo
- Baidu

**知识库**:
- Wikipedia
- WikiHow
- 知乎 (Zhihu)

**技术社区**:
- Stack Overflow
- Stack Exchange
- GitHub
- GitLab

**内容平台**:
- YouTube (根据视频主题判断)
- Medium
- Reddit (根据 subreddit 和帖子主题)
- Quora

## 判断依据

AI 现在会分析以下内容来做决定：

### 1. **URL 参数**
```
例如: google.com/search?q=python+tutorial
提取: "python tutorial" → 如果目标是学习编程，则放行
```

### 2. **URL 路径**
```
例如: wikipedia.org/wiki/Machine_Learning
提取: "Machine Learning" → 如果目标相关，则放行
```

### 3. **页面标题**
```
如果浏览器提供了页面标题，也会纳入判断
```

### 4. **域名类型**
```
识别是否为通用知识网站，采用更智能的判断策略
```

## 实际效果示例

### 场景：用户目标 = "学习 Python 编程"

#### ✅ 会放行的：

| 网站 | URL 示例 | 原因 |
|------|---------|------|
| Google | `google.com/search?q=python+tutorial` | 搜索词与目标相关 |
| Wikipedia | `wikipedia.org/wiki/Python_(programming)` | 文章主题相关 |
| YouTube | `youtube.com/watch?v=xxx` (标题: Python入门) | 视频内容相关 |
| Stack Overflow | `stackoverflow.com/questions/tagged/python` | 技术问题相关 |
| GitHub | `github.com/python/cpython` | 代码仓库相关 |

#### ❌ 会拦截的：

| 网站 | URL 示例 | 原因 |
|------|---------|------|
| Google | `google.com/search?q=best+movies+2024` | 搜索内容无关 |
| Wikipedia | `wikipedia.org/wiki/Taylor_Swift` | 文章主题无关 |
| YouTube | `youtube.com/watch?v=xxx` (标题: 搞笑视频) | 娱乐内容 |
| Reddit | `reddit.com/r/funny` | 娱乐 subreddit |

## Prompt 优化

### 系统提示词
```
You are a focus assistant that determines if websites are relevant 
to a user's goal. For general knowledge sites (Google, Wikipedia, etc.), 
always analyze the SPECIFIC CONTENT (search queries, article topics, 
URL parameters) rather than blocking the entire domain.
```

### 宽松模式提示
```
Be LENIENT and permissive. Allow websites unless they are clearly 
distracting (entertainment, social media, shopping unrelated to the goal).

For general knowledge sites (Google, Wikipedia, etc.), focus on the 
SEARCH TERMS, URL PARAMETERS, and PAGE TITLE:
- If the search terms or page content relate to the focus goal, ALLOW it
- Only block if the content is clearly unrelated or distracting
```

### 标准模式提示
```
Be BALANCED. Allow websites that are reasonably related to the goal.

For general knowledge sites (Google, Wikipedia, etc.), analyze the 
SPECIFIC CONTENT:
- Check URL parameters (search queries, article topics)
- Check page title
- Allow if the content could reasonably help with the focus goal
```

### 严格模式提示
```
Be STRICT. Only allow websites that directly help achieve the goal.
Even for general sites, check if the specific content (search terms, 
page topic) is directly relevant.
```

## 技术实现

### 代码位置
- **文件**: `src/services/aiService.ts`
- **方法**: `classifyURLWithOpenAI()`

### 关键逻辑

1. **URL 解析**
```typescript
const url = new URL(payload.url);
const domain = url.hostname.replace('www.', '');
const searchParams = url.searchParams.toString();
const urlPath = url.pathname;
```

2. **识别通用网站**
```typescript
const generalKnowledgeSites = [
  'google.com', 'bing.com', 'wikipedia.org', ...
];
const isGeneralSite = generalKnowledgeSites.some(site => 
  domain.includes(site)
);
```

3. **根据宽容度调整提示词**
```typescript
if (strictness === 'relaxed') {
  strictnessInstruction = `Be LENIENT...`;
} else if (strictness === 'standard') {
  strictnessInstruction = `Be BALANCED...`;
} else {
  strictnessInstruction = `Be STRICT...`;
}
```

4. **传递完整上下文给 AI**
```typescript
const prompt = `
Focus Goal: ${intent}
Domain: ${domain}
URL Parameters: ${searchParams}
Page Title: ${payload.title}
${isGeneralSite ? 'Note: This is a GENERAL KNOWLEDGE site...' : ''}
${strictnessInstruction}
`;
```

## 测试建议

### 1. 宽松模式测试
- 设置目标："学习 JavaScript"
- 选择 Relaxed 模式
- 访问: `google.com/search?q=javascript+array+methods`
- **预期**: ✅ 放行

### 2. 标准模式测试
- 设置目标："写论文"
- 选择 Standard 模式
- 访问: `wikipedia.org/wiki/Academic_writing`
- **预期**: ✅ 放行
- 访问: `wikipedia.org/wiki/Video_games`
- **预期**: ❌ 拦截

### 3. 严格模式测试
- 设置目标："学习 Python"
- 选择 Strict 模式
- 访问: `stackoverflow.com/questions/tagged/python`
- **预期**: ✅ 放行
- 访问: `stackoverflow.com/questions/tagged/java`
- **预期**: ❌ 拦截

## 优势

1. **更智能**: 不再"一刀切"拦截整个域名
2. **更准确**: 基于实际内容判断，减少误拦截
3. **更灵活**: 用户可以通过宽容度调整体验
4. **更友好**: 允许合理使用通用工具

## 注意事项

- 通用网站的判断依赖 AI 调用，会消耗更多 API 配额
- 首次访问需要等待 AI 判断（约 1-2 秒）
- 判断结果会被缓存，重复访问不会再次调用 API
- 建议使用 Relaxed 或 Standard 模式以获得更好体验

## 下一步

可以考虑的改进方向：
1. 让用户自定义"通用网站"列表
2. 添加本地缓存优化，减少 AI 调用
3. 提供手动添加白名单规则的快捷方式
