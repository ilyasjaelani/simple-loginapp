# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# ── Stage 2: final image ──────────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000 || exit 1

CMD ["node", "server.js"]
