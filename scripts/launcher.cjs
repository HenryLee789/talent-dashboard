const childProcess = require("node:child_process");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const defaultUrl = "http://127.0.0.1:5173/";
const serverReadyTimeoutMs = 60_000;

let devProcess = null;
let openedBrowser = false;
let detectedUrl = "";
let packageManagerCommand = "pnpm";
let packageManagerArgsPrefix = [];

function log(message = "") {
  console.log(message);
}

function fail(message, error) {
  console.error("");
  console.error("启动失败：");
  console.error(message);
  if (error) {
    console.error("");
    console.error("错误详情：");
    console.error(error.message || String(error));
  }
  console.error("");
  console.error("请按任意键关闭窗口。");
  process.stdin.resume();
  process.stdin.once("data", () => process.exit(1));
}

function runCheck(command, args) {
  return childProcess.spawnSync([command, ...args].join(" "), {
    cwd: projectRoot,
    shell: true,
    encoding: "utf8",
  });
}

function formatCommand(command, args) {
  return [command, ...args].join(" ");
}

function setPackageManager(command, argsPrefix = []) {
  packageManagerCommand = command;
  packageManagerArgsPrefix = argsPrefix;
}

function runPackageManagerCheck(args) {
  return runCheck(packageManagerCommand, [...packageManagerArgsPrefix, ...args]);
}

function runPackageManagerCommand(args, label) {
  runCommand(packageManagerCommand, [...packageManagerArgsPrefix, ...args], label);
}

function runCommand(command, args, label) {
  log("");
  log(label);
  log(formatCommand(command, args));

  const result = childProcess.spawnSync([command, ...args].join(" "), {
    cwd: projectRoot,
    shell: true,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${label} 未完成，请检查上方日志。`);
  }
}

function detectPackageManager() {
  const pnpmCheck = runCheck("pnpm", ["--version"]);

  if (pnpmCheck.status === 0) {
    setPackageManager("pnpm");
    return {
      ok: true,
      version: pnpmCheck.stdout.trim(),
    };
  }

  const corepackCheck = runCheck("corepack", ["--version"]);

  if (corepackCheck.status !== 0) {
    return {
      ok: false,
      message:
        "未检测到 pnpm，也未检测到 corepack。请安装新版 Node.js，或执行 npm install -g pnpm 后重新启动。",
    };
  }

  log("未检测到 pnpm，正在尝试使用 Node.js 自带的 corepack 启动 pnpm...");
  runCheck("corepack", ["enable"]);

  const pnpmAfterEnableCheck = runCheck("pnpm", ["--version"]);

  if (pnpmAfterEnableCheck.status === 0) {
    setPackageManager("pnpm");
    return {
      ok: true,
      version: pnpmAfterEnableCheck.stdout.trim(),
    };
  }

  setPackageManager("corepack", ["pnpm"]);
  const corepackPnpmCheck = runPackageManagerCheck(["--version"]);

  if (corepackPnpmCheck.status === 0) {
    return {
      ok: true,
      version: `corepack pnpm ${corepackPnpmCheck.stdout.trim()}`,
    };
  }

  return {
    ok: false,
    message:
      "已检测到 Node.js 和 corepack，但 pnpm 启动失败。请打开 PowerShell 执行 corepack enable，或执行 npm install -g pnpm 后重新双击启动器。",
  };
}

function checkEnvironment() {
  const nodeCheck = runCheck("node", ["--version"]);
  if (nodeCheck.status !== 0) {
    fail("未检测到 Node.js。请先安装 Node.js，然后重新双击启动器。");
    return false;
  }

  const packageManagerCheck = detectPackageManager();
  if (!packageManagerCheck.ok) {
    fail(packageManagerCheck.message);
    return false;
  }

  log(`Node.js：${nodeCheck.stdout.trim() || process.version}`);
  log(`pnpm：${packageManagerCheck.version}`);
  return true;
}

function ensureDependencies() {
  const nodeModulesPath = path.join(projectRoot, "node_modules");

  if (fs.existsSync(nodeModulesPath)) {
    log("依赖已存在，跳过安装。");
    return;
  }

  log("首次启动检测到 node_modules 不存在，将自动安装依赖。");
  log("这一步可能需要几分钟，请保持窗口打开。");
  runPackageManagerCommand(["install"], "正在安装依赖");
}

function requestUrl(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });

    request.setTimeout(1200, () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => resolve(false));
  });
}

function extractLocalUrl(text) {
  const localMatch = text.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+\/?)/);
  if (localMatch) {
    return localMatch[1].endsWith("/") ? localMatch[1] : `${localMatch[1]}/`;
  }

  const fallbackMatch = text.match(/http:\/\/127\.0\.0\.1:\d+\/?/);
  if (fallbackMatch) {
    return fallbackMatch[0].endsWith("/") ? fallbackMatch[0] : `${fallbackMatch[0]}/`;
  }

  return "";
}

function startDevServer() {
  log("");
  log("正在启动关键人才管理数据看板系统...");
  log("如果看到 VITE ready，说明服务已启动。");
  log("关闭这个命令行窗口后，系统服务会停止。");
  log("");

  devProcess = childProcess.spawn(
    formatCommand(packageManagerCommand, [
      ...packageManagerArgsPrefix,
      "dev",
      "--host",
      "127.0.0.1",
    ]),
    {
    cwd: projectRoot,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
    },
  );

  devProcess.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);
    const url = extractLocalUrl(text);
    if (url) {
      detectedUrl = url;
    }
  });

  devProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    process.stderr.write(text);
    const url = extractLocalUrl(text);
    if (url) {
      detectedUrl = url;
    }
  });

  devProcess.on("exit", (code) => {
    if (!openedBrowser && code !== 0) {
      fail("开发服务器启动失败，请查看上方日志。");
      return;
    }
    log("");
    log("服务已停止。");
    process.exit(code ?? 0);
  });

  devProcess.on("error", (error) => {
    fail("无法启动开发服务器，请确认 pnpm 可用。", error);
  });
}

function openBrowser(url) {
  if (openedBrowser) {
    return;
  }

  openedBrowser = true;
  log("");
  log(`启动成功，正在打开浏览器：${url}`);
  childProcess.spawn("cmd", ["/c", "start", "", url], {
    cwd: projectRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}

async function waitForServer() {
  const startTime = Date.now();
  let lastUrl = defaultUrl;

  while (Date.now() - startTime < serverReadyTimeoutMs) {
    if (detectedUrl) {
      lastUrl = detectedUrl;
    }

    if (await requestUrl(lastUrl)) {
      openBrowser(lastUrl);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  stopDevServer();
  fail(
    "等待服务启动超时。请检查 5173 端口是否被占用，或查看上方 Vite 日志中的实际访问地址。",
  );
}

function stopDevServer() {
  if (devProcess && !devProcess.killed) {
    devProcess.kill("SIGINT");
  }
}

process.on("SIGINT", () => {
  log("");
  log("正在停止服务...");
  stopDevServer();
});

process.on("SIGTERM", () => {
  stopDevServer();
});

async function main() {
  process.chdir(projectRoot);

  log("关键人才管理数据看板系统启动器");
  log(`项目目录：${projectRoot}`);
  log("");

  if (!checkEnvironment()) {
    return;
  }

  ensureDependencies();
  startDevServer();
  await waitForServer();
}

main().catch((error) => {
  fail("启动过程中出现异常。", error);
});
