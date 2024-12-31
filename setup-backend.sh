cd packages/backend
npm init -y
npm install express @prisma/client cors dotenv
npm install -D typescript @types/node @types/express @types/cors prisma ts-node-dev
npx tsc --init
npx prisma init 