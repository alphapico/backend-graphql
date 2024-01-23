#!/bin/sh

COMMAND="$*"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Executing Prisma command: $COMMAND (attempt $(($RETRY_COUNT + 1)))"
  npx prisma $COMMAND

  if [ $? -eq 0 ]; then
    echo "Prisma command succeeded: $COMMAND"
    exit 0
  else
    echo "Prisma command failed: $COMMAND"
    RETRY_COUNT=$(($RETRY_COUNT + 1))
    sleep 5
  fi
done

echo "Prisma command failed after $MAX_RETRIES attempts: $COMMAND"
exit 1
