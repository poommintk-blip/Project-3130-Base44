# ผลการทดสอบ — Coffee Queue

วันที่ทดสอบ: [ ]  ผู้ทดสอบ: [ ]  Instance IDs: [ ]

| ข้อ | พิสูจน์ | ผลที่คาด | ผลจริง | ภาพหลักฐาน |
|---|---|---|---|---|
| 6.1 | Gateway | `/` ได้หน้าเว็บ, `/api` ได้ JSON |  | images/6-1.png |
| 6.2 | Load Balance | มี pod ตอบอย่างน้อย 2 ชื่อ |  | images/6-2.png |
| 6.3 | Scaling | REPLICAS เพิ่มเกิน 2 แล้วลดกลับ |  | images/6-3.png |
| 6.4 | Self-healing | pod ใหม่ขึ้นแทนเอง |  | images/6-4.png |
| 6.5 | Persistence | เลขคิวเดิมยังอยู่หลังลบ postgres-0 |  | images/6-5.png |
| 6.6 | Readiness | backend ไม่ restart วนตอน DB หยุด |  | images/6-6.png |
| 6.7 | Rolling update / rollback | อัปเดตได้ ย้อนกลับได้ |  | images/6-7.png |
| 6.8 | รันซ้ำ | Instance ID เดิม ไม่สร้างเครื่องเกิน |  | images/6-8.png |

## ปัญหาที่พบและวิธีแก้

| ปัญหา | สาเหตุ | วิธีแก้ |
|---|---|---|
|  |  |  |
