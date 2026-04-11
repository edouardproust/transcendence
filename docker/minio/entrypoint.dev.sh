#!/bin/sh
# Start MinIO in background temporarily
minio server /data --console-address ":9001" &
MINIO_PID=$!

# Configure alias
mc alias set local http://localhost:9000 ${AWS_ACCESS_KEY_ID} ${AWS_SECRET_ACCESS_KEY}

# Wait for MinIO to be ready
until mc ready local 2>/dev/null; do
    sleep 1
done

# Init bucket
mc mb --ignore-existing local/${S3_BUCKET}
mc anonymous set public local/${S3_BUCKET}

# Restart as foreground process
kill $MINIO_PID
exec minio server /data --console-address ":9001"