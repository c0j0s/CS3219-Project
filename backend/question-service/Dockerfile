FROM node:20
# Defing service arguments
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

ARG CORS_ALLOWED_ORIGINS=http://localhost:3000
ENV CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS

ARG PORT=5100
EXPOSE $PORT

# Defing service specific arguments
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Build steps
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

COPY package*.json ./

# Run image
CMD ["node", "dist/app.js"]