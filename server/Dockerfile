# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Distroless
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 5000
CMD ["server.js"]

