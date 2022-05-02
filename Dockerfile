# syntax=docker/dockerfile:1
FROM node:14.17.0 as base

WORKDIR /code

COPY package.json package.json
COPY package-lock.json package-lock.json

FROM base as test
RUN yarn install
COPY . .
RUN yarn test

FROM base as prod
RUN yarn install
COPY . .
CMD [ "node", "src/main.ts" ]