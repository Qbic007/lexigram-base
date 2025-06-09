FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install -y tzdata

CMD ["npx", "ts-node", "src/index.ts"] 