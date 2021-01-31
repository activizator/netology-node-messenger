FROM alpine/node:latest
WORKDIR /app
COPY src/package*.json ./
RUN npm install
COPY src/ ./