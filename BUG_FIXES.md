# Bug Fixes - Focus Mode Navigation & CSP Error

## 问题总结

### 1. 导航问题
**问题**: 启动 Focus Mode 后，点击设置再返回就结束了会话
**原因**: 设置按钮返回时总是回到 'start' 视图，而不是记住之前的视图状态

### 2. CSP 错误
**问题**: Focus Mode 启动后 console 报错 Content Security Policy 违规
```
Executing inline script violates the following Content Security Policy directive 'script-src 'self''
```
**原因**: `blocked/index.html` 中包含内联 JavaScript，违反了 Chrome 扩展的内容安全策略

## 修复内容

### 1. 修复视图导航逻辑 (`src/popup/App.tsx`)

**添加状态追踪**:
```typescript
const [previousView, setPreviousView] = useState<'start' | 'active'>('start');
```

**更新开始会话时保存状态**:
```typescript
if (response.success) {
  setSession(response.session);
  setView('active');
  setPreviousView('active');  // 记住当前是 active 状态
  // ...
}
```

**更新结束会话时保存状态**:
```typescript
if (response.success) {
  setSession(null);
  setView('start');
  setPreviousView('start');  // 记住当前是 start 状态
  // ...
}
```

**修复设置按钮逻辑**:
```typescript
<button
  onClick={() => {
    if (view === 'settings') {
      setView(previousView);  // 返回之前的视图
    } else {
      setPreviousView(view as 'start' | 'active');  // 保存当前视图
      setView('settings');
    }
  }}
  // ...
>
```

现在的行为:
- 从 **start** 视图点击设置 → 返回时回到 **start** 视图
- 从 **active** 视图点击设置 → 返回时回到 **active** 视图 ✅

### 2. 修复 CSP 违规问题

**创建独立的 JavaScript 文件** (`src/blocked/blocked.js`):
- 将所有内联脚本移到独立文件
- 导出 `allowTemporarily()` 和 `goBack()` 函数到全局

**更新 HTML** (`src/blocked/index.html`):
```html
<!-- 移除了所有 <script> 内联代码 -->
<script src="blocked.js"></script>  <!-- 使用外部脚本 -->
```

**更新构建脚本** (`post-build.sh`):
```bash
# 复制 blocked.js 到 dist 目录
cp src/blocked/blocked.js dist/blocked/blocked.js
```

**更新 manifest.json**:
```json
"web_accessible_resources": [
  {
    "resources": ["blocked/index.html", "blocked/blocked.js"],
    "matches": ["<all_urls>"]
  }
]
```

## 测试步骤

### 1. 重新加载扩展
1. 打开 `chrome://extensions/`
2. 找到 DoOneThing 扩展
3. 点击刷新按钮 🔄

### 2. 测试导航修复
1. 启动一个 Focus Session
2. 看到 "Focus Mode Active" 界面
3. 点击右上角设置按钮 ⚙️
4. 查看设置页面
5. 点击左上角返回按钮 ←
6. **预期结果**: 应该返回到 "Focus Mode Active" 界面，会话继续进行 ✅

### 3. 测试 CSP 修复
1. 启动 Focus Session
2. 访问一个会被拦截的网站（如 `google.com`）
3. 应该看到拦截页面，不再有 CSP 错误
4. 打开 DevTools Console (F12)
5. **预期结果**: 没有 Content Security Policy 相关错误 ✅

## 技术细节

### 为什么需要外部脚本？
Chrome Extension Manifest V3 强制执行严格的 CSP：
- ❌ 不允许内联 `<script>` 标签
- ❌ 不允许 `eval()` 和类似功能
- ✅ 只允许从扩展包内加载的外部脚本

### previousView 的作用
通过追踪用户进入设置前的视图状态，确保返回时能正确恢复：
```
start → settings → start  (初始状态)
active → settings → active (会话进行中)
```

## 文件变更清单

- ✅ `src/popup/App.tsx` - 添加视图状态追踪
- ✅ `src/blocked/index.html` - 移除内联脚本
- ✅ `src/blocked/blocked.js` - 新建外部脚本文件
- ✅ `post-build.sh` - 添加复制 blocked.js 的步骤
- ✅ `public/manifest.json` - 添加 blocked.js 到 web_accessible_resources

## 构建状态

✅ **构建成功**: 611ms
✅ **所有文件已复制**
✅ **准备就绪**

请重新加载扩展并测试！
