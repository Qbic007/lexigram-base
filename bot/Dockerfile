FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev
RUN npm install -g typescript

COPY . .

RUN apt-get update && apt-get install -y tzdata

RUN npm run build

CMD ["node", "dist/index.js"] 