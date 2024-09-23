# Use node alpine image
FROM node:21.5.0-alpine

ARG PORT

# Install openssl and bash
RUN apk add --no-cache openssl bash

# Set working directory
WORKDIR /usr/src

# Install dependencies
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

# RUN npm ci
RUN npm install -g npm@10.8.3 && npm ci

# Copy all files
COPY . .

# Rename .env.example if .env doesn't exist 
RUN if [ ! -f .env ]; then \
      mv .env.example .env; \
    fi

# Generate self-signed certificate
RUN /bin/bash ./generate-cert.sh

# Expose server port
EXPOSE ${PORT}

# Start server
# redirect console output to file
CMD ["sh", "-c", "npm run start >> /data/api_logs/output.log 2>&1" ]
