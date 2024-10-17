# Developed By Paysys Labs

# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Environment variables
ENV STARTUP_TYPE=nats
ENV NODE_ENV=dev
ENV SERVER_URL=nats:4222 
ENV FUNCTION_NAME=messageRelayService
ENV PRODUCER_STREAM=destination.subject
ENV CONSUMER_STREAM=cms
ENV DESTINATION_TYPE=nats
ENV DESTINATION_URL=nats://localhost:4223
ENV QUEUE=messageRelayService

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
