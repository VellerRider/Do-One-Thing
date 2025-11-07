# DoOneThing - AI-Powered Focus Browser Extension

一个基于AI的浏览器专注插件,帮助用户专注于一件事,智能过滤干扰内容。

## 🎯 核心功能

- **AI意图理解**: 用户用自然语言描述要做的事,AI智能理解并生成过滤规则
- **智能网站拦截**: 自动识别并阻止与当前任务无关的网站
- **智能内容判断**: 对Google、Wikipedia等通用网站,基于搜索词和页面内容判断,而非简单拦截域名
- **三级宽容度**: Relaxed/Standard/Strict 三种模式,自动调整拦截严格程度
- **细粒度内容过滤**: 对YouTube等平台进行视频级别的内容过滤
- **智能内容推荐**: 将被拦截的网站替换为相关学习资源
- **单一任务模式**: 强制专注,一次只做一件事

## 🏗️ 技术架构

- **前端框架**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **AI服务**: OpenAI API / Claude API
- **浏览器**: Chrome Extension Manifest V3

## 📁 项目结构

```
Do-One-Thing/
├── src/
│   ├── background/          # Background Service Worker
│   │   ├── index.ts
│   │   ├── urlClassifier.ts
│   │   └── requestBlocker.ts
│   ├── content/            # Content Scripts
│   │   ├── index.ts
│   │   ├── contentFilter.ts
│   │   └── youtube.ts
│   ├── popup/              # Popup UI
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── components/
│   ├── blocked/            # Blocked Page
│   │   ├── index.html
│   │   └── blocked.tsx
│   ├── services/           # Shared Services
│   │   ├── aiService.ts
│   │   ├── storage.ts
│   │   └── types.ts
│   └── utils/
├── public/
│   ├── manifest.json
│   └── icons/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 开始使用

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 加载到Chrome
1. 打开Chrome扩展管理页面 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 目录

## 🎨 使用流程

1. 点击扩展图标打开popup
2. 在设置中配置你的 OpenAI API Key
3. 输入你的专注目标(如:"我要学习编程")
4. 选择宽容度模式 (Relaxed/Standard/Strict)
5. AI分析你的意图并激活过滤模式
6. 浏览器自动拦截无关网站,保留相关内容
7. 对于Google、Wikipedia等通用网站,AI会分析搜索词和页面内容来判断
8. 被拦截的页面显示推荐的学习资源

## 🎯 智能过滤策略

### Relaxed (宽松模式)
- 对通用知识网站(Google、Wikipedia等)非常宽容
- 只要搜索词或内容与目标相关就放行
- 只拦截明显的娱乐内容

### Standard (标准模式)
- 平衡的判断策略
- 分析URL参数、搜索词、页面标题
- 内容合理相关就允许访问

### Strict (严格模式)
- 严格审查所有网站
- 即使通用网站也要求具体内容直接相关
- 最大化专注度

详细说明请查看 [SMART_FILTERING.md](./SMART_FILTERING.md)

## 🔧 配置

在popup中可以配置:
- AI API密钥
- 拦截强度(宽松/标准/严格)
- 白名单网站
- 自定义拦截页面

## 📝 开发计划

- [x] 架构设计
- [ ] 基础扩展框架搭建
- [ ] AI服务集成
- [ ] URL分类器实现
- [ ] Content过滤器实现
- [ ] YouTube特殊处理
- [ ] 拦截页面设计
- [ ] UI/UX优化
- [ ] 测试与优化

## 📄 License

MIT
