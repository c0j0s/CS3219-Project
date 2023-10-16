FROM node:20

# Defing service arguments
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

ARG PORT=5200
EXPOSE $PORT

# Defing service specific arguments
ARG MATCHING_TIMEOUT=60000
ENV MATCHING_TIMEOUT=$MATCHING_TIMEOUT

# Build steps
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

RUN npm ci --omit=dev

CMD ["node", "dist/app.js"]