FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install full deps for building
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package metadata and built artifacts
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Install only production deps
RUN npm ci --omit=dev

USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
