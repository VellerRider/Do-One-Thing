# DoOneThing 行动方案

## 📋 项目概述

DoOneThing 是一个基于AI的Chrome浏览器专注插件,帮助用户通过智能拦截无关网站来专注于单一任务。

## 🎯 核心功能特性

1. **AI意图理解** - 用户用自然语言描述目标,AI自动分析并生成过滤规则
2. **智能URL拦截** - 多级判断机制(白名单→黑名单→缓存→关键词→AI)
3. **细粒度内容过滤** - YouTube视频级别过滤,侧边栏推荐清理
4. **智能拦截页面** - 被拦截网站显示相关学习资源推荐
5. **实时统计** - 记录拦截次数、专注时长、完成会话数

## 📅 开发计划

### Phase 1: 基础框架搭建 (✅ 已完成)

#### 1.1 项目初始化
- [x] 创建项目结构
- [x] 配置TypeScript + React + Vite
- [x] 配置Tailwind CSS
- [x] 创建manifest.json

#### 1.2 核心类型和服务
- [x] 定义TypeScript类型 (types.ts)
- [x] 实现Storage服务(Chrome Storage封装)
- [x] 实现AI服务(OpenAI集成)
- [x] 实现工具函数库

#### 1.3 Background Service Worker
- [x] URL分类器(URLClassifier)
- [x] 请求拦截器(RequestBlocker)
- [x] 消息处理器
- [x] 会话管理

#### 1.4 Content Scripts
- [x] YouTube专用过滤器
- [x] 通用内容过滤器
- [x] 专注指示器UI

#### 1.5 Popup UI框架
- [x] React应用主框架
- [x] 开始会话视图(部分完成)
- [ ] 活动会话视图
- [ ] 设置视图
- [ ] 拦截页面

### Phase 2: 核心功能实现 (当前阶段)

#### 2.1 完成UI组件 (预计2天)
```
TODO:
- [ ] ActiveSessionView.tsx - 显示活动会话状态
  - 显示当前专注目标
  - 实时拦截统计
  - 倒计时/计时器
  - 结束会话按钮
  
- [ ] SettingsView.tsx - 设置页面
  - AI配置(API密钥、模型选择)
  - 拦截强度设置
  - 白名单/黑名单管理
  - 数据导出/导入
  
- [ ] Blocked Page (blocked/index.html + blocked.tsx)
  - 拦截提示
  - 推荐替代网站
  - 临时允许选项
  - 返回功能
```

**具体任务:**
```bash
# 1. 创建 ActiveSessionView.tsx
- 组件结构:顶部专注目标卡片 + 中间统计数据 + 底部操作按钮
- 实时更新专注时长(useEffect + setInterval)
- 显示本次会话拦截的网站列表
- "End Focus" 按钮确认对话框

# 2. 创建 SettingsView.tsx  
- Tab切换: "AI Config" / "Blocking Rules" / "Data"
- AI Config: provider选择、API key输入、model选择、测试连接
- Blocking Rules: 严格度滑块、白名单输入框、黑名单输入框
- Data: 导出JSON、导入JSON、清除缓存、重置统计

# 3. 创建 Blocked Page
- 全屏居中设计
- 顶部: 大号拦截图标 + "Stay Focused"
- 中间: 拦截原因 + 专注目标提醒
- 推荐区域: 3-5个相关网站卡片
- 底部: "临时允许(需输入原因)" + "返回"
```

#### 2.2 AI服务增强 (预计1天)
```
TODO:
- [ ] 优化Prompt工程
  - 更精确的意图分析prompt
  - 更严格的URL判断prompt
  - 批量处理优化
  
- [ ] 错误处理
  - API限流处理
  - 网络错误重试
  - Fallback到本地规则
  
- [ ] 性能优化
  - 实现请求队列
  - 批量请求合并
  - 结果缓存优化
```

#### 2.3 URL分类器完善 (预计1天)
```
TODO:
- [ ] 预设规则库
  - 常见学习网站列表(教育、编程、文档等)
  - 常见干扰网站列表(社交、视频、游戏等)
  - 特殊处理网站(GitHub、StackOverflow等)
  
- [ ] 智能判断优化
  - 域名相似度计算
  - 子域名处理(www, m, etc.)
  - URL参数分析
  
- [ ] 缓存策略优化
  - LRU缓存实现
  - 缓存预热
  - 缓存统计
```

#### 2.4 Content过滤器增强 (预计2天)
```
TODO:
- [ ] YouTube过滤增强
  - 视频页面播放拦截动画
  - 评论区过滤
  - 搜索结果过滤
  - Shorts过滤
  
- [ ] 通用网站过滤
  - 识别推荐内容区域(机器学习?)
  - 广告拦截增强
  - 侧边栏过滤
  - 弹窗拦截
  
- [ ] MutationObserver优化
  - 性能优化(debounce)
  - 内存泄漏防止
  - 动态内容监听
```

### Phase 3: 测试与优化 (预计3天)

#### 3.1 功能测试
```
- [ ] 会话流程测试
  - 启动会话 → AI分析 → 规则生成
  - 浏览网站 → URL判断 → 拦截/放行
  - 结束会话 → 统计更新 → 历史记录
  
- [ ] 边界情况测试
  - 无API密钥
  - API调用失败
  - 网络离线
  - 缓存满
  
- [ ] 多标签页测试
  - 同时打开多个标签页
  - 标签页间通信
  - 状态同步
```

#### 3.2 性能优化
```
- [ ] 启动速度优化
  - 懒加载
  - 代码分割
  - 缓存预加载
  
- [ ] 运行时性能
  - URL判断延迟 < 100ms
  - AI判断延迟 < 2s
  - 内存占用 < 100MB
  
- [ ] 电池优化
  - 减少定时器
  - 优化Observer
  - 降低CPU使用
```

#### 3.3 用户体验优化
```
- [ ] UI/UX打磨
  - 动画效果
  - 加载状态
  - 错误提示
  - 成功反馈
  
- [ ] 引导流程
  - 首次使用教程
  - 快捷键支持
  - 右键菜单
  
- [ ] 无障碍支持
  - ARIA标签
  - 键盘导航
  - 屏幕阅读器
```

### Phase 4: 高级功能 (预计4天)

#### 4.1 多AI提供商支持
```
- [ ] Anthropic Claude集成
- [ ] Google Gemini集成
- [ ] 本地模型支持(Ollama)
- [ ] AI提供商切换
```

#### 4.2 高级过滤功能
```
- [ ] 时间限制(只在特定时间拦截)
- [ ] 配额系统(每天允许访问N次)
- [ ] 渐进式拦截(第一次警告,第二次拦截)
- [ ] 网站评分系统
```

#### 4.3 数据分析与可视化
```
- [ ] 统计面板
  - 每日专注时长图表
  - 拦截网站分类饼图
  - 专注效率趋势
  
- [ ] 数据导出
  - CSV格式
  - JSON格式
  - PDF报告
```

#### 4.4 社区功能
```
- [ ] 规则分享
  - 导出规则配置
  - 导入他人规则
  - 规则市场
  
- [ ] 排行榜
  - 专注时长排名
  - 成就系统
  - 徽章收集
```

## 🚀 即刻开始的行动步骤

### 第一步: 安装依赖并测试构建
```bash
cd /Users/qihangyang/Do-One-Thing
npm install
npm run build
```

### 第二步: 创建图标资源
```bash
# 创建简单的图标(可使用在线工具或设计软件)
# 需要: 16x16, 32x32, 48x48, 128x128 PNG
# 放置在: public/icons/
```

### 第三步: 完成剩余UI组件
```
优先级顺序:
1. ActiveSessionView.tsx (最重要 - 用户会话时主界面)
2. blocked/index.html + blocked.tsx (核心功能)
3. SettingsView.tsx (配置AI必需)
```

### 第四步: 本地测试
```bash
1. npm run build
2. 打开 Chrome -> chrome://extensions/
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 dist 目录
6. 测试完整流程
```

### 第五步: 调试和修复
```
- 使用 Chrome DevTools 调试 Background/Content Scripts
- 使用 React DevTools 调试 Popup UI
- 检查 Console 错误
- 测试各种网站
```

## 📝 开发注意事项

### 1. Chrome Extension API限制
- Manifest V3不支持远程代码
- Service Worker没有DOM访问
- Content Script与页面隔离
- 消息传递是异步的

### 2. AI API使用
- 成本控制(缓存、批量请求)
- API密钥安全(本地加密存储)
- 错误处理(重试、降级)
- 速率限制(队列管理)

### 3. 性能考虑
- URL判断必须快速(<100ms)
- 避免阻塞主线程
- 内存泄漏防止
- 电池消耗优化

### 4. 隐私保护
- 不记录用户浏览历史
- API密钥本地加密
- 最小化数据传输
- 用户数据不上传

## 🐛 已知问题和TODO

### 类型错误修复
```
当前lint错误主要是:
- chrome API类型缺失 -> 需要安装依赖后解决
- NodeJS类型缺失 -> 使用window.setTimeout替代
- React类型缺失 -> 需要安装依赖后解决

这些在npm install后会自动解决
```

### 功能完善
```
- [ ] vite配置需要调整以正确构建扩展
- [ ] 需要添加copy插件复制manifest.json到dist
- [ ] 需要生成图标资源
- [ ] 需要添加开发模式热重载
```

## 📚 参考资源

- [Chrome Extension API文档](https://developer.chrome.com/docs/extensions/)
- [OpenAI API文档](https://platform.openai.com/docs/api-reference)
- [React文档](https://react.dev/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Vite文档](https://vitejs.dev/)

## 🎯 成功标准

### MVP阶段(最小可用产品)
- [x] 用户能输入专注目标
- [x] AI能分析意图并生成规则
- [x] 能拦截无关网站
- [ ] 能显示拦截页面
- [ ] 能结束会话并查看统计

### Beta阶段
- [ ] YouTube过滤功能完善
- [ ] 性能优化完成
- [ ] 用户测试通过
- [ ] 文档完善

### 正式发布
- [ ] 所有核心功能完成
- [ ] 无严重Bug
- [ ] 用户反馈积极
- [ ] 准备发布到Chrome Web Store

## 📞 下一步行动

**立即执行:**
1. 运行 `npm install` 安装所有依赖
2. 创建图标资源文件
3. 完成 ActiveSessionView、SettingsView和Blocked Page组件
4. 测试完整的用户流程
5. 修复发现的Bug

**本周目标:**
- 完成所有UI组件
- 实现完整的会话流程
- 本地测试通过
- 准备第一个可用版本

---

**项目当前状态:** 基础框架完成 ✅ | MVP开发中 🚧 | 预计1-2周完成可用版本 🎯
