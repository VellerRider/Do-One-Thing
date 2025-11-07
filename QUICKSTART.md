# 快速开始指南

## 安装依赖

```bash
npm install
```

## 开发

```bash
# 构建扩展
npm run build

# 监听模式(开发中)
npm run dev
```

## 加载到Chrome

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 配置AI

1. 获取OpenAI API密钥: https://platform.openai.com/api-keys
2. 点击扩展图标打开popup
3. 点击设置(⚙️)
4. 输入你的API密钥
5. 选择模型(推荐: gpt-4o-mini)
6. 保存

## 使用

1. 点击扩展图标
2. 输入你想专注的事情,例如:
   - "我要学习Python编程"
   - "准备明天的考试"
   - "写一篇关于AI的文章"
3. 点击"开始专注模式"
4. AI会自动拦截无关网站
5. 完成后点击"结束会话"

## 当前状态

✅ **已完成:**
- 项目结构搭建
- TypeScript类型定义
- Background Service Worker
- URL分类器和拦截器
- AI服务集成(OpenAI)
- Content Scripts(YouTube过滤器)
- 部分UI组件

🚧 **开发中:**
- ActiveSessionView组件
- SettingsView组件  
- Blocked Page
- UI完善和测试

## 下一步

参考 `ACTION_PLAN.md` 了解详细的开发计划。
