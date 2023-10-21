# Stage 1: Build environment
FROM node:20 AS build
WORKDIR /app

# Copy the source code and install dependencies
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build

# Stage 2: Production environment
FROM node:20
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

ARG CORS_ALLOWED_ORIGINS=http://localhost:3000
ENV CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS

ARG PORT=5300
ENV PORT=$PORT

# locally, it will be localhost
# now, it is redis://<container_name>:6380/

# Defing service specific arguments
ARG REDIS_EVENT_BUS=redis://peerprep-eventbus:6380/
ENV REDIS_EVENT_BUS=$REDIS_EVENT_BUS

ARG REDIS_URL=redis://peerprep-database:6379/
ENV REDIS_URL=$REDIS_URL

# Copy only the production artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install --omit=dev

# Expose the application's port
EXPOSE $PORT