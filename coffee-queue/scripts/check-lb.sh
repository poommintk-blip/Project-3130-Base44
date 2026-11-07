#!/usr/bin/env bash
# ยิง request 10 ครั้ง แล้วดูว่า backend pod ไหนตอบ (header X-Served-By)
# ใช้: ./scripts/check-lb.sh <Public IP ของเครื่องใดก็ได้ใน cluster>
set -euo pipefail
IP="${1:?ใส่ Public IP}"
for i in $(seq 1 10); do
  curl -s -o /dev/null -D - "http://$IP/api/menu" | grep -i '^x-served-by'
done
