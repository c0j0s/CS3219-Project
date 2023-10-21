FROM node:20

ENV NODE_ENV=development

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Copy .env 
COPY .env .env

# Build the project
RUN npm run build

# event bus = redis://<container_name>:6380/
ARG REDIS_EVENT_BUS=redis://peerprep-eventbus:6380/
ENV REDIS_EVENT_BUS=$REDIS_EVENT_BUS

# Copy only the production artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

ARG PORT=5200

EXPOSE $PORT

CMD ["node", "dist/app.js"]