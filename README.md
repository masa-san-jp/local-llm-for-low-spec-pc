# local-llm

低スペックPCでローカルLLMを体験できる、シンプルなチャットアプリ。

CPU-only・メモリ8〜16GBの一般的なPCで動作します。  
クラウド不要・APIキー不要・無料。

---

## 動作環境

| 構成 | テキスト会話 | 画像入力 | Webカメラ | 添付処理 | アーカイブ |
|---|:---:|:---:|:---:|:---:|:---:|
| **8GB RAM / CPU-only** | 推奨 | 非推奨 | 非推奨 | 軽量ファイルのみ | 推奨 |
| **16GB RAM / CPU-only** | 推奨 | 推奨 | 推奨 | 推奨 | 推奨 |

- 画像入力には mmproj ファイルが別途必要
- 長い会話はコンテキスト上限により自動制御

---

## セットアップ

2通りの方法があります。**初めての方はターミナルセットアップ**を推奨します。

| 方法 | 対象 | 特徴 |
|------|------|------|
| ターミナルセットアップ | 全OS | スクリプト一発で完結。初心者向け |
| Dockerセットアップ | Linux / 開発者 | 環境を汚さず再現可能。CI/CDにも利用 |

---

### ターミナルセットアップ（推奨）

#### 事前準備

- **Node.js 18+** — [nodejs.org](https://nodejs.org/) からインストール
- **Rust** — セットアップスクリプトが自動インストール
- **Ollama** — セットアップスクリプトが自動インストール

#### macOS / Linux

```bash
git clone https://github.com/masa-jp-art/local-llm-for-low-spec-pc.git
cd local-llm-for-low-spec-pc
chmod +x setup.sh
./setup.sh
```

#### Windows

```bat
git clone https://github.com/masa-jp-art/local-llm-for-low-spec-pc.git
cd local-llm-for-low-spec-pc
setup.bat
```

セットアップが完了したら「起動方法」へ進んでください。

---

### Dockerセットアップ（Linux / 開発者向け）

> **注意**: Docker 版は Linux デスクトップ環境（X11 / Wayland）でのみ動作します。  
> macOS / Windows のエンドユーザーにはターミナルセットアップを推奨します。

#### 前提

- Docker Desktop または Docker Engine がインストール済み
- Linux の場合: X11 サーバーが利用可能

#### Docker Hub からイメージを取得して実行

```bash
# イメージを取得
docker pull masajpart/local-llm:latest

# Ollama はホスト側で起動しておく
ollama serve &

# X11 経由でアプリを起動
docker run --rm \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  --network host \
  masajpart/local-llm:latest
```

#### ソースからビルドする場合

```bash
git clone https://github.com/masa-jp-art/local-llm-for-low-spec-pc.git
cd local-llm-for-low-spec-pc
docker build -t local-llm .
docker run --rm \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  --network host \
  local-llm
```

---

## 起動方法

```bash
# 1. Ollama を起動（インストール後は自動起動する場合あり）
ollama serve

# 2. アプリを起動（別ターミナルで）
cd app
pnpm tauri dev
```

---

## 使い方

1. **Ollama を起動しておく**（インストール後は自動起動する場合あり）
2. アプリを開くとモデル状態が画面上部に表示される
3. テキストを入力して送信

---

## コンテキスト長の目安

| RAM | 推奨コンテキスト上限 | 備考 |
|---|---|---|
| 8GB | 8,192 トークン | テキスト会話に集中 |
| 16GB | 16,384〜32,768 トークン | 全機能利用可 |

上限に近づくと警告が表示され、古いメッセージが自動的にトリミングされます。

---

## 会話のアーカイブ

アーカイブボタンを押すと、現在の会話から Markdown 形式の議事録を生成して `log/` に保存します。

ファイル名は `yyyymmdd_タイトル.md` の形式で、タイトルは Gemma 4 E2B が自動生成します。

---

## トラブルシューティング

### よくある問題

**「モデルが見つかりません」と表示される**
```bash
ollama pull gemma4:e2b
```

**「Ollama に接続できません」と表示される**
```bash
ollama serve
```

**応答が遅い**
- 他のアプリを閉じてメモリを確保してください
- 設定でコンテキスト上限を下げると改善することがあります
- 8GB 環境では画像入力を無効化してください

**画像入力が使えない**
- mmproj ファイルのダウンロードが必要です
- 8GB 環境では画像入力は非推奨です

---

### FAQ

**Q. setup.sh でエラーが出る**  
A. まず `node -v` で Node.js 18 以上がインストールされているか確認してください。Rust のインストール中にエラーが出た場合は [rustup.rs](https://rustup.rs/) から手動でインストールできます。

**Q. モデルのダウンロードに時間がかかる / 途中で止まる**  
A. `ollama pull gemma4:e2b` は約 2GB のダウンロードです。中断された場合は同じコマンドを再実行すると続きから再開されます。

**Q. Docker でアプリが起動しない（Linux）**  
A. X11 の認証が必要な場合があります。`xhost +local:docker` を実行してから再試行してください。

**Q. Windows で `setup.bat` が「Rust が見つかりません」で終了する**  
A. [rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) からインストーラをダウンロードし、インストール完了後に `setup.bat` を再実行してください。

**Q. `pnpm tauri dev` でビルドエラーが出る（Windows）**  
A. Microsoft C++ Build Tools が必要です。[Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) からインストールしてください。

---

## 開発

```bash
cd app
pnpm install
pnpm tauri dev    # 開発モードで起動
pnpm tauri build  # 配布用ビルド
```

### 技術スタック

- **デスクトップ**: Tauri v2（軽量・低メモリ）
- **UI**: React 19 + Vite + Tailwind CSS v4
- **状態管理**: Zustand
- **推論バックエンド**: Ollama（localhost:11434）
- **モデル**: Gemma 4 E2B

### CI/CD

GitHub Actions によりプッシュ時に以下が自動実行されます：

- フロントエンドの型チェック & ビルド確認
- Docker イメージのビルド & Docker Hub へのプッシュ（`main` ブランチのみ）

Docker Hub への自動プッシュには、リポジトリの Secrets に `DOCKERHUB_USERNAME` と `DOCKERHUB_TOKEN` の設定が必要です。

---

## ライセンス

MIT
