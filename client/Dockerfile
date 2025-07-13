# Stage 1: Build React/Vite app
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Clean default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend files to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
