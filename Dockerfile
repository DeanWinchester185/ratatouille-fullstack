FROM node:lts-alpine
WORKDIR /ratatouille
COPY package*.json ./
RUN npm i --production

COPY . .

EXPOSE 80
CMD ["npm", "run", "dev"]