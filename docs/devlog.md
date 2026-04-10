# 開発ログ

---

## 2026-04-10

### プロジェクト立ち上げ

**方針決定**
- 低スペックPC（CPU-only / 8〜16GB RAM）向けローカルLLMアプリを新規構築
- 当初 `ochyai/vibe-local` をベースにする予定だったが、Python CLI のため不採用
- Tauri v2 + React 19 + TypeScript で独自実装

**技術スタック選定**
- フロントエンド: React 19 + Vite 7 + TypeScript + Tailwind CSS v4
- デスクトップ: Tauri v2（Rust バックエンド + WebView）
- 状態管理: Zustand（immutable）
- LLM バックエンド: Ollama REST API（`http://localhost:11434`）
- 採用モデル: Gemma 4 E2B（`gemma4:e2b`）

---

### Phase 1: 基本チャット UI + Gemma 4 E2B 接続

**実装内容**
- Tauri v2 プロジェクトを `app/` ディレクトリに作成
- Ollama クライアント（ストリーミング対応）
- Zustand によるチャット・モデル・設定ストア
- セッション永続化（IndexedDB / idb）
- サイドバー（セッション一覧・切り替え）
- モデルステータス表示（準備中 / 準備完了 / エラー）
- コンテキスト使用量インジケーター
- react-markdown によるアシスタントメッセージのレンダリング

**トラブルシューティング**
- `pnpm create vite .` が既存ファイルで失敗 → `app/` サブディレクトリで作成
- Rust 1.81.0 では edition2024 が未対応 → `brew upgrade rust`（1.94.1）
- Ollama 0.17.7 で `gemma4:e2b` の pull が 412 エラー → 公式サイトから最新版インストール
- 誤って `gemma3:4b` を pull → 削除して `gemma4:e2b` を再 pull

---

### Phase 2: ファイル添付・画像入力

**実装内容**
- 添付ファイル型定義（`image` / `text` / `pdf`）
- ドラッグ＆ドロップ対応
- HEIC/HEIF 形式サポート（heic2any で JPEG 変換）
- PDF テキスト抽出
- 添付プレビューコンポーネント
- Ollama API への画像（base64）付きメッセージ送信

**Tauri 設定**
- `tauri-plugin-shell` / `tauri-plugin-fs` を追加
- `capabilities/default.json` に各種 fs・shell 権限を設定
- `tauri.conf.json` の `plugins.shell.scope` は無効フィールド → capabilities に移行

---

### Phase 3: カメラ入力・音声入力（一部）

**実装内容**
- `useWebcam` フック（getUserMedia → Canvas キャプチャ）
- `WebcamModal` コンポーネント（ライブプレビュー + 撮影ボタン）
- macOS カメラ権限対応（`Info.plist` に `NSCameraUsageDescription` 追加）

**音声入力**
- `useMicrophone` フック・`whisperClient` を実装したが、音声入力はスコープ外に変更
  - 原因: whisper-cpp のバイナリ名・モデルパス・音声フォーマット変換（webm → wav）など設定が複雑
  - マイクボタンは UI から削除

**トラブルシューティング**
- `tauri.conf.json` の `bundle.macOS.infoPlist` にオブジェクトを渡すとエラー → `.plist` ファイルパスを指定する方式に変更
- カメラ・マイクともに「開けませんでした」エラー → `Info.plist` 追加で解決（カメラのみ）

---

### UI 改善

**日本語 IME 対応**
- Enter キー送信時に `e.nativeEvent.isComposing` チェックを追加したが不完全
- Enter = 改行 / Shift+Enter = 送信 に変更（根本解決）
- 入力欄上部に「Shift+Enter で送信　Enter で改行」ヒントを追加

**画像サムネイル表示**
- 送信済みメッセージのバブルに添付画像のサムネイルを表示
- `Message` 型に `imagePreviews?: string[]` フィールドを追加
- 当初 blob URL を使用したが `clearAttachments()` 後に無効化される問題あり → base64 から data URL を生成する方式に変更

**画像データの永続化方針**
- セッション終了後は画像不要 → `sessionStorage.ts` の保存時に `imagePreviews` を除去
- IndexedDB にはテキストのみ保存、画像はメモリ内のみ

---

## 2026-04-10（続）

### ドキュメント整備：改善計画ログの追加

**対応内容**
- `docs/improvement-plan.md` を新規作成
  - 追記型の改善計画ログとして運用
  - バージョン（`v0.1 — 2026-04-10`）と未着手 / 進行中 / 完了 のステータス表示を採用
  - 改善項目：Dockerセットアップ・setupスクリプト・トラブルシューティング整備・READMEリファクタリング・CI/CD導入
- ドキュメント構成が以下の3本柱で整理された：
  1. `docs/gpt-design-spec.md` — 設計仕様書
  2. `docs/devlog.md` — 開発ログ（本ファイル）
  3. `docs/improvement-plan.md` — 改善計画（未着手 / 完了のログ）
