FROM node:alpine

ENV BUILD_ENV=development

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev
RUN npm run build

# Bundle app source
COPY . .

ARG port=3000
EXPOSE $port

CMD [ "npm", "run", "start" ]