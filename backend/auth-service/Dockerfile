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

# Defing service arguments
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

ARG CORS_ALLOWED_ORIGINS=http://localhost:3000
ENV CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS

ARG PORT=5050
EXPOSE $PORT

# Defing service specific arguments
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG EMAIL_VERIFICATION_SECRET
ENV EMAIL_VERIFICATION_SECRET=$EMAIL_VERIFICATION_SECRET

ARG EMAIL_RESET_SECRET
ENV EMAIL_RESET_SECRET=$EMAIL_RESET_SECRET

ARG NM_MAIL
ENV NM_MAIL=$NM_MAIL

ARG NM_PASS
ENV NM_PASS=$NM_PASS

# Copy only the production artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install --omit=dev

# Expose the application's port
EXPOSE $PORT

# Run image
CMD ["node", "dist/app.js"]