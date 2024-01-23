# Use the official Node.js 16 image as the base image
FROM --platform=linux/amd64 node:16-slim AS base

ENV NODE_ENV=production
# Install OpenSSL
RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
EXPOSE 80
ENV PORT 80
WORKDIR /app
COPY ./package.json ./package-lock.json nx.json tsconfig.base.json ./
RUN npm config list
RUN npm ci \
    && npm cache clean --force
COPY ./dist/apps/customer-api ./dist/apps/customer-api
COPY ./prisma ./prisma
# Copy the wait-for-it.sh script into the container
COPY bash/wait-for-it.sh /usr/local/bin/wait-for-it.sh
# Copy the run_prisma_with_retries.sh script into the container
COPY bash/run_prisma_with_retries.sh /usr/local/bin/run_prisma_with_retries.sh
# Set executable permissions for the script
RUN chmod +x /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/run_prisma_with_retries.sh
RUN chown -R node:node /app


FROM base as prod
COPY --from=base /app /app
# Copy the entrypoint.sh script into the container
COPY bash/entrypoint.sh /usr/local/bin/entrypoint.sh
# COPY bash/entrypoint.dev.sh /usr/local/bin/entrypoint.dev.sh
# Set executable permissions for the script
RUN chmod +x /usr/local/bin/entrypoint.sh
# RUN chmod +x /usr/local/bin/entrypoint.dev.sh
HEALTHCHECK CMD curl --fail http://127.0.0.1:80/health || exit 1
USER node
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# ENTRYPOINT ["/usr/local/bin/entrypoint.dev.sh"]