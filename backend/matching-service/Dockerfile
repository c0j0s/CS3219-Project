# Reference
# https://www.andreadiotallevi.com/blog/how-to-create-a-production-image-for-a-node-typescript-app-using-docker-multi-stage-builds

# Stage 1: Build the project
FROM node:20 AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Build the image
FROM node:20 AS final
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder ./app/dist ./dist
COPY package*.json ./

RUN npm ci --omit=dev

ARG PORT=5200
EXPOSE $PORT

# default matching timeout
ARG MATCHING_TIMEOUT=60000
ENV MATCHING_TIMEOUT=$MATCHING_TIMEOUT

# default matching log level
ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

CMD ["node", "dist/app.js"]