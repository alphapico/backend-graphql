#!/bin/bash

# Load environment variables
source /opt/elasticbeanstalk/support/envvars

# Extract the RDS hostname and port from the DATABASE_URL
RDS_HOSTNAME_AND_PORT=$(echo $DATABASE_URL | sed -n 's|^.*@\([^:/]*\):\([0-9]*\)/.*$|\1:\2|p')

# Wait for the RDS instance to be ready
/usr/local/bin/wait-for-it.sh "${RDS_HOSTNAME_AND_PORT}"

# Run Prisma commands with retries
/usr/local/bin/run_prisma_with_retries.sh generate
/usr/local/bin/run_prisma_with_retries.sh migrate deploy

# Start the Node.js application
node dist/apps/customer-api/main.js
