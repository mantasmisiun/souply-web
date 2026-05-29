# syntax=docker/dockerfile:1
#
# Souply-web container. Two-stage: Node compiles the Vite bundle, then a
# slim Node runtime serves it via server/index.js (Express). We need a
# Node runtime — not bare nginx — because /t/:slug share links are
# prerendered with per-template OG meta tags (see server/index.js).
#
# Build from /opt/souply/souply-web (this dir):
#   docker compose build
#
# The browser API URL is baked at BUILD time — Vite inlines every VITE_*
# var into the bundle, it can't change at runtime. Pass it as a build
# arg so one Dockerfile makes test vs prod bundles:
#   docker compose build --build-arg VITE_API_BASE_URL=https://api.souply.lt
#
# The SSR fetch URL + public origin are RUNTIME env (server/index.js),
# set in docker-compose.yml — not build args.

# ─── Stage 1: build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite reads VITE_* from the environment at build time.
ARG VITE_API_BASE_URL=https://api.souply.manofoto.dpdns.org
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# TEST-ONLY simulated login (no OAuth yet). Empty by default so a prod
# build can NEVER silently bake a dev user — only the test compose
# passes real values. DELETE these + the simulated login in Phase 3
# when real OAuth lands (see project_souply_web_launch memory, B-10).
ARG VITE_DEV_USER_ID=
ARG VITE_DEV_USER_NAME=
ARG VITE_DEV_USER_HANDLE=
ENV VITE_DEV_USER_ID=$VITE_DEV_USER_ID
ENV VITE_DEV_USER_NAME=$VITE_DEV_USER_NAME
ENV VITE_DEV_USER_HANDLE=$VITE_DEV_USER_HANDLE

# `tsc -b && vite build` per package.json → /app/dist
RUN npm run build

# ─── Stage 2: runtime ───────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Prod deps only (express + compression). package.json is the same one
# the builder used, so the lockfile resolves identically.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled static bundle + the server that serves it.
COPY --from=builder /app/dist ./dist
COPY server ./server

EXPOSE 80
CMD ["node", "server/index.js"]
