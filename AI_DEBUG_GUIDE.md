# 🔧 AI链路调试指南

## ✅ 已修复的问题

### 1. AI配置重新加载
**问题**: 保存API key后,background service不会自动重新加载配置

**修复**: 
- 添加了 `RELOAD_AI_CONFIG` 消息类型
- 保存配置后自动通知background重新初始化AI服务
- 添加了详细的日志输出

### 2. 错误信息优化
**改进**:
- 添加了详细的console.log日志
- 改进了错误提示信息
- 区分不同的错误情况(无配置、无API key、API调用失败)

### 3. 测试连接功能
**新增**:
- 在设置页面添加了"测试连接"按钮
- 可以在不启动真实会话的情况下测试AI是否正常工作
- 显示详细的测试结果

## 📋 使用步骤

### 1. 重新加载扩展
```
1. 打开 chrome://extensions/
2. 找到 DoOneThing 扩展
3. 点击"重新加载"按钮 (刷新图标)
```

### 2. 配置API密钥
```
1. 点击扩展图标
2. 点击右上角的⚙️设置
3. 在"AI Config"标签下:
   - 选择Provider: OpenAI
   - 输入API Key (以sk-开头)
   - 选择Model: gpt-4o-mini (推荐)
4. 点击"💾 Save AI Configuration"
5. 点击"🧪 Test Connection"
```

### 3. 查看测试结果
测试按钮会:
- ✅ 绿色提示 = 连接成功
- ❌ 红色提示 = 连接失败,显示错误信息

## 🐛 调试技巧

### 查看详细日志

**1. Background Service日志**
```
1. 打开 chrome://extensions/
2. 找到 DoOneThing
3. 点击"service worker"(检查视图)
4. 查看Console标签
```

你应该看到:
```
AI Service initialized with config: {
  provider: "openai",
  model: "gpt-4o-mini", 
  enabled: true,
  hasApiKey: true
}
```

**2. Popup日志**
```
1. 右键点击扩展图标
2. 选择"检查"
3. 查看Console标签
```

**3. 测试连接时的日志**
点击"Test Connection"后,在background console中应该看到:
```
analyzeIntent called with: test connection - learning programming
Calling OpenAI API with model: gpt-4o-mini
OpenAI response status: 200
OpenAI response received successfully
Focus session started successfully
```

### 常见错误排查

#### 错误1: "AI service not configured"
**原因**: 没有保存API配置或配置未生效

**解决**:
1. 确保点击了"Save AI Configuration"
2. 点击"Test Connection"确认配置已生效
3. 重新加载扩展

#### 错误2: "API key is missing"
**原因**: API key为空或格式错误

**解决**:
1. 检查API key是否以 `sk-` 开头
2. 确保没有多余的空格
3. 重新从OpenAI复制API key

#### 错误3: "OpenAI API error: 401"
**原因**: API key无效或已过期

**解决**:
1. 在OpenAI平台检查API key是否有效
2. 生成新的API key
3. 更新扩展中的配置

#### 错误4: "OpenAI API error: 429"
**原因**: 超过API调用限制或配额不足

**解决**:
1. 检查OpenAI账户的配额
2. 等待一段时间后重试
3. 升级OpenAI账户套餐

#### 错误5: "OpenAI API error: 500/503"
**原因**: OpenAI服务暂时不可用

**解决**:
1. 等待几分钟后重试
2. 检查OpenAI状态页面: https://status.openai.com/
3. 切换到其他模型尝试

## 🧪 测试流程

### 完整测试
```
1. 配置API key
2. 保存配置
3. 点击"Test Connection" → 应该成功
4. 返回主页面
5. 输入: "我要学习Python编程"
6. 点击"Start Focus Mode"
7. 等待3-5秒
8. 应该看到专注模式界面,显示:
   - 专注目标
   - 关键词列表
   - 允许的网站
```

### 查看AI生成的规则
在background console中,你应该看到类似:
```javascript
{
  intent: "学习Python编程",
  keywords: ["Python", "编程", "代码", "开发", ...],
  allowedCategories: ["education", "programming", ...],
  blockedCategories: ["entertainment", "social", ...],
  suggestedWebsites: ["python.org", "github.com", ...],
  confidence: 95
}
```

## 📊 日志级别

### 正常流程日志
```
✅ AI Service initialized with config: {...}
✅ analyzeIntent called with: 我要学习Python
✅ Calling OpenAI API with model: gpt-4o-mini
✅ OpenAI response status: 200
✅ OpenAI response received successfully
✅ Focus session started successfully
```

### 错误流程日志
```
❌ AI service not configured: null
或
❌ API key missing
或
❌ OpenAI API error: 401 Unauthorized
或
❌ Failed to start session: [error details]
```

## 💡 开发建议

### 1. 保持Background Service活跃
Chrome可能会暂停不活跃的service worker,导致配置丢失。

**解决**: 已添加keepAlive机制
```javascript
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
```

### 2. 清除缓存
如果遇到奇怪问题:
```
1. 设置页面 → Data标签
2. 点击"Clear URL Cache"
3. 重新加载扩展
```

### 3. 完全重置
```
1. chrome://extensions/ → 删除扩展
2. npm run build
3. 重新加载扩展
4. 重新配置API key
```

## 🎯 验证清单

测试AI链路是否正常工作:

- [ ] 设置页面能打开
- [ ] 能输入并保存API key
- [ ] 点击"Test Connection"显示成功
- [ ] Background console显示配置日志
- [ ] 输入专注目标后能启动会话
- [ ] 能看到AI生成的关键词
- [ ] 访问无关网站会被拦截
- [ ] 访问相关网站能正常访问

## 🔍 高级调试

### 手动测试API调用
在background console中执行:
```javascript
// 检查配置
chrome.storage.local.get('aiConfig', (data) => {
  console.log('Current AI Config:', data.aiConfig);
});

// 手动测试API调用
fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY_HERE'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{role: 'user', content: 'test'}],
    max_tokens: 10
  })
}).then(r => r.json()).then(console.log);
```

### 监听所有消息
```javascript
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  console.log('Message received:', msg);
  return true;
});
```

## 📞 仍然有问题?

如果以上都无法解决:

1. **导出日志**
   - 打开所有Console (background + popup)
   - 右键 → Save as... → 保存日志

2. **检查网络**
   - Network标签中查看API请求
   - 确认请求是否发送
   - 查看响应内容

3. **验证API key**
   - 在OpenAI Playground测试同样的key
   - 确认有足够的配额

---

**重要提示**: 每次修改代码后记得:
1. `npm run build`
2. 重新加载扩展
3. 清除缓存(如果需要)
