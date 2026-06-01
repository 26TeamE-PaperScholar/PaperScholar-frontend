#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')
const isWindows = process.platform === 'win32'
const args = new Set(process.argv.slice(2))

const npmBin = isWindows ? 'npm.cmd' : 'npm'
const gitBin = isWindows ? 'git.cmd' : 'git'
const useMock = args.has('--mock') ? 'true' : 'false'
const shouldPull = args.has('--pull')
const skipInstall = args.has('--skip-install')
const minNodeMajor = 16
const host = '127.0.0.1'
const port = '5173'

function log(message) {
  console.log(`[PaperScholar] ${message}`)
}

function fail(message) {
  console.error(`[PaperScholar] ${message}`)
  process.exit(1)
}

function runSync(command, commandArgs, label) {
  log(label)
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env
  })

  if (result.error) fail(`${label} 失败：${result.error.message}`)
  if (result.status !== 0) fail(`${label} 失败，退出码：${result.status}`)
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    cwd: rootDir,
    stdio: 'ignore',
    env: process.env
  })
  return !result.error && result.status === 0
}

function ensureNodeVersion() {
  const major = Number(process.versions.node.split('.')[0])
  if (!Number.isFinite(major) || major < minNodeMajor) {
    fail(`当前 Node.js 版本是 ${process.version}，请安装 Node.js 16 或更新版本后再运行；推荐 Node.js 18/20 LTS。`)
  }
}

function ensureNpm() {
  if (!commandExists(npmBin)) {
    fail('未检测到 npm。请安装 Node.js 16 或更新版本；官方安装包通常会自带 npm。')
  }
}

function updateEnvLocal() {
  const envPath = resolve(rootDir, '.env.local')
  const key = 'VITE_USE_MOCK'
  const nextLine = `${key}=${useMock}`
  const lines = existsSync(envPath)
    ? readFileSync(envPath, 'utf8').split(/\r?\n/)
    : []

  let found = false
  const nextLines = lines
    .filter((line, index) => line !== '' || index < lines.length - 1)
    .map((line) => {
      if (line.startsWith(`${key}=`)) {
        found = true
        return nextLine
      }
      return line
    })

  if (!found) nextLines.push(nextLine)
  writeFileSync(envPath, `${nextLines.join('\n')}\n`, 'utf8')
  log(`已写入 .env.local：${nextLine}`)
}

function maybePullLatest() {
  if (!shouldPull) return
  if (!existsSync(resolve(rootDir, '.git'))) {
    log('当前目录不是 Git 仓库，跳过 --pull。')
    return
  }
  if (!commandExists(gitBin)) {
    log('未检测到 Git，跳过 --pull。')
    return
  }
  runSync(gitBin, ['pull', '--ff-only'], '拉取最新代码')
}

function installDependencies() {
  if (skipInstall) {
    log('已跳过依赖安装。')
    return
  }
  runSync(npmBin, ['ci', '--no-audit', '--no-fund'], '安装依赖 npm ci')
}

function startDevServer() {
  const url = `http://localhost:${port}/`
  log(`即将启动本地测试服务，优先使用：${url}`)
  log('如端口被占用，请以 Vite 输出的 Local 地址为准。')
  log('保持这个终端窗口打开；结束测试时按 Ctrl+C。')

  const child = spawn(
    npmBin,
    ['run', 'dev', '--', '--host', host, '--port', port],
    {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_USE_MOCK: useMock
      }
    }
  )

  child.on('error', (error) => fail(`启动失败：${error.message}`))
  child.on('exit', (code) => process.exit(code ?? 0))
}

ensureNodeVersion()
ensureNpm()
maybePullLatest()
updateEnvLocal()
installDependencies()
startDevServer()
