# 同行专家本地一键测试说明

这套脚本用于让专家在自己的 Windows、macOS 或 Linux 电脑上运行前端测试环境。专家只需要克隆仓库，在项目主目录运行 `npm run expert:test`，然后用浏览器访问本机地址。

## 适用场景

- 适合：专家具备基本电脑操作能力，可以安装 Git 和 Node.js。
- 不适合：完全不希望专家安装任何开发工具的测试。此时仍建议提供公网测试地址。
- 本地地址 `http://localhost:5173/` 只代表专家自己的电脑，不是公网地址，不能发给别人访问。

## 前置安装

所有系统都需要：

- Git
- Node.js 18 或 20 LTS，安装 Node.js 会自带 npm

Windows：

1. 安装 Git for Windows。
2. 安装 Node.js 18/20 LTS。
3. 打开 PowerShell 或命令提示符，确认：

```bash
git --version
node --version
npm --version
```

macOS：

1. 如果没有 Git，先安装 Xcode Command Line Tools，或安装 Git。
2. 安装 Node.js 18/20 LTS，可使用官方安装包或 Homebrew。
3. 打开 Terminal，确认：

```bash
git --version
node --version
npm --version
```

Linux：

1. 使用系统包管理器安装 Git。
2. 安装 Node.js 18/20 LTS，建议使用 NodeSource、nvm 或发行版官方源。
3. 确认：

```bash
git --version
node --version
npm --version
```

## 克隆仓库

```bash
git clone https://github.com/26TeamE-PaperScholar/PaperScholar-fronted.git
cd PaperScholar-fronted
```

## 一键启动

推荐所有系统统一使用：

```bash
npm run expert:test
```

也可以直接运行本目录中的脚本。

Windows：

```bat
expert-test\start-expert-test.cmd
```

macOS / Linux：

```bash
sh ./expert-test/start-expert-test.sh
```

脚本会自动完成：

1. 检查 Node.js 版本。
2. 写入 `.env.local`，设置 `VITE_USE_MOCK=false`。
3. 执行 `npm ci` 安装依赖。
4. 启动 Vite 本地服务。
5. 提示访问 `http://localhost:5173/`。

## 可选参数

跳过依赖安装，适合已经安装过依赖、只想快速重启：

```bash
npm run expert:test -- --skip-install
```

启动前拉取最新代码：

```bash
npm run expert:test -- --pull
```

后端暂时不可用时使用 mock 数据：

```bash
npm run expert:test -- --mock
```

## 真实后端访问方式

当前项目的前端请求统一走 `/api`。本地开发服务会使用 `vite.config.js` 中的开发代理，把 `/api` 转发到后端联调地址。

因此专家访问的是：

```text
http://localhost:5173/
```

浏览器里实际 API 请求形如：

```text
http://localhost:5173/api/...
```

再由 Vite 开发服务器代理到后端。

## 常见问题

Node 版本过低：

- 现象：脚本提示 Node.js 版本不满足要求。
- 处理：安装 Node.js 18 或 20 LTS 后重新打开终端。

Windows 提示找不到 node：

- 处理：重新安装 Node.js，并勾选添加到 PATH；安装后重新打开 PowerShell 或命令提示符。

依赖安装失败：

- 检查网络是否能访问 npm registry。
- 删除 `node_modules` 后重新运行脚本。

端口被占用：

- Vite 通常会自动选择下一个端口，例如 `5174`。
- 以终端实际打印的地址为准。

页面能打开但接口失败：

- 检查后端联调地址是否在线。
- 浏览器开发者工具 Network 中确认请求是否为 `/api/...`。
- 如后端暂时不可用，可使用 `--mock` 只演示前端页面。

登录失败：

- 确认后端 Cookie、CSRF、Session 配置允许本地开发代理访问。
- 当前源码使用 `withCredentials`，并会读取 `csrftoken` 后发送 `X-CSRFToken`。
