FROM node:15.1.0-alpine3.10

ADD ./package.json /app/

WORKDIR /app

RUN npm install

ADD ./ /app

RUN npm run build-assets-prod

EXPOSE 3000

CMD ["npm", "run", "start-backend-prod"]
