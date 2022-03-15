
## declare base image - node 16
FROM node:16.4.2-alpine3.11 AS builder 

## make work directory and copy files 
WORKDIR /app 
COPY . . 
## project dependency install
RUN npm ci --legacy-peer-deps
RUN npm install -g @nestjs/cli
RUN npm run build 

FROM node:16.4.2-alpine3.11 
WORKDIR /usr/src/app 
COPY --from=builder /app ./ 
EXPOSE 80 
CMD npm start:prod

# docker build -t aio/miko-nestjs .
