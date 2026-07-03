param(
  [switch]$SetupOnly
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RuntimeRoot = Join-Path $ProjectRoot ".runtime"
$NodeChannel = "latest-v22.x"
$PnpmVersion = "11.7.0"

Set-Location $ProjectRoot

function Write-Step {
  param([string]$Message)

  Write-Host ""
  Write-Host "==> $Message"
}

function Get-CommandPath {
  param([string]$Name)

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  return $null
}

function Get-NodeArch {
  $arch = $env:PROCESSOR_ARCHITEW6432
  if (-not $arch) {
    $arch = $env:PROCESSOR_ARCHITECTURE
  }

  switch -Regex ($arch) {
    "ARM64" { return "arm64" }
    "AMD64" { return "x64" }
    default { return "x64" }
  }
}

function Find-LocalNode {
  if (-not (Test-Path $RuntimeRoot)) {
    return $null
  }

  $nodeDir = Get-ChildItem -LiteralPath $RuntimeRoot -Directory -Filter "node-v*-win-*" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $nodeDir) {
    return $null
  }

  $nodeExe = Join-Path $nodeDir.FullName "node.exe"
  if (Test-Path $nodeExe) {
    return $nodeDir.FullName
  }

  return $null
}

function Install-LocalNode {
  Write-Step "Node.js was not found. Downloading portable Node.js"

  New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null

  $arch = Get-NodeArch
  $indexUrl = "https://nodejs.org/dist/$NodeChannel/SHASUMS256.txt"
  $downloadIndex = Invoke-WebRequest -UseBasicParsing -Uri $indexUrl
  $zipName = [regex]::Match($downloadIndex.Content, "node-v[^\s]+-win-$arch\.zip").Value

  if (-not $zipName) {
    throw "No Node.js package was found for this Windows architecture: $arch"
  }

  $zipUrl = "https://nodejs.org/dist/$NodeChannel/$zipName"
  $zipPath = Join-Path $RuntimeRoot $zipName

  Write-Host "Downloading: $zipUrl"
  Invoke-WebRequest -UseBasicParsing -Uri $zipUrl -OutFile $zipPath

  Write-Host "Extracting Node.js..."
  Expand-Archive -LiteralPath $zipPath -DestinationPath $RuntimeRoot -Force
  Remove-Item -LiteralPath $zipPath -Force

  $nodeDirName = [System.IO.Path]::GetFileNameWithoutExtension($zipName)
  $nodeDir = Join-Path $RuntimeRoot $nodeDirName

  if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
    throw "node.exe was not found after extracting Node.js."
  }

  return $nodeDir
}

function Ensure-Node {
  $nodePath = Get-CommandPath "node"

  if ($nodePath) {
    Write-Host "Node.js found: $(& node --version)"
    return $nodePath
  }

  $localNode = Find-LocalNode
  if (-not $localNode) {
    $localNode = Install-LocalNode
  }

  $env:PATH = "$localNode;$env:PATH"
  Write-Host "Using local Node.js: $(& node --version)"
  return (Join-Path $localNode "node.exe")
}

function Get-PackageManager {
  $pnpmPath = Get-CommandPath "pnpm"
  if ($pnpmPath) {
    return @{
      Command = "pnpm"
      Prefix = @()
      Label = "pnpm $(& pnpm --version)"
    }
  }

  $corepackPath = Get-CommandPath "corepack"
  if (-not $corepackPath) {
    $localNode = Find-LocalNode
    if (-not $localNode) {
      $localNode = Install-LocalNode
    }
    $env:PATH = "$localNode;$env:PATH"
    $corepackPath = Get-CommandPath "corepack"
  }

  if ($corepackPath) {
    Write-Host "pnpm was not found. Preparing pnpm $PnpmVersion with corepack..."
    try {
      & corepack prepare "pnpm@$PnpmVersion" --activate | Out-Host
    } catch {
      Write-Host "corepack prepare did not complete. The script will try corepack pnpm directly."
    }

    return @{
      Command = "corepack"
      Prefix = @("pnpm")
      Label = "corepack pnpm"
    }
  }

  throw "pnpm and corepack were not found. Please install a recent Node.js version and try again."
}

function Invoke-PackageManager {
  param(
    [hashtable]$PackageManager,
    [string[]]$Arguments
  )

  $allArgs = @()
  $allArgs += $PackageManager.Prefix
  $allArgs += $Arguments

  & $PackageManager.Command @allArgs
  if ($LASTEXITCODE -ne 0) {
    throw "$($PackageManager.Label) $($Arguments -join ' ') failed."
  }
}

try {
  Write-Host "Talent Dashboard - one-click environment setup and launcher"
  Write-Host "Project root: $ProjectRoot"

  Write-Step "Checking Node.js"
  Ensure-Node | Out-Null

  Write-Step "Checking pnpm"
  $packageManager = Get-PackageManager
  Write-Host "Package manager: $($packageManager.Label)"

  Write-Step "Installing dependencies"
  Invoke-PackageManager -PackageManager $packageManager -Arguments @("install")

  if ($SetupOnly) {
    Write-Step "Environment setup completed"
    Write-Host "Dependencies are ready. The app was not started because -SetupOnly was used."
    exit 0
  }

  Write-Step "Starting the app"
  Write-Host "The browser will open automatically after the app is ready."
  Write-Host "Keep this window open. Closing it stops the app."
  & node (Join-Path $ProjectRoot "scripts\launcher.cjs")
} catch {
  Write-Host ""
  Write-Host "Setup or startup failed:"
  Write-Host $_.Exception.Message
  Write-Host ""
  Write-Host "If the download failed, check the network and double-click this script again."
  Write-Host "If it still fails, send this window's error message to the project maintainer."
  exit 1
}
