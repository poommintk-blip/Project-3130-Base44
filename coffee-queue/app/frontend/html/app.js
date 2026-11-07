// ===== Coffee Queue: ตั้งค่าส่วนกลางของหน้าเว็บ =====
// ทุกหน้าเรียก Backend ผ่าน /api (Nginx ส่งต่อให้ container backend)
// ถ้า endpoint หรือชื่อฟิลด์ของ Backend เปลี่ยน แก้ที่ไฟล์นี้ไฟล์เดียวได้เลย
const API = '/api';

const ENDPOINTS = {
  menu:        () => '/menu',                                   // GET  -> [{id,name,price}]
  createOrder: () => '/orders',                                 // POST {name, items:[{drink,temp,quantity}]} -> {queue,items,total,...}
  getOrder:    (q) => '/orders/' + encodeURIComponent(q),       // GET  -> {queue,status,name,items,total}
  staffOrders: () => '/staff/orders',                           // GET  (header X-Staff-PIN) -> [order,...]
  setStatus:   (q) => '/orders/' + encodeURIComponent(q) + '/status', // PATCH {status} (header X-Staff-PIN)
};

// key = ค่าสถานะที่ Backend เก็บ, label = ชื่อสถานะที่แสดง, desc = คำอธิบายสั้นใต้ชื่อ
// act = ข้อความบนปุ่มของพนักงานตอนเลื่อนออร์เดอร์ "ไปยัง" สถานะนั้น
const STATUSES = [
  { key: 'waiting', label: 'In queue',   desc: 'Order received', icon: '🕒', act: 'In queue' },
  { key: 'making',  label: 'Being made', desc: 'Making now',     icon: '☕', act: 'Start' },
  { key: 'ready',   label: 'Ready',      desc: 'Pick it up',     icon: '✅', act: 'Done' },
  { key: 'done',    label: 'Picked up',  desc: 'Enjoy!',         icon: '🛍️', act: 'Picked up' },
];

// เมนูสำรองเมื่อเรียก /api/menu ไม่ได้ (ราคาเป็นบาทต่อแก้ว)
const DEFAULT_MENU = [
  { name: 'Latte', price: 60 },
  { name: 'Americano', price: 50 },
  { name: 'Cappuccino', price: 60 },
  { name: 'Mocha', price: 65 },
  { name: 'Thai Tea', price: 45 },
  { name: 'Green Tea Latte', price: 55 },
  { name: 'Cocoa', price: 50 },
  { name: 'Chocolate', price: 55 },
];

// ===== ตัวช่วย =====
const norm = (s) => String(s || '').toLowerCase().replace(/[\s_-]+/g, '');
function statusIndex(s) {
  const n = norm(s);
  return STATUSES.findIndex((x) => norm(x.key) === n);
}
const queueOf = (o) => o.queue ?? o.queueNumber ?? o.queue_number ?? o.id;
const tempLabel = (t) => (norm(t) === 'hot' ? 'Hot' : 'Iced');
const baht = (n) => '฿' + Number(n).toLocaleString('en-US');

// ออร์เดอร์หนึ่งมีได้หลายรายการ: order.items = [{drink, temp, quantity}]
// รองรับรูปแบบเดิม (drink/temp/quantity ที่ระดับออร์เดอร์) ด้วย
function itemsOf(o) {
  if (Array.isArray(o.items) && o.items.length) return o.items;
  return o.drink ? [{ drink: o.drink, temp: o.temp, quantity: o.quantity ?? 1 }] : [];
}
function fillItems(ul, o) {
  ul.replaceChildren();
  itemsOf(o).forEach((it) => {
    ul.append(el('li', {},
      el('span', { class: 'nm' }, String(it.drink), it.temp ? el('span', { class: 'tp', text: ' ' + tempLabel(it.temp) }) : ''),
      el('span', { class: 'qty', text: '× ' + (it.quantity ?? 1) })));
  });
}
// ยอดรวมของออร์เดอร์จาก Backend (ถ้ามี): total, totalPrice หรือ total_price
const priceOf = (o) => o.total ?? o.totalPrice ?? o.total_price ?? null;

async function api(path, { method = 'GET', body, pin } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (pin) headers['X-Staff-PIN'] = pin;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw Object.assign(new Error("Can't reach the server. Please try again."), { status: 0 });
  }
  if (!res.ok) {
    let msg = 'Something went wrong (' + res.status + ')';
    try {
      const j = await res.json();
      if (j && (j.message || j.error)) msg = j.message || j.error;
    } catch (e) { /* ignore */ }
    throw Object.assign(new Error(msg), { status: res.status });
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch (e) { return null; }
}

// สร้าง DOM แบบปลอดภัย (ใช้ textContent ไม่ใช้ innerHTML กับข้อมูลลูกค้า)
function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  kids.flat().forEach((c) => n.append(c));
  return n;
}
function showMsg(box, text, type) {
  box.textContent = text || '';
  box.className = text ? 'msg ' + (type || 'err') : 'msg hidden';
}
