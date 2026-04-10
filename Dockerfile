# ── Stage 1: Frontend build ────────────────────────────────────────────────
FROM node:20-alpine AS frontend

WORKDIR /workspace/app

RUN npm install -g pnpm@latest

COPY app/package.json app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY app/index.html app/tsconfig.json app/tsconfig.node.json app/vite.config.ts ./
COPY app/src ./src
COPY app/public ./public
RUN pnpm build

# ── Stage 2: Tauri / Rust build (Linux) ────────────────────────────────────
FROM rust:1.82-bookworm AS tauri

RUN apt-get update && apt-get install -y --no-install-recommends \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY app/src-tauri ./app/src-tauri
COPY --from=frontend /workspace/app/dist ./app/dist

WORKDIR /workspace/app/src-tauri
RUN cargo build --release

# ── Stage 3: Runtime (Debian slim) ─────────────────────────────────────────
# Linux 向け実行環境（X11 / Wayland 必須）
# 使い方:
#   docker run --rm \
#     -e DISPLAY=$DISPLAY \
#     -v /tmp/.X11-unix:/tmp/.X11-unix \
#     --network host \
#     local-llm
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libwebkit2gtk-4.1-0 \
    libgtk-3-0 \
    libayatana-appindicator3-1 \
    librsvg2-2 \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=tauri /workspace/app/src-tauri/target/release/app /usr/local/bin/local-llm

ENTRYPOINT ["local-llm"]
