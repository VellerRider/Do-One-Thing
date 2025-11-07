# Privacy Policy for DoOneThing

**Last Updated**: November 7, 2025

## Overview

DoOneThing ("we", "our", or "the extension") is committed to protecting your privacy. This privacy policy explains how we handle data when you use our Chrome extension.

## Data Collection and Usage

### What We Collect

1. **User Settings**
   - OpenAI API Key (stored locally on your device)
   - Focus goals and keywords
   - Strictness mode preferences
   - Whitelist/blacklist configurations

2. **Browsing Data**
   - URLs of websites you visit
   - Page titles
   - URL parameters (search queries, etc.)

### How We Use Data

- **Local Storage**: All your settings and API keys are stored locally on your device using Chrome's storage API. We do not have access to this data.

- **AI Analysis**: URLs and page titles are sent to OpenAI's API for relevance analysis. This is necessary for the extension to function. OpenAI's privacy policy applies to this data: https://openai.com/policies/privacy-policy

- **No Collection**: We do not collect, store, or transmit any data to our own servers. We do not have servers or databases.

### Third-Party Services

**OpenAI API**:
- URLs and page titles are sent to OpenAI for AI analysis
- OpenAI's privacy policy applies: https://openai.com/policies/privacy-policy
- You can review OpenAI's data usage policies on their website

## Data Storage

- All data is stored locally using Chrome's `chrome.storage.local` API
- Data persists across browser sessions
- You can clear all data by uninstalling the extension

## Permissions

The extension requires the following permissions:

- **storage**: To save your settings and session data locally
- **declarativeNetRequest**: To block websites based on your focus goals
- **declarativeNetRequestFeedback**: To provide feedback on blocked requests
- **scripting**: To inject content filters on web pages
- **tabs**: To detect which websites you're visiting
- **webNavigation**: To monitor page navigation for filtering
- **host_permissions**: Required to access all URLs for filtering

## Data Sharing

- We do not share your data with any third parties except OpenAI (as described above)
- We do not sell your data
- We do not use your data for advertising
- We do not track your behavior across websites

## User Control

You have full control over your data:

- **View**: Check your settings in the extension popup
- **Modify**: Change your API key, focus goals, and preferences at any time
- **Delete**: Uninstall the extension to remove all stored data

## Children's Privacy

This extension is not intended for children under 13. We do not knowingly collect data from children.

## Changes to Privacy Policy

We may update this privacy policy from time to time. We will notify users of any material changes through the extension update notes.

## Contact

For questions about this privacy policy, please:
- Open an issue on GitHub: https://github.com/VellerRider/Do-One-Thing
- Email: [Your contact email]

## Consent

By using DoOneThing, you consent to this privacy policy.

---

## 中文版本

**更新日期**：2025年11月7日

## 概述

DoOneThing（"我们"或"该扩展"）致力于保护您的隐私。本隐私政策说明我们如何处理您使用 Chrome 扩展时的数据。

## 数据收集与使用

### 我们收集什么

1. **用户设置**
   - OpenAI API Key（本地存储在您的设备上）
   - 专注目标和关键词
   - 宽容度模式偏好
   - 白名单/黑名单配置

2. **浏览数据**
   - 您访问的网站 URL
   - 页面标题
   - URL 参数（搜索查询等）

### 如何使用数据

- **本地存储**：所有设置和 API 密钥都使用 Chrome 的存储 API 本地存储在您的设备上。我们无法访问这些数据。

- **AI 分析**：URL 和页面标题会发送到 OpenAI API 进行相关性分析。这是扩展功能所必需的。OpenAI 的隐私政策适用于这些数据：https://openai.com/policies/privacy-policy

- **不收集**：我们不向自己的服务器收集、存储或传输任何数据。我们没有服务器或数据库。

### 第三方服务

**OpenAI API**：
- URL 和页面标题会发送到 OpenAI 进行 AI 分析
- 适用 OpenAI 隐私政策：https://openai.com/policies/privacy-policy
- 您可以在其网站上查看 OpenAI 的数据使用政策

## 数据存储

- 所有数据使用 Chrome 的 `chrome.storage.local` API 本地存储
- 数据在浏览器会话之间保持
- 您可以通过卸载扩展来清除所有数据

## 权限

扩展需要以下权限：

- **storage**：在本地保存您的设置和会话数据
- **declarativeNetRequest**：根据您的专注目标拦截网站
- **declarativeNetRequestFeedback**：提供拦截请求的反馈
- **scripting**：在网页上注入内容过滤器
- **tabs**：检测您正在访问的网站
- **webNavigation**：监控页面导航以进行过滤
- **host_permissions**：访问所有 URL 以进行过滤所需

## 数据共享

- 除 OpenAI（如上所述）外，我们不与任何第三方共享您的数据
- 我们不出售您的数据
- 我们不使用您的数据进行广告
- 我们不跨网站跟踪您的行为

## 用户控制

您对数据拥有完全控制权：

- **查看**：在扩展弹窗中查看您的设置
- **修改**：随时更改您的 API 密钥、专注目标和偏好
- **删除**：卸载扩展即可删除所有存储的数据

## 儿童隐私

本扩展不适用于 13 岁以下儿童。我们不会故意收集儿童数据。

## 隐私政策变更

我们可能会不时更新本隐私政策。我们将通过扩展更新说明通知用户任何重大变更。

## 联系方式

有关本隐私政策的问题，请：
- 在 GitHub 上提交问题：https://github.com/VellerRider/Do-One-Thing
- 电子邮件：[您的联系邮箱]

## 同意

使用 DoOneThing 即表示您同意本隐私政策。
