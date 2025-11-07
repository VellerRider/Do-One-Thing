# DoOneThing - AI-Powered Focus Browser Extension

[English](#english) | [中文](#中文)

---

## English

### 🎯 Overview

DoOneThing is an AI-powered Chrome extension that helps you focus on one thing at a time by intelligently filtering distracting content. Simply describe what you want to focus on in natural language, and the AI will automatically block irrelevant websites while allowing helpful resources.

> **Note**: I vibed coded this project, so it’s pretty rough and subject to change.

### ✨ Key Features

- **🤖 AI Intent Understanding**: Describe your goal in natural language, AI generates filtering rules automatically
- **🚫 Smart Website Blocking**: Automatically blocks websites unrelated to your current task
- **🧠 Content-Based Filtering**: For general sites (Google, Wikipedia), analyzes search terms and page content instead of blocking entire domains
- **⚖️ Three Strictness Levels**: Relaxed/Standard/Strict modes to adjust filtering intensity
- **🎬 Fine-Grained Content Filtering**: Video-level filtering for platforms like YouTube
- **💡 Smart Recommendations**: Suggests relevant learning resources on blocked pages
- **🎯 Single-Task Mode**: Forces focus on one thing at a time

### 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **AI Service**: OpenAI API (gpt-4o-mini)
- **Platform**: Chrome Extension Manifest V3

### � Quick Start

#### Installation
```bash
npm install
```

#### Development
```bash
npm run dev
```

#### Build
```bash
npm run build
```

#### Load in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` directory

### 📖 How to Use

1. Click the extension icon to open popup
2. Go to Settings and configure your OpenAI API Key
3. Enter your focus goal (e.g., "Learn Python programming")
4. Choose strictness level (Relaxed/Standard/Strict)
5. AI analyzes your intent and activates filtering
6. Browser automatically blocks unrelated sites
7. For general sites (Google, Wikipedia), AI analyzes search terms and content
8. Blocked pages show relevant resource recommendations

### 🎚️ Filtering Modes

#### 🟢 Relaxed
- Very lenient with general knowledge sites
- Allows if search terms or content relate to goal
- Only blocks obvious entertainment

#### 🟡 Standard (Recommended)
- Balanced judgment
- Analyzes URL parameters, search terms, page titles
- Allows reasonably related content

#### 🔴 Strict
- Rigorous filtering for all sites
- Requires direct relevance even for general sites
- Maximizes focus

> For detailed filtering strategy, see [SMART_FILTERING.md](./SMART_FILTERING.md)

### ⚙️ Configuration

Available settings:
- OpenAI API Key
- Strictness level (Relaxed/Standard/Strict)
- Whitelist domains
- Custom blocked page

### 📁 Project Structure

```
Do-One-Thing/
├── src/
│   ├── background/          # Background Service Worker
│   ├── content/            # Content Scripts  
│   ├── popup/              # Popup UI
│   ├── blocked/            # Blocked Page
│   ├── services/           # Shared Services
│   └── utils/              # Helper Functions
├── public/
│   ├── manifest.json       # Extension Manifest
│   └── icons/              # Extension Icons
└── dist/                   # Build Output
```

### 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

### 📄 License

MIT

---

## 中文

### 🎯 项目简介

DoOneThing 是一个基于 AI 的 Chrome 浏览器专注插件，通过智能过滤干扰内容帮助你专注于一件事。只需用自然语言描述你想做的事，AI 就会自动拦截无关网站，同时保留有用的资源。

> **注意**：I vibed coded this project, so it’s probably pretty rough and subject to change anytime.

### ✨ 核心功能

- **🤖 AI 意图理解**：用自然语言描述目标，AI 自动生成过滤规则
- **🚫 智能网站拦截**：自动识别并阻止与当前任务无关的网站
- **🧠 基于内容判断**：对 Google、Wikipedia 等通用网站，分析搜索词和页面内容而非简单拦截域名
- **⚖️ 三级宽容度**：Relaxed/Standard/Strict 三种模式调整拦截强度
- **🎬 细粒度内容过滤**：对 YouTube 等平台进行视频级别的内容过滤
- **💡 智能推荐**：在拦截页面显示相关学习资源推荐
- **🎯 单一任务模式**：强制专注，一次只做一件事

### 🏗️ 技术栈

- **前端**：React 18 + TypeScript
- **样式**：Tailwind CSS
- **构建工具**：Vite
- **AI 服务**：OpenAI API (gpt-4o-mini)
- **平台**：Chrome Extension Manifest V3

### 🚀 快速开始

#### 安装依赖
```bash
npm install
```

#### 开发模式
```bash
npm run dev
```

#### 构建
```bash
npm run build
```

#### 加载到 Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 目录

### 📖 使用说明

1. 点击扩展图标打开 popup
2. 进入设置配置你的 OpenAI API Key
3. 输入专注目标（如："学习 Python 编程"）
4. 选择宽容度模式（Relaxed/Standard/Strict）
5. AI 分析意图并激活过滤模式
6. 浏览器自动拦截无关网站
7. 对于 Google、Wikipedia 等通用网站，AI 会分析搜索词和内容
8. 被拦截的页面显示相关资源推荐

### 🎚️ 过滤模式

#### 🟢 Relaxed（宽松）
- 对通用知识网站非常宽容
- 只要搜索词或内容与目标相关就放行
- 只拦截明显的娱乐内容

#### 🟡 Standard（标准，推荐）
- 平衡的判断策略
- 分析 URL 参数、搜索词、页面标题
- 内容合理相关就允许访问

#### 🔴 Strict（严格）
- 严格审查所有网站
- 即使通用网站也要求具体内容直接相关
- 最大化专注度

> 详细过滤策略说明请查看 [SMART_FILTERING.md](./SMART_FILTERING.md)

### ⚙️ 配置选项

可配置项：
- OpenAI API 密钥
- 拦截强度（宽松/标准/严格）
- 白名单域名
- 自定义拦截页面

### 📁 项目结构

```
Do-One-Thing/
├── src/
│   ├── background/          # 后台服务 Worker
│   ├── content/            # 内容脚本
│   ├── popup/              # 弹窗 UI
│   ├── blocked/            # 拦截页面
│   ├── services/           # 共享服务
│   └── utils/              # 工具函数
├── public/
│   ├── manifest.json       # 扩展清单
│   └── icons/              # 扩展图标
└── dist/                   # 构建输出
```

### 🤝 贡献

欢迎贡献！你可以：
- 报告 bug
- 提出功能建议
- 提交 pull request

### 📄 许可证

MIT

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
