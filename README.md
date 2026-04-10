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

> **所要時間の目安**: 初回は依存関係とモデルのダウンロードで 15〜30 分かかります。

### 全体の流れ

```
① Git でリポジトリをクローン
② Node.js をインストール
③ pnpm をインストール
④ Rust をインストール
⑤ OS 固有の依存関係をインストール（Linux のみ）
⑥ プロジェクトの依存関係をインストール
⑦ Ollama をインストール
⑧ モデル（Gemma 4 E2B）をダウンロード
⑨ アプリを起動
```

---

### ① リポジトリをクローン

Git がインストール済みであることを確認してから実行してください。

```bash
git clone https://github.com/masa-san-jp/local-llm-for-low-spec-pc.git
cd local-llm-for-low-spec-pc
```

> **Git が入っていない場合**
> - macOS: `xcode-select --install` を実行するとインストールされます
> - Windows: [git-scm.com](https://git-scm.com/) からインストーラをダウンロード
> - Linux: `sudo apt install git` または `sudo dnf install git`

---

### ② Node.js をインストール（v20 以上）

[nodejs.org](https://nodejs.org/) から **LTS 版**（v20 以上）をダウンロードしてインストールしてください。

インストール後、バージョンを確認します：

```bash
node -v
# v20.x.x 以上が表示されれば OK
```

> **バージョン管理ツールを使う場合**  
> [nvm](https://github.com/nvm-sh/nvm)（macOS/Linux）や [fnm](https://github.com/Schniz/fnm)（全OS）を使うと複数バージョンを管理できます。

---

### ③ pnpm をインストール

Node.js インストール後、ターミナルで以下を実行します：

```bash
npm install -g pnpm
```

確認：

```bash
pnpm -v
# 9.x.x 以上が表示されれば OK
```

---

### ④ Rust をインストール

Tauri のビルドに Rust が必要です。

#### macOS / Linux

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

インストール完了後、ターミナルを**一度閉じて再起動**するか、以下を実行してパスを反映します：

```bash
source "$HOME/.cargo/env"
```

#### Windows

[rustup.rs](https://rustup.rs/) を開き、**RUSTUP-INIT.EXE** をダウンロードして実行してください。  
インストール完了後、ターミナルを再起動してください。

確認（全OS共通）：

```bash
rustc -V
# rustc 1.xx.x (xxxx) が表示されれば OK
```

---

### ⑤ OS 固有の依存関係をインストール

#### macOS

Xcode Command Line Tools が必要です。まだインストールしていない場合：

```bash
xcode-select --install
```

ダイアログが表示されたら「インストール」をクリックしてください。

#### Linux（Ubuntu / Debian 系）

Tauri が必要とするライブラリをインストールします：

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  pkg-config
```

> **Fedora / RHEL 系の場合**
> ```bash
> sudo dnf install webkit2gtk4.1-devel gtk3-devel \
>   libappindicator-gtk3-devel librsvg2-devel \
>   openssl-devel
> ```

#### Windows

以下の 2 つが必要です。

**1. Microsoft C++ Build Tools**  
[visualstudio.microsoft.com/visual-cpp-build-tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) からインストーラをダウンロードし、「**C++ によるデスクトップ開発**」をチェックしてインストールしてください。

**2. WebView2**  
Windows 11 / 最新の Windows 10 には標準搭載されています。入っていない場合は [Microsoft の WebView2 ページ](https://developer.microsoft.com/microsoft-edge/webview2/) からインストールしてください。

---

### ⑥ プロジェクトの依存関係をインストール

```bash
cd app
pnpm install
cd ..
```

> `app/node_modules/` が作成されれば成功です。

---

### ⑦ Ollama をインストール

Ollama はローカルで LLM を動かすためのツールです。

#### macOS

```bash
brew install ollama
```

Homebrew がない場合は [ollama.com/download](https://ollama.com/download) からインストーラをダウンロードしてください。

#### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Windows

[ollama.com/download/windows](https://ollama.com/download/windows) からインストーラをダウンロードして実行してください。

確認（全OS共通）：

```bash
ollama -v
# ollama version x.x.x が表示されれば OK
```

---

### ⑧ モデル（Gemma 4 E2B）をダウンロード

まず Ollama を起動します：

```bash
ollama serve
```

> macOS で Ollama アプリをインストールした場合、起動後はタスクバーに常駐します。  
> `ollama serve` は不要な場合もあります。

**別のターミナルを開いて**モデルをダウンロードします：

```bash
ollama pull gemma4:e2b
```

> - ファイルサイズは約 **2GB** です
> - ダウンロードには数分〜十数分かかります
> - 途中で中断しても、再実行すると続きから再開されます

**画像入力も使いたい場合**（RAM 16GB 以上推奨）：

```bash
ollama pull gemma4:e2b-mmproj
```

---

### ⑨ アプリを起動

Ollama が起動している状態で、以下を実行します：

```bash
cd app
pnpm tauri dev
```

> 初回は Rust のコンパイルに **3〜10 分**かかります。  
> ウィンドウが表示されれば起動成功です。

---

### 一括セットアップスクリプト（簡易版）

上記の手順をスクリプトで自動化したい場合は以下を使えます。  
ただし Node.js は事前に手動でインストールが必要です（② を参照）。

#### macOS / Linux

```bash
chmod +x setup.sh
./setup.sh
```

#### Windows

```bat
setup.bat
```

---

## 使い方

1. Ollama が起動していることを確認する（画面上部にモデル状態が表示される）
2. テキストを入力して送信
3. ファイル添付ボタンから画像・PDF・CSV などを添付できる

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

### 起動・接続

**「Ollama に接続できません」と表示される**

Ollama が起動していません。以下を実行してください：

```bash
ollama serve
```

**「モデルが見つかりません」と表示される**

モデルのダウンロードが完了していません：

```bash
ollama pull gemma4:e2b
```

**応答が遅い**

- 他のアプリを閉じてメモリを確保してください
- 設定でコンテキスト上限を下げると改善することがあります
- 8GB 環境では画像入力を無効化してください

**画像入力が使えない**

- mmproj ファイルのダウンロードが必要です（手順 ⑧ 参照）
- 8GB 環境では画像入力は非推奨です

---

### セットアップ

**`pnpm tauri dev` でビルドエラーが出る**

- macOS: `xcode-select --install` で Xcode CLT を再インストール
- Linux: ⑤ の apt パッケージがすべて入っているか確認
- Windows: C++ Build Tools のインストールを確認し、ターミナルを再起動して再試行

**`rustc: command not found` と表示される**

Rust のパスが通っていません。以下を実行してください：

```bash
source "$HOME/.cargo/env"
```

それでも解決しない場合はターミナルを再起動してください。

**`pnpm install` でエラーが出る**

Node.js のバージョンを確認してください（v20 以上が必要）：

```bash
node -v
```

---

### よくある質問

**Q. モデルのダウンロードが途中で止まった**  
A. 同じコマンドを再実行すると続きから再開します：`ollama pull gemma4:e2b`

**Q. Ollama を毎回手動で起動しなければいけない？**  
A. macOS で Ollama アプリ（.app）をインストールした場合、ログイン時に自動起動します。タスクトレイに Ollama アイコンが表示されていれば起動中です。

**Q. Windows で `setup.bat` が「Rust が見つかりません」で終了する**  
A. [rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) からインストーラをダウンロードし、インストール完了後に `setup.bat` を再実行してください。

---

## 開発者向け

### コマンド一覧

```bash
cd app
pnpm install       # 依存関係インストール
pnpm tauri dev     # 開発モードで起動（ホットリロードあり）
pnpm build         # フロントエンドのみビルド
pnpm tauri build   # 配布用バイナリをビルド
```

### 技術スタック

| レイヤー | 技術 |
|---|---|
| デスクトップ | Tauri v2（Rust） |
| UI | React 19 + Vite + Tailwind CSS v4 |
| 状態管理 | Zustand |
| 推論バックエンド | Ollama（localhost:11434） |
| モデル | Gemma 4 E2B |

### CI/CD

GitHub Actions によりプッシュ時に以下が自動実行されます：

- フロントエンドの型チェック & ビルド確認（全ブランチ）

> Docker イメージの自動ビルド & Docker Hub へのプッシュは今後対応予定です。

---

## ライセンス

MIT
