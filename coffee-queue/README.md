# Coffee Queue

ระบบสั่งเครื่องดื่มและติดตามคิวร้านกาแฟ แบบ Three Tier (Nginx + Node.js + PostgreSQL)
deploy บน Kubernetes (k3s) ใน AWS EC2 ด้วย Ansible

**คู่มือฉบับเต็ม:** `docs/Coffee-Queue-Manual.pdf`

| โฟลเดอร์ | คืออะไร | ใช้ในขั้นที่ |
|---|---|---|
| `app/` | โค้ดเว็บแอป + Dockerfile + docker-compose.yml | 1–2 |
| `scripts/` | build/push image, เช็ก Load Balance | 2, 6 |
| `ansible/` | สร้าง EC2, ติดตั้ง k3s, deploy, ลบทรัพยากร | 3–5, 7 |
| `k8s/` | ไฟล์ Kubernetes ที่ deploy.yml นำไปใช้ | 5 |
| `load-test/` | สคริปต์ k6 จำลองคนสั่งพร้อมกัน | 6 |
| `docs/` | คู่มือ PDF, AI usage log, ผลทดสอบ | ทุกขั้น |

## เริ่มเร็ว

```bash
# ขั้นที่ 1: รันในเครื่อง
cd app && docker compose up --build        # เปิด http://localhost:8080

# ขั้นที่ 2: push image
./scripts/build-push.sh <dockerhub_user> 1.0.0

# ขั้นที่ 5: ขึ้น AWS (ใน Ubuntu WSL, อยู่ในโฟลเดอร์ ansible/)
ansible-playbook provision.yml
ansible-playbook -i inventory.ini k3s.yml
ansible-playbook -i inventory.ini deploy.yml

# ขั้นที่ 7: ลบทุกอย่าง
ansible-playbook destroy.yml
```
