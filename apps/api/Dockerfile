FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the application
RUN cd apps/api && pnpm build

EXPOSE 4000

CMD ["pnpm", "--filter", "@streamhub/api", "start"]