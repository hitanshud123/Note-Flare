FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including nodemon
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application with nodemon
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then node dist/index.js; else nodemon src/index.ts; fi"] 