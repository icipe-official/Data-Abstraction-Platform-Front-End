FROM node:alpine3.20 as build

WORKDIR /home/app

COPY . .

RUN npm install

RUN npm run build

FROM node:alpine3.20

RUN addgroup -S appgroup && adduser -S app -G appgroup

WORKDIR /home/app

COPY --from=build /home/app/build/ app/
COPY --from=build /home/app/package.json ./
COPY --from=build /home/app/package-lock.json ./

RUN npm ci --omit dev 

EXPOSE 3000
USER app

CMD [ "node","app" ]