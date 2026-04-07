FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 1. Install ALL dependencies (including devDeps for building)
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    SKIP_PRISMA_GENERATE=true \
    pnpm install --frozen-lockfile

# 2. Build the application
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build:swc
RUN pnpm prisma generate

# --- CRITICAL OPTIMIZATION STEP ---
# Remove devDependencies while still in the builder stage
# This keeps the final runner image lean
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm prune --prod --ignore-scripts
# ----------------------------------

FROM base AS runner 
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

# Copy only what is strictly necessary for production
COPY --from=builder /app/package.json ./
# This now only contains production dependencies thanks to the prune above
COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/LICENSE ./LICENSE

EXPOSE 3000
CMD ["pnpm", "run", "start:docker"]