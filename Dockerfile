# 1st Stage for installing dependencies
FROM node:14-alpine AS build
WORKDIR /app-build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14-alpine AS runtime
WORKDIR /app-runtime
COPY package*.json ./
RUN npm install --production

FROM node:14-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build --chown=node:node /app-build/dist /app
COPY --from=runtime --chown=node:node /app-runtime /app

USER node
EXPOSE 3000
CMD [ "node", "index.js" ]
