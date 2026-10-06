FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3008
CMD ["pnpm","start"]
