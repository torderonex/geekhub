#!/bin/sh
set -e

if [ -f /var/run/docker/containerd/containerd.pid ]; then
    echo "Removing existing containerd PID file..."
    rm -rf /var/run/docker/containerd/containerd.pid
fi

dockerd &

while ! docker info > /dev/null 2>&1; do
    echo "Waiting for Docker to start..."
    sleep 1
done

echo "Docker started successfully."

exec "$@"
