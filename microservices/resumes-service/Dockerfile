FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Create uploads directory
RUN mkdir -p uploads

RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001
RUN chown -R nodeapp:nodejs /app
USER nodeapp

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4004/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

EXPOSE 4004
CMD ["npm", "start"]