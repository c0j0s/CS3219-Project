# Reference
# https://www.andreadiotallevi.com/blog/how-to-create-a-production-image-for-a-node-typescript-app-using-docker-multi-stage-builds

# Stage 1: Build the project
FROM node:20 AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

# Stage 2: Build the image
FROM node:20 AS final
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/node_modules ./node_modules
COPY package*.json ./

ARG PORT=5100
EXPOSE $PORT

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# default matching log level
ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

# Run image
CMD ["node", "dist/app.js"]