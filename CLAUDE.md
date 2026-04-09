# local-llm-for-low-spec-pc

低スペックPC（CPU-only / 8〜16GB RAM）向けローカルLLMアプリ。`ochyai/vibe-local` をベースに拡張する。
設計仕様: `gpt-design-spec.md` 参照。採用モデル: Gemma 4 E2B 単体。

## Auto-approve

エージェント開発の自動承認対象ツール:

```json
{
  "allowedTools": [
    "Read", "Write", "Edit", "Glob", "Grep", "Bash",
    "Agent", "TaskCreate", "TaskUpdate", "TaskGet", "TaskList",
    "WebSearch", "WebFetch"
  ]
}
```

以下は自動承認してよい:
- ファイルの読み書き・編集
- `npm install`, `pnpm install`, テスト実行, ビルド
- `git status`, `git diff`, `git log`, `git add`, `git commit`
- サブエージェント起動

以下は確認を要する:
- `git push`
- ブランチ削除・force push
- 外部APIへのリクエスト

## Architecture

- **UI層** → **会話制御層** → **Input Processor / Chat Engine** → **実行基盤層**
- Input Processor と Chat Engine は論理分離。物理的には Gemma 4 E2B を逐次利用（8GB環境で同時常駐しない）
- 音声は暫定的に Whisper.cpp → テキスト変換後に Chat Engine へ渡す
- 画像入力には mmproj ファイルが別途必要

## Constraints

- ローカルファイルは UI アップロード経由のみ（ディレクトリ直接参照禁止）
- ターミナル操作・自動ファイル収集は対象外
- クラウド依存なし・ローカル完結
- LLM は Gemma 4 E2B のみ（初期フェーズ）

## Dev Notes

- Phase 1 から着手: 基本チャットUI + Gemma 4 E2B 接続 + テキスト会話
- 実装前に `ochyai/vibe-local` のUIスタック・推論バックエンドを確認すること
- 8GB環境ではコンテキスト長を 8K〜32K の範囲で制限
- 未確定事項は `gpt-design-spec.md` §15 参照
