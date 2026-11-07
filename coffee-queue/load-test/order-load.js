// จำลองช่วงพักเที่ยง: คนเปิดเมนูและสั่งเครื่องดื่มพร้อมกันจำนวนมาก
// ใช้: k6 run -e TARGET=http://<Public IP> load-test/order-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ค่อยๆ เพิ่มเป็น 50 คน
    { duration: '3m', target: 50 },   // ค้างไว้ 3 นาที ให้ HPA มีเวลาเพิ่ม pod
    { duration: '1m', target: 0 },    // ลดลง
  ],
};

const BASE = __ENV.TARGET || 'http://localhost:8080';
const NAMES = ['Boss', 'Fon', 'Mew', 'Ploy', 'Nan', 'Tee'];
const DRINKS = ['Latte', 'Americano', 'Cappuccino', 'Mocha', 'Thai Tea', 'Green Tea Latte', 'Cocoa', 'Chocolate'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function () {
  const menu = http.get(`${BASE}/api/menu`);
  check(menu, { 'menu ok': r => r.status === 200 });

  // หนึ่งออร์เดอร์มี 1-2 รายการ เหมือนลูกค้าจริง
  const items = [{ drink: pick(DRINKS), temp: Math.random() < 0.5 ? 'hot' : 'iced', quantity: 1 }];
  if (Math.random() < 0.5) items.push({ drink: pick(DRINKS), temp: 'iced', quantity: 1 });
  const body = JSON.stringify({ name: pick(NAMES), items });
  const order = http.post(`${BASE}/api/orders`, body, { headers: { 'Content-Type': 'application/json' } });
  check(order, { 'order created': r => r.status === 201 });

  sleep(0.5);
}
