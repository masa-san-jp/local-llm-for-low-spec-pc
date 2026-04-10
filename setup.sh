#!/usr/bin/env bash
# local-llm セットアップスクリプト (macOS / Linux)
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

echo ""
echo "========================================"
echo "  local-llm セットアップ"
echo "========================================"
echo ""

# ── Node.js ─────────────────────────────────────────────────────────────────
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    success "Node.js: $NODE_VER"
else
    error "Node.js が見つかりません。https://nodejs.org/ からインストールしてください。"
fi

# ── pnpm ─────────────────────────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
    info "pnpm をインストール中..."
    npm install -g pnpm
    success "pnpm をインストールしました"
else
    success "pnpm: $(pnpm -v)"
fi

# ── Rust / rustup ────────────────────────────────────────────────────────────
if ! command -v rustc &>/dev/null; then
    info "Rust (rustup) をインストール中..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    # shellcheck source=/dev/null
    source "$HOME/.cargo/env"
    success "Rust をインストールしました: $(rustc -V)"
else
    success "Rust: $(rustc -V)"
fi

# ── プロジェクト依存関係 ──────────────────────────────────────────────────────
info "npm 依存関係をインストール中 (app/)..."
cd "$(dirname "$0")/app"
pnpm install
success "依存関係のインストール完了"
cd ..

# ── Ollama ───────────────────────────────────────────────────────────────────
if command -v ollama &>/dev/null; then
    success "Ollama: $(ollama -v 2>/dev/null || echo 'installed')"
else
    info "Ollama をインストール中..."
    if [[ "$(uname)" == "Darwin" ]]; then
        if command -v brew &>/dev/null; then
            brew install ollama
        else
            warn "Homebrew が見つかりません。https://ollama.com/download から手動でインストールしてください。"
        fi
    else
        curl -fsSL https://ollama.com/install.sh | sh
    fi
    success "Ollama をインストールしました"
fi

# ── モデルのダウンロード ──────────────────────────────────────────────────────
info "Gemma 4 E2B モデルをダウンロード中 (約 2GB)..."
if ! ollama list 2>/dev/null | grep -q "gemma4:e2b"; then
    # Ollama が起動していない場合はバックグラウンドで起動
    if ! pgrep -x ollama &>/dev/null; then
        info "Ollama を起動中..."
        ollama serve &>/dev/null &
        OLLAMA_PID=$!
        sleep 3
        ollama pull gemma4:e2b
        kill "$OLLAMA_PID" 2>/dev/null || true
    else
        ollama pull gemma4:e2b
    fi
    success "モデルのダウンロード完了"
else
    success "Gemma 4 E2B は既にダウンロード済みです"
fi

# ── 完了メッセージ ────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo -e "${GREEN}  セットアップ完了！${NC}"
echo "========================================"
echo ""
echo "起動方法:"
echo ""
echo "  1. Ollama を起動:"
echo "       ollama serve"
echo ""
echo "  2. アプリを起動 (別ターミナルで):"
echo "       cd app"
echo "       pnpm tauri dev"
echo ""
