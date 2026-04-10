@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo.
echo ========================================
echo   local-llm セットアップ (Windows)
echo ========================================
echo.

:: ── Node.js ──────────────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js が見つかりません。
    echo         https://nodejs.org/ からインストールしてください。
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK]   Node.js: %%v

:: ── pnpm ─────────────────────────────────────────────────────────────────────
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] pnpm をインストール中...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [ERROR] pnpm のインストールに失敗しました。
        pause
        exit /b 1
    )
    echo [OK]   pnpm をインストールしました
) else (
    for /f "tokens=*" %%v in ('pnpm -v') do echo [OK]   pnpm: %%v
)

:: ── Rust / rustup ────────────────────────────────────────────────────────────
where rustc >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Rust (rustup) をインストール中...
    echo        ブラウザが開きます。インストーラの指示に従ってください。
    start https://www.rust-lang.org/tools/install
    echo.
    echo [INFO] rustup-init.exe のインストール完了後、このスクリプトを再実行してください。
    pause
    exit /b 0
) else (
    for /f "tokens=*" %%v in ('rustc -V') do echo [OK]   Rust: %%v
)

:: ── プロジェクト依存関係 ──────────────────────────────────────────────────────
echo [INFO] npm 依存関係をインストール中 (app/)...
pushd "%~dp0app"
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] pnpm install に失敗しました。
    popd
    pause
    exit /b 1
)
popd
echo [OK]   依存関係のインストール完了

:: ── Ollama ───────────────────────────────────────────────────────────────────
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Ollama をインストール中...
    echo        ブラウザが開きます。インストーラの指示に従ってください。
    start https://ollama.com/download/windows
    echo.
    echo [INFO] Ollama のインストール完了後、このスクリプトを再実行してください。
    pause
    exit /b 0
) else (
    echo [OK]   Ollama: installed
)

:: ── モデルのダウンロード ──────────────────────────────────────────────────────
echo [INFO] Gemma 4 E2B モデルをダウンロード中 (約 2GB)...
ollama list 2>nul | findstr "gemma4:e2b" >nul 2>&1
if %errorlevel% neq 0 (
    ollama pull gemma4:e2b
    if %errorlevel% neq 0 (
        echo [WARN] モデルのダウンロードに失敗しました。
        echo        Ollama が起動しているか確認してください: ollama serve
    ) else (
        echo [OK]   モデルのダウンロード完了
    )
) else (
    echo [OK]   Gemma 4 E2B は既にダウンロード済みです
)

:: ── 完了メッセージ ────────────────────────────────────────────────────────────
echo.
echo ========================================
echo   セットアップ完了！
echo ========================================
echo.
echo 起動方法:
echo.
echo   1. Ollama を起動:
echo        ollama serve
echo.
echo   2. アプリを起動 (別ターミナルで):
echo        cd app
echo        pnpm tauri dev
echo.
pause
