#!/usr/bin/env bash
# build image ของ frontend และ backend แล้ว push ขึ้น Docker Hub
# ใช้: ./scripts/build-push.sh <dockerhub_user> <version>
# ตัวอย่าง: ./scripts/build-push.sh boss123 1.0.0
# --platform linux/amd64 ทำให้ image รันบน EC2 (x86) ได้ แม้จะ build บน Mac M1/M2
set -euo pipefail
USER_NAME="${1:?ใส่ชื่อผู้ใช้ Docker Hub}"
VERSION="${2:-1.0.0}"
cd "$(dirname "$0")/../app"

docker buildx build --platform linux/amd64 -t "$USER_NAME/coffee-frontend:$VERSION" --push ./frontend
docker buildx build --platform linux/amd64 -t "$USER_NAME/coffee-backend:$VERSION"  --push ./backend

echo "เสร็จแล้ว: $USER_NAME/coffee-frontend:$VERSION และ $USER_NAME/coffee-backend:$VERSION"
