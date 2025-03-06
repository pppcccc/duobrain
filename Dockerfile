# ========== 1) BUILD STAGE ==========
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code, including prisma/
COPY . .

# Build Next.js
RUN npm run build

# ========== 2) PRODUCTION STAGE ==========
FROM node:18-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy build output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# IMPORTANT: Copy your prisma folder into the final image
COPY --from=builder /app/prisma ./prisma

# copying app manually?
COPY --from=builder /app/src/app ./src/app

# Expose port 3000 for Next.js
EXPOSE 3000

# The default command
CMD ["npm", "start"]
