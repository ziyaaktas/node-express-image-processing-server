FROM node:12.13.0-alpine

RUN apk add graphicsmagick=1.3.31-r0

ADD ./package.json .

RUN npm install

COPY . .

