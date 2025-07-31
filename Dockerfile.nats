# SPDX-License-Identifier: Apache-2.0
# Developed By Paysys Labs

# Use Node.js as the base image
FROM node:20-alpine

ARG GH_TOKEN

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./
COPY .npmrc .npmrc

# Install dependencies, including the NATS relay plugin
RUN npm install && npm install @tazama-lf/nats-relay-plugin

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Environment variables (May require changes based on requirements)
ENV STARTUP_TYPE=nats
ENV NODE_ENV=dev
ENV SERVER_URL=nats://localhost:4222 
ENV FUNCTION_NAME=messageRelayService
ENV OUTPUT_TO_JSON=true
ENV PRODUCER_STREAM=destination.subject
ENV CONSUMER_STREAM=interdiction-service
ENV DESTINATION_TRANSPORT_TYPE=@tazama-lf/nats-relay-plugin

# NATS plugin-specific env vars (defaults from README; override as needed)
ENV DESTINATION_TRANSPORT_URL=tls://localhost:4223
ENV PRODUCER_STREAM=example.subject
# Update with actual path below or volume mount for production
ENV NATS_TLS_CA=/path/to/ca.pem  

ENV APM_ACTIVE=true
ENV APM_SERVICE_NAME=relay-service
ENV APM_URL=http://apm-server.development.svc.cluster.local:8200/
ENV APM_SECRET_TOKEN=

ENV LOGSTASH_LEVEL='info'
ENV SIDECAR_HOST=0.0.0.0:5000

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
