#!/bin/bash


# Wait for the RDS instance to be ready
/usr/local/bin/wait-for-it.sh dev_db:5432

# Run Prisma commands with retries
/usr/local/bin/run_prisma_with_retries.sh generate
/usr/local/bin/run_prisma_with_retries.sh migrate deploy

# Start the Node.js application
node dist/apps/customer-api/main.js
